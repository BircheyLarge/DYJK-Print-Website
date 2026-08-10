/**
 * POST /api/quote — Cloudflare Pages Function backing the quote form.
 *
 * Lives outside src/ because Pages Functions are deployed by Cloudflare from
 * the repo-root `functions/` directory, alongside Astro's static `dist/`
 * output. No Astro adapter needed — the site stays fully static.
 *
 * It answers two kinds of caller:
 *   - fetch() from the enhanced form  → JSON  { ok } | { ok, errors, message }
 *   - a native form POST (no JS)      → 303 to /quote-received/, or an
 *                                       error page the visitor can read
 *
 * Validation is imported from the same module the browser uses, so the two
 * can never drift apart.
 *
 * Required binding to actually deliver mail:
 *   RESEND_API_KEY  — Resend API key
 * Optional:
 *   LEAD_TO         — recipient (default sales@dyjkprint.com)
 *   LEAD_FROM       — verified sender  (default quotes@dyjkprint.com)
 *   TURNSTILE_SECRET_KEY — when set, a Turnstile token is required & verified
 *
 * With no RESEND_API_KEY the endpoint returns 503 and the form shows its
 * "call us instead" fallback. We fail loudly rather than swallowing a lead.
 */
import {
  toQuoteValues,
  validateQuote,
  type QuoteErrors,
  type QuoteFormValues,
} from '../../src/lib/quote';

interface Env {
  RESEND_API_KEY?: string;
  LEAD_TO?: string;
  LEAD_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const DEFAULT_TO = 'sales@dyjkprint.com';
const DEFAULT_FROM = 'DYJK Print Website <quotes@dyjkprint.com>';
const SUCCESS_PATH = '/quote-received/';

/** Cap the body so a hostile client can't make us buffer megabytes. */
const MAX_BODY_BYTES = 64 * 1024;

function wantsJson(request: Request): boolean {
  const accept = request.headers.get('accept') ?? '';
  const contentType = request.headers.get('content-type') ?? '';
  return accept.includes('application/json') || contentType.includes('json');
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/** Minimal readable page for no-JS visitors when something goes wrong. */
function htmlError(message: string, status: number): Response {
  const escaped = escapeHtml(message);
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<meta name="robots" content="noindex">` +
      `<title>We couldn't send that — DYJK Print</title>` +
      `<style>body{font-family:system-ui,sans-serif;max-width:34rem;margin:4rem auto;padding:0 1rem;` +
      `color:#0b1a22;line-height:1.6}h1{font-size:1.5rem}a{color:#1d6fa8}</style></head>` +
      `<body><h1>We couldn't send that</h1><p>${escaped}</p>` +
      `<p>Please <a href="/request-a-quote/">go back and try again</a>, ` +
      `email <a href="mailto:${DEFAULT_TO}">${DEFAULT_TO}</a>, ` +
      `or call <a href="tel:+18019603396">(801) 960-3396</a> and we'll take the ` +
      `details over the phone.</p></body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Strip CR/LF so nothing user-supplied can inject an email header. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/** Where the lead came from. Untrusted metadata — reported, never trusted. */
interface Attribution {
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

interface ParsedBody {
  values: QuoteFormValues;
  attribution: Attribution;
  turnstileToken: string;
}

/** Keep attribution short — it's echoed into an email we send ourselves. */
const MAX_ATTRIBUTION_LEN = 200;

function pickAttribution(record: Record<string, unknown>): Attribution {
  const take = (key: string): string => {
    const value = record[key];
    return typeof value === 'string'
      ? value.trim().slice(0, MAX_ATTRIBUTION_LEN)
      : '';
  };
  return {
    source: take('source'),
    utmSource: take('utmSource'),
    utmMedium: take('utmMedium'),
    utmCampaign: take('utmCampaign'),
  };
}

function fromRecord(record: Record<string, unknown>): ParsedBody {
  return {
    values: toQuoteValues(record),
    attribution: pickAttribution(record),
    turnstileToken: String(record['cf-turnstile-response'] ?? ''),
  };
}

async function readBody(request: Request): Promise<ParsedBody | null> {
  const contentType = request.headers.get('content-type') ?? '';
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) return null;

  try {
    if (contentType.includes('application/json')) {
      const text = await request.text();
      if (text.length > MAX_BODY_BYTES) return null;
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) return null;
      return fromRecord(parsed as Record<string, unknown>);
    }

    const form = await request.formData();
    const record: Record<string, unknown> = {};
    form.forEach((value, key) => {
      record[key] = typeof value === 'string' ? value : '';
    });
    return fromRecord(record);
  } catch {
    return null;
  }
}

async function verifyTurnstile(
  secret: string,
  token: string,
  ip: string | null,
): Promise<boolean> {
  if (!token) return false;
  try {
    const body = new FormData();
    body.append('secret', secret);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);
    const res = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body },
    );
    const outcome = (await res.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false;
  }
}

interface LeadMeta {
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  receivedAt: string;
}

/** Human-readable lead email. Plain text — it lands in a sales inbox. */
function buildLeadEmail(values: QuoteFormValues, meta: LeadMeta) {
  const line = (label: string, value: string) =>
    value ? `${label}: ${value}` : null;

  const body = [
    'NEW QUOTE REQUEST',
    '',
    line('Name', values.name),
    line('Company', values.company),
    line('Email', values.email),
    line('Phone', values.phone),
    '',
    line('Product', values.projectType),
    line('Quantity', values.quantity),
    line('Deadline', values.deadline),
    line('Artwork', values.artworkUrl),
    '',
    line(
      'Ships to',
      [values.shipState, values.shipZip].filter(Boolean).join(' '),
    ),
    '',
    values.message ? `Details:\n${values.message}` : null,
    '',
    '---',
    line('Source', meta.source),
    line('UTM source', meta.utmSource),
    line('UTM medium', meta.utmMedium),
    line('UTM campaign', meta.utmCampaign),
    line('Received', meta.receivedAt),
  ]
    .filter((entry) => entry !== null)
    .join('\n');

  const who = headerSafe(values.company || values.name);
  return {
    subject: `Quote request — ${headerSafe(values.projectType)} — ${who}`,
    body,
  };
}

export const onRequestPost = async (
  context: RequestContext,
): Promise<Response> => {
  const { request, env } = context;
  const json = wantsJson(request);

  const parsed = await readBody(request);
  if (!parsed) {
    return json
      ? jsonResponse(
          { ok: false, message: 'We could not read that request.' },
          400,
        )
      : htmlError('We could not read that request.', 400);
  }

  const { values, attribution, turnstileToken } = parsed;
  const result = validateQuote(values);

  // Honeypot: accept it so the bot moves on, but deliver nothing.
  if (result.spam) {
    return json
      ? jsonResponse({ ok: true }, 200)
      : Response.redirect(new URL(SUCCESS_PATH, request.url).toString(), 303);
  }

  if (!result.valid) {
    const errors: QuoteErrors = result.errors;
    return json
      ? jsonResponse({ ok: false, errors }, 422)
      : htmlError('Some required details were missing or looked wrong.', 422);
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstile(
      env.TURNSTILE_SECRET_KEY,
      turnstileToken,
      request.headers.get('cf-connecting-ip'),
    );
    if (!ok) {
      const message =
        "We couldn't verify that you're human. Please reload the page and try again.";
      return json
        ? jsonResponse({ ok: false, message }, 403)
        : htmlError(message, 403);
    }
  }

  if (!env.RESEND_API_KEY) {
    // No transport configured — say so instead of pretending it worked.
    const message =
      "Our quote inbox isn't reachable right now. Please call or email us and we'll take your details directly.";
    return json
      ? jsonResponse({ ok: false, message }, 503)
      : htmlError(message, 503);
  }

  const { subject, body } = buildLeadEmail(values, {
    ...attribution,
    receivedAt: new Date().toISOString(),
  });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.LEAD_FROM ?? DEFAULT_FROM,
        to: [env.LEAD_TO ?? DEFAULT_TO],
        reply_to: values.email,
        subject,
        text: body,
      }),
    });

    if (!res.ok) throw new Error(`mail transport responded ${res.status}`);
  } catch {
    const message =
      "We couldn't send that just now. Please try again in a moment, or call us and we'll take the details over the phone.";
    return json
      ? jsonResponse({ ok: false, message }, 502)
      : htmlError(message, 502);
  }

  return json
    ? jsonResponse({ ok: true }, 200)
    : Response.redirect(new URL(SUCCESS_PATH, request.url).toString(), 303);
};

// Only onRequestPost is exported on purpose: Pages answers other methods with
// a 405 automatically, and adding a catch-all onRequest would shadow that.

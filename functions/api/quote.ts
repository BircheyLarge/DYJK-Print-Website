/**
 * POST /api/quote: the Cloudflare Pages Function behind the quote form.
 *
 * It lives in the repo-root functions/ directory, which Cloudflare Pages
 * deploys next to Astro's static dist/; the site itself stays static.
 *
 * Two kinds of caller:
 *   - fetch() from the enhanced form (Accept: application/json) gets JSON:
 *     { ok: true } | { ok: false, errors } | { ok: false, message }
 *   - a plain form POST gets a 303 to /quote-received/, or a short page that
 *     says what went wrong and offers email and the phone.
 *
 * Spam layers, in order, all here on the server:
 *   1. the honeypot: accepted quietly, nothing is sent;
 *   2. the signed "issued at" token: at least 3 seconds to fill, no replays;
 *   3. the shared validation in src/lib/quote.ts: lengths, links in fields,
 *      at most two links in the notes;
 *   4. Turnstile, verified with TURNSTILE_SECRET_KEY.
 * Only a request that passes all four sends mail, so the auto-reply can't be
 * pointed at strangers. It also carries none of the visitor's free text.
 *
 * Settings (Cloudflare Pages environment variables):
 *   TURNSTILE_SECRET_KEY  Turnstile secret; also keys the issued-at token
 *   RESEND_API_KEY        Resend API key
 *   RESEND_API_URL        optional, tests only: a stand-in for Resend
 *   TURNSTILE_VERIFY_URL  optional, tests only: a stand-in for siteverify
 * Without both keys it answers 503 and the page offers email and the phone.
 */
import { SITE } from '../../src/consts';
import { QUOTE_NEXT } from '../../src/data/quote';
import { checkToken } from '../../src/lib/form-token';
import { gmailHref, outlookHref, QUOTE_EMAIL } from '../../src/lib/email';
import {
  DELIVERY_SLC,
  SOMETHING_ELSE,
  toQuoteValues,
  validateQuote,
  type QuoteErrors,
  type QuoteValues,
} from '../../src/lib/quote';

export interface Env {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_URL?: string;
  TURNSTILE_VERIFY_URL?: string;
}

export interface QuoteContext {
  request: Request;
  env: Env;
  waitUntil?: (promise: Promise<unknown>) => void;
}

export const FROM = 'DYJK Print <quotes@dyjkprint.com>';
export const SUCCESS_PATH = '/quote-received/';
const RESEND_URL = 'https://api.resend.com/emails';
const SITEVERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Cap the body, so nobody can make us buffer megabytes. */
const MAX_BODY_BYTES = 64 * 1024;

const FALLBACK =
  'You can also email us or call, and we’ll take the details from there.';

/* ------------------------------------------------------------------ */
/* Responses                                                          */
/* ------------------------------------------------------------------ */

function wantsJson(request: Request): boolean {
  return (request.headers.get('accept') ?? '').includes('application/json');
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** For a plain form POST: what went wrong, and how else to reach us. */
function page(
  heading: string,
  message: string,
  status: number,
  errors?: QuoteErrors,
): Response {
  const list = errors
    ? `<ul>${Object.values(errors)
        .map((error) => `<li>${escapeHtml(error)}</li>`)
        .join('')}</ul>`
    : '';
  const phone = SITE.phone
    ? `, or call <a href="tel:${SITE.phone.e164}">${SITE.phone.display}</a>`
    : '';
  const html =
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width,initial-scale=1">` +
    `<meta name="robots" content="noindex">` +
    `<title>${escapeHtml(heading)} | ${SITE.name}</title><style>` +
    `body{margin:0;font-family:system-ui,sans-serif;color:#0b1a22;line-height:1.55}` +
    `header{background:#0b1a22;color:#fff;padding:2.5rem 1rem}` +
    `header p{margin:0 0 .5rem;color:#7fd4f5;font-size:.8125rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase}` +
    `h1{margin:0;font-size:2rem;line-height:1.2}main{max-width:40rem;padding:2rem 1rem}` +
    `a{color:#1d6fa8}li{margin:.25rem 0}.back{display:inline-block;margin-top:1rem;font-weight:600}` +
    `</style></head><body><header><p>Request a Quote</p><h1>${escapeHtml(heading)}</h1></header>` +
    `<main><p>${escapeHtml(message)}</p>${list}` +
    `<p>${escapeHtml(FALLBACK)} Write to <a href="mailto:${SITE.email}">${SITE.email}</a> ` +
    `(or open it in <a href="${gmailHref(SITE.email, QUOTE_EMAIL)}">Gmail</a> or ` +
    `<a href="${outlookHref(SITE.email, QUOTE_EMAIL)}">Outlook</a>)${phone}.</p>` +
    `<a class="back" href="/request-a-quote/">Back to the form</a></main></body></html>`;
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

/** Answer in the caller's format. */
function fail(
  request: Request,
  status: number,
  message: string,
  errors?: QuoteErrors,
): Response {
  if (wantsJson(request)) {
    return json(
      errors ? { ok: false, errors } : { ok: false, message },
      status,
    );
  }
  const heading =
    status === 422 ? 'Some details need another look' : 'We couldn’t send that';
  return page(heading, message, status, errors);
}

function succeed(request: Request): Response {
  return wantsJson(request)
    ? json({ ok: true }, 200)
    : new Response(null, {
        status: 303,
        headers: { location: new URL(SUCCESS_PATH, request.url).toString() },
      });
}

/* ------------------------------------------------------------------ */
/* Reading the request                                                */
/* ------------------------------------------------------------------ */

interface Submission {
  values: QuoteValues;
  issued: string;
  turnstile: string;
}

async function readSubmission(request: Request): Promise<Submission | null> {
  if (Number(request.headers.get('content-length') ?? '0') > MAX_BODY_BYTES) {
    return null;
  }
  try {
    const type = request.headers.get('content-type') ?? '';
    let record: Record<string, unknown>;
    if (type.includes('application/json')) {
      const body = await request.text();
      if (body.length > MAX_BODY_BYTES) return null;
      const parsed: unknown = JSON.parse(body);
      if (typeof parsed !== 'object' || parsed === null) return null;
      record = parsed as Record<string, unknown>;
    } else {
      const form = await request.formData();
      record = {};
      form.forEach((value, key) => {
        record[key] = typeof value === 'string' ? value : '';
      });
    }
    return {
      values: toQuoteValues(record),
      issued: typeof record.issued === 'string' ? record.issued : '',
      turnstile:
        typeof record['cf-turnstile-response'] === 'string'
          ? record['cf-turnstile-response']
          : '',
    };
  } catch {
    return null;
  }
}

async function turnstilePasses(
  env: Env,
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
    const response = await fetch(env.TURNSTILE_VERIFY_URL ?? SITEVERIFY_URL, {
      method: 'POST',
      body,
    });
    const outcome = (await response.json()) as { success?: boolean };
    return outcome.success === true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* The two emails                                                     */
/* ------------------------------------------------------------------ */

/** No line breaks in anything that ends up in a header. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/** The lead, to sales@: everything they sent, as plain text. */
export function leadEmail(values: QuoteValues, receivedAt: Date) {
  const line = (label: string, value: string) =>
    value ? `${label}: ${value}` : null;
  const where =
    values.delivery === DELIVERY_SLC
      ? 'Salt Lake area (Salt Lake, Davis or Utah County): deliver it'
      : `Ship to ${values.shipTo}`;
  const text = [
    'New quote request from the website.',
    '',
    line('Name', values.name),
    line('Email', values.email),
    line('Phone', values.phone),
    line('Company', values.company),
    '',
    line('Printing', values.product),
    line('Quantity', values.quantity),
    line('Finished size', values.size),
    line('Paper or finish', values.paper),
    line('Their date', values.deadline),
    line('Where it goes', where),
    line('Artwork', values.artwork),
    '',
    values.notes ? `Notes:\n${values.notes}` : null,
    '',
    `Received ${receivedAt.toISOString()}. Reply to this email to answer them.`,
  ]
    .filter((entry) => entry !== null)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
  const who = values.company
    ? `${values.name} (${values.company})`
    : values.name;
  return {
    subject: oneLine(`Quote request: ${values.product}, from ${who}`),
    text,
  };
}

/**
 * The auto-reply, to the visitor. Only the product (from our own list) comes
 * from the form, so it can't carry anyone else's message.
 */
export function autoReply(values: QuoteValues) {
  const piece =
    values.product === SOMETHING_ELSE
      ? 'your print job'
      : values.product.toLowerCase();
  const phone = SITE.phone ? ` or call ${SITE.phone.display}` : '';
  return {
    subject: 'We have your quote request',
    text: [
      `Thanks for your quote request for ${piece}. It reached us, and here is what happens next.`,
      '',
      ...QUOTE_NEXT.map((step) => `- ${step.text}`),
      '',
      `Have files, or something to add? Reply to this email${phone}.`,
      '',
      SITE.name,
      SITE.url.replace(/^https:\/\//, ''),
    ].join('\n'),
  };
}

async function send(
  env: Env,
  apiKey: string,
  message: {
    to: string;
    reply_to: string;
    subject: string;
    text: string;
  },
): Promise<void> {
  const response = await fetch(env.RESEND_API_URL ?? RESEND_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, ...message, to: [message.to] }),
  });
  if (!response.ok) throw new Error(`Resend answered ${response.status}`);
}

/* ------------------------------------------------------------------ */
/* The handler                                                        */
/* ------------------------------------------------------------------ */

export const onRequestPost = async (
  context: QuoteContext,
): Promise<Response> => {
  const { request, env } = context;
  const submission = await readSubmission(request);
  if (!submission) {
    return fail(request, 400, 'We couldn’t read that request.');
  }
  const { values, issued, turnstile } = submission;

  // 1. Honeypot: let the bot think it worked.
  if (values.website) return succeed(request);

  // The form is off until both keys are set; fail closed, never unverified.
  const secret = env.TURNSTILE_SECRET_KEY;
  const apiKey = env.RESEND_API_KEY;
  if (!secret || !apiKey) {
    return fail(request, 503, 'The quote form isn’t taking requests yet.');
  }

  // 2. The signed issued-at time.
  const token = await checkToken(secret, issued);
  if (token === 'too-fast') {
    return fail(request, 400, 'Please take a moment, then send it again.');
  }
  if (token !== 'ok') {
    return fail(
      request,
      400,
      'This form has expired. Please reload the page and send it again.',
    );
  }

  // 3. The shared rules.
  const result = validateQuote(values);
  if (!result.valid) {
    return fail(request, 422, 'Some details need another look.', result.errors);
  }

  // 4. Turnstile.
  const human = await turnstilePasses(
    env,
    secret,
    turnstile,
    request.headers.get('cf-connecting-ip'),
  );
  if (!human) {
    return fail(
      request,
      403,
      'We couldn’t confirm the form came from a person. Please reload the page and send it again.',
    );
  }

  // The lead has to land, or we say so.
  const lead = leadEmail(values, new Date());
  try {
    await send(env, apiKey, {
      to: SITE.email,
      reply_to: values.email,
      ...lead,
    });
  } catch {
    return fail(request, 503, 'We couldn’t send that just now.');
  }

  // The auto-reply is a courtesy: if it fails, the request still went in.
  const reply = send(env, apiKey, {
    to: values.email,
    reply_to: SITE.email,
    ...autoReply(values),
  }).catch(() => undefined);
  // waitUntil is called on the context: it needs its receiver.
  if (context.waitUntil) context.waitUntil(reply);
  else await reply;

  return succeed(request);
};

// Only POST is exported: Pages answers other methods with a 405 itself.

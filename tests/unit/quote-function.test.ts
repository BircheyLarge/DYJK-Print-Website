import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FROM, onRequestPost, type Env } from '../../functions/api/quote';
import { SITE } from '../../src/consts';
import { issueToken } from '../../src/lib/form-token';

const SECRET = '1x0000000000000000000000000000000AA';
const ENV: Env = { TURNSTILE_SECRET_KEY: SECRET, RESEND_API_KEY: 're_test' };
const URL_ = 'https://www.dyjkprint.com/api/quote';

const FIELDS = {
  name: 'Jamie Rivera',
  email: 'jamie@example.com',
  phone: '(385) 555-0100',
  company: 'Rivera Dental',
  product: 'Presentation Folders',
  quantity: '250',
  size: '9 x 12',
  paper: 'Matte',
  deadline: '',
  delivery: 'ship',
  shipTo: 'Boise, ID',
  artwork: 'https://www.dropbox.com/s/abc/folder.pdf',
  notes: 'Two pockets and a card slit.',
  website: '',
  'cf-turnstile-response': 'XXXX.DUMMY.TOKEN.XXXX',
};

type Reply = { status?: number; body?: unknown };
let turnstile: Reply;
let resend: Reply[];
let calls: Array<{ url: string; body: unknown }>;

beforeEach(() => {
  turnstile = { body: { success: true } };
  resend = [{ body: { id: 'lead' } }, { body: { id: 'reply' } }];
  calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      if (url.includes('siteverify')) {
        const form = init.body as FormData;
        calls.push({ url, body: Object.fromEntries(form.entries()) });
        return Response.json(turnstile.body, { status: turnstile.status });
      }
      calls.push({ url, body: JSON.parse(String(init.body)) });
      const next = resend.shift() ?? { body: {} };
      return Response.json(next.body, { status: next.status ?? 200 });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function post(
  overrides: Record<string, string> = {},
  {
    json = true,
    env = ENV,
    issuedAgo = 5000,
  }: { json?: boolean; env?: Env; issuedAgo?: number } = {},
) {
  const issued = await issueToken(SECRET, Date.now() - issuedAgo);
  const body = new URLSearchParams({ ...FIELDS, issued, ...overrides });
  const request = new Request(URL_, {
    method: 'POST',
    headers: {
      accept: json ? 'application/json' : 'text/html',
      'content-type': 'application/x-www-form-urlencoded',
      'cf-connecting-ip': '203.0.113.7',
    },
    body,
  });
  return onRequestPost({ request, env });
}

const resendCalls = () => calls.filter((call) => call.url.includes('resend'));
const verifyCalls = () =>
  calls.filter((call) => call.url.includes('siteverify'));

describe('a good request', () => {
  it('sends the lead and an auto-reply, then answers ok', async () => {
    const response = await post();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    expect(verifyCalls()).toEqual([
      {
        url: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        body: {
          secret: SECRET,
          response: 'XXXX.DUMMY.TOKEN.XXXX',
          remoteip: '203.0.113.7',
        },
      },
    ]);

    const [lead, reply] = resendCalls().map(
      (call) => call.body as Record<string, string | string[]>,
    );
    expect(lead).toMatchObject({
      from: FROM,
      to: [SITE.email],
      reply_to: 'jamie@example.com',
      subject:
        'Quote request: Presentation Folders, from Jamie Rivera (Rivera Dental)',
    });
    for (const line of [
      'Phone: (385) 555-0100',
      'Quantity: 250',
      'Finished size: 9 x 12',
      'Where it goes: Ship to Boise, ID',
      'Artwork: https://www.dropbox.com/s/abc/folder.pdf',
      'Two pockets and a card slit.',
    ]) {
      expect(lead!.text).toContain(line);
    }

    expect(reply).toMatchObject({
      from: FROM,
      to: ['jamie@example.com'],
      reply_to: SITE.email,
      subject: 'We have your quote request',
    });
    expect(reply!.text).toContain('quote request for presentation folders');
    expect(reply!.text).toContain('The quote is free.');
    expect(reply!.text).toContain('approve a proof before anything prints');
    expect(reply!.text).toContain('In Salt Lake City, we deliver it ourselves');
  });

  it('a plain form POST gets a 303 to /quote-received/', async () => {
    const response = await post({}, { json: false });
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'https://www.dyjkprint.com/quote-received/',
    );
  });

  it('notes Salt Lake City delivery in the lead', async () => {
    await post({ delivery: 'deliver-slc', shipTo: '' });
    expect((resendCalls()[0]!.body as { text: string }).text).toContain(
      'Where it goes: Salt Lake City, deliver it',
    );
  });

  it('puts none of the visitor’s own words in the auto-reply', async () => {
    await post({ name: 'Buy cheap pills', notes: 'Visit the pill shop now' });
    const reply = resendCalls()[1]!.body as { text: string; subject: string };
    expect(`${reply.subject}\n${reply.text}`).not.toMatch(/pill/i);
  });

  it('still answers ok when only the auto-reply fails', async () => {
    resend = [{ body: { id: 'lead' } }, { status: 500, body: {} }];
    const response = await post();
    expect(response.status).toBe(200);
  });

  it('hands the auto-reply to waitUntil when there is one', async () => {
    const waitUntil = vi.fn();
    const issued = await issueToken(SECRET, Date.now() - 5000);
    await onRequestPost({
      request: new Request(URL_, {
        method: 'POST',
        headers: { accept: 'application/json' },
        body: new URLSearchParams({ ...FIELDS, issued }),
      }),
      env: ENV,
      waitUntil,
    });
    expect(waitUntil).toHaveBeenCalledTimes(1);
  });
});

describe('a request with problems', () => {
  it('422: field errors, and neither Turnstile nor mail is touched', async () => {
    const response = await post({ email: 'jamie@', quantity: '' });
    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      ok: false,
      errors: {
        email: 'That email address doesn’t look right.',
        quantity: 'Roughly how many do you need?',
      },
    });
    expect(calls).toEqual([]);
  });

  it('422 without JavaScript: a page that lists the problems', async () => {
    const response = await post({ email: 'jamie@' }, { json: false });
    expect(response.status).toBe(422);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(await response.text()).toContain(
      '<li>That email address doesn’t look right.</li>',
    );
  });

  it('503 until both keys are set', async () => {
    for (const env of [
      { RESEND_API_KEY: 're_test' },
      { TURNSTILE_SECRET_KEY: SECRET },
    ]) {
      const response = await post({}, { env });
      expect(response.status).toBe(503);
    }
    expect(calls).toEqual([]);
  });

  it('503 when Resend fails, offering email and the phone', async () => {
    resend = [{ status: 500, body: {} }];
    const response = await post();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      message: 'We couldn’t send that just now.',
    });

    resend = [{ status: 500, body: {} }];
    const page = await (await post({}, { json: false })).text();
    expect(page).toContain(`mailto:${SITE.email}`);
    expect(page).toContain('https://mail.google.com/mail/?view=cm');
    expect(page).toContain('https://outlook.office.com/mail/deeplink/compose');
    if (SITE.phone) {
      expect(page).toContain(`tel:${SITE.phone.e164}`);
      expect(page).toContain(SITE.phone.display);
    }
    expect(page).not.toMatch(/960\W?3396|573\W?6774/);
    expect(page).toContain('<meta name="robots" content="noindex">');
  });

  it('400 for a body it can’t read', async () => {
    const response = await onRequestPost({
      request: new Request(URL_, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
        body: '{not json',
      }),
      env: ENV,
    });
    expect(response.status).toBe(400);
  });
});

describe('spam', () => {
  it('the honeypot gets a quiet ok, and nothing is sent', async () => {
    const response = await post({ website: 'https://spam.example' });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(calls).toEqual([]);
  });

  it('a form sent within 3 seconds is turned away', async () => {
    const response = await post({}, { issuedAgo: 500 });
    expect(response.status).toBe(400);
    expect(calls).toEqual([]);
  });

  it('a forged or missing issued-at token is turned away', async () => {
    expect(
      (await post({ issued: `${Date.now() - 60_000}.forged` })).status,
    ).toBe(400);
    expect((await post({ issued: '' })).status).toBe(400);
    expect(calls).toEqual([]);
  });

  it('three links in the notes is a 422', async () => {
    const response = await post({
      notes: 'https://a.example https://b.example https://c.example',
    });
    expect(response.status).toBe(422);
    expect(calls).toEqual([]);
  });

  it('a failed Turnstile check is a 403, and no mail goes out', async () => {
    turnstile = { body: { success: false } };
    const response = await post();
    expect(response.status).toBe(403);
    expect(resendCalls()).toEqual([]);
  });

  it('a missing Turnstile token never reaches Resend', async () => {
    const response = await post({ 'cf-turnstile-response': '' });
    expect(response.status).toBe(403);
    expect(resendCalls()).toEqual([]);
  });

  it('an oversized body is refused', async () => {
    const response = await post({ notes: 'x'.repeat(70_000) });
    expect([400, 422]).toContain(response.status);
    expect(resendCalls()).toEqual([]);
  });
});

/**
 * A signed "form issued at" timestamp for the quote form. The middleware in
 * functions/request-a-quote/ stamps it into the page as it's served, and the
 * Function checks it on submit: a person takes more than a few seconds to
 * fill the form; a bot posts at once, or replays an old token.
 *
 * HMAC-SHA-256 through Web Crypto, so it runs the same in Workers and Node.
 * The key is derived from TURNSTILE_SECRET_KEY, which is always set when the
 * form is on, so there is no extra secret to manage.
 */

/** Faster than this is a bot. */
export const MIN_FILL_MS = 3000;
/** Older than this is a replay (or a tab left open overnight: reload). */
export const MAX_AGE_MS = 12 * 60 * 60 * 1000;

const encoder = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(`dyjk-quote-form-issued:${secret}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function toBase64Url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[\w-]+$/.test(text)) return null;
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** "<issued ms>.<signature>" */
export async function issueToken(
  secret: string,
  now: number = Date.now(),
): Promise<string> {
  const issued = String(Math.floor(now));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await hmacKey(secret),
    encoder.encode(issued),
  );
  return `${issued}.${toBase64Url(signature)}`;
}

export type TokenCheck = 'ok' | 'missing' | 'invalid' | 'too-fast' | 'expired';

export async function checkToken(
  secret: string,
  token: string,
  now: number = Date.now(),
): Promise<TokenCheck> {
  if (!token) return 'missing';
  const [issued, signature, extra] = token.split('.');
  if (!issued || !signature || extra !== undefined || !/^\d+$/.test(issued)) {
    return 'invalid';
  }
  const bytes = fromBase64Url(signature);
  if (!bytes) return 'invalid';
  const valid = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(secret),
    bytes,
    encoder.encode(issued),
  );
  if (!valid) return 'invalid';
  const age = now - Number(issued);
  if (age < MIN_FILL_MS) return 'too-fast';
  if (age > MAX_AGE_MS) return 'expired';
  return 'ok';
}

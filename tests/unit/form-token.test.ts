import { describe, expect, it } from 'vitest';
import {
  checkToken,
  issueToken,
  MAX_AGE_MS,
  MIN_FILL_MS,
} from '../../src/lib/form-token';

const SECRET = 'turnstile-secret';
const NOW = 1_760_000_000_000;

describe('the issued-at token', () => {
  it('passes after the minimum fill time', async () => {
    const token = await issueToken(SECRET, NOW);
    expect(await checkToken(SECRET, token, NOW + MIN_FILL_MS)).toBe('ok');
  });

  it('turns away a form sent too fast', async () => {
    const token = await issueToken(SECRET, NOW);
    expect(await checkToken(SECRET, token, NOW + 1000)).toBe('too-fast');
  });

  it('turns away an old token', async () => {
    const token = await issueToken(SECRET, NOW);
    expect(await checkToken(SECRET, token, NOW + MAX_AGE_MS + 1)).toBe(
      'expired',
    );
  });

  it('turns away a forged time or a different key', async () => {
    const token = await issueToken(SECRET, NOW);
    const [, signature] = token.split('.');
    expect(await checkToken(SECRET, `${NOW - 60_000}.${signature}`, NOW)).toBe(
      'invalid',
    );
    expect(await checkToken('another-secret', token, NOW + 5000)).toBe(
      'invalid',
    );
    expect(await checkToken(SECRET, 'nonsense', NOW)).toBe('invalid');
    expect(await checkToken(SECRET, '', NOW)).toBe('missing');
  });
});

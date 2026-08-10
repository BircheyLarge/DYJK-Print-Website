import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb } from '../../src/lib/color';

const css = readFileSync(
  fileURLToPath(new URL('../../src/styles/global.css', import.meta.url)),
  'utf8',
);

/** Extract the brand tokens straight from the source of truth. */
function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]+)`));
  if (!match) throw new Error(`Token --color-${name} not found in global.css`);
  return match[1]!;
}

const WHITE = '#ffffff';
const AA_NORMAL = 4.5;

describe('color helpers', () => {
  it('computes a known contrast ratio (black on white = 21)', () => {
    expect(contrastRatio('#000000', WHITE)).toBeCloseTo(21, 0);
  });

  it('is order-independent', () => {
    expect(contrastRatio('#1d6fa8', WHITE)).toBeCloseTo(
      contrastRatio(WHITE, '#1d6fa8'),
      5,
    );
  });

  it('expands 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe('brand tokens meet WCAG AA (4.5:1) for normal text', () => {
  // Tokens used as text on white / near-white backgrounds.
  for (const name of [
    'brand-blue',
    'brand-blue-dark',
    'brand-slate',
    'brand-muted',
    'brand-ink',
  ]) {
    it(`${name} on white`, () => {
      expect(contrastRatio(token(name), WHITE)).toBeGreaterThanOrEqual(
        AA_NORMAL,
      );
    });
  }

  it('white button labels on brand-blue pass', () => {
    expect(contrastRatio(WHITE, token('brand-blue'))).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it('muted text on the surface tint still passes', () => {
    expect(
      contrastRatio(token('brand-muted'), token('brand-surface')),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});

/*
 * Non-text contrast (WCAG 2.2 SC 1.4.11). A border is what tells you an input
 * or an outlined button is there at all, so it needs 3:1 against whatever it
 * sits on — a rule that is easy to lose the next time someone reaches for a
 * lighter grey. brand-line is exempt on purpose: it draws card edges and
 * dividers, which carry no information you'd miss.
 */
describe('interactive boundaries meet WCAG AA (3:1) non-text contrast', () => {
  const AA_NON_TEXT = 3;
  const SURFACES = [
    ['white', WHITE],
    ['brand-surface', token('brand-surface')],
    ['brand-ink', token('brand-ink')],
  ] as const;

  for (const [label, background] of SURFACES) {
    it(`brand-line-strong on ${label}`, () => {
      expect(
        contrastRatio(token('brand-line-strong'), background),
      ).toBeGreaterThanOrEqual(AA_NON_TEXT);
    });
  }

  it('the focus outline is visible against every surface it can land on', () => {
    for (const [, background] of SURFACES) {
      expect(
        contrastRatio(token('brand-blue'), background),
      ).toBeGreaterThanOrEqual(AA_NON_TEXT);
    }
  });
});

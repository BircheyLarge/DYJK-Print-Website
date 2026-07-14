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

describe('accent (single-action spot color) contract', () => {
  it('white button label on the accent fill passes AA', () => {
    expect(contrastRatio(WHITE, token('accent'))).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it('white button label on the accent hover state passes AA', () => {
    expect(contrastRatio(WHITE, token('accent-hover'))).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it('ink body text on the accent tint passes AA', () => {
    expect(
      contrastRatio(token('brand-ink'), token('accent-tint')),
    ).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});

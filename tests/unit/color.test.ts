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

describe('Card B pairings meet WCAG AA (4.5:1) for normal text', () => {
  // [text, ground], from the token table in the web-refresh SPEC.md.
  const pairs: Array<[string, string]> = [
    // Links, eyebrows and headings on the alternating surface sections.
    ['brand-blue', 'brand-surface'],
    ['brand-slate', 'brand-surface'],
    ['brand-ink', 'brand-surface'],
    // Headings, labels, the current nav item and mosaic captions on the
    // blue-dark header, CTA band and footer; also the solid button's hover.
    ['on-dark', 'brand-blue-dark'],
    // Nav links, CTA copy and footer links on blue-dark.
    ['on-dark-soft', 'brand-blue-dark'],
    // The inverted button on blue-dark: brand-blue label on a white fill.
    ['brand-blue', 'on-dark'],
  ];
  for (const [text, ground] of pairs) {
    it(`${text} on ${ground}`, () => {
      expect(contrastRatio(token(text), token(ground))).toBeGreaterThanOrEqual(
        AA_NORMAL,
      );
    });
  }
});

describe('the spine reads as a graphic (WCAG 1.4.11, 3:1)', () => {
  // brand-mark is never text; it only has to stand out from its ground.
  for (const [name, ground] of [
    ['white', WHITE],
    ['brand-surface', token('brand-surface')],
  ] as const) {
    it(`brand-mark on ${name}`, () => {
      expect(contrastRatio(token('brand-mark'), ground)).toBeGreaterThanOrEqual(
        3,
      );
    });
  }
});

import { readdirSync, readFileSync } from 'node:fs';
import { fromBuffer } from '@capsizecss/unpack';
import { describe, expect, it } from 'vitest';

const FONTS = new URL('../../src/assets/fonts/', import.meta.url);
const css = readFileSync(
  new URL('../../src/styles/global.css', import.meta.url),
  'utf8',
);

// Arial Bold as Astro's fonts API measures it, so the hand-written Syne
// fallbacks follow the same rules as the generated Outfit ones.
const ARIAL_BOLD = { xWidthAvg: 983, unitsPerEm: 2048 };

/** The self-hosted files of a family, one per weight. */
function weights(family: string): Array<[number, URL]> {
  return readdirSync(new URL(`${family}/`, FONTS)).flatMap((file) => {
    const weight = /-(\d{3})\.woff2$/.exec(file)?.[1];
    return weight
      ? [[Number(weight), new URL(`${family}/${file}`, FONTS)]]
      : [];
  });
}

const metrics = (file: URL) => fromBuffer(readFileSync(file));

/** Same rounding as Astro's generated fallback faces. */
const percent = (value: number) =>
  `${Number.parseFloat((value * 100).toFixed(4))}%`;

/** The descriptors of the 'Syne Fallback' face for one weight. */
function syneFallback(weight: number): Record<string, string> {
  const face = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)]
    .map(([, body]) => body!)
    .find(
      (body) =>
        body.includes("font-family: 'Syne Fallback'") &&
        body.includes(`font-weight: ${weight};`),
    );
  if (!face) throw new Error(`No 'Syne Fallback' face for weight ${weight}`);
  return Object.fromEntries(
    [...face.matchAll(/([\w-]+(?:-adjust|-override)):\s*([^;]+);/g)].map(
      ([, name, value]) => [name, value!.trim()],
    ),
  );
}

describe('Syne fallback faces in global.css', () => {
  for (const [weight, file] of weights('syne')) {
    it(`match the metrics of Syne ${weight}`, async () => {
      const font = await metrics(file);
      const sizeAdjust =
        font.xWidthAvg /
        font.unitsPerEm /
        (ARIAL_BOLD.xWidthAvg / ARIAL_BOLD.unitsPerEm);
      const em = font.unitsPerEm * sizeAdjust;
      expect(syneFallback(weight)).toEqual({
        'size-adjust': percent(sizeAdjust),
        'ascent-override': percent(font.ascent / em),
        'descent-override': percent(Math.abs(font.descent) / em),
        'line-gap-override': percent(font.lineGap / em),
      });
    });
  }
});

describe('Outfit', () => {
  // Astro sizes one Arial fallback for every Outfit weight from the 400
  // file. That only holds while the weights stay about as wide as 400; past
  // that, Outfit needs per-weight fallbacks like Syne's.
  it('keeps every weight within 2.5% of the 400 width', async () => {
    const files = weights('outfit');
    const regular = files.find(([weight]) => weight === 400);
    expect(regular).toBeDefined();
    const base = (await metrics(regular![1])).xWidthAvg;
    for (const [weight, file] of files) {
      const ratio = (await metrics(file)).xWidthAvg / base;
      expect(Math.abs(ratio - 1), `Outfit ${weight}`).toBeLessThan(0.025);
    }
  });
});

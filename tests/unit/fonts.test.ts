import { readdirSync, readFileSync } from 'node:fs';
import { fromBuffer } from '@capsizecss/unpack';
import { describe, expect, it } from 'vitest';

const FONTS = new URL('../../src/assets/fonts/', import.meta.url);
const css = readFileSync(
  new URL('../../src/styles/global.css', import.meta.url),
  'utf8',
);

// Arial and Arial Bold as Astro's fonts API measures them, so the
// hand-written fallbacks follow the same rules Astro would.
const ARIAL = { xWidthAvg: 913, unitsPerEm: 2048 };
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

/** The descriptors of one fallback face in global.css. */
function fallbackFace(name: string, weight: number): Record<string, string> {
  const face = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)]
    .map(([, body]) => body!)
    .find(
      (body) =>
        body.includes(`font-family: '${name}'`) &&
        body.includes(`font-weight: ${weight};`),
    );
  if (!face) throw new Error(`No '${name}' face for weight ${weight}`);
  return Object.fromEntries(
    [...face.matchAll(/([\w-]+(?:-adjust|-override)|src):\s*([^;]+);/g)].map(
      ([, property, value]) => [property, value!.trim()],
    ),
  );
}

// [family folder, fallback family, the local font each weight stands in for]
const FAMILIES = [
  ['outfit', 'Outfit Fallback', (weight: number) => weight >= 700],
] as const;

for (const [family, name, usesBold] of FAMILIES) {
  describe(`${name} faces in global.css`, () => {
    for (const [weight, file] of weights(family)) {
      it(`match the metrics of ${family} ${weight}`, async () => {
        const font = await metrics(file);
        const local = usesBold(weight) ? ARIAL_BOLD : ARIAL;
        const sizeAdjust =
          font.xWidthAvg /
          font.unitsPerEm /
          (local.xWidthAvg / local.unitsPerEm);
        const em = font.unitsPerEm * sizeAdjust;
        expect(fallbackFace(name, weight)).toEqual({
          src: usesBold(weight) ? "local('Arial Bold')" : "local('Arial')",
          'size-adjust': percent(sizeAdjust),
          'ascent-override': percent(font.ascent / em),
          'descent-override': percent(Math.abs(font.descent) / em),
          'line-gap-override': percent(font.lineGap / em),
        });
      });
    }
  });
}

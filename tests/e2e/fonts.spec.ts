import fs from 'node:fs';
import { expect, test, type CDPSession } from '@playwright/test';

// Every built page, as a URL path.
const dist = new URL('../../dist/', import.meta.url);
const routes = fs
  .readdirSync(dist, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.html'))
  .map((file) => `/${file.replace(/index\.html$/, '')}`)
  .sort();

const TEXT_NODE = 3;

type DomNode = {
  nodeId: number;
  nodeType: number;
  nodeValue: string;
  children?: DomNode[];
};

/** Elements with visible text of their own, with that text. */
function textElements(node: DomNode, out: Array<[number, string]> = []) {
  const text = (node.children ?? [])
    .filter((child) => child.nodeType === TEXT_NODE)
    .map((child) => child.nodeValue)
    .join('')
    .trim();
  if (text) out.push([node.nodeId, text]);
  for (const child of node.children ?? []) textElements(child, out);
  return out;
}

/** Text the browser drew with anything but the self-hosted faces. */
async function fallbackText(client: CDPSession) {
  const { root } = await client.send('DOM.getDocument', { depth: -1 });
  const misses: string[] = [];
  for (const [nodeId, text] of textElements(root as DomNode)) {
    const { fonts } = await client.send('CSS.getPlatformFontsForNode', {
      nodeId,
    });
    const system = fonts.filter(
      (font) => !font.isCustomFont || !/^(Outfit|Syne)\b/.test(font.familyName),
    );
    if (system.length) {
      misses.push(
        `"${text.slice(0, 60)}" → ${system.map((font) => font.familyName).join(', ')}`,
      );
    }
  }
  return misses;
}

// Characters outside the Latin subsets silently fall back to a system font.
// If new copy needs one, add it in scripts/build-fonts.py and rebuild.
test('every page draws all of its text in Outfit or Syne', async ({ page }) => {
  test.slow();
  const client = await page.context().newCDPSession(page);
  await client.send('DOM.enable');
  await client.send('CSS.enable');

  const misses: string[] = [];
  for (const path of routes) {
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    misses.push(
      ...(await fallbackText(client)).map((miss) => `${path} ${miss}`),
    );
  }
  expect(misses).toEqual([]);
});

// Each page preloads only the faces its first screen draws with: every h1 is
// Outfit 700.
for (const [path, expected] of [
  ['/', ['Outfit 500', 'Outfit 600', 'Outfit 700']],
  ['/products/business-cards/', ['Outfit 400', 'Outfit 500', 'Outfit 700']],
] as const) {
  test(`preloads only the first screen faces on ${path}`, async ({ page }) => {
    await page.goto(path);
    const preloaded = await page.evaluate(() => {
      const faces = [...document.styleSheets]
        .flatMap((sheet) => [...sheet.cssRules])
        .filter(
          (rule): rule is CSSFontFaceRule => rule instanceof CSSFontFaceRule,
        );
      return [
        ...document.querySelectorAll<HTMLLinkElement>(
          'link[rel="preload"][as="font"]',
        ),
      ].map((link) => {
        const face = faces.find((rule) =>
          rule.style
            .getPropertyValue('src')
            .includes(new URL(link.href).pathname),
        );
        // Astro suffixes family names with a hash, e.g. "Outfit-c953684c".
        const family = face?.style
          .getPropertyValue('font-family')
          .replace(/-\w+$/, '');
        return `${family} ${face?.style.getPropertyValue('font-weight')}`;
      });
    });
    expect(preloaded.sort()).toEqual([...expected]);
  });
}

import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { SITE } from '../../src/consts';

const dist = new URL('../../dist/', import.meta.url);

/** Every built page as [path, html]. */
function builtPages(): Array<[string, string]> {
  return fs
    .readdirSync(dist, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file, fs.readFileSync(new URL(file, dist), 'utf8')]);
}

// Astro copies a full-size original into dist/_astro whenever code reads its
// metadata directly (e.g. image.width). Originals can carry details the
// resized versions don't show, so every image there must be one a built page
// actually references.
test('ships no image that no page references', () => {
  const html = builtPages()
    .map(([, page]) => page)
    .join('\n');
  const images = fs
    .readdirSync(new URL('_astro/', dist))
    .filter((file) => /\.(avif|webp|jpe?g|png)$/.test(file));

  expect(images.length).toBeGreaterThan(0);
  expect(images.filter((file) => !html.includes(file))).toEqual([]);
});

test('ships no tel: links while DYJK has no phone number', () => {
  test.skip(SITE.phone !== null, 'SITE.phone is set');
  const withTel = builtPages()
    .filter(([, html]) => /href=["']?tel:/i.test(html))
    .map(([file]) => file);
  expect(withTel).toEqual([]);
});

test('never shows the old number, which was never DYJK’s', () => {
  const withOldNumber = builtPages()
    .filter(([, html]) => /960\W?3396/.test(html))
    .map(([file]) => file);
  expect(withOldNumber).toEqual([]);
});

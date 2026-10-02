import fs from 'node:fs';
import { expect, test } from '@playwright/test';

// Astro copies a full-size original into dist/_astro whenever code reads its
// metadata directly (e.g. image.width). Originals can carry details the
// resized versions don't show, so every image there must be one a built page
// actually references.
test('ships no image that no page references', () => {
  const dist = new URL('../../dist/', import.meta.url);
  const html = fs
    .readdirSync(dist, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.html'))
    .map((file) => fs.readFileSync(new URL(file, dist), 'utf8'))
    .join('\n');
  const images = fs
    .readdirSync(new URL('_astro/', dist))
    .filter((file) => /\.(avif|webp|jpe?g|png)$/.test(file));

  expect(images.length).toBeGreaterThan(0);
  expect(images.filter((file) => !html.includes(file))).toEqual([]);
});

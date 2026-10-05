import fs from 'node:fs';
import { expect, test } from '@playwright/test';

// Every built page, as a URL path.
const dist = new URL('../../dist/', import.meta.url);
const routes = fs
  .readdirSync(dist, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.html'))
  .map((file) => `/${file.replace(/index\.html$/, '')}`)
  .sort();

for (const width of [390, 1440]) {
  test(`no page scrolls sideways at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    const overflowing: string[] = [];
    for (const path of routes) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (scrollWidth > clientWidth) {
        overflowing.push(`${path} (${scrollWidth} > ${clientWidth})`);
      }
    }
    expect(overflowing).toEqual([]);
  });
}

// Product and service pages ask for themselves, the portfolio and the
// contact page close on their own heading, and every other page with the
// band keeps the default.
test('the CTA band heading fits each page', async ({ page }) => {
  test.slow();
  const wrong: string[] = [];
  for (const path of routes) {
    await page.goto(path);
    const cta = page.locator('main section.on-dark h2');
    if ((await cta.count()) === 0) continue;
    const heading = (await cta.innerText()).trim();
    const expected = /^\/(products|services)\/[^/]+\/$/.test(path)
      ? `Need ${(await page.locator('h1').innerText()).trim().toLowerCase()}?`
      : path === '/portfolio/'
        ? 'Want to see examples like yours?'
        : path === '/contact/'
          ? "Let's get you noticed."
          : 'Ready to start your print project?';
    if (heading !== expected) wrong.push(`${path}: "${heading}"`);
  }
  expect(wrong).toEqual([]);
});

test('the hero tiles load eagerly, the flyer first', async ({ page }) => {
  await page.goto('/');
  const tiles = page.locator('section[aria-label="Introduction"] figure img');
  await expect(tiles).toHaveCount(5);
  for (const img of await tiles.all()) {
    await expect(img).toHaveAttribute('loading', 'eager');
  }
  const priority = page.locator(
    'section[aria-label="Introduction"] img[fetchpriority="high"]',
  );
  await expect(priority).toHaveCount(1);
  await expect(priority).toHaveAttribute('alt', /Atomic Auto Show flyer/);
});

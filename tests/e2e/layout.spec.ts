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

// Product and service pages ask for themselves; the homepage, portfolio,
// contact and about pages close on their own heading; every other page with
// the band keeps the default.
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
          : path === '/about/'
            ? "Let's print it together."
            : path === '/'
              ? 'Ready to get noticed?'
              : 'Ready to start your print project?';
    if (heading !== expected) wrong.push(`${path}: "${heading}"`);
  }
  expect(wrong).toEqual([]);
});

test('the hero fan loads the first image eagerly', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('section[aria-label="Introduction"] .fan-card');
  await expect(cards).toHaveCount(5);
  const images = await cards.locator('img').all();
  for (const [index, img] of images.entries()) {
    await expect(img).toHaveAttribute(
      'loading',
      index === 0 ? 'eager' : 'lazy',
    );
  }
  // The first fan image is the one the browser should fetch immediately.
  const priority = page.locator(
    'section[aria-label="Introduction"] img[fetchpriority="high"]',
  );
  await expect(priority).toHaveCount(1);
  await expect(cards.first().locator('img')).toHaveAttribute(
    'fetchpriority',
    'high',
  );
  await expect(cards.last()).toHaveAttribute('aria-label', 'Flyers');
});

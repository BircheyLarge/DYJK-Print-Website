import fs from 'node:fs';
import { expect, test } from '@playwright/test';

// Stanley: everything is ordered online or by email and shipped, except in
// Salt Lake City, where DYJK delivers. No pick-up, showroom or address.
const dist = new URL('../../dist/', import.meta.url);
const routes = fs
  .readdirSync(dist, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.html'))
  .map((file) => `/${file.replace(/index\.html$/, '')}`)
  .sort();

const DELIVERY_PAGES = ['/about/', '/contact/', '/request-a-quote/'];
const NEVER = ['showroom', 'show room', 'pick-up', 'walk-in', 'in-store'];

test('Salt Lake City is only where we deliver, and nothing offers pick-up', async ({
  page,
}) => {
  test.slow();
  const wrong: string[] = [];
  for (const path of routes) {
    await page.goto(path);
    const text = (await page.locator('body').innerText()).toLowerCase();
    for (const term of NEVER) {
      if (text.includes(term)) wrong.push(`${path}: "${term}"`);
    }
    const mentions = text.match(/[^.]*salt lake[^.]*\./g) ?? [];
    if (mentions.length > 0 && !DELIVERY_PAGES.includes(path)) {
      wrong.push(`${path}: names Salt Lake City`);
    }
    for (const sentence of mentions) {
      if (!sentence.includes('deliver')) wrong.push(`${path}: "${sentence}"`);
    }
  }
  expect(wrong).toEqual([]);
  // And each of the three says it.
  for (const path of DELIVERY_PAGES) {
    await page.goto(path);
    await expect(page.locator('main'), path).toContainText('Salt Lake City');
  }
});

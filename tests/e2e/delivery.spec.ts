import fs from 'node:fs';
import { expect, test } from '@playwright/test';

// Local first (Stanley and The voyeur, October 2026): DYJK delivers in person
// across the Salt Lake City area and ships everywhere else. Salt Lake City
// appears only on these pages, and on all but /salt-lake-city/ only in a
// sentence about delivery, which keeps it from turning into stuffing. No
// pick-up, showroom or address anywhere.
const dist = new URL('../../dist/', import.meta.url);
const routes = fs
  .readdirSync(dist, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.html'))
  .map((file) => `/${file.replace(/index\.html$/, '')}`)
  .sort();

const LOCAL_PAGE = '/salt-lake-city/';
const DELIVERY_PAGES = [
  '/',
  LOCAL_PAGE,
  '/about/',
  '/contact/',
  '/request-a-quote/',
  ...[
    'business-cards',
    'flyers',
    'door-hangers',
    'postcards-mailers',
    'menus',
  ].map((slug) => `/products/${slug}/`),
];
// May say it as well: what happens after a quote request, with the form on.
const ALSO_ALLOWED = ['/quote-received/'];
const NEVER = ['showroom', 'show room', 'pick-up', 'walk-in', 'in-store'];
const cap = (path: string) => (path === LOCAL_PAGE ? 8 : 2);

test('Salt Lake City is only where we deliver, and nothing offers pick-up', async ({
  page,
}) => {
  test.slow();
  const wrong: string[] = [];
  for (const path of routes) {
    await page.goto(path);
    const body = (await page.locator('body').innerText()).toLowerCase();
    const main = (await page.locator('main').innerText()).toLowerCase();
    for (const term of NEVER) {
      if (body.includes(term)) wrong.push(`${path}: "${term}"`);
    }
    // In the page itself; the footer's "Salt Lake City delivery" link is on
    // every page.
    const mentions = (main.match(/salt lake/g) ?? []).length;
    if (
      mentions > 0 &&
      !DELIVERY_PAGES.includes(path) &&
      !ALSO_ALLOWED.includes(path)
    ) {
      wrong.push(`${path}: names Salt Lake City`);
    }
    if (mentions > cap(path)) wrong.push(`${path}: ${mentions} mentions`);
    if (path !== LOCAL_PAGE) {
      for (const sentence of body.match(/[^.]*salt lake[^.]*\./g) ?? []) {
        if (!sentence.includes('deliver')) {
          wrong.push(`${path}: "${sentence.trim()}"`);
        }
      }
    }
  }
  expect(wrong).toEqual([]);
  // And each of them says it.
  for (const path of DELIVERY_PAGES) {
    await page.goto(path);
    await expect(page.locator('main'), path).toContainText('Salt Lake City');
  }
});

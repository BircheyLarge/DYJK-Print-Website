import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SERVICES } from '../../src/data/catalog';

// Product pages come from the products collection; drafts aren't built.
const PRODUCTS_DIR = new URL('../../src/content/products/', import.meta.url);
const isDraft = (file: string) =>
  /^draft:\s*true\s*$/m.test(
    /^---\r?\n([\s\S]*?)\r?\n---/.exec(
      fs.readFileSync(new URL(file, PRODUCTS_DIR), 'utf8'),
    )?.[1] ?? '',
  );
const PRODUCT_ROUTES = fs
  .readdirSync(PRODUCTS_DIR)
  .filter((file) => file.endsWith('.md') && !isDraft(file))
  .map((file) => `/products/${file.replace(/\.md$/, '')}/`);

// Cover every generated route (sourced from the catalog and content so it
// stays in sync), plus the 404 page.
const STATIC_ROUTES = [
  '/',
  '/services/',
  '/products/',
  '/industries/',
  '/portfolio/',
  '/about/',
  '/contact/',
  '/request-a-quote/',
];
const pages = [
  ...STATIC_ROUTES,
  ...SERVICES.map((service) => service.href),
  ...PRODUCT_ROUTES,
  '/this-route-does-not-exist/',
];

for (const path of pages) {
  test(`a11y: no serious or critical violations on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}

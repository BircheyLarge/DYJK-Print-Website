import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { SERVICES } from '../../src/data/catalog';

// Cover every generated route (sourced from the catalog so it stays in sync),
// plus the 404 page.
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

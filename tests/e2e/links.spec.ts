import { expect, test } from '@playwright/test';

/**
 * Crawl the internal links exposed by the shell (nav, footer, CTAs, cards)
 * and assert none of them 404. Guards against linking to routes that don't
 * exist yet.
 */
const SEED_PAGES = ['/', '/services/'];

async function internalLinks(
  page: import('@playwright/test').Page,
): Promise<string[]> {
  const hrefs = await page
    .locator('a[href]')
    .evaluateAll((els) =>
      els
        .map((el) => el.getAttribute('href'))
        .filter((h): h is string => !!h && h.startsWith('/')),
    );
  return [...new Set(hrefs)];
}

test('no internal link in the shell 404s', async ({ page }) => {
  const toVisit = new Set<string>();
  for (const seed of SEED_PAGES) {
    await page.goto(seed);
    for (const href of await internalLinks(page)) toVisit.add(href);
  }

  expect(toVisit.size).toBeGreaterThan(5);

  for (const href of toVisit) {
    const response = await page.goto(href);
    expect(response, `no response for ${href}`).not.toBeNull();
    expect(response!.status(), `${href} returned ${response!.status()}`).toBe(
      200,
    );
    await expect(page.locator('h1'), `${href} missing h1`).toHaveCount(1);
  }
});

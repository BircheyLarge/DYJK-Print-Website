import { expect, test } from '@playwright/test';
import { SITE } from '../../src/consts';
import { mailtoHref, QUOTE_EMAIL } from '../../src/lib/email';

test.describe('about', () => {
  test('opens on the Utah hook, then tells the story in order', async ({
    page,
  }) => {
    await page.goto('/about/');
    await expect(page.locator('h1')).toHaveText(
      'A small company that knows your job.',
    );
    await expect(page.locator('main h2')).toHaveText([
      'Who we are',
      'What we bring',
      'Why small beats big',
      'Who we do it for',
      "Let's print it together.",
    ]);
  });

  test('closes with a free quote, a call and an email', async ({ page }) => {
    await page.goto('/about/');
    const close = page.locator('section[aria-labelledby="print-together"]');
    await expect(
      close.getByRole('link', { name: 'Get a free quote' }),
    ).toHaveAttribute('href', '/request-a-quote/');
    await expect(close.locator('a[href^="tel:"]')).toHaveCount(
      SITE.phone ? 1 : 0,
    );
    await expect(
      close.getByRole('link', { name: SITE.email, exact: true }),
    ).toHaveAttribute('href', mailtoHref(SITE.email, QUOTE_EMAIL));
  });

  test('is indexable, and names no street or person', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE.url}/about/`,
    );
    const text = (await page.locator('main').innerText()).toLowerCase();
    expect(text).toContain('utah');
    // Salt Lake City only as where we deliver (Stanley, 2026-10-23).
    expect(text).toContain('we deliver in the salt lake city area');
    for (const term of ['draper', 'po box', 'showroom', 'stanley', 'stan ']) {
      expect(text, `mentions "${term}"`).not.toContain(term);
    }
  });
});

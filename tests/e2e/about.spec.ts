import { expect, test } from '@playwright/test';
import { SITE } from '../../src/consts';

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
    await expect(close.locator(`a[href="mailto:${SITE.email}"]`)).toHaveCount(
      1,
    );
  });

  test('is indexable, and names no city, street or person', async ({
    page,
  }) => {
    await page.goto('/about/');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${SITE.url}/about/`,
    );
    const text = (await page.locator('main').innerText()).toLowerCase();
    expect(text).toContain('utah');
    for (const term of ['draper', 'salt lake', 'po box', 'stanley', 'stan ']) {
      expect(text, `mentions "${term}"`).not.toContain(term);
    }
  });
});

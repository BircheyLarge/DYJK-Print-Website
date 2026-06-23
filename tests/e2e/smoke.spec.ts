import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('renders the hero with a single h1 and brand title', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DYJK Print/);
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Your Vision, Our Precision');
  });

  test('exposes the primary quote CTA', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'Request a Quote' }).first();
    await expect(cta).toHaveAttribute('href', '/request-a-quote/');
  });

  test('emits Organization JSON-LD without a physical address', async ({
    page,
  }) => {
    await page.goto('/');
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const joined = blocks.join('\n');
    expect(joined).toContain('"@type":"Organization"');
    expect(joined).not.toContain('postalAddress');
    expect(joined).not.toContain('LocalBusiness');
  });

  test('does not surface a street address anywhere on the page', async ({
    page,
  }) => {
    await page.goto('/');
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('po box');
    expect(body).not.toContain('draper');
  });
});

test.describe('navigation', () => {
  test('mobile menu toggles open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Toggle navigation menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('404', () => {
  test('serves a not-found page for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText("couldn't find");
  });
});

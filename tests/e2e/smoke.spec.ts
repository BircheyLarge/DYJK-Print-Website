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

  test('links the Recent work strip to the portfolio', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('link', { name: 'View our portfolio' }),
    ).toHaveAttribute('href', '/portfolio/');
  });

  test('keeps a space between the year and name in the footer', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toContainText(/© \d{4} DYJK Print\./);
  });
});

test.describe('portfolio', () => {
  test('renders every piece as a responsive AVIF/WebP picture', async ({
    page,
  }) => {
    await page.goto('/portfolio/');
    const figures = await page.locator('main figure').all();
    expect(figures.length).toBeGreaterThan(0);
    for (const figure of figures) {
      await expect(figure.locator('source[type="image/avif"]')).toHaveCount(1);
      await expect(figure.locator('source[type="image/webp"]')).toHaveCount(1);
      const img = figure.locator('img');
      // Intrinsic size reserves the box before load (no layout shift).
      await expect(img).toHaveAttribute('width', /^\d+$/);
      await expect(img).toHaveAttribute('height', /^\d+$/);
      await expect(img).toHaveAttribute('sizes', /\S/);
      await expect(img).toHaveAttribute('alt', /\S/);
    }
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

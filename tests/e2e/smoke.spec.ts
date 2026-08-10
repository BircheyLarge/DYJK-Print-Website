import { expect, test } from '@playwright/test';

test.describe('harness', () => {
  /*
   * Guards the suite itself. If Playwright is ever pointed at `astro dev`
   * instead of `astro preview`, every other test still runs — against markup
   * that isn't what ships, with the dev toolbar injecting extra landmarks and
   * headings. That surfaced once as "the home page has 5 h1s" and read as an
   * app bug for two people before anyone suspected the server. Fail here
   * instead, with a message that names the actual cause.
   */
  test('is testing the production build, not the dev server', async ({
    page,
  }) => {
    await page.goto('/');
    const html = (await page.content()).toLowerCase();
    const devMarkers = ['astro-dev-toolbar', '@vite/client', 'astro:scripts'];
    const found = devMarkers.filter((marker) => html.includes(marker));
    expect(
      found,
      `Served HTML contains dev-server markers (${found.join(', ')}). ` +
        'Playwright is talking to `astro dev`, not `astro preview` — check ' +
        'the port and reuseExistingServer in playwright.config.ts.',
    ).toEqual([]);
  });
});

test.describe('home page', () => {
  test('renders the hero with a single h1 and brand title', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DYJK Print/);
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Nationwide Commercial Printing');
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

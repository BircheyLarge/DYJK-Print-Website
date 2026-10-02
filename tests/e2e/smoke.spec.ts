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

test.describe('product pages', () => {
  const LOCAL_TERMS = ['utah', 'salt lake', 'near you', 'draper', 'po box'];

  test('every hub card leads to a well-formed, nationwide product page', async ({
    page,
  }) => {
    await page.goto('/products/');
    const hrefs = await page
      .locator('main a[href^="/products/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      await page.goto(href);
      await expect(page.locator('h1'), href).toHaveCount(1);

      const ld = (
        await page
          .locator('script[type="application/ld+json"]')
          .allTextContents()
      ).join('\n');
      expect(ld, href).toContain('"@type":"BreadcrumbList"');
      // No prices, so no Product/Offer markup.
      expect(ld, href).not.toMatch(/"@type":"(Product|Offer)"/);
      // FAQ markup must match the questions shown on the page.
      const shownFaqs = await page.locator('main dt').count();
      expect((ld.match(/"@type":"Question"/g) ?? []).length, href).toBe(
        shownFaqs,
      );

      const text = (await page.locator('main').innerText()).toLowerCase();
      for (const term of LOCAL_TERMS) {
        expect(text, `${href} mentions "${term}"`).not.toContain(term);
      }

      // Product-page images share one 3:2 frame, cropped at build time.
      for (const img of await page.locator('main figure img').all()) {
        const width = Number(await img.getAttribute('width'));
        const height = Number(await img.getAttribute('height'));
        expect(width / height, `${href} image ratio`).toBeCloseTo(1.5, 2);
      }
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

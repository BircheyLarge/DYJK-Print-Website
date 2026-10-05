import { expect, test } from '@playwright/test';
import { SERVICES } from '../../src/data/catalog';

test.describe('home page', () => {
  test('renders the hero with a single h1 and brand title', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DYJK Print/);
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    // The <br> stacks it like the card; innerText reads it as one line.
    await expect(h1).toContainText('Your Vision, Our Precision', {
      useInnerText: true,
    });
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

  test('footer labels are not headings', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('footer :is(h1, h2, h3, h4, h5, h6)'),
    ).toHaveCount(0);
  });

  test('keeps the meta description within a search snippet', async ({
    page,
  }) => {
    await page.goto('/');
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(description!.length).toBeLessThanOrEqual(155);
  });

  test('links to every product page', async ({ page }) => {
    await page.goto('/products/');
    const products = await page
      .locator('main a[href^="/products/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    await page.goto('/');
    const linked = await page
      .locator('main a[href^="/products/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(products.length).toBeGreaterThan(0);
    expect(new Set(linked)).toEqual(new Set(products));
  });
});

test.describe('service pages', () => {
  for (const service of SERVICES) {
    test(`${service.href} has breadcrumbs and FAQ markup matching the page`, async ({
      page,
    }) => {
      await page.goto(service.href);
      await expect(page.locator('h1')).toHaveCount(1);
      const ld = (
        await page
          .locator('script[type="application/ld+json"]')
          .allTextContents()
      ).join('\n');
      expect(ld).toContain('"@type":"BreadcrumbList"');
      expect(ld).toContain('"@type":"Service"');
      const shownFaqs = await page.locator('main dt').count();
      expect((ld.match(/"@type":"Question"/g) ?? []).length).toBe(shownFaqs);
    });
  }
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

test.describe('products hub', () => {
  test('every card shows a 3:2 thumbnail or the drawn placeholder', async ({
    page,
  }) => {
    await page.goto('/products/');
    const cards = await page.locator('main a[href^="/products/"]').all();
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const href = await card.getAttribute('href');
      const img = card.locator('img');
      const placeholder = card.locator('[data-placeholder]');
      expect((await img.count()) + (await placeholder.count()), href!).toBe(1);

      if ((await img.count()) === 1) {
        // The card's own text names the product.
        await expect(img, href!).toHaveAttribute('alt', '');
        const width = Number(await img.getAttribute('width'));
        const height = Number(await img.getAttribute('height'));
        expect(width / height, href!).toBeCloseTo(1.5, 2);
      }
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

      // Example thumbnails share one 3:2 frame, cropped at build time.
      for (const img of await page.locator('main a[data-lightbox] img').all()) {
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
    const menu = page.locator('#mobile-nav');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.getByRole('link', { name: 'Products' })).toBeVisible();

    // Escape closes it from inside and hands focus back to the toggle.
    await menu.getByRole('link', { name: 'Products' }).focus();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
});

test.describe('404', () => {
  test('serves a not-found page for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist/');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText("couldn't find");
  });
});

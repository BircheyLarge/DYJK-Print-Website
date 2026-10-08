import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Business cards has the most examples, so it exercises the grid hardest.
const PAGE = '/products/business-cards/';

test.describe('product example lightbox', () => {
  test('opens an accessible dialog and hands focus back on Escape', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const trigger = page.locator('a[data-lightbox]').first();
    const heading = await page.locator('h1').boundingBox();
    const thumbWidth = await trigger
      .locator('img')
      .evaluate((img) => img.getBoundingClientRect().width);

    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/\S/);
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();

    // The enlarged image is the full frame and loads at a larger size.
    const large = dialog.locator('img');
    await expect
      .poll(() => large.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(thumbWidth * 2);
    // Opening it doesn't move the page underneath.
    expect(await page.locator('h1').boundingBox()).toEqual(heading);

    const results = await new AxeBuilder({ page })
      .include('dialog[open]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('product example lightbox without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('each thumbnail links straight to a large WebP', async ({
    page,
    request,
  }) => {
    await page.goto(PAGE);
    const links = page.locator('a[data-lightbox]');
    const hrefs = await links.evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')!),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
      expect(response.headers()['content-type'], href).toBe('image/webp');
    }

    await links.first().click();
    await expect(page).toHaveURL(/\.webp$/);
  });
});

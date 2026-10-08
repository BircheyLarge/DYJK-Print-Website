import { expect, test } from '@playwright/test';

test.describe('portfolio', () => {
  test('tells eight featured stories with a picture, words and a product link', async ({
    page,
  }) => {
    await page.goto('/portfolio/');
    const stories = page.locator(
      'section[aria-labelledby="featured-projects"] article',
    );
    await expect(stories).toHaveCount(8);
    for (const [index, story] of (await stories.all()).entries()) {
      await expect(story.locator('h3')).toHaveText(/\S/);
      await expect(story.locator('p').first()).toHaveText(/\S/);
      // Only the first story's picture can be near the fold.
      await expect(story.locator('a[data-lightbox] img')).toHaveAttribute(
        'loading',
        index === 0 ? 'eager' : 'lazy',
      );
      await expect(
        story.locator('a[href^="/products/"]').last(),
      ).toHaveAttribute('href', /^\/products\/[\w-]+\/$/);
    }
  });

  test('groups the rest by product in the hub order, each with a caption', async ({
    page,
  }) => {
    await page.goto('/products/');
    const hubOrder = await page.locator('main a h2').allInnerTexts();

    await page.goto('/portfolio/');
    const groups = page.locator('section[aria-labelledby="more-work"] section');
    const names = (await groups.locator('h3').allInnerTexts()).map((name) =>
      name.replace(/\s*→\s*$/, ''),
    );
    expect(names.length).toBeGreaterThan(0);
    expect(names).toEqual(hubOrder.filter((title) => names.includes(title)));

    for (const item of await groups.locator('li').all()) {
      await expect(item.locator('p')).toHaveText(/\S/);
      await expect(item.locator('a[data-lightbox] img')).toHaveAttribute(
        'loading',
        'lazy',
      );
    }
  });

  test('shows every thumbnail as a sized 3:2 picture', async ({ page }) => {
    await page.goto('/portfolio/');
    const thumbnails = page.locator('main a[data-lightbox] img');
    expect(await thumbnails.count()).toBeGreaterThan(8);
    for (const img of await thumbnails.all()) {
      const width = Number(await img.getAttribute('width'));
      const height = Number(await img.getAttribute('height'));
      expect(width / height).toBeCloseTo(1.5, 2);
      await expect(img).toHaveAttribute('sizes', /\S/);
      await expect(img).toHaveAttribute('alt', /\S/);
    }
  });

  test('names the businesses but never a person', async ({ page }) => {
    await page.goto('/portfolio/');
    const text = await page.locator('main').innerText();
    expect(text).toContain('Jeppson Dental');
    // People named on the pieces, withheld by the copy doc.
    for (const person of [
      'Joe Jeppson',
      'Chris Nielsen',
      'Jason Rees',
      'Mike Green',
    ]) {
      expect(text).not.toContain(person);
    }
  });
});

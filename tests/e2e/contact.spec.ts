import { expect, test } from '@playwright/test';
import { SITE } from '../../src/consts';

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('contact', () => {
  test('hooks, answers the hook, then asks', async ({ page }) => {
    await page.goto('/contact/');
    await expect(page.locator('h1')).toHaveText(
      'Ready to be impossible to walk past?',
    );
    await expect(page.locator('main h2')).toHaveText([
      'What happens when you reach out',
      'What to send us',
      "Let's get you noticed.",
      'Frequently asked questions',
    ]);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Get a free quote from DYJK Print: send your idea, approve a proof before anything prints, and get it shipped anywhere in the US.',
    );
  });

  test('the call to action offers a free quote, a call and an email', async ({
    page,
  }) => {
    await page.goto('/contact/');
    const cta = page.locator('section[aria-labelledby="get-noticed"]');
    await expect(
      cta.getByRole('link', { name: 'Get a free quote' }),
    ).toHaveAttribute('href', '/request-a-quote/');
    if (SITE.phone) {
      await expect(
        cta.getByRole('link', {
          name: new RegExp(`^Call ${escape(SITE.phone.display)}`),
        }),
      ).toHaveAttribute('href', `tel:${SITE.phone.e164}`);
    }
    await expect(
      cta.getByRole('link', {
        name: new RegExp(`^Email ${escape(SITE.email)}`),
      }),
    ).toHaveAttribute('href', `mailto:${SITE.email}`);
  });

  test('marks up the questions it shows as a FAQPage', async ({ page }) => {
    await page.goto('/contact/');
    const shown = await page.locator('main dt').allInnerTexts();
    const nodes = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).flatMap((block) => [JSON.parse(block)].flat());
    const faq = nodes.find((node) => node['@type'] === 'FAQPage');
    expect(shown).toHaveLength(3);
    expect(
      faq.mainEntity.map((question: { name: string }) => question.name),
    ).toEqual(shown);
  });

  test('a phone reaches the call to action within one scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/contact/');
    await page.evaluate(() => document.fonts.ready);
    const box = await page
      .locator('section[aria-labelledby="get-noticed"]')
      .getByRole('link', { name: 'Get a free quote' })
      .boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(2 * 844);
  });
});

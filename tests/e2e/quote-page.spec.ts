import { expect, test } from '@playwright/test';

// The default build: PUBLIC_QUOTE_FORM_ENABLED is not 'true', so the quote
// page stays the email-or-call page.
test('with the form off, /request-a-quote/ is the email-or-call page', async ({
  page,
}) => {
  await page.goto('/request-a-quote/');
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('.cf-turnstile')).toHaveCount(0);
  await expect(
    page.locator('script[src*="challenges.cloudflare.com"]'),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Email your project details' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /^Open in Gmail/ }),
  ).toBeVisible();
  await expect(page.locator('h2')).toHaveText([
    'What happens after you send this',
    'What to include',
  ]);
});

test('/quote-received/ stays out of search', async ({ page }) => {
  await page.goto('/quote-received/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  );
});

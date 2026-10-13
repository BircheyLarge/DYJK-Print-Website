import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { SITE } from '../../src/consts';
import { QUOTE_NEXT } from '../../src/data/quote';
import { PRODUCT_CHOICES } from '../../src/lib/quote';

// Runs in the "quote-form" project, against the build made with
// PUBLIC_QUOTE_FORM_ENABLED=true (npm run build:form). Turnstile's script is
// replaced with a stand-in that fills in its documented dummy token, so the
// suite never calls Cloudflare.
const TOKEN = 'XXXX.DUMMY.TOKEN.XXXX';
const TURNSTILE = `
  function fill() {
    for (const widget of document.querySelectorAll('.cf-turnstile')) {
      let input = widget.querySelector('input[name="cf-turnstile-response"]');
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'cf-turnstile-response';
        widget.append(input);
      }
      input.value = '${TOKEN}';
    }
  }
  window.turnstile = { reset() { window.__resets = (window.__resets || 0) + 1; fill(); } };
  fill();
`;

test.beforeEach(async ({ page }) => {
  await page.route('https://challenges.cloudflare.com/**', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: TURNSTILE }),
  );
});

const field = (page: Page, label: string) =>
  page.getByLabel(label, { exact: true });

async function fillRequired(page: Page) {
  await field(page, 'Name').fill('Jamie Rivera');
  await field(page, 'Email').fill('jamie@example.com');
  await field(page, 'What are we printing?').selectOption('Business Cards');
  await field(page, 'Quantity').fill('500');
  await field(page, 'State or ZIP').fill('UT');
}

test('the form has its fields, labels and spam checks', async ({ page }) => {
  await page.goto('/request-a-quote/');
  const form = page.locator('form[data-quote-form]');
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form).toHaveAttribute('action', '/api/quote');

  const required = ['Name', 'Email', 'What are we printing?', 'Quantity'];
  const optional = [
    'Phone (optional)',
    'Company (optional)',
    'Finished size (optional)',
    'Paper or finish (optional)',
    'Your date (optional)',
    'Link to your files (optional)',
    'Notes (optional)',
  ];
  for (const label of required) {
    await expect(field(page, label), label).toHaveAttribute('required', '');
  }
  for (const label of optional) {
    await expect(field(page, label), label).not.toHaveAttribute('required');
  }

  await expect(
    field(page, 'What are we printing?').locator('option'),
  ).toHaveText(['Choose one', ...PRODUCT_CHOICES]);
  await expect(page.getByRole('radio', { name: 'Ship it' })).toBeChecked();
  await expect(
    page.getByRole('radio', { name: 'Salt Lake City, deliver it' }),
  ).toBeVisible();
  await expect(field(page, 'State or ZIP')).toBeVisible();
  await expect(page.locator('#q-artwork-hint')).toContainText(
    `You can also email files to ${SITE.email} afterward.`,
  );

  await expect(
    page.getByText('We use these details only to quote and deliver your job.'),
  ).toBeVisible();
  await expect(page.getByRole('checkbox')).toHaveCount(0);

  // Spam checks: a honeypot no one can reach, the issued-at stamp, Turnstile.
  await expect(form.locator('input[name="website"]')).toHaveCount(1);
  await expect(
    page.getByRole('textbox', { name: 'Leave this field empty' }),
  ).toHaveCount(0);
  await expect(form.locator('input[type="hidden"][name="issued"]')).toHaveCount(
    1,
  );
  await expect(form.locator('.cf-turnstile')).toHaveAttribute(
    'data-sitekey',
    /\S/,
  );
  await expect(form.locator('[name="cf-turnstile-response"]')).toHaveValue(
    TOKEN,
  );
});

test('axe finds nothing on the form page', async ({ page }) => {
  await page.goto('/request-a-quote/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('an empty send shows inline errors and moves focus to the first', async ({
  page,
}) => {
  await page.goto('/request-a-quote/');
  await page.getByRole('button', { name: 'Send my quote request' }).click();

  for (const [label, error] of [
    ['Name', 'Please enter your name.'],
    ['Email', 'Please enter your email, so we can send the quote.'],
    ['What are we printing?', 'Please choose what we’re printing.'],
    ['Quantity', 'Roughly how many do you need?'],
    ['State or ZIP', 'Tell us the state or ZIP it ships to.'],
  ] as const) {
    await expect(field(page, label), label).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(field(page, label), label).toHaveAccessibleDescription(
      new RegExp(error.replace(/[.?]/g, '\\$&')),
    );
  }
  await expect(field(page, 'Name')).toBeFocused();
  await expect(page.getByRole('status').first()).toHaveText(
    '5 details need another look.',
  );

  // Fixing a field clears its error.
  await field(page, 'Name').fill('Jamie');
  await expect(field(page, 'Name')).not.toHaveAttribute('aria-invalid');
});

test('sends with fetch and lands on /quote-received/', async ({ page }) => {
  let sent: { accept: string | null; body: string } | null = null;
  await page.route('**/api/quote', async (route) => {
    sent = {
      accept: route.request().headers()['accept'] ?? null,
      body: route.request().postData() ?? '',
    };
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto('/request-a-quote/');
  await fillRequired(page);
  await page.getByRole('button', { name: 'Send my quote request' }).click();
  await expect(page).toHaveURL(/\/quote-received\/$/);
  expect(sent!.accept).toContain('application/json');
  expect(sent!.body).toContain('Jamie Rivera');
  expect(sent!.body).toContain(TOKEN);
});

test('Salt Lake City delivery needs no state or ZIP', async ({ page }) => {
  await page.route('**/api/quote', (route) =>
    route.fulfill({ json: { ok: true } }),
  );
  await page.goto('/request-a-quote/');
  await fillRequired(page);
  await field(page, 'State or ZIP').fill('');
  await page.getByRole('radio', { name: 'Salt Lake City, deliver it' }).check();
  await page.getByRole('button', { name: 'Send my quote request' }).click();
  await expect(page).toHaveURL(/\/quote-received\/$/);
});

for (const [name, answer] of [
  [
    'a server error',
    {
      status: 503,
      json: { ok: false, message: 'We couldn’t send that just now.' },
    },
  ],
  ['a network failure', null],
] as const) {
  test(`${name} keeps what was typed and offers the phone and email`, async ({
    page,
  }) => {
    await page.route('**/api/quote', (route) =>
      answer ? route.fulfill(answer) : route.abort('failed'),
    );
    await page.goto('/request-a-quote/');
    await fillRequired(page);
    await page.getByRole('button', { name: 'Send my quote request' }).click();

    const failure = page.locator('[data-quote-failure]');
    await expect(failure).toBeVisible();
    await expect(failure).toBeFocused();
    await expect(failure).toContainText('We couldn’t send that.');
    if (SITE.phone) {
      await expect(
        failure.locator(`a[href="tel:${SITE.phone.e164}"]`),
      ).toHaveText(SITE.phone.display);
    }
    await expect(
      failure.getByRole('link', { name: /^Open in Gmail/ }),
    ).toBeVisible();
    await expect(
      failure.getByRole('link', { name: /^Open in Outlook/ }),
    ).toBeVisible();
    await expect(failure.getByText(SITE.email, { exact: true })).toBeVisible();

    await expect(field(page, 'Name')).toHaveValue('Jamie Rivera');
    await expect(field(page, 'Quantity')).toHaveValue('500');
    // A fresh Turnstile token for the retry.
    expect(
      await page.evaluate(() => (window as { __resets?: number }).__resets),
    ).toBe(1);
  });
}

test('field errors from the server land inline', async ({ page }) => {
  await page.route('**/api/quote', (route) =>
    route.fulfill({
      status: 422,
      json: {
        ok: false,
        errors: {
          shipTo: 'Enter a state, like UT or Texas, or a 5-digit ZIP.',
        },
      },
    }),
  );
  await page.goto('/request-a-quote/');
  await fillRequired(page);
  await page.getByRole('button', { name: 'Send my quote request' }).click();
  await expect(field(page, 'State or ZIP')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await expect(field(page, 'State or ZIP')).toBeFocused();
  await expect(page.locator('[data-quote-failure]')).toBeHidden();
});

test('with JavaScript off, it still posts to /api/quote and says to email or call', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/request-a-quote/');
  const form = page.locator('form[data-quote-form]');
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form).toHaveAttribute('action', '/api/quote');
  await expect(
    page.getByRole('button', { name: 'Send my quote request' }),
  ).toBeVisible();
  // getByText skips <noscript>, so find the note by its element.
  const note = page.locator('p', {
    hasText: 'This form keeps spam out with a script',
  });
  await expect(note).toBeVisible();
  await expect(note).toContainText(SITE.email);
  if (SITE.phone) await expect(note).toContainText(SITE.phone.display);
  await context.close();
});

test('/quote-received/ is noindex and says what happens next', async ({
  page,
}) => {
  await page.goto('/quote-received/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('h1')).toHaveText('Thanks. Your request is in.');
  for (const step of QUOTE_NEXT) {
    await expect(page.getByText(step.text)).toBeVisible();
  }
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

for (const width of [390, 1440]) {
  test(`the form page doesn't scroll sideways at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/request-a-quote/');
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
}

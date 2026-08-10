import { expect, test, type Page } from '@playwright/test';

const QUOTE = '/request-a-quote/';

/** Fill everything the validator requires, so each test can break one thing. */
async function fillValidQuote(page: Page) {
  await page.fill('#qf-name', 'Jane Rivera');
  await page.fill('#qf-email', 'jane@rivera.co');
  await page.selectOption('#qf-projectType', 'Brochures');
  await page.fill('#qf-quantity', '5,000');
  await page.selectOption('#qf-shipState', 'TX');
  await page.check('#qf-consent');
}

test.describe('quote form — validation', () => {
  test('an empty submit reports each field and focuses the first one', async ({
    page,
  }) => {
    await page.goto(QUOTE);
    await page.click('#quote-submit');

    // Form-level summary is announced via role=alert.
    const banner = page.locator('#quote-form-error');
    await expect(banner).toBeVisible();
    await expect(banner).toHaveText(/fields need a look/);

    // Field-level messages are visible, not just present in the DOM.
    // (A `hidden` utility class here once made these silently invisible.)
    await expect(page.locator('[data-error-for="name"]')).toBeVisible();
    await expect(page.locator('[data-error-for="email"]')).toBeVisible();
    await expect(page.locator('[data-error-for="consent"]')).toBeVisible();

    await expect(page.locator('#qf-name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    await expect(page.locator('#qf-name')).toBeFocused();

    // Nothing was sent.
    await expect(page).toHaveURL(new RegExp(`${QUOTE}$`));
  });

  test('an error clears as soon as the visitor starts fixing it', async ({
    page,
  }) => {
    await page.goto(QUOTE);
    await page.click('#quote-submit');
    await expect(page.locator('[data-error-for="name"]')).toBeVisible();

    await page.fill('#qf-name', 'Jane');
    await expect(page.locator('[data-error-for="name"]')).toBeHidden();
    await expect(page.locator('#qf-name')).not.toHaveAttribute('aria-invalid');
  });

  test('rejects a malformed email before hitting the network', async ({
    page,
  }) => {
    let requested = false;
    await page.route('**/api/quote', (route) => {
      requested = true;
      return route.abort();
    });

    await page.goto(QUOTE);
    await fillValidQuote(page);
    await page.fill('#qf-email', 'jane@');
    await page.click('#quote-submit');

    await expect(page.locator('[data-error-for="email"]')).toBeVisible();
    expect(requested).toBe(false);
  });
});

test.describe('quote form — submission', () => {
  test('a successful send swaps in the confirmation and moves focus', async ({
    page,
  }) => {
    await page.route('**/api/quote', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      }),
    );

    await page.goto(QUOTE);
    await fillValidQuote(page);
    await page.click('#quote-submit');

    const success = page.locator('#quote-success');
    await expect(success).toBeVisible();
    await expect(success).toContainText('your request is in');
    await expect(success).toBeFocused();
    await expect(page.locator('#quote-form')).toBeHidden();
    await expect(page.locator('#quote-status')).toHaveText(/was sent/);
  });

  test('sends the typed values as JSON', async ({ page }) => {
    let body: Record<string, string> | null = null;
    await page.route('**/api/quote', async (route) => {
      body = JSON.parse(route.request().postData() ?? '{}');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto(QUOTE);
    await fillValidQuote(page);
    await page.click('#quote-submit');
    await expect(page.locator('#quote-success')).toBeVisible();

    expect(body).toMatchObject({
      name: 'Jane Rivera',
      email: 'jane@rivera.co',
      projectType: 'Brochures',
      quantity: '5,000',
      shipState: 'TX',
      consent: 'on',
    });
  });

  test('a server failure keeps everything typed and offers a way through', async ({
    page,
  }) => {
    await page.route('**/api/quote', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Inbox unreachable.' }),
      }),
    );

    await page.goto(QUOTE);
    await fillValidQuote(page);
    await page.fill('#qf-message', 'Tri-fold, 100# gloss.');
    await page.click('#quote-submit');

    await expect(page.locator('#quote-form-error')).toContainText(
      'Inbox unreachable.',
    );
    // The lead is not stranded: form still there, values intact, button usable.
    await expect(page.locator('#quote-form')).toBeVisible();
    await expect(page.locator('#qf-name')).toHaveValue('Jane Rivera');
    await expect(page.locator('#qf-message')).toHaveValue(
      'Tri-fold, 100# gloss.',
    );
    await expect(page.locator('#quote-submit')).toBeEnabled();
  });

  test('surfaces per-field errors the server sends back', async ({ page }) => {
    await page.route('**/api/quote', (route) =>
      route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          errors: { quantity: 'We need a rough quantity.' },
        }),
      }),
    );

    await page.goto(QUOTE);
    await fillValidQuote(page);
    await page.click('#quote-submit');

    await expect(page.locator('[data-error-for="quantity"]')).toHaveText(
      'We need a rough quantity.',
    );
    await expect(page.locator('#qf-quantity')).toBeFocused();
  });

  test('a network failure is reported rather than swallowed', async ({
    page,
  }) => {
    await page.route('**/api/quote', (route) => route.abort('failed'));

    await page.goto(QUOTE);
    await fillValidQuote(page);
    await page.click('#quote-submit');

    await expect(page.locator('#quote-form-error')).toContainText(
      /couldn't reach our server/,
    );
    await expect(page.locator('#quote-submit')).toBeEnabled();
  });
});

test.describe('quote form — without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('still posts to the endpoint, with the browser enforcing required', async ({
    page,
  }) => {
    await page.goto(QUOTE);

    const form = page.locator('#quote-form');
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form).toHaveAttribute('action', '/api/quote');
    // noValidate is only set by the enhancement script, so native validation
    // is still in force here.
    await expect(form).not.toHaveAttribute('novalidate', /.*/);

    for (const id of [
      '#qf-name',
      '#qf-email',
      '#qf-projectType',
      '#qf-quantity',
      '#qf-shipState',
      '#qf-consent',
    ]) {
      await expect(page.locator(id)).toHaveAttribute('required', /.*/);
    }

    // The form is the visible state; the success panel stays out of the way.
    await expect(form).toBeVisible();
    await expect(page.locator('#quote-success')).toBeHidden();
  });
});

test.describe('quote form — accessibility wiring', () => {
  test('every control is labelled and describes its own error', async ({
    page,
  }) => {
    await page.goto(QUOTE);
    for (const [id, label] of [
      ['#qf-name', 'Your name'],
      ['#qf-email', 'Email'],
      ['#qf-projectType', 'What are you printing?'],
      ['#qf-shipState', 'Ship-to state'],
    ] as const) {
      const control = page.locator(id);
      await expect(control).toHaveAccessibleName(new RegExp(label));
      await expect(control).toHaveAttribute(
        'aria-describedby',
        new RegExp(`${id.slice(1)}-error`),
      );
    }
  });

  test('the honeypot is hidden from assistive tech and from tabbing', async ({
    page,
  }) => {
    await page.goto(QUOTE);
    const honeypot = page.locator('#qf-website');
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    await expect(honeypot).toHaveCount(1);
    // Wrapped in aria-hidden, so it never reaches the a11y tree.
    await expect(page.locator('[aria-hidden="true"] #qf-website')).toHaveCount(
      1,
    );
  });
});

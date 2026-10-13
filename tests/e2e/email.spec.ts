import { expect, test, type Page } from '@playwright/test';
import { SITE } from '../../src/consts';
import { QUOTE_EMAIL } from '../../src/lib/email';

// A mailto: link does nothing without a desktop mail app, so every email
// action also offers Copy, Gmail and Outlook, and shows the address.
const PAGES = ['/request-a-quote/', '/contact/', '/about/'];

const params = (href: string) => new URL(href).searchParams;

async function hrefOf(page: Page, name: RegExp) {
  return (await page
    .getByRole('link', { name })
    .first()
    .getAttribute('href')) as string;
}

test('the quote button keeps its mailto: template', async ({ page }) => {
  await page.goto('/request-a-quote/');
  const href = await hrefOf(page, /^Email your project details$/);
  const url = new URL(href);
  expect(url.protocol).toBe('mailto:');
  expect(url.pathname).toBe(SITE.email);
  expect(url.searchParams.get('subject')).toBe(QUOTE_EMAIL.subject);
  expect(url.searchParams.get('body')).toBe(QUOTE_EMAIL.body);
});

for (const path of PAGES) {
  test(`${path}: Gmail and Outlook links decode back to the template`, async ({
    page,
  }) => {
    await page.goto(path);

    const gmail = page.getByRole('link', { name: /^Open in Gmail/ });
    await expect(gmail).toHaveAttribute('target', '_blank');
    await expect(gmail).toHaveAttribute('rel', 'noopener');
    const g = new URL((await gmail.getAttribute('href'))!);
    expect(`${g.origin}${g.pathname}`).toBe('https://mail.google.com/mail/');
    expect(g.searchParams.get('view')).toBe('cm');
    expect(g.searchParams.get('fs')).toBe('1');
    expect(g.searchParams.get('to')).toBe(SITE.email);
    expect(g.searchParams.get('su')).toBe(QUOTE_EMAIL.subject);
    expect(g.searchParams.get('body')).toBe(QUOTE_EMAIL.body);

    const outlook = page.getByRole('link', { name: /^Open in Outlook/ });
    await expect(outlook).toHaveAttribute('target', '_blank');
    await expect(outlook).toHaveAttribute('rel', 'noopener');
    const o = params((await outlook.getAttribute('href'))!);
    expect(await outlook.getAttribute('href')).toMatch(
      /^https:\/\/outlook\.office\.com\/mail\/deeplink\/compose\?/,
    );
    expect(o.get('to')).toBe(SITE.email);
    expect(o.get('subject')).toBe(QUOTE_EMAIL.subject);
    expect(o.get('body')).toBe(QUOTE_EMAIL.body);
  });
}

for (const path of ['/request-a-quote/', '/contact/']) {
  test(`${path}: shows the address as text`, async ({ page }) => {
    await page.goto(path);
    await expect(
      page.getByText(SITE.email, { exact: true }).first(),
    ).toBeVisible();
  });
}

test('Copy puts the address on the clipboard and announces "Copied"', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/request-a-quote/');
  const block = page.locator('[data-email-actions]').first();
  await block.getByRole('button', { name: 'Copy email address' }).click();
  const status = block.getByRole('status');
  await expect(status).toHaveText('Copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    SITE.email,
  );
  // Gone after two seconds.
  await expect(status).toHaveText('', { timeout: 3000 });
});

test('without clipboard access, Copy selects the visible address', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
    document.execCommand = () => false;
  });
  await page.goto('/request-a-quote/');
  const block = page.locator('[data-email-actions]').first();
  await block.getByRole('button', { name: 'Copy email address' }).click();
  await expect(block.getByRole('status')).toHaveText(/Selected/);
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe(
    SITE.email,
  );
});

test('with JavaScript off, Copy hides and the links and address stay', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ['/request-a-quote/', '/contact/']) {
    await page.goto(path);
    await expect(
      page.getByRole('button', { name: 'Copy email address' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: /^Open in Gmail/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /^Open in Outlook/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(SITE.email, { exact: true }).first(),
    ).toBeVisible();
  }
  await context.close();
});

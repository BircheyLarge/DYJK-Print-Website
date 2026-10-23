import { expect, test } from '@playwright/test';
import { SITE } from '../../src/consts';

// /salt-lake-city/: the one local page. Content Strategist's copy; the Local
// work section waits for Stanley, so it isn't there yet.
const PATH = '/salt-lake-city/';

test('the page has its title, meta, h1 and sections', async ({ page }) => {
  await page.goto(PATH);
  await expect(page).toHaveTitle(
    'Printing in Salt Lake City, Delivered in Person | DYJK Print',
  );
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Business cards, flyers, door hangers and menus for Salt Lake City businesses. Free quotes, a proof before print, and we deliver the job ourselves.',
  );
  await expect(page.locator('h1')).toHaveText(
    'Printing for Salt Lake City businesses, delivered in person',
  );
  await expect(page.locator('main h2')).toHaveText([
    'How it works',
    'What Salt Lake City businesses order',
    'Who we print for',
    'Frequently asked questions',
    "Let's bring it to you.",
  ]);
  const text = await page.locator('main').innerText();
  expect(text).not.toMatch(/PENDING|Local work/i);
  expect(text.toLowerCase()).not.toContain('printed in utah');
  // Six order cards, each to its product page.
  const cards = page.locator(
    'section[aria-labelledby="what-businesses-order"] li a',
  );
  await expect(cards).toHaveCount(6);
  if (SITE.phone) {
    await expect(
      page.locator(`main a[href="tel:${SITE.phone.e164}"]`).first(),
    ).toBeVisible();
  }
});

test('its schema: a Service in three counties, breadcrumbs and the FAQ', async ({
  page,
}) => {
  await page.goto(PATH);
  const nodes = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).flatMap((block) => [JSON.parse(block)].flat());
  const service = nodes.find((node) => node['@type'] === 'Service');
  expect(service.areaServed).toEqual(
    ['Salt Lake County', 'Davis County', 'Utah County'].map((name) => ({
      '@type': 'AdministrativeArea',
      name,
      containedInPlace: { '@type': 'State', name: 'Utah' },
    })),
  );
  expect(service.url).toBe(`${SITE.url}${PATH}`);
  expect(nodes.some((node) => node['@type'] === 'BreadcrumbList')).toBe(true);
  // Organization stays nationwide; no LocalBusiness.
  expect(nodes.some((node) => node['@type'] === 'LocalBusiness')).toBe(false);
  const faq = nodes.find((node) => node['@type'] === 'FAQPage');
  expect(
    faq.mainEntity.map((question: { name: string }) => question.name),
  ).toEqual(await page.locator('main dt').allInnerTexts());
  expect(
    faq.mainEntity.map(
      (question: { acceptedAnswer: { text: string } }) =>
        question.acceptedAnswer.text,
    ),
  ).toEqual(await page.locator('main dd').allInnerTexts());
});

test('the delivery sentences and the footer link to it, the main nav does not', async ({
  page,
}) => {
  const linked = [
    '/',
    '/about/',
    '/contact/',
    '/request-a-quote/',
    '/products/business-cards/',
    '/products/flyers/',
    '/products/door-hangers/',
    '/products/postcards-mailers/',
    '/products/menus/',
  ];
  for (const path of linked) {
    await page.goto(path);
    await expect(
      page.locator(`main a[href="${PATH}"]`).first(),
      path,
    ).toBeVisible();
  }
  await page.goto('/');
  await expect(page.locator(`header a[href="${PATH}"]`)).toHaveCount(0);
  await expect(
    page
      .locator('footer')
      .getByRole('link', { name: 'Salt Lake City delivery' }),
  ).toHaveAttribute('href', PATH);
});

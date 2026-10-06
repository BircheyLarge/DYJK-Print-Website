import { expect, test } from '@playwright/test';

// The voyeur's final SEO pass (#5wcfs8): titles that carry the search term,
// and product pages linking to the industries that use them.

test('titles carry the search terms', async ({ page }) => {
  const TITLES: Record<string, string> = {
    '/': 'Commercial Printing, Shipped Nationwide | DYJK Print',
    '/services/': 'Printing Services: Offset, Digital & Design | DYJK Print',
    '/industries/':
      'Printing for Dental, Auto, Restaurants & Events | DYJK Print',
    '/products/envelopes-letterhead/':
      'Letterhead & Envelope Printing | DYJK Print',
    '/products/presentation-folders/':
      'Presentation Folder Printing | DYJK Print',
    '/services/graphic-design/':
      'Graphic Design & Prepress Services for Print | DYJK Print',
  };
  for (const [path, title] of Object.entries(TITLES)) {
    await page.goto(path);
    await expect(page, path).toHaveTitle(title);
  }
});

test('product pages link to the industries that use them', async ({ page }) => {
  const MAPPING: Record<string, string[]> = {
    'business-cards': [
      'dental-and-medical',
      'auto',
      'real-estate-and-insurance',
    ],
    brochures: ['dental-and-medical'],
    'presentation-folders': ['dental-and-medical'],
    flyers: ['auto', 'restaurants', 'events-and-campaigns'],
    stickers: ['auto'],
    menus: ['restaurants'],
    'door-hangers': [
      'restaurants',
      'real-estate-and-insurance',
      'events-and-campaigns',
    ],
    'envelopes-letterhead': ['real-estate-and-insurance'],
    'postcards-mailers': ['events-and-campaigns'],
    labels: [],
    'catalogs-booklets': [],
  };

  await page.goto('/industries/');
  const sections = await page
    .locator('main section[id]')
    .evaluateAll((els) => els.map((el) => el.id));

  for (const [slug, expected] of Object.entries(MAPPING)) {
    await page.goto(`/products/${slug}/`);
    const links = page.locator('main a[href^="/industries/#"]');
    const anchors = await links.evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')!.split('#')[1]!),
    );
    expect(anchors, slug).toEqual(expected);
    for (const anchor of anchors) {
      expect(sections, `${slug} → #${anchor}`).toContain(anchor);
    }
    // Descriptive anchors, never "click here".
    for (const text of await links.allInnerTexts()) {
      expect(text, slug).toMatch(/^Print for /);
    }
  }
});

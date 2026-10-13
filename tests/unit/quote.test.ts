import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  countLinks,
  DELIVERY_SHIP,
  DELIVERY_SLC,
  firstErrorField,
  looksLikeUsPlace,
  PRODUCT_CHOICES,
  QUOTE_PRODUCTS,
  SOMETHING_ELSE,
  toQuoteValues,
  validateQuote,
  type QuoteValues,
} from '../../src/lib/quote';

const TODAY = new Date(2026, 9, 12);

function values(overrides: Partial<QuoteValues> = {}): QuoteValues {
  return {
    ...toQuoteValues({
      name: 'Jamie Rivera',
      email: 'jamie@example.com',
      product: 'Business Cards',
      quantity: '500',
      delivery: DELIVERY_SHIP,
      shipTo: 'UT 84101',
    }),
    ...overrides,
  };
}

describe('the product list', () => {
  it('is the 11 products, in the hub order, then "Something else"', () => {
    const dir = new URL('../../src/content/products/', import.meta.url);
    const products = readdirSync(dir)
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        const text = readFileSync(new URL(file, dir), 'utf8');
        return {
          title: text.match(/^title: (.+)$/m)![1]!,
          order: Number(text.match(/^order: (\d+)$/m)![1]),
        };
      })
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    expect(QUOTE_PRODUCTS).toEqual(products.map((product) => product.title));
    expect(PRODUCT_CHOICES).toEqual([...QUOTE_PRODUCTS, SOMETHING_ELSE]);
  });
});

describe('validateQuote', () => {
  it('passes a complete request', () => {
    expect(validateQuote(values(), TODAY)).toEqual({
      valid: true,
      errors: {},
      spam: false,
    });
  });

  it('needs a name, an email, a product, a quantity and a destination', () => {
    const { errors } = validateQuote(toQuoteValues({}), TODAY);
    expect(Object.keys(errors).sort()).toEqual(
      ['delivery', 'email', 'name', 'product', 'quantity'].sort(),
    );
  });

  it('leaves phone, company, size, paper, date, artwork and notes optional', () => {
    expect(validateQuote(values(), TODAY).valid).toBe(true);
  });

  it('checks the email and a phone number if one is given', () => {
    expect(validateQuote(values({ email: 'jamie@' }), TODAY).errors.email).toBe(
      'That email address doesn’t look right.',
    );
    expect(validateQuote(values({ phone: '555-12' }), TODAY).errors.phone).toBe(
      'Please enter a 10-digit phone number, or leave it blank.',
    );
    expect(
      validateQuote(values({ phone: '(385) 257-9040' }), TODAY).valid,
    ).toBe(true);
  });

  it('takes only a product from the list', () => {
    expect(
      validateQuote(values({ product: 'Banners' }), TODAY).errors.product,
    ).toBe('Please choose one from the list.');
    expect(
      validateQuote(values({ product: SOMETHING_ELSE }), TODAY).valid,
    ).toBe(true);
  });

  it('ships to a state or ZIP, or delivers in Salt Lake City', () => {
    for (const shipTo of ['UT', 'Texas', '84101', 'Boise, ID', '10001-1234']) {
      expect(validateQuote(values({ shipTo }), TODAY).valid, shipTo).toBe(true);
    }
    expect(validateQuote(values({ shipTo: '' }), TODAY).errors.shipTo).toBe(
      'Tell us the state or ZIP it ships to.',
    );
    expect(
      validateQuote(values({ shipTo: 'somewhere nice' }), TODAY).errors.shipTo,
    ).toBe('Enter a state, like UT or Texas, or a 5-digit ZIP.');
    expect(
      validateQuote(values({ delivery: DELIVERY_SLC, shipTo: '' }), TODAY)
        .valid,
    ).toBe(true);
    expect(
      validateQuote(values({ delivery: 'pick-up' }), TODAY).errors.delivery,
    ).toBe('Choose shipping or Salt Lake City delivery.');
  });

  it('accepts a date from today on, and nothing else', () => {
    expect(validateQuote(values({ deadline: '2026-10-12' }), TODAY).valid).toBe(
      true,
    );
    expect(
      validateQuote(values({ deadline: '2026-10-11' }), TODAY).errors.deadline,
    ).toBe('That date has passed.');
    expect(
      validateQuote(values({ deadline: 'next week' }), TODAY).errors.deadline,
    ).toBe('Please enter a date, or leave it blank.');
  });

  it('wants a full https link for the artwork', () => {
    expect(
      validateQuote(
        values({ artwork: 'https://www.dropbox.com/s/abc/cards.pdf' }),
        TODAY,
      ).valid,
    ).toBe(true);
    for (const artwork of [
      'dropbox.com/abc',
      'ftp://files.example.com/a',
      'https://a b.com',
    ]) {
      expect(
        validateQuote(values({ artwork }), TODAY).errors.artwork,
        artwork,
      ).toBe('Paste the full link to your files, starting https://.');
    }
  });

  it('allows up to two links in the notes, and none in short fields', () => {
    const two = 'See https://a.example/1 and www.b.example/2.';
    expect(validateQuote(values({ notes: two }), TODAY).valid).toBe(true);
    expect(
      validateQuote(values({ notes: `${two} And http://c.example.` }), TODAY)
        .errors.notes,
    ).toBe('Please include no more than 2 links.');
    expect(
      validateQuote(values({ company: 'https://spam.example' }), TODAY).errors
        .company,
    ).toBe('Please leave links out of this one.');
  });

  it('caps every field’s length', () => {
    expect(
      validateQuote(values({ notes: 'x'.repeat(3001) }), TODAY).errors.notes,
    ).toBe('Please keep this under 3,000 characters.');
    expect(
      validateQuote(values({ name: 'x'.repeat(101) }), TODAY).errors.name,
    ).toBe('Please keep this under 100 characters.');
  });

  it('flags the honeypot as spam', () => {
    expect(validateQuote(values({ website: 'x' }), TODAY).spam).toBe(true);
  });

  it('points focus at the first field with an error, in page order', () => {
    expect(firstErrorField({ notes: 'x', email: 'y' })).toBe('email');
    expect(firstErrorField({})).toBeNull();
  });
});

describe('helpers', () => {
  it('count links', () => {
    expect(countLinks('none here')).toBe(0);
    expect(countLinks('https://a.b http://c.d www.e.f')).toBe(3);
  });

  it('find a US place', () => {
    expect(looksLikeUsPlace('Salt Lake City, UT')).toBe(true);
    expect(looksLikeUsPlace('new york')).toBe(true);
    expect(looksLikeUsPlace('Narnia')).toBe(false);
  });
});

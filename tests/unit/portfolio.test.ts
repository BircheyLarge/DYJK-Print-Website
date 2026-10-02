import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../src/data/catalog';
import {
  assertKnownProducts,
  PORTFOLIO,
  photosForProduct,
  relatedService,
} from '../../src/data/portfolio';

describe('PORTFOLIO', () => {
  it('links every piece to an existing service', () => {
    for (const item of PORTFOLIO) {
      expect(SERVICES).toContain(relatedService(item));
    }
  });

  it('gives every piece a caption and descriptive alt text', () => {
    for (const item of PORTFOLIO) {
      expect(item.title.trim()).not.toBe('');
      // alt="" would mark the photo decorative; portfolio photos are content.
      expect(item.alt.trim()).not.toBe('');
    }
  });

  it('names only products that have a content entry', () => {
    // Same check the product pages run at build time, caught earlier here.
    const slugs = fs
      .readdirSync('src/content/products')
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''));
    expect(() => assertKnownProducts(slugs)).not.toThrow();
  });
});

describe('relatedService', () => {
  it('throws on an unknown slug instead of rendering a dead link', () => {
    const item = { ...PORTFOLIO[0]!, serviceSlug: 'letterpress' };
    expect(() => relatedService(item)).toThrow(/unknown serviceSlug/);
  });
});

describe('photosForProduct', () => {
  it("returns that product's pieces and nothing for others", () => {
    const first = PORTFOLIO[0]!;
    expect(photosForProduct(first.product)).toContain(first);
    expect(photosForProduct('no-such-product')).toEqual([]);
  });
});

describe('assertKnownProducts', () => {
  it('throws when a piece names a product with no entry', () => {
    const known = PORTFOLIO.map((item) => item.product).filter(
      (slug) => slug !== PORTFOLIO[0]!.product,
    );
    expect(() => assertKnownProducts([...known, 'flyers'])).toThrow(
      /unknown product/,
    );
  });

  it('skips the check until any product entries exist', () => {
    expect(() => assertKnownProducts([])).not.toThrow();
  });
});

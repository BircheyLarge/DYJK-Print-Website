import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../src/data/catalog';
import {
  assertKnownProducts,
  HERO_TILES,
  imagesForProduct,
  PORTFOLIO,
  PORTFOLIO_GALLERY,
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

describe('imagesForProduct', () => {
  it("returns that product's pieces of every kind, and none for others", () => {
    for (const item of PORTFOLIO) {
      expect(imagesForProduct(item.product)).toContain(item);
    }
    expect(imagesForProduct('no-such-product')).toEqual([]);
  });

  it('puts real artwork before AI mockups', () => {
    for (const slug of new Set(PORTFOLIO.map((item) => item.product))) {
      const isAi = imagesForProduct(slug).map(
        (item) => item.kind === 'ai-mockup',
      );
      // false (real) sorts before true (AI).
      expect(isAi, slug).toEqual([...isAi].sort());
    }
  });
});

describe('PORTFOLIO_GALLERY', () => {
  it('keeps every photo, in portfolio order', () => {
    const photos = PORTFOLIO.filter((item) => item.kind === 'photo');
    expect(photos.length).toBeGreaterThan(0);
    for (const photo of photos) expect(PORTFOLIO_GALLERY).toContain(photo);
    expect(PORTFOLIO_GALLERY).toEqual(
      PORTFOLIO.filter((item) => PORTFOLIO_GALLERY.includes(item)),
    );
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

describe('HERO_TILES', () => {
  it('shows only real print work, never an AI mockup', () => {
    expect(HERO_TILES).toHaveLength(5);
    for (const { item } of HERO_TILES) {
      expect(['photo', 'mockup'], item.title).toContain(item.kind);
    }
  });

  it('uses each piece once', () => {
    expect(new Set(HERO_TILES.map(({ item }) => item)).size).toBe(
      HERO_TILES.length,
    );
  });
});

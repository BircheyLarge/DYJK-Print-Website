import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../src/data/catalog';
import {
  assertKnownProducts,
  HERO_TILES,
  imagesForProduct,
  moreWork,
  pieceByFile,
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
  it("returns that product's pieces, and none for others", () => {
    for (const item of PORTFOLIO) {
      expect(imagesForProduct(item.product)).toContain(item);
    }
    expect(imagesForProduct('no-such-product')).toEqual([]);
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
  it('shows five different pieces', () => {
    expect(HERO_TILES).toHaveLength(5);
    expect(new Set(HERO_TILES.map(({ item }) => item)).size).toBe(5);
  });
});

// The featured stories on /portfolio/ name their piece by file name.
const PROJECTS = new URL('../../src/content/projects/', import.meta.url);
const featured = fs
  .readdirSync(PROJECTS)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const image = /^image:\s*(\S+)\s*$/m.exec(
      fs.readFileSync(new URL(file, PROJECTS), 'utf8'),
    )?.[1];
    if (!image) throw new Error(`${file} names no image`);
    return pieceByFile(image);
  });

describe('pieceByFile', () => {
  it('finds the entry for a file in src/assets/portfolio/', () => {
    expect(pieceByFile('menus-bagel-shop.jpg').product).toBe('menus');
  });

  it('throws for a file no entry uses', () => {
    expect(() => pieceByFile('no-such-piece.jpg')).toThrow();
  });
});

describe('the /portfolio/ page', () => {
  it('features eight different pieces', () => {
    expect(featured).toHaveLength(8);
    expect(new Set(featured).size).toBe(8);
  });

  it('gives every piece it does not feature a gallery caption', () => {
    const told = new Set(featured);
    for (const item of PORTFOLIO.filter((piece) => !told.has(piece))) {
      expect(item.galleryCaption, item.title).toMatch(/\S/);
    }
  });
});

describe('moreWork', () => {
  it('groups the unfeatured pieces by product, in order, skipping empty ones', () => {
    const told = new Set([pieceByFile('menus-bagel-shop.jpg')]);
    const groups = moreWork(['menus', 'flyers', 'business-cards'], told);
    // The menu is the only menus piece, so that product drops out.
    expect(groups.map(({ product }) => product)).toEqual([
      'flyers',
      'business-cards',
    ]);
    for (const { product, items } of groups) {
      expect(items).toEqual(
        PORTFOLIO.filter((item) => item.product === product),
      );
    }
  });
});

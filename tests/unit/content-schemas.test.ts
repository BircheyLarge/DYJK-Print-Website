import { describe, expect, it } from 'vitest';
import {
  blogSchema,
  industrySchema,
  productSchema,
  projectSchema,
  serviceSchema,
} from '../../src/lib/content-schemas';

describe('blogSchema', () => {
  it('parses a valid entry and applies defaults', () => {
    const parsed = blogSchema.parse({
      title: 'Offset vs Digital Printing',
      description: 'When to choose each.',
      publishDate: '2026-01-15',
    });
    expect(parsed.author).toBe('DYJK Print');
    expect(parsed.tags).toEqual([]);
    expect(parsed.draft).toBe(false);
    expect(parsed.publishDate).toBeInstanceOf(Date);
  });

  it('rejects an over-long description', () => {
    expect(() =>
      blogSchema.parse({
        title: 'x',
        description: 'a'.repeat(181),
        publishDate: '2026-01-15',
      }),
    ).toThrow();
  });

  it('requires a title', () => {
    expect(() =>
      blogSchema.parse({ description: 'x', publishDate: '2026-01-15' }),
    ).toThrow();
  });
});

describe('serviceSchema', () => {
  it('defaults order and faqs', () => {
    const parsed = serviceSchema.parse({
      title: 'Offset Printing',
      description: 'High-volume offset.',
    });
    expect(parsed.order).toBe(100);
    expect(parsed.faqs).toEqual([]);
  });
});

describe('productSchema', () => {
  it('defaults keywords to an empty array', () => {
    const parsed = productSchema.parse({
      title: 'Business Cards',
      description: 'Premium business card printing.',
    });
    expect(parsed.keywords).toEqual([]);
  });

  it('defaults services to an empty array and keeps known slugs in order', () => {
    const base = { title: 'Flyers', description: 'Full-color flyers.' };
    expect(productSchema.parse(base).services).toEqual([]);
    expect(
      productSchema.parse({
        ...base,
        services: ['offset-printing', 'graphic-design'],
      }).services,
    ).toEqual(['offset-printing', 'graphic-design']);
  });

  it('rejects a service slug that has no service page', () => {
    expect(() =>
      productSchema.parse({
        title: 'Labels',
        description: 'Product labels.',
        services: ['letterpress'],
      }),
    ).toThrow();
  });
});

describe('industrySchema', () => {
  it('parses a minimal valid entry', () => {
    const parsed = industrySchema.parse({
      title: 'Nonprofits',
      description: 'Print for nonprofits.',
    });
    expect(parsed.order).toBe(100);
    expect(parsed.draft).toBe(false);
  });
});

describe('projectSchema', () => {
  const story = {
    heading: 'A welcome folder for Jeppson Dental',
    image: 'presentation-folder-and-insert.jpg',
    order: 1,
  };

  it('parses a story and defaults draft to false', () => {
    expect(projectSchema.parse(story).draft).toBe(false);
  });

  it('rejects a heading over 60 characters', () => {
    expect(() =>
      projectSchema.parse({ ...story, heading: 'a'.repeat(61) }),
    ).toThrow();
  });

  it('takes the image as a bare file name, not a path', () => {
    expect(() =>
      projectSchema.parse({ ...story, image: '../assets/portfolio/x.jpg' }),
    ).toThrow();
  });
});

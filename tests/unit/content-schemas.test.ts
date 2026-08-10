import { describe, expect, it } from 'vitest';
import {
  blogSchema,
  industrySchema,
  productSchema,
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

import { describe, expect, it } from 'vitest';
import { SERVICES } from '../../src/data/catalog';
import { PORTFOLIO, relatedService } from '../../src/data/portfolio';

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
});

describe('relatedService', () => {
  it('throws on an unknown slug instead of rendering a dead link', () => {
    const item = { ...PORTFOLIO[0]!, serviceSlug: 'letterpress' };
    expect(() => relatedService(item)).toThrow(/unknown serviceSlug/);
  });
});

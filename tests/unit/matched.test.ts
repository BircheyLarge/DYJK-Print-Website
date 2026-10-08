import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MATCHED } from '../../src/data/matched';

// Published products, from src/content/products/*.md (drafts aren't built).
const PRODUCTS = new URL('../../src/content/products/', import.meta.url);
const published = fs
  .readdirSync(PRODUCTS)
  .filter((file) => file.endsWith('.md'))
  .filter(
    (file) =>
      !/^draft:\s*true\s*$/m.test(
        fs.readFileSync(new URL(file, PRODUCTS), 'utf8'),
      ),
  )
  .map((file) => file.replace(/\.md$/, ''))
  .sort();

describe('MATCHED', () => {
  it('has a matched shot for every published product', () => {
    expect(published.filter((slug) => !MATCHED[slug])).toEqual([]);
  });

  it('names only products that exist', () => {
    expect(
      Object.keys(MATCHED).filter((slug) => !published.includes(slug)),
    ).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  buildPageMeta,
  canonicalUrl,
  normalizePath,
  pageTitle,
} from '../../src/lib/seo';
import { SITE } from '../../src/consts';

describe('pageTitle', () => {
  it('returns the brand title when no page title is given', () => {
    expect(pageTitle()).toBe(`${SITE.name} — ${SITE.tagline}`);
    expect(pageTitle('   ')).toBe(`${SITE.name} — ${SITE.tagline}`);
  });

  it('suffixes the brand name for inner pages', () => {
    expect(pageTitle('Offset Printing')).toBe('Offset Printing | DYJK Print');
  });
});

describe('normalizePath', () => {
  it('keeps root as a single slash', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('')).toBe('/');
  });

  it('adds a leading and trailing slash', () => {
    expect(normalizePath('services')).toBe('/services/');
    expect(normalizePath('/services')).toBe('/services/');
    expect(normalizePath('/services/')).toBe('/services/');
  });

  it('does not trailing-slash file-like paths', () => {
    expect(normalizePath('/robots.txt')).toBe('/robots.txt');
  });

  it('preserves query and hash without trailing-slashing them', () => {
    expect(normalizePath('/blog?page=2')).toBe('/blog/?page=2');
    expect(normalizePath('/about#team')).toBe('/about/#team');
  });
});

describe('canonicalUrl', () => {
  it('builds an absolute canonical from the site origin', () => {
    expect(canonicalUrl('/services')).toBe(
      'https://www.dyjkprint.com/services/',
    );
    expect(canonicalUrl('/')).toBe('https://www.dyjkprint.com/');
  });

  it('never produces a double slash between origin and path', () => {
    expect(canonicalUrl('/x', 'https://example.com/')).toBe(
      'https://example.com/x/',
    );
  });
});

describe('absoluteUrl', () => {
  it('passes through absolute URLs', () => {
    const url = 'https://cdn.example.com/a.png';
    expect(absoluteUrl(url)).toBe(url);
  });

  it('resolves root-relative paths against the origin', () => {
    expect(absoluteUrl('/og.png')).toBe('https://www.dyjkprint.com/og.png');
    expect(absoluteUrl('og.png')).toBe('https://www.dyjkprint.com/og.png');
  });
});

describe('buildPageMeta', () => {
  it('falls back to site defaults', () => {
    const meta = buildPageMeta();
    expect(meta.title).toBe(`${SITE.name} — ${SITE.tagline}`);
    expect(meta.description).toBe(SITE.description);
    expect(meta.canonical).toBe('https://www.dyjkprint.com/');
    expect(meta.noindex).toBe(false);
    expect(meta.image).toBeUndefined();
  });

  it('honors overrides and resolves the OG image', () => {
    const meta = buildPageMeta({
      title: 'Contact',
      description: 'Reach DYJK Print',
      path: '/contact',
      image: '/og/contact.png',
      noindex: true,
    });
    expect(meta.title).toBe('Contact | DYJK Print');
    expect(meta.description).toBe('Reach DYJK Print');
    expect(meta.canonical).toBe('https://www.dyjkprint.com/contact/');
    expect(meta.image).toBe('https://www.dyjkprint.com/og/contact.png');
    expect(meta.noindex).toBe(true);
  });
});

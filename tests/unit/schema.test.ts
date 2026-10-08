import { describe, expect, it } from 'vitest';
import {
  breadcrumbSchema,
  faqSchema,
  organizationSchema,
  serviceSchema,
  websiteSchema,
} from '../../src/lib/schema';
import { SITE } from '../../src/consts';

describe('organizationSchema', () => {
  const org = organizationSchema();

  it('is an Organization (not a LocalBusiness)', () => {
    expect(org['@type']).toBe('Organization');
  });

  it('declares nationwide service area', () => {
    expect(org.areaServed).toEqual({
      '@type': 'Country',
      name: 'United States',
    });
  });

  it('exposes a sales contact point with email, and a phone only once set', () => {
    expect(org.contactPoint).toMatchObject({
      '@type': 'ContactPoint',
      email: SITE.email,
    });
    if (SITE.phone) {
      expect(org.telephone).toBe(SITE.phone.e164);
      expect(org.contactPoint).toMatchObject({ telephone: SITE.phone.e164 });
    } else {
      expect(org.contactPoint).not.toHaveProperty('telephone');
    }
  });

  it('emits a region-only address and no local-business signals', () => {
    expect(org.address).toEqual({
      '@type': 'PostalAddress',
      addressRegion: 'UT',
      addressCountry: 'US',
    });
    const s = JSON.stringify(org);
    for (const k of [
      'streetAddress',
      'postalCode',
      'addressLocality',
      'postOfficeBoxNumber',
      'LocalBusiness',
      'openingHours',
      'geo',
      'hasMap',
    ]) {
      expect(s).not.toContain(k);
    }
  });

  it('omits sameAs when there are no profiles', () => {
    expect(org).not.toHaveProperty('sameAs');
  });
});

describe('websiteSchema', () => {
  it('links to the organization as publisher', () => {
    const site = websiteSchema();
    expect(site['@type']).toBe('WebSite');
    expect(site.publisher).toEqual({ '@id': `${SITE.url}/#organization` });
  });
});

describe('breadcrumbSchema', () => {
  it('produces sequential 1-indexed positions with absolute URLs', () => {
    const crumbs = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Offset', path: '/services/offset-printing' },
    ]);
    const items = crumbs.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items[2]!.item).toBe(
      'https://www.dyjkprint.com/services/offset-printing/',
    );
  });
});

describe('serviceSchema', () => {
  it('links the provider by organization id and serves the US', () => {
    const svc = serviceSchema({
      name: 'Offset Printing',
      description: 'High-volume offset.',
      path: '/services/offset-printing',
    });
    expect(svc['@type']).toBe('Service');
    expect(svc.provider).toEqual({ '@id': `${SITE.url}/#organization` });
    expect(svc.url).toBe('https://www.dyjkprint.com/services/offset-printing/');
    expect(svc.areaServed).toEqual({
      '@type': 'Country',
      name: 'United States',
    });
  });
});

describe('faqSchema', () => {
  it('maps questions to Question/Answer nodes', () => {
    const faq = faqSchema([
      { question: 'Do you ship?', answer: 'Yes, nationwide.' },
    ]);
    expect(faq['@type']).toBe('FAQPage');
    const entities = faq.mainEntity as Array<Record<string, unknown>>;
    expect(entities[0]).toMatchObject({
      '@type': 'Question',
      name: 'Do you ship?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, nationwide.' },
    });
  });
});

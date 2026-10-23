/**
 * JSON-LD structured-data builders. Pure functions returning plain objects so
 * they are unit-testable and can be serialized by the <JsonLd> component.
 *
 * Policy (updated 2026-10-23, Stanley): DYJK is a small Utah-based team
 * serving clients nationwide. We emit `Organization` (NOT `LocalBusiness`)
 * with `areaServed: United States` and a region-only address (state and
 * country): NO street address, city, map or hours.
 *
 * Local first: Salt Lake City appears in the homepage meta, /salt-lake-city/
 * and five local product titles, always tied to delivery. No address,
 * showroom, pick-up or other city names. Never claim the work is printed in
 * Utah. In the schema, Salt Lake City is only the /salt-lake-city/ page's
 * Service areaServed.
 */
import { SITE } from '../consts';
import { absoluteUrl, canonicalUrl } from './seo';

type Json = Record<string, unknown>;

const ORG_ID = `${SITE.url}/#organization`;

/**
 * Organization node — the canonical entity for the whole site. The logo is
 * the square one: Google wants at least 112x112 for the knowledge panel.
 */
export function organizationSchema(logoPath = '/brand/logo-square.png'): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    slogan: SITE.tagline,
    description: SITE.description,
    logo: absoluteUrl(logoPath),
    ...(SITE.phone ? { telephone: SITE.phone.e164 } : {}),
    address: {
      '@type': 'PostalAddress',
      addressRegion: SITE.addressRegion,
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      ...(SITE.phone ? { telephone: SITE.phone.e164 } : {}),
      email: SITE.email,
      areaServed: SITE.areaServed,
      availableLanguage: ['English'],
    },
    ...(SITE.sameAs.length > 0 ? { sameAs: [...SITE.sameAs] } : {}),
  };
}

/** WebSite node (enables sitelinks search box later if we add search). */
export function websiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: `${SITE.url}/`,
    name: SITE.name,
    description: SITE.description,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en-US',
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Root-relative path, e.g. "/services/". */
  path: string;
}

/** BreadcrumbList for nested pages. Positions are 1-indexed and sequential. */
export function breadcrumbSchema(items: readonly BreadcrumbItem[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export interface ServiceInput {
  name: string;
  description: string;
  path: string;
  /** Where the service is offered; the whole United States by default. */
  areaServed?: Json | Json[];
}

/** The default service area: the whole country. */
export const UNITED_STATES: Json = {
  '@type': 'Country',
  name: 'United States',
};

/** Service node, linked back to the Organization as provider. */
export function serviceSchema(input: ServiceInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: canonicalUrl(input.path),
    serviceType: input.name,
    provider: { '@id': ORG_ID },
    areaServed: input.areaServed ?? UNITED_STATES,
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/** FAQPage node for service/product/quote pages. */
export function faqSchema(items: readonly FaqItem[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

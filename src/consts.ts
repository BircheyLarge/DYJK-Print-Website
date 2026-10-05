/**
 * Site-wide constants. Single source of truth for brand, contact and SEO defaults.
 *
 * Contact policy (updated 2026-10-05, Stanley): DYJK is a small Utah-based team
 * serving clients nationwide. We say 'Utah-based' but expose NO street address,
 * city, map or hours. Utah never goes in titles or H1s; product pages target
 * nationwide queries.
 */

/** A public phone number: E.164 for tel: links and schema, plus display text. */
export interface PhoneNumber {
  e164: string;
  display: string;
}

export const SITE = {
  name: 'DYJK Print',
  tagline: 'Your Vision, Our Precision',
  /** Canonical production origin (no trailing slash). */
  url: 'https://www.dyjkprint.com',
  /** Homepage meta description and the fallback; 155 chars max for snippets. */
  description:
    'Nationwide commercial printing from DYJK Print: offset and digital printing, ' +
    'graphic design and prepress, proofed and shipped anywhere in the US.',
  /**
   * DYJK's business line. tel: links, the Call buttons, the footer, the
   * contact page and the schema telephone all read it; null hides them all.
   * Stan's cell stays on his card and flyer, never here.
   */
  phone: {
    e164: '+13852579040',
    display: '(385) 257-9040',
  } as PhoneNumber | null,
  email: 'sales@dyjkprint.com',
  /**
   * Nationwide service area — drives Organization.areaServed. Utah-based, but
   * the area served stays the whole US.
   */
  areaServed: 'US',
  /** Home state only: the Organization's region-only PostalAddress. */
  addressRegion: 'UT',
  /** Social / external profiles for Organization.sameAs. Fill in as confirmed. */
  sameAs: [] as string[],
  locale: 'en_US',
} as const;

/** Primary navigation — mirrors the locked IA in ARCHITECTURE.md §4. */
export const NAV: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Services', href: '/services/' },
  { label: 'Products', href: '/products/' },
  { label: 'Industries', href: '/industries/' },
  { label: 'Portfolio', href: '/portfolio/' },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

/** The single high-intent conversion target, referenced by every CTA. */
export const QUOTE_PATH = '/request-a-quote/';

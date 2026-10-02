/**
 * Site-wide constants. Single source of truth for brand, contact and SEO defaults.
 *
 * Contact policy (locked with @you): DYJK is a nationwide print partner, NOT a
 * walk-in/local shop. We intentionally expose NO physical address, map or hours.
 * Public contact = email + quote form, plus a phone number once DYJK has one.
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
   * ACTION ITEM #np3as5: DYJK has no phone number yet, so the site shows no
   * phone UI, tel: links or schema telephone, and leads with email. When the
   * real number arrives, set it here and every page picks it up:
   *   phone: { e164: '+1XXXXXXXXXX', display: '(XXX) XXX-XXXX' },
   */
  phone: null as PhoneNumber | null,
  email: 'sales@dyjkprint.com',
  /** Nationwide service area — drives Organization.areaServed, no local framing. */
  areaServed: 'US',
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

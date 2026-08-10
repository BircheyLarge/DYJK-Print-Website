/**
 * Site-wide constants. Single source of truth for brand, contact and SEO defaults.
 *
 * Contact policy (locked with @you): DYJK is a nationwide print partner, NOT a
 * walk-in/local shop. We intentionally expose NO physical address, map or hours.
 * Public contact = phone + email + quote form only.
 */
export const SITE = {
  name: 'DYJK Print',
  tagline: 'Your Vision, Our Precision',
  /** Canonical production origin (no trailing slash). */
  url: 'https://www.dyjkprint.com',
  description:
    'DYJK Print is a nationwide commercial printing partner — offset and digital printing, ' +
    'graphic design and prepress. Quality print, shipped to your door anywhere in the US.',
  /** E.164 for tel: links and schema. */
  phone: '+18019603396',
  /** Human-readable phone. */
  phoneDisplay: '(801) 960-3396',
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

/**
 * Lightweight catalog data driving the home page and section hubs in P0.
 * Service detail pages exist; product/industry detail pages arrive in P1/P2,
 * so those entries intentionally have no `href` yet (hubs render them as
 * non-linked cards to avoid dead links).
 */

export interface ServiceItem {
  /** URL slug; also the dynamic route param. */
  slug: string;
  name: string;
  href: string;
  blurb: string;
  /** Longer intro copy for the detail page. */
  detail: string;
}

export const SERVICES: ReadonlyArray<ServiceItem> = [
  {
    slug: 'offset-printing',
    name: 'Offset Printing',
    href: '/services/offset-printing/',
    blurb:
      'High-volume brochures, catalogs and flyers with sharp, consistent color at scale.',
    detail:
      'Offset is the right call when volume and color consistency matter. We run high-quantity brochures, catalogs, flyers and booklets with crisp, repeatable color across the entire run — then ship anywhere in the US.',
  },
  {
    slug: 'digital-printing',
    name: 'Digital Printing',
    href: '/services/digital-printing/',
    blurb:
      'Fast-turnaround short runs — business cards, personalized mailers and proofs.',
    detail:
      'Digital printing turns short runs around fast, with no plates and easy personalization. It is ideal for business cards, on-demand reprints, variable-data mailers and proofs when you need quality quickly.',
  },
  {
    slug: 'graphic-design',
    name: 'Graphic Design & Prepress',
    href: '/services/graphic-design/',
    blurb:
      'Press-ready file prep and design support so your job prints right the first time.',
    detail:
      'Our design and prepress team makes sure your files are press-ready — bleeds, color, resolution and imposition — so your job prints right the first time. Need design help from scratch? We do that too.',
  },
];

export interface CatalogItem {
  name: string;
  blurb: string;
}

export const PRODUCTS: ReadonlyArray<CatalogItem> = [
  {
    name: 'Business Cards',
    blurb: 'Premium stocks, finishes and quick reorders.',
  },
  {
    name: 'Brochures',
    blurb: 'Bi-fold, tri-fold and custom folds in any quantity.',
  },
  {
    name: 'Flyers',
    blurb: 'Bold, full-color flyers for promotions and events.',
  },
  {
    name: 'Catalogs & Booklets',
    blurb: 'Saddle-stitched and perfect-bound multi-page pieces.',
  },
  {
    name: 'Postcards & Mailers',
    blurb: 'Direct-mail-ready postcards shipped wherever you need them.',
  },
  {
    name: 'Envelopes & Letterhead',
    blurb: 'Cohesive branded stationery and business systems.',
  },
];

export const INDUSTRIES: ReadonlyArray<CatalogItem> = [
  {
    name: 'Agencies & Marketing Teams',
    blurb: 'A reliable production partner for client campaigns nationwide.',
  },
  {
    name: 'Franchises & Multi-Location',
    blurb: 'Consistent brand collateral across every location.',
  },
  {
    name: 'Nonprofits',
    blurb: 'Cost-effective print for outreach and fundraising.',
  },
  {
    name: 'Schools',
    blurb: 'Programs, handbooks, signage and event materials.',
  },
  {
    name: 'Events',
    blurb: 'Signage, badges and printed collateral on deadline.',
  },
  {
    name: 'Real Estate',
    blurb: 'Listing sheets, postcards and branded marketing.',
  },
];

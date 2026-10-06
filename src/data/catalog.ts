/**
 * The three services: the /services/ hub cards and each service page's slug.
 * Products live in the src/content/products collection; the industries are
 * sections of /industries/ itself.
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

/**
 * The five industries on /industries/, in page order. Each id is its
 * section's anchor, and product pages link to it with `link` as the text, so
 * the two can't drift apart.
 */
export const INDUSTRIES = [
  {
    id: 'dental-and-medical',
    title: 'Dental and medical',
    link: 'Print for dental and medical practices',
  },
  { id: 'auto', title: 'Auto', link: 'Print for auto shops' },
  { id: 'restaurants', title: 'Restaurants', link: 'Print for restaurants' },
  {
    id: 'real-estate-and-insurance',
    title: 'Real estate and insurance',
    link: 'Print for real estate and insurance firms',
  },
  {
    id: 'events-and-campaigns',
    title: 'Events and campaigns',
    link: 'Print for events and campaigns',
  },
] as const;

export type Industry = (typeof INDUSTRIES)[number];
export type IndustryId = Industry['id'];

/** The industry with this id. */
export function industry(id: IndustryId): Industry {
  const found = INDUSTRIES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown industry "${id}".`);
  return found;
}

/**
 * Local first (The voyeur's plan, October 2026). DYJK delivers in person
 * across the Salt Lake City area (Salt Lake, Davis and Utah counties) and
 * ships everywhere else; /salt-lake-city/ is the one local page. We never
 * claim the work is printed in Utah, only that we deliver it there.
 */
export const SLC_PATH = '/salt-lake-city/';

/** The five products people search for with "Salt Lake City". */
export const LOCAL_PRODUCTS = [
  'business-cards',
  'flyers',
  'door-hangers',
  'postcards-mailers',
  'menus',
] as const;

const UTAH = { '@type': 'State', name: 'Utah' };

/**
 * Where Stanley delivers in person (confirmed 2026-10-23), for the
 * /salt-lake-city/ Service node's areaServed. Organization stays nationwide.
 */
export const DELIVERY_AREA = [
  'Salt Lake County',
  'Davis County',
  'Utah County',
].map((name) => ({
  '@type': 'AdministrativeArea',
  name,
  containedInPlace: UTAH,
}));

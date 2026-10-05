/**
 * Matched product shots. Imported only while drafting, so the production
 * build does not emit these files. No page outside the dev drafts uses them.
 */
import type { ImageMetadata } from 'astro';
import type { FramedPiece } from './content';
import matchedCards from '../../assets/matched/product-business-cards.jpg';
import matchedFolders from '../../assets/matched/product-presentation-folders.jpg';
import matchedFlyers from '../../assets/matched/product-flyers.jpg';
import matchedBrochures from '../../assets/matched/product-brochures.jpg';
import matchedMenus from '../../assets/matched/product-menus.jpg';
import matchedHangers from '../../assets/matched/product-door-hangers.jpg';
import matchedPostcards from '../../assets/matched/product-postcards-mailers.jpg';
import matchedStickers from '../../assets/matched/product-stickers.jpg';
import matchedLabels from '../../assets/matched/product-labels.jpg';
import matchedEnvelopes from '../../assets/matched/product-envelopes-letterhead.jpg';
import matchedCatalogs from '../../assets/matched/product-catalogs-booklets.jpg';

function matched(
  image: ImageMetadata,
  alt: string,
  label: string,
  href: string,
): FramedPiece {
  return {
    image,
    alt,
    href,
    label,
    position: '50% 50%',
    scale: 1,
    matched: true,
  };
}

const businessCards = matched(
  matchedCards,
  'Business cards from several companies, arranged on a light gray surface.',
  'Business cards',
  '/products/business-cards/',
);
const folders = matched(
  matchedFolders,
  'An open blank presentation folder with a pocket, on a light gray surface.',
  'Presentation folders',
  '/products/presentation-folders/',
);
const flyers = matched(
  matchedFlyers,
  'Two flyers, including one for the Clinch River Atomic Auto Show, on a light gray surface.',
  'Flyers',
  '/products/flyers/',
);
const brochures = matched(
  matchedBrochures,
  'Brochures on a light gray surface.',
  'Brochures',
  '/products/brochures/',
);
const menus = matched(
  matchedMenus,
  'Menus on a light gray surface.',
  'Menus',
  '/products/menus/',
);
const doorHangers = matched(
  matchedHangers,
  'Three door hangers, including one for Clean It Up carpet cleaning, on a light gray surface.',
  'Door hangers',
  '/products/door-hangers/',
);

/** Grid order. */
export const products: readonly FramedPiece[] = [
  businessCards,
  folders,
  flyers,
  brochures,
  menus,
  doorHangers,
  matched(
    matchedPostcards,
    'Postcards on a light gray surface.',
    'Postcards',
    '/products/postcards-mailers/',
  ),
  matched(
    matchedStickers,
    'Stickers on a light gray surface.',
    'Stickers',
    '/products/stickers/',
  ),
  matched(
    matchedLabels,
    'Labels on a light gray surface.',
    'Labels',
    '/products/labels/',
  ),
  matched(
    matchedEnvelopes,
    'Envelopes and letterhead on a light gray surface.',
    'Envelopes & letterhead',
    '/products/envelopes-letterhead/',
  ),
  matched(
    matchedCatalogs,
    'A catalog or booklet on a light gray surface.',
    'Catalogs & booklets',
    '/products/catalogs-booklets/',
  ),
];

/** B and C heroes: cards, flyers, brochures, menus, door hangers. */
export const heroInk: readonly FramedPiece[] = [
  businessCards,
  flyers,
  brochures,
  menus,
  doorHangers,
];

/**
 * Shared words for both homepage drafts, from home-copy.md v2, so Stanley
 * compares the layouts. Product crops are a stand-in until the matched
 * backdrop set arrives: same mat, padding, and ratio in ProductFrame.astro.
 */
import type { ImageMetadata } from 'astro';
import { QUOTE_PATH } from '../../consts';
import { PORTFOLIO, PORTFOLIO_GALLERY } from '../../data/portfolio';
import cardsDespain from '../../assets/portfolio/business-cards-despain-subaru.jpg';
import presentationFolder from '../../assets/portfolio/presentation-folder-and-insert.jpg';
import flyerAutoShow from '../../assets/portfolio/flyers-atomic-auto-show.jpg';
import brochureSunTree from '../../assets/portfolio/brochures-sun-tree-hospice.jpg';
import menuBagelShop from '../../assets/portfolio/menus-bagel-shop.jpg';
import doorHanger from '../../assets/portfolio/door-hangers-clean-it-up.jpg';
import postcardWater from '../../assets/portfolio/postcards-water-sensations.jpg';
import stickerGlobe from '../../assets/portfolio/stickers-globe-candy.jpg';

export const quoteHref = QUOTE_PATH;
export const workHref = '/portfolio/';

// Option 1 is live. Swap a later option by replacing these two lines.
export const heroHeadline = 'Impossible to walk past.';
export const heroSubhead =
  'On the counter, on the door, in their hand. Your name, with enough presence to stop someone.';
// 2. 'Print that gets noticed.' / 'The piece in their hand says who you are before you do.'
// 3. 'Look established on sight.' / 'Folders, cards, and envelopes that make a new company look settled.'
// 4. 'Own the counter.' / 'Menus, cards, and mailers with enough presence to hold a glance.'
// 5. 'Your vision. Their full attention.' / 'Cards, folders, and flyers that turn a clear idea into a reason to stop.'
export const closeHeading = 'Ready to get noticed?';
export const closeLine = 'Tell us what should get noticed. The quote is free.';

export const proofs = [
  'Free quotes',
  'Proof before print',
  'Design help',
  'Offset + digital',
  'Ships nationwide',
] as const;

export interface Benefit {
  title: string;
  body: string;
}

export const benefits: readonly Benefit[] = [
  {
    title: 'Get noticed',
    body: 'A card, a flyer, or a hanger puts your name where people are already looking.',
  },
  {
    title: 'Look established',
    body: 'Matching cards, letterhead, and envelopes make the company look settled the moment someone sees them.',
  },
  {
    title: 'Hold the glance',
    body: 'Menus, brochures, and mailers give people a reason to stop and look.',
  },
  {
    title: 'Walk in ready',
    body: 'The folder, the invite, the hanger. You arrive with a piece that already speaks for the business.',
  },
];

export interface Step {
  name: string;
  body: string;
}

export const steps: readonly Step[] = [
  { name: 'Quote', body: 'Tell us the piece and where it goes.' },
  { name: 'Proof', body: 'You approve it before we print.' },
  { name: 'Print', body: 'We run it offset or digital.' },
  { name: 'Ship', body: 'Anywhere in the United States.' },
];

export interface Audience {
  name: string;
  body: string;
}

export const audiences: readonly Audience[] = [
  {
    name: 'Dental and medical',
    body: 'Folders and cards that make a practice feel calm and clear.',
  },
  {
    name: 'Auto',
    body: 'Cards that make a shop look like the specialist it is.',
  },
  {
    name: 'Restaurants',
    body: 'Menus that make the specials look as good as they taste.',
  },
  {
    name: 'Real estate and insurance',
    body: 'Envelopes and cards that make the firm look established.',
  },
  {
    name: 'Events and campaigns',
    body: 'Flyers and hangers that pull people toward the event.',
  },
];

export interface FramedPiece {
  image: ImageMetadata;
  alt: string;
  href: string;
  label: string;
  /** object-position so the crop sits on the printed piece. */
  position: string;
  /** Zoom that drops the table and props around the piece. */
  scale?: number;
  /** Show the whole photograph inside the frame, instead of a tight crop. */
  whole?: boolean;
}

function altFor(image: ImageMetadata): string {
  const item = PORTFOLIO.find((entry) => entry.image === image);
  if (!item) {
    throw new Error('Draft image is not in the portfolio');
  }
  return item.alt;
}

function piece(
  image: ImageMetadata,
  label: string,
  href: string,
  position: string,
  scale = 1,
): FramedPiece {
  return { image, alt: altFor(image), href, label, position, scale };
}

/** Eight products, cropped to the piece. Order is the grid order. */
export const products: readonly FramedPiece[] = [
  piece(
    cardsDespain,
    'Business cards',
    '/products/business-cards/',
    '30% 70%',
    1.2,
  ),
  piece(
    presentationFolder,
    'Presentation folders',
    '/products/presentation-folders/',
    '48% 44%',
    1.2,
  ),
  piece(flyerAutoShow, 'Flyers', '/products/flyers/', '86% 48%', 1.35),
  piece(brochureSunTree, 'Brochures', '/products/brochures/', '52% 48%', 1.45),
  piece(menuBagelShop, 'Menus', '/products/menus/', '14% 52%', 2.15),
  piece(doorHanger, 'Door hangers', '/products/door-hangers/', '50% 46%', 1.25),
  piece(
    postcardWater,
    'Postcards',
    '/products/postcards-mailers/',
    '70% 68%',
    1.45,
  ),
  piece(stickerGlobe, 'Stickers', '/products/stickers/', '50% 70%', 1.25),
];

const flyerWhole: FramedPiece = {
  ...piece(flyerAutoShow, 'Flyers', '/products/flyers/', '50% 50%', 1),
  whole: true,
};

/** A's hero: three pieces, the flyer shown whole inside its frame. */
export const heroLight: readonly FramedPiece[] = [
  products[0]!,
  flyerWhole,
  products[1]!,
];

/** B's hero: four pieces fanned on the ink field. The flyer stays whole. */
export const heroInk: readonly FramedPiece[] = [
  products[0]!,
  flyerWhole,
  products[1]!,
  products[3]!,
];

/** The two photos the live homepage already treats as recent work. */
export const recentWork: readonly FramedPiece[] = PORTFOLIO_GALLERY.slice(
  0,
  2,
).map((item) => ({
  image: item.image,
  alt: item.alt,
  href: `/products/${item.product}/`,
  label: item.title,
  position: '50% 46%',
  scale: 1.25,
}));

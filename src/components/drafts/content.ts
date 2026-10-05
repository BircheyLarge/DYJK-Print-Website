/**
 * Shared facts for the two homepage drafts. Headlines live in each direction
 * so the pages don't read as one layout. Product crops are a stand-in until
 * the matched backdrop set arrives: same mat, padding, and ratio in
 * ProductFrame.astro.
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

export const proofs = [
  'Free quotes',
  'Design help',
  'A proof before anything prints',
  'Offset and digital',
  'Shipped nationwide',
] as const;

export interface Benefit {
  title: string;
  body: string;
}

export const benefits: readonly Benefit[] = [
  {
    title: 'Design help',
    body: 'Bring a finished file, or a logo and a sentence. Prepress builds or repairs it so the piece is ready to print.',
  },
  {
    title: 'A proof before anything prints',
    body: 'You see the piece and approve it. The run does not start until you say so.',
  },
  {
    title: 'Offset and digital',
    body: 'Offset when the run is long and the color has to hold. Digital for short runs and versions. The quote names which.',
  },
  {
    title: 'Shipped nationwide',
    body: 'When the job is done, it ships anywhere in the United States.',
  },
];

export interface Step {
  name: string;
  body: string;
}

export const steps: readonly Step[] = [
  {
    name: 'Quote',
    body: 'Tell us the product and where it ships.',
  },
  {
    name: 'Proof',
    body: 'Nothing prints until you approve the proof.',
  },
  {
    name: 'Print',
    body: 'Offset or digital, the process named in the quote.',
  },
  {
    name: 'Delivered',
    body: 'Packed and shipped anywhere in the US.',
  },
];

export interface Audience {
  name: string;
  body: string;
}

export const audiences: readonly Audience[] = [
  {
    name: 'Dental and medical',
    body: 'Folders, cards, and mailers.',
  },
  {
    name: 'Auto',
    body: 'Flyers, cards, and event pieces.',
  },
  {
    name: 'Restaurants',
    body: 'Menus and the pieces around them.',
  },
  {
    name: 'Real estate and insurance',
    body: 'Cards, postcards, and letterhead.',
  },
  {
    name: 'Events and campaigns',
    body: 'Door hangers, flyers, and handouts.',
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
}

function altFor(image: ImageMetadata): string {
  const item = PORTFOLIO.find((entry) => entry.image.src === image.src);
  if (!item) {
    throw new Error(`Draft image is not in the portfolio: ${image.src}`);
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

export const heroShot: FramedPiece = piece(
  flyerAutoShow,
  'Flyers',
  '/products/flyers/',
  '80% 40%',
);

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

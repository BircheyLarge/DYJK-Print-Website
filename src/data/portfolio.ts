/**
 * DYJK's work: photos of past print jobs and mockups of customers' designs.
 * Product pages show both kinds for their product; the /portfolio/ gallery
 * and the homepage "Recent work" strip show PORTFOLIO_GALLERY.
 *
 * To add a piece: save the original image in src/assets/portfolio/, import it
 * below and add one entry with its product slug and kind. Newest first — the
 * homepage shows the first two gallery pieces. Astro generates the responsive
 * AVIF/WebP sizes at build time; product pages crop every image to 3:2, so
 * keep the subject near the middle.
 *
 * Captions name the product, never the client. Alt text describes what's
 * visible; don't claim finishes or processes Stanley hasn't confirmed.
 */
import type { ImageMetadata } from 'astro';
import { SERVICES, type ServiceItem } from './catalog';
import brochureUltrablox from '../assets/portfolio/brochures-ultrablox-accordion-fold.jpg';
import cardsCarvit from '../assets/portfolio/business-cards-carvit-rounded-corners.jpg';
import cardsMillcreek from '../assets/portfolio/business-cards-millcreek-tile-stone.jpg';
import cardsMotoSkiveez from '../assets/portfolio/business-cards-moto-skiveez-carbon-pattern.jpg';
import cardsPrestigeBlack from '../assets/portfolio/business-cards-prestige-performance-black.jpg';
import cardsPrestigeWhite from '../assets/portfolio/business-cards-prestige-performance-white.jpg';
import labelsCuttingEdge from '../assets/portfolio/labels-cutting-edge-roll-bags-boxes.jpg';
import labelsRust from '../assets/portfolio/labels-rust-automation-roll-desk.jpg';
import foldersOakridge from '../assets/portfolio/presentation-folders-oakridge-dental.jpg';
import foldersOakridgeFanned from '../assets/portfolio/presentation-folders-oakridge-dental-fanned.jpg';
import presentationFolder from '../assets/portfolio/presentation-folder-and-insert.jpg';
import promotionalCards from '../assets/portfolio/promotional-cards.jpg';
import stickerRust from '../assets/portfolio/stickers-rust-automation-oval-bottle.jpg';

export interface PortfolioItem {
  image: ImageMetadata;
  /** Caption: the printed product, e.g. "Presentation folder & insert". */
  title: string;
  /** Slug of the src/content/products entry whose page shows this image. */
  product: string;
  /** Slug of the related entry in SERVICES; the gallery caption links to it. */
  serviceSlug: string;
  /** A photo of a finished job, or a mockup rendering of a customer design. */
  kind: 'photo' | 'mockup';
  /** Describes the printed piece for screen readers. */
  alt: string;
}

export const PORTFOLIO: ReadonlyArray<PortfolioItem> = [
  {
    image: cardsPrestigeBlack,
    title: 'Black business cards with a gold logo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Black Prestige Performance business card with a gold logo and web address, lying on a light stone surface.',
  },
  {
    image: cardsMotoSkiveez,
    title: 'Business cards with a carbon-fiber pattern',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Stack of dark Moto-Skiveez business cards with a carbon-fiber pattern and a red, blue and gray logo, on a wooden desk beside a pen.',
  },
  {
    image: cardsCarvit,
    title: 'Promo cards with rounded corners',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Carvit promo card with rounded corners and an action-sports photo collage, reading "Shop now" with a promo code, propped on a stack of matching cards.',
  },
  {
    image: cardsMillcreek,
    title: 'Two-sided business cards with a copper-colored back',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Millcreek Tile & Stone business cards: a stack with a copper-colored, tile-patterned back and white cards with the logo and contact details.',
  },
  {
    image: cardsPrestigeWhite,
    title: 'White business cards with a black logo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'White Prestige Performance business cards on a marble surface: one with a large black monogram, one with contact details, and a stack beside them.',
  },
  {
    image: foldersOakridgeFanned,
    title: 'Presentation folders, fanned out',
    product: 'presentation-folders',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'White Oakridge Dental presentation folders fanned out on a wooden desk, the top one showing the logo.',
  },
  {
    image: foldersOakridge,
    title: 'Presentation folder with a centered logo',
    product: 'presentation-folders',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'White Oakridge Dental presentation folder with the logo centered on the cover, on a dark wooden desk.',
  },
  {
    image: labelsCuttingEdge,
    title: 'Round labels on a roll, applied to bags and boxes',
    product: 'labels',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Roll of round Cutting Edge Physical Therapy labels beside white paper bags and brown boxes with the same label applied.',
  },
  {
    image: labelsRust,
    title: 'Round labels on a roll, one peeled from its backing',
    product: 'labels',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Roll of round RUST Automation & Controls labels on a desk, with the label applied to paper bags and a box and one label peeled from its backing.',
  },
  {
    image: stickerRust,
    title: 'Oval logo sticker on a water bottle',
    product: 'stickers',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Oval blue RUST Automation & Controls sticker with an oil-derrick logo on a metal water bottle.',
  },
  {
    image: brochureUltrablox,
    title: 'Accordion-fold brochure',
    product: 'brochures',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'UltraBlox accordion-fold brochure standing open, with a surgeon raising a gloved hand on the front panel and a tube of X-ray attenuating cream inside, beside a stack of folded copies.',
  },
  {
    image: presentationFolder,
    title: 'Presentation folder & insert',
    product: 'presentation-folders',
    serviceSlug: 'offset-printing',
    kind: 'photo',
    alt: 'Open presentation folder for a dental practice, showing a printed bio page and navy pockets. A full-color insert with a smiling family photo lies on top.',
  },
  {
    image: promotionalCards,
    title: 'Promotional cards',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'photo',
    alt: 'Overlapping rows of printed promotional cards: black cards with a white chairlift logo, and light cards over a snowy mountain photo offering 20% off demos and rentals.',
  },
];

/**
 * What /portfolio/ and the homepage show: photos only until Stanley decides
 * on mockups. To include them, use PORTFOLIO here.
 */
export const PORTFOLIO_GALLERY = PORTFOLIO.filter(
  (item) => item.kind === 'photo',
);

/**
 * The service a portfolio item links to. Throws on an unknown slug so a typo
 * fails the build instead of shipping a dead link.
 */
export function relatedService(item: PortfolioItem): ServiceItem {
  const service = SERVICES.find((s) => s.slug === item.serviceSlug);
  if (!service) {
    throw new Error(
      `Portfolio item "${item.title}" has unknown serviceSlug "${item.serviceSlug}".`,
    );
  }
  return service;
}

/** Images for one product page (photos and mockups), newest first. */
export function imagesForProduct(slug: string): PortfolioItem[] {
  return PORTFOLIO.filter((item) => item.product === slug);
}

/**
 * Throws if a piece names a product with no content entry, so a typo fails
 * the build instead of the image silently never showing.
 */
export function assertKnownProducts(slugs: Iterable<string>): void {
  const known = new Set(slugs);
  // No product entries at all yet: nothing to check against.
  if (known.size === 0) return;
  for (const item of PORTFOLIO) {
    if (!known.has(item.product)) {
      throw new Error(
        `Portfolio item "${item.title}" has unknown product "${item.product}". ` +
          `Known products: ${[...known].join(', ')}.`,
      );
    }
  }
}

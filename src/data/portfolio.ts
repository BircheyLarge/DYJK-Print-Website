/**
 * DYJK's work: photos of past print jobs, mockups built from DYJK's real
 * print files, and AI mockups of customers' designs. Product pages show every
 * kind for their product, real artwork first; the /portfolio/ gallery and the
 * homepage "Recent work" strip show PORTFOLIO_GALLERY.
 *
 * To add a piece: save the original image in src/assets/portfolio/, import it
 * below and add one entry with its product slug and kind. Newest first — the
 * homepage shows the first two gallery pieces. Astro generates the responsive
 * AVIF/WebP sizes at build time. Product pages crop every thumbnail to 3:2
 * (set cropPosition if the subject isn't central) and link to the full image.
 *
 * Captions name the product, never the client. Alt text describes what's
 * visible; don't claim finishes or processes Stanley hasn't confirmed.
 */
import type { ImageMetadata } from 'astro';
import { SERVICES, type ServiceItem } from './catalog';
import brochureAspire from '../assets/portfolio/brochures-aspire-surgical.jpg';
import brochureBagelShop from '../assets/portfolio/brochures-bagel-shop-menu.jpg';
import brochureSunTree from '../assets/portfolio/brochures-sun-tree-hospice.jpg';
import cardsAveron from '../assets/portfolio/business-cards-averon-group.jpg';
import cardsCanyonMedical from '../assets/portfolio/business-cards-canyon-medical.jpg';
import cardsCarvit from '../assets/portfolio/business-cards-carvit-rounded-corners.jpg';
import cardsCarvitSurf from '../assets/portfolio/business-cards-carvit-surf.jpg';
import cardsDespain from '../assets/portfolio/business-cards-despain-subaru.jpg';
import cardsMillcreek from '../assets/portfolio/business-cards-millcreek-tile-stone.jpg';
import cardsMotoSkiveez from '../assets/portfolio/business-cards-moto-skiveez-carbon-pattern.jpg';
import cardsPrestigeBlack from '../assets/portfolio/business-cards-prestige-performance-black.jpg';
import cardsPrestigeWhite from '../assets/portfolio/business-cards-prestige-performance-white.jpg';
import doorHangerCleanItUp from '../assets/portfolio/door-hangers-clean-it-up.jpg';
import doorHangerMikeGreen from '../assets/portfolio/door-hangers-mike-green-campaign.jpg';
import flyerAspire from '../assets/portfolio/flyers-aspire-surgical.jpg';
import flyerAutoShow from '../assets/portfolio/flyers-atomic-auto-show.jpg';
import flyerUew from '../assets/portfolio/flyers-united-energy-workers.jpg';
import labelsCuttingEdge from '../assets/portfolio/labels-cutting-edge-roll-bags-boxes.jpg';
import labelsRust from '../assets/portfolio/labels-rust-automation-roll-desk.jpg';
import menuBagelShop from '../assets/portfolio/menus-bagel-shop.jpg';
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
  /**
   * 'photo': a photo of a finished job. 'mockup': a rendering built from
   * DYJK's real print file, so every word is exact. 'ai-mockup': an AI
   * rendering of a customer design; shown last and due to be retired.
   */
  kind: 'photo' | 'mockup' | 'ai-mockup';
  /** Anchor for the 3:2 product-page crop; centered when unset. */
  cropPosition?: 'top' | 'bottom' | 'left' | 'right' | 'attention';
  /** Describes the printed piece for screen readers. */
  alt: string;
}

export const PORTFOLIO: ReadonlyArray<PortfolioItem> = [
  {
    image: cardsAveron,
    title: 'Two-sided business cards in orange and navy',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Averon Group business cards beside a palm leaf: an orange front with the AG logo, a name, title and contact details, and a navy back with the Averon Group logo.',
  },
  {
    image: cardsDespain,
    title: 'Black business cards with an illustrated back',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'DeSpain The Subaru Specialist business cards: two black cards with a blue and gray star logo in front of a stack showing the engine illustration on the back.',
  },
  {
    image: cardsCanyonMedical,
    title: 'White business card with a blue logo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    cropPosition: 'bottom',
    alt: 'Canyon Medical Home business card with a blue cross logo, a name, title and contact details, beside a brown envelope and green leaves.',
  },
  {
    image: cardsCarvitSurf,
    title: 'Promo cards with an edge-to-edge photo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'Two Carvit promo cards with an edge-to-edge photo of a surfer in a breaking wave, reading "A lifestyle, shop now" and the web address, on white paper by a cream envelope.',
  },
  {
    image: doorHangerCleanItUp,
    title: 'Door hanger with a coupon',
    product: 'door-hangers',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    cropPosition: 'attention',
    alt: 'Clean It Up carpet cleaning door hanger hung on a brass doorknob through its die-cut hole, with a soap-bubble design, "No surprises, no hidden fees" and a 20% off coupon.',
  },
  {
    image: doorHangerMikeGreen,
    title: 'Two-sided campaign door hangers',
    product: 'door-hangers',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'Front and back of a green Mike Green city council campaign door hanger, each with a round die-cut hole and slit at the top, beside red carnations.',
  },
  {
    image: flyerAutoShow,
    title: 'Event flyer with illustrated cars',
    product: 'flyers',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'Atomic Auto Show flyer for Clinch River Home Healthcare, with red headline type, classic car and truck illustrations, the date, and a location, fees and registration panel, on a table with flowers and coffee.',
  },
  {
    image: flyerUew,
    title: 'Event flyer with a photo header',
    product: 'flyers',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'United Energy Workers Healthcare flyer for a free lunch-and-learn resource fair, with a photo of four smiling older adults, event details and an RSVP number, on a desk beside coffee and a pen.',
  },
  {
    image: flyerAspire,
    title: 'Informational flyer with diagrams',
    product: 'flyers',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'Aspire Surgical flyer titled "Dental Implant Treatment", with implant diagrams and a section recommending Straumann implants, propped on a counter in a waiting room.',
  },
  {
    image: menuBagelShop,
    title: 'Tall menu with a chalkboard-style cover',
    product: 'menus',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: 'The Bagel Shop menu, a tall card with a chalkboard-style cover showing the round logo and "Menu" in white lettering, beside a place setting on a dark wooden table.',
  },
  {
    image: brochureSunTree,
    title: 'Tri-fold brochure in green and gold',
    product: 'brochures',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'Sun Tree Hospice brochure open to panels about hospice care, the medical director and services, with a family photo, beside a narrow panel with the tree logo and tagline and red carnations.',
  },
  {
    image: brochureAspire,
    title: 'Tri-fold brochure with photo panels',
    product: 'brochures',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'Aspire Surgical tri-fold brochure open on a gray surface: doctor portraits, a skincare product photo with the logo panel, and a portrait of a woman, beside a matching single panel.',
  },
  {
    image: brochureBagelShop,
    title: 'Tri-fold menu brochure',
    product: 'brochures',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'The Bagel Shop tri-fold brochure open to three panels of menu items and prices with food photos, partly covered by its chalkboard-style front panel, on a light wooden surface.',
  },
  {
    image: cardsPrestigeBlack,
    title: 'Black business cards with a gold logo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'ai-mockup',
    alt: 'Black Prestige Performance business card with a gold logo and web address, lying on a light stone surface.',
  },
  {
    image: cardsMotoSkiveez,
    title: 'Business cards with a carbon-fiber pattern',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'ai-mockup',
    alt: 'Stack of dark Moto-Skiveez business cards with a carbon-fiber pattern and a red, blue and gray logo, on a wooden desk beside a pen.',
  },
  {
    image: cardsCarvit,
    title: 'Promo cards with rounded corners',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'ai-mockup',
    alt: 'Carvit promo card with rounded corners and an action-sports photo collage, reading "Shop now" with a promo code, propped on a stack of matching cards.',
  },
  {
    image: cardsMillcreek,
    title: 'Two-sided business cards with a copper-colored back',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'ai-mockup',
    alt: 'Millcreek Tile & Stone business cards: a stack with a copper-colored, tile-patterned back and white cards with the logo and contact details.',
  },
  {
    image: cardsPrestigeWhite,
    title: 'White business cards with a black logo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'ai-mockup',
    alt: 'White Prestige Performance business cards on a marble surface: one with a large black monogram, one with contact details, and a stack beside them.',
  },
  {
    image: foldersOakridgeFanned,
    title: 'Presentation folders, fanned out',
    product: 'presentation-folders',
    serviceSlug: 'offset-printing',
    kind: 'ai-mockup',
    alt: 'White Oakridge Dental presentation folders fanned out on a wooden desk, the top one showing the logo.',
  },
  {
    image: foldersOakridge,
    title: 'Presentation folder with a centered logo',
    product: 'presentation-folders',
    serviceSlug: 'offset-printing',
    kind: 'ai-mockup',
    alt: 'White Oakridge Dental presentation folder with the logo centered on the cover, on a dark wooden desk.',
  },
  {
    image: labelsCuttingEdge,
    title: 'Round labels on a roll, applied to bags and boxes',
    product: 'labels',
    serviceSlug: 'digital-printing',
    kind: 'ai-mockup',
    alt: 'Roll of round Cutting Edge Physical Therapy labels beside white paper bags and brown boxes with the same label applied.',
  },
  {
    image: labelsRust,
    title: 'Round labels on a roll, one peeled from its backing',
    product: 'labels',
    serviceSlug: 'digital-printing',
    kind: 'ai-mockup',
    alt: 'Roll of round RUST Automation & Controls labels on a desk, with the label applied to paper bags and a box and one label peeled from its backing.',
  },
  {
    image: stickerRust,
    title: 'Oval logo sticker on a water bottle',
    product: 'stickers',
    serviceSlug: 'digital-printing',
    kind: 'ai-mockup',
    alt: 'Oval blue RUST Automation & Controls sticker with an oil-derrick logo on a metal water bottle.',
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

/**
 * Images for one product page: real artwork (photos and mockups) first, then
 * AI mockups, each group newest first.
 */
export function imagesForProduct(slug: string): PortfolioItem[] {
  const images = PORTFOLIO.filter((item) => item.product === slug);
  return [
    ...images.filter((item) => item.kind !== 'ai-mockup'),
    ...images.filter((item) => item.kind === 'ai-mockup'),
  ];
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

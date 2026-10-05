/**
 * DYJK's work: photos of past print jobs and mockups built from DYJK's real
 * print files. Product pages show every piece for their product; the
 * /portfolio/ gallery and the homepage "Recent work" strip show
 * PORTFOLIO_GALLERY.
 *
 * To add a piece: save the original image in src/assets/portfolio/, import it
 * below and add one entry with its product slug and kind. Entries are in
 * display order: a product page lists its pieces in the order below, and its
 * first image is the thumbnail on the /products/ hub card. Gallery photos go newest first; the homepage shows the first two.
 * Astro generates the responsive AVIF/WebP sizes at build time. Product pages
 * crop every thumbnail to 3:2 (set cropPosition if the subject isn't central)
 * and link to the full image.
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
import cardsCarvitSurf from '../assets/portfolio/business-cards-carvit-surf.jpg';
import cardsDespain from '../assets/portfolio/business-cards-despain-subaru.jpg';
import cardsMillcreek from '../assets/portfolio/business-cards-millcreek.jpg';
import doorHangerCleanItUp from '../assets/portfolio/door-hangers-clean-it-up.jpg';
import doorHangerMikeGreen from '../assets/portfolio/door-hangers-mike-green-campaign.jpg';
import envelopesApexAdvance from '../assets/portfolio/envelopes-letterhead-apex-advance-envelopes.jpg';
import envelopesAspire from '../assets/portfolio/envelopes-letterhead-aspire-envelopes.jpg';
import letterheadAdvancedOral from '../assets/portfolio/envelopes-letterhead-advanced-oral-surgery.jpg';
import letterheadBbc from '../assets/portfolio/envelopes-letterhead-better-body-compositions.jpg';
import stationeryAps from '../assets/portfolio/envelopes-letterhead-aps-set.jpg';
import flyerAspire from '../assets/portfolio/flyers-aspire-surgical.jpg';
import flyerAutoShow from '../assets/portfolio/flyers-atomic-auto-show.jpg';
import flyerUew from '../assets/portfolio/flyers-united-energy-workers.jpg';
import labelsCuttingEdge from '../assets/portfolio/labels-cutting-edge-box.jpg';
import menuBagelShop from '../assets/portfolio/menus-bagel-shop.jpg';
import postcardAspire from '../assets/portfolio/postcards-aspire-invitation.jpg';
import postcardWaterSensations from '../assets/portfolio/postcards-water-sensations.jpg';
import presentationFolder from '../assets/portfolio/presentation-folder-and-insert.jpg';
import promotionalCards from '../assets/portfolio/promotional-cards.jpg';
import stickersAssorted from '../assets/portfolio/stickers-assorted-logos.jpg';
import stickerGlobeCandy from '../assets/portfolio/stickers-globe-candy.jpg';

export interface PortfolioItem {
  image: ImageMetadata;
  /**
   * The printed product, e.g. "Presentation folder & insert": the caption in
   * a product page's lightbox.
   */
  title: string;
  /**
   * The caption in /portfolio/'s "More of our work" gallery. It names the
   * business (Stanley approved), never a person. Featured pieces don't need
   * one; their story in src/content/projects/ tells them.
   */
  galleryCaption?: string;
  /** Slug of the src/content/products entry whose page shows this image. */
  product: string;
  /** Slug of the related entry in SERVICES; the gallery caption links to it. */
  serviceSlug: string;
  /**
   * 'photo': a photo of a finished job. 'mockup': a rendering built from
   * DYJK's real print file, so every word is exact.
   */
  kind: 'photo' | 'mockup';
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
    galleryCaption:
      'Averon Group cards: an orange logo side and a navy wordmark.',
    kind: 'mockup',
    alt: 'Averon Group business cards beside a palm leaf: an orange front with the AG logo, a name, title and contact details, and a navy back with the Averon Group logo.',
  },
  {
    image: cardsDespain,
    title: 'Black business cards with an illustrated back',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    kind: 'mockup',
    alt: "DeSpain The Subaru Specialist business cards on a light gray table: two black cards side by side, each with a silver star and blue swoosh logo, in front of a stack whose top card shows the blue DeSpain name, an engine illustration and 'The Subaru Specialist'.",
  },
  {
    image: cardsCanyonMedical,
    title: 'White business card with a blue logo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    galleryCaption: 'Canyon Medical Home card, white, with a blue cross logo.',
    kind: 'mockup',
    cropPosition: 'bottom',
    alt: 'Two Canyon Medical Home business cards on a pale gray-green surface beside two green leaves: one shows a blue square with a white cross; the other shows the logo, Jason Rees, Clinic Director, and phone, fax and email details.',
  },
  {
    image: cardsCarvitSurf,
    title: 'Promo cards with an edge-to-edge photo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    galleryCaption: 'Carvit promo cards, with a surfer photo edge to edge.',
    kind: 'mockup',
    alt: "Two Carvit promo cards on a plain gray surface, each with an edge-to-edge photo of a surfer in a breaking wave, the Carvit logo, and 'A lifestyle, shop now' with the web address.",
  },
  {
    image: cardsMillcreek,
    title: 'White business cards with a copper-colored logo',
    product: 'business-cards',
    serviceSlug: 'digital-printing',
    galleryCaption:
      'Millcreek Tile & Stone cards, with a copper geometric logo.',
    kind: 'mockup',
    alt: 'Two white Millcreek Tile & Stone business cards on gray marble: one with the logo, street address, phone numbers and email, partly covered by the other, which shows the copper-colored tile logo and web address.',
  },
  {
    image: postcardWaterSensations,
    title: 'Product postcard with a retro stripe design',
    product: 'postcards-mailers',
    serviceSlug: 'digital-printing',
    galleryCaption:
      'Water Sensations postcard: a drop logo, stripes, and citrus.',
    kind: 'mockup',
    cropPosition: 'right',
    alt: 'Water Sensations postcard with retro yellow and blue stripes, a water-drop logo and Citrus flavor details, on a wooden desk under a cup of coffee, beside a keyboard and notebook.',
  },
  {
    image: postcardAspire,
    title: 'Event invitation postcard',
    product: 'postcards-mailers',
    serviceSlug: 'digital-printing',
    galleryCaption: 'Aspire Surgical movie-night invitation.',
    kind: 'mockup',
    alt: 'Aspire Surgical movie-night invitation postcard with a black-and-white photo of a suit and tie, "No Time To Die" lettering and the event details, lying on a gold envelope.',
  },
  {
    image: stationeryAps,
    title: 'Matching letterhead and envelope',
    product: 'envelopes-letterhead',
    serviceSlug: 'offset-printing',
    kind: 'mockup',
    alt: 'Applied Product Solutions letterhead and matching envelope on a light wood table, each with the gold and teal APS logo and a pale gray curve along the bottom.',
  },
  {
    image: letterheadAdvancedOral,
    title: 'Letterhead with a blue gradient rule',
    product: 'envelopes-letterhead',
    serviceSlug: 'offset-printing',
    galleryCaption:
      'Advanced Oral Surgery of San Antonio letterhead, blue logo and rule.',
    kind: 'mockup',
    alt: 'Advanced Oral Surgery of San Antonio letterhead with a blue line-art logo at the top and a blue gradient rule over the contact details at the bottom, beside an espresso cup.',
  },
  {
    image: letterheadBbc,
    title: 'Letterhead with an orange header band',
    product: 'envelopes-letterhead',
    serviceSlug: 'offset-printing',
    galleryCaption:
      'Better Body Compositions letterhead with an orange header band.',
    kind: 'mockup',
    alt: 'Better Body Compositions letterhead with an orange header band holding the white BBC logo and a one-line contact footer, on a white wooden desk beside a keyboard and camera lens.',
  },
  {
    image: envelopesAspire,
    title: 'Business envelopes with a logo on the flap',
    product: 'envelopes-letterhead',
    serviceSlug: 'offset-printing',
    galleryCaption: 'Aspire Surgical envelopes, logo on the face and the flap.',
    kind: 'mockup',
    alt: 'Two white Aspire Surgical business envelopes on a gray surface, one showing the logo and return address on the front, the other the logo and web address on the back flap, beside a fountain pen.',
  },
  {
    image: envelopesApexAdvance,
    title: 'Branded business envelopes',
    product: 'envelopes-letterhead',
    serviceSlug: 'offset-printing',
    galleryCaption:
      'Apex Insurance and Advance Insurance envelopes, each with a logo.',
    kind: 'mockup',
    alt: 'Two business envelopes on a wooden desk below a laptop and coffee: one for Apex Insurance with a red and gray mountain logo, one for Advance Insurance with a red and gray curve along the bottom.',
  },
  {
    image: labelsCuttingEdge,
    title: 'Round label on a shipping box',
    product: 'labels',
    serviceSlug: 'digital-printing',
    galleryCaption: 'Cutting Edge Physical Therapy label on a shipping box.',
    kind: 'mockup',
    alt: 'Round white Cutting Edge Physical Therapy label with blue and gray lettering and contact details, applied to the lid of a brown shipping box.',
  },
  {
    image: stickersAssorted,
    title: 'Logo stickers in assorted shapes',
    product: 'stickers',
    serviceSlug: 'digital-printing',
    galleryCaption:
      'Gonzalez Group, Wright Dental Group, Globe Candy, Wee Care, MikesAutoShack.com',
    kind: 'mockup',
    alt: 'Five logo stickers on a white desk: rounded rectangles for Gonzalez Group and Wright Dental Group, and on a spiral notepad a round Globe Candy sticker, a Wee Care pediatric dentistry rectangle and a square blue "Thank You!" sticker for MikesAutoShack.com.',
  },
  {
    image: stickerGlobeCandy,
    title: 'Round logo sticker',
    product: 'stickers',
    serviceSlug: 'digital-printing',
    galleryCaption: 'Round Globe Candy sticker, teal with white type.',
    kind: 'mockup',
    alt: 'Round dark teal Globe Candy logo sticker with white lettering, on a pale gray surface below a mint-green pen.',
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
    galleryCaption:
      'Two-sided campaign hangers with a doorknob hole and a photo.',
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
    galleryCaption:
      'United Energy Workers Healthcare flyer for a benefits fair.',
    kind: 'mockup',
    alt: 'United Energy Workers Healthcare flyer for a free lunch-and-learn resource fair, with a photo of four smiling older adults, event details and an RSVP number, on a desk beside coffee and a pen.',
  },
  {
    image: flyerAspire,
    title: 'Informational flyer with diagrams',
    product: 'flyers',
    serviceSlug: 'offset-printing',
    galleryCaption: 'Aspire Surgical flyer on dental implants, with diagrams.',
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
    galleryCaption:
      'Aspire Surgical tri-fold: portraits, products, and a cover.',
    kind: 'mockup',
    alt: 'Aspire Surgical tri-fold brochure open on a gray surface: doctor portraits, a skincare product photo with the logo panel, and a portrait of a woman, beside a matching single panel.',
  },
  {
    image: brochureBagelShop,
    title: 'Tri-fold menu brochure',
    product: 'brochures',
    serviceSlug: 'offset-printing',
    galleryCaption:
      'The Bagel Shop tri-fold menu, with dishes and food photos.',
    kind: 'mockup',
    alt: 'The Bagel Shop tri-fold brochure open to three panels of menu items and prices with food photos, partly covered by its chalkboard-style front panel, on a light wooden surface.',
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

/** The homepage "Recent work" strip: photos of finished jobs only. */
export const PORTFOLIO_GALLERY = PORTFOLIO.filter(
  (item) => item.kind === 'photo',
);

/** The portfolio entry for an imported image. */
function piece(image: ImageMetadata): PortfolioItem {
  const item = PORTFOLIO.find((entry) => entry.image === image);
  if (!item) throw new Error(`No portfolio entry uses ${image.src}.`);
  return item;
}

export interface HeroTile {
  item: PortfolioItem;
  /** Names the product, like the flyer's photo captions. */
  caption: string;
  /** object-position that keeps the key artwork in frame. */
  position: string;
  /** Phones crop the tile differently; defaults to `position`. */
  phonePosition?: string;
}

/**
 * The homepage hero mosaic (web-refresh SPEC.md): DYJK's real print files.
 * Phones show the first three; HomeHero.astro places the five on larger
 * screens.
 */
export const HERO_TILES: ReadonlyArray<HeroTile> = [
  {
    item: piece(flyerAutoShow),
    caption: 'Flyers',
    position: '78% 38%',
    phonePosition: '86% 38%',
  },
  {
    item: piece(doorHangerCleanItUp),
    caption: 'Door hangers',
    position: '50% 38%',
    phonePosition: '50% 40%',
  },
  { item: piece(cardsDespain), caption: 'Business cards', position: '42% 58%' },
  { item: piece(brochureSunTree), caption: 'Brochures', position: '46% 50%' },
  { item: piece(menuBagelShop), caption: 'Menus', position: '16% 50%' },
];

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

// Every image in src/assets/portfolio/, by path. These are the same objects
// the imports above produce, so pieces match by identity: reading an image's
// src at build time would make Astro ship the full-size original.
const IMAGE_FILES = import.meta.glob<ImageMetadata>(
  '../assets/portfolio/*.{jpg,jpeg}',
  { eager: true, import: 'default' },
);

/** The portfolio entry for a file in src/assets/portfolio/. */
export function pieceByFile(file: string): PortfolioItem {
  const image = IMAGE_FILES[`../assets/portfolio/${file}`];
  const item = image && PORTFOLIO.find((entry) => entry.image === image);
  if (!item) {
    throw new Error(`No portfolio entry uses src/assets/portfolio/${file}.`);
  }
  return item;
}

/**
 * /portfolio/'s "More of our work": every piece the featured stories don't
 * show, grouped by product in the given order (the /products/ hub's).
 * Products with nothing left are skipped.
 */
export function moreWork(
  productOrder: readonly string[],
  featured: ReadonlySet<PortfolioItem>,
): Array<{ product: string; items: PortfolioItem[] }> {
  return productOrder
    .map((product) => ({
      product,
      items: PORTFOLIO.filter(
        (item) => item.product === product && !featured.has(item),
      ),
    }))
    .filter(({ items }) => items.length > 0);
}

/** Images for one product page, in portfolio order. */
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

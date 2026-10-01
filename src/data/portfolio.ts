/**
 * Past print jobs shown in the /portfolio/ gallery and the homepage
 * "Recent work" strip.
 *
 * To add a piece: save the original photo (landscape, ideally 4:3 like the
 * others) in src/assets/portfolio/, import it below and add one entry.
 * Newest first — the homepage shows the first two. Astro generates the
 * responsive AVIF/WebP sizes at build time.
 *
 * Captions name the product, never the client.
 */
import type { ImageMetadata } from 'astro';
import { SERVICES, type ServiceItem } from './catalog';
import presentationFolder from '../assets/portfolio/presentation-folder-and-insert.jpg';
import promotionalCards from '../assets/portfolio/promotional-cards.jpg';

export interface PortfolioItem {
  image: ImageMetadata;
  /** Caption: the printed product, e.g. "Presentation folder & insert". */
  title: string;
  /**
   * Product category, e.g. "Folders". Not shown yet; it's the key for
   * grouping or filtering once the gallery is big enough.
   */
  productType: string;
  /** Slug of the related entry in SERVICES; the gallery caption links to it. */
  serviceSlug: string;
  /** Describes the printed piece for screen readers. */
  alt: string;
}

export const PORTFOLIO: ReadonlyArray<PortfolioItem> = [
  {
    image: presentationFolder,
    title: 'Presentation folder & insert',
    productType: 'Folders',
    serviceSlug: 'offset-printing',
    alt: 'Open presentation folder for a dental practice, showing a printed bio page and navy pockets. A full-color insert with a smiling family photo lies on top.',
  },
  {
    image: promotionalCards,
    title: 'Promotional cards',
    productType: 'Cards',
    serviceSlug: 'digital-printing',
    alt: 'Overlapping rows of printed promotional cards: black cards with a white chairlift logo, and light cards over a snowy mountain photo offering 20% off demos and rentals.',
  },
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

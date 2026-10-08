/**
 * The matched product shots: one 3:2 photograph per product, all on the same
 * light gray surface, so the /products/ hub and the homepage grid show the
 * range in uniform frames. Product pages keep their own real examples.
 */
import type { ImageMetadata } from 'astro';
import brochures from '../assets/matched/product-brochures.jpg';
import businessCards from '../assets/matched/product-business-cards.jpg';
import catalogsBooklets from '../assets/matched/product-catalogs-booklets.jpg';
import doorHangers from '../assets/matched/product-door-hangers.jpg';
import envelopesLetterhead from '../assets/matched/product-envelopes-letterhead.jpg';
import flyers from '../assets/matched/product-flyers.jpg';
import labels from '../assets/matched/product-labels.jpg';
import menus from '../assets/matched/product-menus.jpg';
import postcardsMailers from '../assets/matched/product-postcards-mailers.jpg';
import presentationFolders from '../assets/matched/product-presentation-folders.jpg';
import stickers from '../assets/matched/product-stickers.jpg';

/** By product slug (src/content/products/<slug>.md). */
export const MATCHED: Readonly<Record<string, ImageMetadata>> = {
  'business-cards': businessCards,
  'presentation-folders': presentationFolders,
  flyers,
  brochures,
  menus,
  'door-hangers': doorHangers,
  'postcards-mailers': postcardsMailers,
  stickers,
  labels,
  'envelopes-letterhead': envelopesLetterhead,
  'catalogs-booklets': catalogsBooklets,
};

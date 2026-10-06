/**
 * The homepage, direction C (Stanley's pick): copy from home-copy.md v2 and
 * the pieces its hero fans out. Headline option 1 is live.
 */
import type { ImageMetadata } from 'astro';
import { PORTFOLIO_GALLERY, type PortfolioItem } from './portfolio';
import fanBrochure from '../assets/matched/fan/brochure.jpg';
import fanBusinessCard from '../assets/matched/fan/business-card.jpg';
import fanDoorHanger from '../assets/matched/fan/door-hanger.jpg';
import fanFlyer from '../assets/matched/fan/flyer.jpg';
import fanMenu from '../assets/matched/fan/menu.jpg';

export const HEADLINE = 'Impossible to walk past.';
export const SUBHEAD =
  'On the counter, on the door, in their hand. Your name, with enough presence to stop someone.';

export const PROOFS = [
  'Free quotes',
  'Proof before print',
  'Design help',
  'Offset + digital',
  'Ships nationwide',
] as const;

/** The scrolling band under the hero. */
export const TICKER = [
  'Business cards',
  'Flyers',
  'Door hangers',
  'Menus',
  'Postcards',
  'Brochures',
  'Labels',
  'Stickers',
  'Folders',
  'Letterhead',
  'Booklets',
] as const;

export interface Point {
  title: string;
  body: string;
}

export const BENEFITS: readonly Point[] = [
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

/** How it works, numbered in the four inks. */
export const STEPS: readonly Point[] = [
  { title: 'Quote', body: 'Tell us the piece and where it goes.' },
  { title: 'Proof', body: 'You approve it before we print.' },
  { title: 'Print', body: 'We run it offset or digital.' },
  { title: 'Ship', body: 'Anywhere in the United States.' },
];

export const AUDIENCES: readonly Point[] = [
  {
    title: 'Dental and medical',
    body: 'Folders and cards that make a practice feel calm and clear.',
  },
  {
    title: 'Auto',
    body: 'Cards that make a shop look like the specialist it is.',
  },
  {
    title: 'Restaurants',
    body: 'Menus that make the specials look as good as they taste.',
  },
  {
    title: 'Real estate and insurance',
    body: 'Envelopes and cards that make the firm look established.',
  },
  {
    title: 'Events and campaigns',
    body: 'Flyers and hangers that pull people toward the event.',
  },
];

export const CLOSE_HEADING = 'Ready to get noticed?';
export const CLOSE_LINE = 'Tell us what should get noticed. The quote is free.';

export interface FanPiece {
  /** Cut from the matched shot by scripts/crop-hero-fan.py. */
  image: ImageMetadata;
  label: string;
  href: string;
}

/** Back to front: the flyer is the front card. */
export const FAN: readonly FanPiece[] = [
  {
    image: fanBusinessCard,
    label: 'Business cards',
    href: '/products/business-cards/',
  },
  { image: fanMenu, label: 'Menus', href: '/products/menus/' },
  {
    image: fanDoorHanger,
    label: 'Door hangers',
    href: '/products/door-hangers/',
  },
  { image: fanBrochure, label: 'Brochures', href: '/products/brochures/' },
  { image: fanFlyer, label: 'Flyers', href: '/products/flyers/' },
];

/** Recent work: the two newest photos of finished jobs. */
export const RECENT_WORK: readonly PortfolioItem[] = PORTFOLIO_GALLERY.slice(
  0,
  2,
);

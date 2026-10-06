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
import fanPostcard from '../assets/matched/fan/postcard.jpg';
import brochures from '../assets/matched/product-brochures.jpg';
import envelopesLetterhead from '../assets/matched/product-envelopes-letterhead.jpg';
import cardsDespain from '../assets/portfolio/business-cards-despain-subaru.jpg';
import envelopesApexAdvance from '../assets/portfolio/envelopes-letterhead-apex-advance-envelopes.jpg';
import flyerAutoShow from '../assets/portfolio/flyers-atomic-auto-show.jpg';
import menuBagelShop from '../assets/portfolio/menus-bagel-shop.jpg';
import presentationFolder from '../assets/portfolio/presentation-folder-and-insert.jpg';

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

/**
 * One short intro under each homepage h2, from home-copy.md. Bracketed
 * links are [label](href).
 */
export const LEADS = {
  why: 'Commercial printing should get you noticed. The card, the door, the folder: we make the piece people stop for, and [graphic design and prepress](/services/graphic-design/) can build it from a logo.',
  how: 'Simple on purpose. Ask for a [free quote](/request-a-quote/), approve a proof before anything prints, and we run it offset or digital, then ship it anywhere in the US.',
  products:
    'Business cards, flyers, brochures, door hangers, postcards, menus, and [presentation folders](/products/presentation-folders/). Commercial printing for the moment someone picks the piece up and decides who you are.',
  who: 'The piece has a person on the other end. A practice, a shop, a restaurant, a firm, or a campaign needs print that makes them look strong to their own customers.',
  recent:
    'Real printed pieces for companies that wanted to be seen. Cards, flyers, brochures, and the rest of the work, gathered in the [portfolio](/portfolio/) so you can see it up close.',
} as const;

export interface LeadPart {
  text: string;
  href?: string;
}

/** Split a lead into text and its [label](href) links. */
export function leadParts(source: string): LeadPart[] {
  const parts: LeadPart[] = [];
  const pattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ text: source.slice(cursor, start) });
    parts.push({ text: match[1] ?? '', href: match[2] });
    cursor = start + match[0].length;
  }
  if (cursor < source.length) parts.push({ text: source.slice(cursor) });
  return parts;
}

export interface ShownPiece {
  image: ImageMetadata;
  alt: string;
}

/** One real piece per benefit, in the same order as BENEFITS. */
export const BENEFIT_PIECES: readonly ShownPiece[] = [
  { image: fanDoorHanger, alt: 'Clean It Up door hanger.' },
  {
    image: envelopesLetterhead,
    alt: 'Letterhead and an envelope laid out together.',
  },
  { image: brochures, alt: 'Sun Tree Hospice brochure, open and closed.' },
  { image: fanBusinessCard, alt: 'Averon Group business card.' },
];

/** One real piece per industry, in the same order as AUDIENCES. */
export const AUDIENCE_PIECES: readonly ShownPiece[] = [
  {
    image: presentationFolder,
    alt: 'Open Jeppson Dental presentation folder with a family photo insert.',
  },
  {
    image: cardsDespain,
    alt: 'DeSpain The Subaru Specialist business cards.',
  },
  { image: menuBagelShop, alt: 'The Bagel Shop menu.' },
  {
    image: envelopesApexAdvance,
    alt: 'Apex Insurance and Advance Insurance envelopes.',
  },
  { image: flyerAutoShow, alt: 'Atomic Auto Show flyer.' },
];

export interface FanPiece {
  /** Cut from the matched shot by scripts/crop-hero-fan.py. */
  image: ImageMetadata;
  label: string;
  href: string;
}

/** Back to front. Business cards start in front; each step sends that card to the back. */
export const FAN: readonly FanPiece[] = [
  { image: fanMenu, label: 'Menus', href: '/products/menus/' },
  { image: fanBrochure, label: 'Brochures', href: '/products/brochures/' },
  {
    image: fanDoorHanger,
    label: 'Door hangers',
    href: '/products/door-hangers/',
  },
  { image: fanFlyer, label: 'Flyers', href: '/products/flyers/' },
  {
    image: fanPostcard,
    label: 'Postcards & mailers',
    href: '/products/postcards-mailers/',
  },
  {
    image: fanBusinessCard,
    label: 'Business cards',
    href: '/products/business-cards/',
  },
];

/** Recent work: the two newest photos of finished jobs. */
export const RECENT_WORK: readonly PortfolioItem[] = PORTFOLIO_GALLERY.slice(
  0,
  2,
);

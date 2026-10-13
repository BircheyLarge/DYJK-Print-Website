/**
 * The quote form's rules, shared by the browser and the Pages Function
 * (functions/api/quote.ts), so the two can't disagree. Pure and
 * dependency-free: no DOM, no network, no Astro.
 *
 * Validation is forgiving on purpose: every avoidable rejection is a lost
 * job. It is strict only where spam lives (links, lengths, the honeypot).
 */

/** The 11 products in the /products/ hub's order (a unit test checks). */
export const QUOTE_PRODUCTS = [
  'Business Cards',
  'Presentation Folders',
  'Postcards & Mailers',
  'Door Hangers',
  'Stickers',
  'Labels',
  'Flyers',
  'Brochures',
  'Menus',
  'Catalogs & Booklets',
  'Envelopes & Letterhead',
] as const;

export const SOMETHING_ELSE = 'Something else';

/** Every choice in the "What are we printing?" list. */
export const PRODUCT_CHOICES: readonly string[] = [
  ...QUOTE_PRODUCTS,
  SOMETHING_ELSE,
];

/** Where the finished job goes: shipped, or delivered in Salt Lake City. */
export const DELIVERY_SHIP = 'ship';
export const DELIVERY_SLC = 'deliver-slc';

export interface QuoteValues {
  name: string;
  email: string;
  phone: string;
  company: string;
  product: string;
  quantity: string;
  size: string;
  paper: string;
  deadline: string;
  delivery: string;
  shipTo: string;
  artwork: string;
  notes: string;
  /** The honeypot. People never see it, so any value means a bot. */
  website: string;
}

export type QuoteField = Exclude<keyof QuoteValues, 'website'>;
export type QuoteErrors = Partial<Record<QuoteField, string>>;

/** The order fields appear in: focus goes to the first one with an error. */
export const FIELD_ORDER: readonly QuoteField[] = [
  'name',
  'email',
  'phone',
  'company',
  'product',
  'quantity',
  'size',
  'paper',
  'deadline',
  'delivery',
  'shipTo',
  'artwork',
  'notes',
];

/** Character limits. Generous for people, tight enough to stop dumps. */
export const LIMITS: Record<QuoteField, number> = {
  name: 100,
  email: 254,
  phone: 40,
  company: 120,
  product: 40,
  quantity: 60,
  size: 80,
  paper: 120,
  deadline: 10,
  delivery: 20,
  shipTo: 60,
  artwork: 500,
  notes: 3000,
};

/** Notes may carry a link or two (a reference, a sample); more is spam. */
export const MAX_NOTE_LINKS = 2;

/** Short text fields where a link only ever means spam. */
const NO_LINK_FIELDS: readonly QuoteField[] = [
  'name',
  'company',
  'quantity',
  'size',
  'paper',
  'shipTo',
];

/** US states, DC and territories: [code, name]. Ship-to matches either. */
export const US_STATES: ReadonlyArray<readonly [string, string]> = [
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CA', 'California'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['FL', 'Florida'],
  ['GA', 'Georgia'],
  ['HI', 'Hawaii'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['KY', 'Kentucky'],
  ['LA', 'Louisiana'],
  ['ME', 'Maine'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MN', 'Minnesota'],
  ['MS', 'Mississippi'],
  ['MO', 'Missouri'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['TX', 'Texas'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
  ['PR', 'Puerto Rico'],
  ['GU', 'Guam'],
  ['VI', 'U.S. Virgin Islands'],
  ['AS', 'American Samoa'],
  ['MP', 'Northern Mariana Islands'],
];

const LINK = /\bhttps?:\/\/|\bwww\./gi;

/** How many links a piece of text carries. */
export function countLinks(text: string): number {
  return (text.match(LINK) ?? []).length;
}

/** A state code or name as a word, or a ZIP, anywhere in the text. */
export function looksLikeUsPlace(text: string): boolean {
  if (/\b\d{5}(-\d{4})?\b/.test(text)) return true;
  const lower = ` ${text.toLowerCase().replace(/[^a-z.\s]/g, ' ')} `;
  return US_STATES.some(
    ([code, name]) =>
      new RegExp(`\\s${code.toLowerCase()}\\s`).test(lower) ||
      lower.includes(` ${name.toLowerCase()} `),
  );
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

function digitCount(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

/** Read a value defensively: FormData and JSON bodies both land here. */
function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Normalize any payload into the full value shape, every key present. */
export function toQuoteValues(input: Record<string, unknown>): QuoteValues {
  return {
    name: text(input.name),
    email: text(input.email),
    phone: text(input.phone),
    company: text(input.company),
    product: text(input.product),
    quantity: text(input.quantity),
    size: text(input.size),
    paper: text(input.paper),
    deadline: text(input.deadline),
    delivery: text(input.delivery),
    shipTo: text(input.shipTo),
    artwork: text(input.artwork),
    notes: text(input.notes),
    website: text(input.website),
  };
}

export interface QuoteValidation {
  valid: boolean;
  errors: QuoteErrors;
  /** The honeypot caught a bot: accept quietly, never deliver. */
  spam: boolean;
}

/**
 * Check a quote request.
 *
 * @param today Injected for tests. Compared date-only, so today itself is
 *              always an acceptable date.
 */
export function validateQuote(
  values: QuoteValues,
  today: Date = new Date(),
): QuoteValidation {
  const errors: QuoteErrors = {};
  const set = (field: QuoteField, message: string) => {
    errors[field] ??= message;
  };

  for (const field of FIELD_ORDER) {
    if (values[field].length > LIMITS[field]) {
      set(
        field,
        `Please keep this under ${LIMITS[field].toLocaleString('en-US')} characters.`,
      );
    }
  }
  for (const field of NO_LINK_FIELDS) {
    if (countLinks(values[field]) > 0) {
      set(field, 'Please leave links out of this one.');
    }
  }

  if (values.name.length < 2) set('name', 'Please enter your name.');

  if (!values.email) {
    set('email', 'Please enter your email, so we can send the quote.');
  } else if (!looksLikeEmail(values.email)) {
    set('email', 'That email address doesn’t look right.');
  }

  // Optional, but a half-typed number is worse than none.
  if (values.phone && digitCount(values.phone) < 10) {
    set('phone', 'Please enter a 10-digit phone number, or leave it blank.');
  }

  if (!values.product) {
    set('product', 'Please choose what we’re printing.');
  } else if (!PRODUCT_CHOICES.includes(values.product)) {
    set('product', 'Please choose one from the list.');
  }

  // Free text on purpose: "5,000" and "not sure yet" are both real answers.
  if (!values.quantity) set('quantity', 'Roughly how many do you need?');

  if (values.deadline) {
    const date = new Date(`${values.deadline}T00:00:00`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(values.deadline) ||
      Number.isNaN(date.getTime())
    ) {
      set('deadline', 'Please enter a date, or leave it blank.');
    } else {
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      if (date < startOfToday) set('deadline', 'That date has passed.');
    }
  }

  if (values.delivery === DELIVERY_SHIP) {
    if (!values.shipTo) {
      set('shipTo', 'Tell us the state or ZIP it ships to.');
    } else if (!looksLikeUsPlace(values.shipTo)) {
      set('shipTo', 'Enter a state, like UT or Texas, or a 5-digit ZIP.');
    }
  } else if (values.delivery !== DELIVERY_SLC) {
    set('delivery', 'Choose shipping or Salt Lake City delivery.');
  }

  if (values.artwork) {
    let ok = false;
    try {
      const url = new URL(values.artwork);
      ok =
        (url.protocol === 'https:' || url.protocol === 'http:') &&
        url.hostname.includes('.') &&
        !/\s/.test(values.artwork);
    } catch {
      ok = false;
    }
    if (!ok) {
      set('artwork', 'Paste the full link to your files, starting https://.');
    }
  }

  if (countLinks(values.notes) > MAX_NOTE_LINKS) {
    set('notes', `Please include no more than ${MAX_NOTE_LINKS} links.`);
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    spam: values.website.length > 0,
  };
}

/** The first field with an error, in the order they appear. */
export function firstErrorField(errors: QuoteErrors): QuoteField | null {
  return FIELD_ORDER.find((field) => errors[field]) ?? null;
}

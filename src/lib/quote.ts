/**
 * Quote-request validation — pure, dependency-free, and shared by BOTH the
 * browser island and the Cloudflare Pages Function. One rule set means the
 * client can never accept something the server rejects (or vice versa), and
 * the rules stay unit-testable without a DOM or a network.
 *
 * Field set follows ARCHITECTURE.md §7. Validation is deliberately forgiving:
 * this is a lead-gen form, and every avoidable rejection is a lost lead.
 */

/** Project types offered in the quote dropdown. Value is what reaches sales. */
export const PROJECT_TYPES = [
  'Business Cards',
  'Brochures',
  'Flyers',
  'Catalogs & Booklets',
  'Postcards & Mailers',
  'Envelopes & Letterhead',
  'Graphic Design / Prepress',
  'Other / Not sure yet',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

/** US states + DC. Shipping destination drives freight cost on national jobs. */
export const US_STATES = [
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
] as const satisfies ReadonlyArray<readonly [string, string]>;

const STATE_CODES: ReadonlySet<string> = new Set(
  US_STATES.map(([code]) => code),
);

export interface QuoteFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
  quantity: string;
  shipState: string;
  shipZip: string;
  deadline: string;
  artworkUrl: string;
  message: string;
  /** Consent checkbox — 'on' when checked (native form encoding). */
  consent: string;
  /** Honeypot. Real users never see it, so any value means a bot. */
  website: string;
}

export type QuoteFieldName = keyof QuoteFormValues;

/** Fields a human must fill in. Used by the UI to render required markers. */
export const REQUIRED_FIELDS = [
  'name',
  'email',
  'projectType',
  'quantity',
  'shipState',
  'consent',
] as const satisfies ReadonlyArray<QuoteFieldName>;

export type QuoteErrors = Partial<Record<QuoteFieldName, string>>;

export interface QuoteValidation {
  valid: boolean;
  errors: QuoteErrors;
  /** True when the honeypot caught a bot — accept silently, never deliver. */
  spam: boolean;
}

const MAX_MESSAGE = 5000;

/**
 * Pragmatic email check. Full RFC 5322 is famously not worth it — we reject
 * the obviously-broken and let the confirmation email catch the rest.
 */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value);
}

function digitCount(value: string): number {
  return (value.match(/\d/g) ?? []).length;
}

/** Read a value defensively — FormData and JSON bodies both land here. */
function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Normalize an arbitrary payload into the full value shape (all keys present). */
export function toQuoteValues(input: Record<string, unknown>): QuoteFormValues {
  return {
    name: str(input.name),
    company: str(input.company),
    email: str(input.email),
    phone: str(input.phone),
    projectType: str(input.projectType),
    quantity: str(input.quantity),
    shipState: str(input.shipState).toUpperCase(),
    shipZip: str(input.shipZip),
    deadline: str(input.deadline),
    artworkUrl: str(input.artworkUrl),
    message: str(input.message),
    consent: str(input.consent),
    website: str(input.website),
  };
}

/**
 * Validate a quote submission.
 *
 * @param values  Normalized form values.
 * @param today   Injected for deterministic tests; defaults to now. Compared
 *                date-only so "today" is always an acceptable deadline.
 */
export function validateQuote(
  values: QuoteFormValues,
  today: Date = new Date(),
): QuoteValidation {
  const errors: QuoteErrors = {};

  if (values.name.length < 2) {
    errors.name = 'Please enter your name.';
  }

  if (!values.email) {
    errors.email = 'Please enter your email so we can send your quote.';
  } else if (!looksLikeEmail(values.email)) {
    errors.email = 'That email address doesn’t look right.';
  }

  // Phone is optional, but a half-typed number is worse than none.
  if (values.phone && digitCount(values.phone) < 10) {
    errors.phone = 'Please enter a 10-digit phone number, or leave it blank.';
  }

  if (!values.projectType) {
    errors.projectType = 'Please choose what you’re printing.';
  } else if (
    !(PROJECT_TYPES as readonly string[]).includes(values.projectType)
  ) {
    errors.projectType = 'Please choose an option from the list.';
  }

  // Free text on purpose — "5,000" and "not sure yet" are both real answers.
  if (!values.quantity) {
    errors.quantity = 'Roughly how many do you need?';
  }

  if (!values.shipState) {
    errors.shipState = 'Please choose where this ships.';
  } else if (!STATE_CODES.has(values.shipState)) {
    errors.shipState = 'Please choose a state from the list.';
  }

  if (values.shipZip && !/^\d{5}(-\d{4})?$/.test(values.shipZip)) {
    errors.shipZip = 'Please enter a 5-digit ZIP code.';
  }

  if (values.deadline) {
    const parsed = new Date(`${values.deadline}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      errors.deadline = 'Please enter a valid date.';
    } else {
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      if (parsed < startOfToday) {
        errors.deadline = 'That date has already passed.';
      }
    }
  }

  if (values.artworkUrl && !/^https?:\/\/\S+\.\S+/i.test(values.artworkUrl)) {
    errors.artworkUrl =
      'Please paste a full link (starting with https://) to your files.';
  }

  if (values.message.length > MAX_MESSAGE) {
    errors.message = `Please keep this under ${MAX_MESSAGE.toLocaleString()} characters.`;
  }

  if (!values.consent) {
    errors.consent = 'Please agree so we can reply to your request.';
  }

  const spam = values.website.length > 0;

  return { valid: Object.keys(errors).length === 0, errors, spam };
}

/** Field order used for focus management and for the lead email. */
export const FIELD_ORDER = [
  'name',
  'company',
  'email',
  'phone',
  'projectType',
  'quantity',
  'shipState',
  'shipZip',
  'deadline',
  'artworkUrl',
  'message',
  'consent',
] as const satisfies ReadonlyArray<QuoteFieldName>;

/** The first field with an error, in visual order — where focus should go. */
export function firstErrorField(errors: QuoteErrors): QuoteFieldName | null {
  return FIELD_ORDER.find((field) => errors[field]) ?? null;
}

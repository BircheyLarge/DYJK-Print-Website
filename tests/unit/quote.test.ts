import { describe, expect, it } from 'vitest';
import {
  FIELD_ORDER,
  PROJECT_TYPES,
  REQUIRED_FIELDS,
  US_STATES,
  firstErrorField,
  toQuoteValues,
  validateQuote,
  type QuoteFormValues,
} from '../../src/lib/quote';

/** A submission that should always pass, so each test can break one thing. */
function validValues(
  overrides: Partial<QuoteFormValues> = {},
): QuoteFormValues {
  return toQuoteValues({
    name: 'Jane Rivera',
    company: 'Rivera Creative',
    email: 'jane@rivera.co',
    phone: '(801) 555-0134',
    projectType: 'Brochures',
    quantity: '5,000',
    shipState: 'TX',
    shipZip: '78701',
    deadline: '',
    artworkUrl: '',
    message: 'Tri-fold, 100# gloss text.',
    consent: 'on',
    website: '',
    ...overrides,
  });
}

const TODAY = new Date('2026-08-10T12:00:00Z');

describe('toQuoteValues', () => {
  it('fills every field so callers never handle undefined', () => {
    const values = toQuoteValues({});
    for (const field of FIELD_ORDER) {
      expect(values[field]).toBe('');
    }
  });

  it('trims whitespace and upper-cases the state code', () => {
    const values = toQuoteValues({ name: '  Jane  ', shipState: 'tx' });
    expect(values.name).toBe('Jane');
    expect(values.shipState).toBe('TX');
  });

  it('ignores non-string values instead of coercing them', () => {
    const values = toQuoteValues({ name: 42, email: null, message: {} });
    expect(values.name).toBe('');
    expect(values.email).toBe('');
    expect(values.message).toBe('');
  });
});

describe('validateQuote', () => {
  it('accepts a complete submission', () => {
    const result = validateQuote(validValues(), TODAY);
    expect(result.errors).toEqual({});
    expect(result.valid).toBe(true);
    expect(result.spam).toBe(false);
  });

  it('requires every field listed as required', () => {
    const result = validateQuote(toQuoteValues({ website: '' }), TODAY);
    expect(result.valid).toBe(false);
    for (const field of REQUIRED_FIELDS) {
      expect(
        result.errors[field],
        `expected an error for ${field}`,
      ).toBeTruthy();
    }
  });

  it('rejects a malformed email but accepts a plain one', () => {
    expect(
      validateQuote(validValues({ email: 'jane@' }), TODAY).errors.email,
    ).toBeTruthy();
    expect(
      validateQuote(validValues({ email: 'jane@sub.example.co.uk' }), TODAY)
        .errors.email,
    ).toBeUndefined();
  });

  it('treats phone as optional but rejects a partial number', () => {
    expect(
      validateQuote(validValues({ phone: '' }), TODAY).errors.phone,
    ).toBeUndefined();
    expect(
      validateQuote(validValues({ phone: '801-555' }), TODAY).errors.phone,
    ).toBeTruthy();
  });

  it('only accepts project types we actually offer', () => {
    expect(
      validateQuote(validValues({ projectType: 'Skywriting' }), TODAY).errors
        .projectType,
    ).toBeTruthy();
    for (const type of PROJECT_TYPES) {
      expect(
        validateQuote(validValues({ projectType: type }), TODAY).errors
          .projectType,
      ).toBeUndefined();
    }
  });

  it('keeps quantity forgiving — vague answers are still leads', () => {
    for (const quantity of ['5,000', '500-1000', 'not sure yet']) {
      expect(
        validateQuote(validValues({ quantity }), TODAY).errors.quantity,
      ).toBeUndefined();
    }
    expect(
      validateQuote(validValues({ quantity: '' }), TODAY).errors.quantity,
    ).toBeTruthy();
  });

  it('accepts every state in the dropdown and rejects anything else', () => {
    for (const [code] of US_STATES) {
      expect(
        validateQuote(validValues({ shipState: code }), TODAY).errors.shipState,
      ).toBeUndefined();
    }
    expect(
      validateQuote(validValues({ shipState: 'ZZ' }), TODAY).errors.shipState,
    ).toBeTruthy();
  });

  it('validates ZIP format only when a ZIP was given', () => {
    expect(
      validateQuote(validValues({ shipZip: '' }), TODAY).errors.shipZip,
    ).toBeUndefined();
    expect(
      validateQuote(validValues({ shipZip: '78701-1234' }), TODAY).errors
        .shipZip,
    ).toBeUndefined();
    expect(
      validateQuote(validValues({ shipZip: '787' }), TODAY).errors.shipZip,
    ).toBeTruthy();
  });

  it('rejects a deadline in the past but allows today', () => {
    expect(
      validateQuote(validValues({ deadline: '2026-08-09' }), TODAY).errors
        .deadline,
    ).toBeTruthy();
    expect(
      validateQuote(validValues({ deadline: '2026-08-10' }), TODAY).errors
        .deadline,
    ).toBeUndefined();
    expect(
      validateQuote(validValues({ deadline: '2026-12-01' }), TODAY).errors
        .deadline,
    ).toBeUndefined();
  });

  it('requires a full URL for the artwork link', () => {
    expect(
      validateQuote(validValues({ artworkUrl: 'drive.google.com/x' }), TODAY)
        .errors.artworkUrl,
    ).toBeTruthy();
    expect(
      validateQuote(
        validValues({ artworkUrl: 'https://drive.google.com/x' }),
        TODAY,
      ).errors.artworkUrl,
    ).toBeUndefined();
  });

  it('caps message length', () => {
    expect(
      validateQuote(validValues({ message: 'x'.repeat(5000) }), TODAY).errors
        .message,
    ).toBeUndefined();
    expect(
      validateQuote(validValues({ message: 'x'.repeat(5001) }), TODAY).errors
        .message,
    ).toBeTruthy();
  });

  it('flags a filled honeypot as spam without inventing field errors', () => {
    const result = validateQuote(
      validValues({ website: 'http://spam' }),
      TODAY,
    );
    expect(result.spam).toBe(true);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });
});

describe('firstErrorField', () => {
  it('returns the earliest field in visual order, not object order', () => {
    expect(firstErrorField({ shipState: 'x', name: 'x' })).toBe('name');
    expect(firstErrorField({ consent: 'x', quantity: 'x' })).toBe('quantity');
  });

  it('returns null when there is nothing to fix', () => {
    expect(firstErrorField({})).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { SITE } from '../../src/consts';
import {
  gmailHref,
  mailtoHref,
  outlookHref,
  QUOTE_EMAIL,
} from '../../src/lib/email';

describe('quote email links', () => {
  const links = {
    mailto: mailtoHref(SITE.email, QUOTE_EMAIL),
    gmail: gmailHref(SITE.email, QUOTE_EMAIL),
    outlook: outlookHref(SITE.email, QUOTE_EMAIL),
  };

  it('all decode back to the one template', () => {
    const mailto = new URL(links.mailto);
    expect(mailto.pathname).toBe(SITE.email);
    expect(mailto.searchParams.get('subject')).toBe(QUOTE_EMAIL.subject);
    expect(mailto.searchParams.get('body')).toBe(QUOTE_EMAIL.body);

    const gmail = new URL(links.gmail).searchParams;
    expect([gmail.get('to'), gmail.get('su'), gmail.get('body')]).toEqual([
      SITE.email,
      QUOTE_EMAIL.subject,
      QUOTE_EMAIL.body,
    ]);

    const outlook = new URL(links.outlook).searchParams;
    expect([
      outlook.get('to'),
      outlook.get('subject'),
      outlook.get('body'),
    ]).toEqual([SITE.email, QUOTE_EMAIL.subject, QUOTE_EMAIL.body]);
  });

  it('encode spaces as %20, never "+" (Outlook shows a "+")', () => {
    for (const href of Object.values(links)) {
      expect(href).not.toContain('+');
      expect(href).toContain('Quote%20request');
    }
  });

  it('keep the encoded body well under the ~2,000-character URL limits', () => {
    expect(encodeURIComponent(QUOTE_EMAIL.body).length).toBeLessThan(1800);
    for (const href of Object.values(links)) {
      expect(href.length).toBeLessThan(1800);
    }
  });
});

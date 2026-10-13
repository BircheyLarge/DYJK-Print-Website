/**
 * The quote email: one template, and every way to send it. A mailto: link
 * does nothing on a computer without a desktop mail app (most people on
 * Outlook or Gmail in the browser), so pages also offer webmail compose links
 * and show the address as text.
 */

export interface EmailDraft {
  subject: string;
  body: string;
}

/** What a quote request should say; the email opens with these to fill in. */
export const QUOTE_EMAIL: EmailDraft = {
  subject: 'Quote request',
  body: [
    'The piece:',
    'Quantity:',
    'Size:',
    'Paper or finish:',
    'Your date (if you have one):',
    'Where it ships (state or ZIP):',
    'Notes:',
  ].join('\n'),
};

// encodeURIComponent, not URLSearchParams: Outlook shows a "+" literally
// where URLSearchParams would have encoded a space.
const encode = encodeURIComponent;

/** A mailto: link: opens the desktop mail app, if there is one. */
export function mailtoHref(to: string, draft: EmailDraft): string {
  return `mailto:${to}?subject=${encode(draft.subject)}&body=${encode(draft.body)}`;
}

/** Gmail's compose window in the browser. */
export function gmailHref(to: string, draft: EmailDraft): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encode(to)}&su=${encode(draft.subject)}&body=${encode(draft.body)}`;
}

/** Outlook on the web's compose window (Microsoft 365 and outlook.com). */
export function outlookHref(to: string, draft: EmailDraft): string {
  return `https://outlook.office.com/mail/deeplink/compose?to=${encode(to)}&subject=${encode(draft.subject)}&body=${encode(draft.body)}`;
}

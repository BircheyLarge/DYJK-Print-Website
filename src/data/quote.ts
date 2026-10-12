/**
 * What happens after a quote request, in Stanley's words. The quote form's
 * sidebar, /quote-received/ and the auto-reply email all say it, from here.
 */
export const QUOTE_NEXT = [
  {
    title: 'A free quote.',
    text: 'We read what you sent and reply with a quote. The quote is free.',
  },
  {
    title: 'A proof first.',
    text: 'You approve a proof before anything prints.',
  },
  {
    title: 'Delivered or shipped.',
    text: 'In Salt Lake City, we deliver it ourselves. Everywhere else, we ship it anywhere in the United States.',
  },
] as const;

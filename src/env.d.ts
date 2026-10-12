/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  /** 'true' at build time renders the quote form on /request-a-quote/. */
  readonly PUBLIC_QUOTE_FORM_ENABLED?: string;
  /** The Turnstile site key; required when the form is on. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

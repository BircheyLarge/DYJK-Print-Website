# DYJK Print — Website

Nationwide commercial printing — marketing + lead-generation site for
[dyjkprint.com](https://www.dyjkprint.com). Built SEO-first for national
(not local) discovery, with a quote-request conversion flow.

> Architecture, decisions and roadmap live in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Stack

- **[Astro](https://astro.build)** (static, content-collections) + **TypeScript** (strict)
- **[Tailwind CSS v4](https://tailwindcss.com)** via `@tailwindcss/vite`
- **Cloudflare Pages** (hosting) + a Pages Function for the quote form
- **Vitest** (unit) · **Playwright** + **axe-core** (e2e / a11y)

## Getting started

```bash
npm install
npm run dev        # http://localhost:4321
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `astro check` + `tsc --noEmit` |
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | Apply Prettier |
| `npm test` | Unit tests (Vitest) |
| `npm run build:form` | Build with the quote form on, to `dist-form/` (Turnstile test key) |
| `npm run test:e2e` | Playwright smoke + a11y: builds `dist/`, and the quote-form server builds `dist-form/` |

## Project layout

```
src/
  components/      BaseHead, JsonLd, Header, Footer
  layouts/         BaseLayout
  lib/             seo.ts, schema.ts (JSON-LD), content-schemas.ts (Zod)
  content.config.ts  content collections (blog/services/products/industries)
  pages/           routes
  styles/          global.css — BRAND TOKENS swap point
tests/
  unit/            Vitest (pure logic)
  e2e/             Playwright smoke + axe a11y
```

## Quote form

`/request-a-quote/` ships as an email-or-call page. Setting
`PUBLIC_QUOTE_FORM_ENABLED=true` at build time swaps in the quote form
(`src/components/QuoteForm.astro`), which posts to a Cloudflare Pages
Function, `POST /api/quote` (`functions/api/quote.ts`). That Function emails
the request to sales@dyjkprint.com through [Resend](https://resend.com), with
reply-to set to the customer, and sends the customer a short auto-reply. Both
come from `DYJK Print <quotes@dyjkprint.com>`. Then it sends them to
`/quote-received/`, the conversion page (noindex).

- **Without JavaScript:** a plain POST, answered with a 303 to
  `/quote-received/`. Turnstile itself needs JavaScript, so a page note offers
  email and the phone instead.
- **With JavaScript:** inline errors from the same rules as the server
  (`src/lib/quote.ts`), a fetch submit, and typed values kept on failure. A
  server or network failure shows the phone number and the email fallbacks.

### Settings

In Cloudflare Pages → Settings → Variables and Secrets, for Production. Redeploy
after changing them: the two `PUBLIC_` ones are read at build time.

| Variable | Value |
|---|---|
| `PUBLIC_QUOTE_FORM_ENABLED` | `true` turns the form on; anything else keeps the email-or-call page |
| `PUBLIC_TURNSTILE_SITE_KEY` | the Turnstile widget's site key (required with the form on; the build fails without it) |
| `TURNSTILE_SECRET_KEY` | the Turnstile secret (encrypt it) |
| `RESEND_API_KEY` | a Resend API key with sending access (encrypt it) |

Until both secrets are set, `/api/quote` answers 503 and the form offers email
and the phone. It never accepts a request it can't verify.

### Spam

All server-side, in this order:
1. **Honeypot.** A hidden `website` field. If it's filled, the bot gets an "ok"
   and nothing is sent.
2. **Fill time.** `functions/request-a-quote/_middleware.ts` stamps each page
   view with a signed time (HMAC, keyed from the Turnstile secret). A request
   sent within 3 seconds, or with a forged or day-old stamp, is refused.
3. **Limits.** Every field has a length cap, short fields take no links, and
   notes take at most two.
4. **Turnstile.** Verified with the secret on every request. There are no
   puzzles.

Mail only goes out after all four pass, and the auto-reply carries none of the
visitor's own text, so it can't be used to send messages to other people.

**Optional: a WAF rate limit.** In Cloudflare → Security → WAF → Rate limiting
rules, add one rule:
- **Match:** `(http.request.uri.path eq "/api/quote" and http.request.method eq "POST")`
- **Count by:** IP
- **Free plan** (10-second periods only): 3 requests per 10 seconds, block
  for 10 seconds.
- **Pro and up:** 5 requests per minute, block for 10 minutes.

### Trying it locally

```bash
npm run build:form
npx wrangler pages dev dist-form \
  --binding TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA \
  --binding RESEND_API_KEY=re_test \
  --binding RESEND_API_URL=http://127.0.0.1:8789/emails
```

- `1x0000000000000000000000000000000AA` is Turnstile's documented always-pass
  test secret; `build:form` uses the matching test site key.
- `RESEND_API_URL` points the mail at a local stand-in, so nothing reaches
  Resend. Leave it out, with a real key, to send for real.

## Brand tokens

All brand colors live in one place — the `@theme` block in
[`src/styles/global.css`](./src/styles/global.css). Values are currently sampled
from a low-res logo extraction; swap for exact brand values when the high-res
logo lands. Nothing else hard-codes brand colors.

## Conventions

- **No physical address / map / "local business" framing** anywhere — DYJK is
  positioned as a nationwide partner. Contact is email, phone and the quote
  form; the number lives in `SITE.phone` (setting it to null hides it).
  This is enforced by tests in `tests/unit/schema.test.ts` and
  `tests/e2e/smoke.spec.ts`.
- One `<h1>` per page; canonical URLs; trailing-slash policy `always`.

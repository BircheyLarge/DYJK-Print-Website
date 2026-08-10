# DYJK Print — Website

Nationwide commercial printing — marketing + lead-generation site for
[dyjkprint.com](https://www.dyjkprint.com). Built SEO-first for national
(not local) discovery, with a quote-request conversion flow.

> Architecture, decisions and roadmap live in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Stack

- **[Astro](https://astro.build)** (static, content-collections) + **TypeScript** (strict)
- **[Tailwind CSS v4](https://tailwindcss.com)** via `@tailwindcss/vite`
- **Cloudflare Pages** target (hosting); R2 for artwork uploads (P1)
- **Vitest** (unit) · **Playwright** + **axe-core** (e2e / a11y)

## Getting started

Astro 7 requires **Node ≥ 22.12** (see `.nvmrc`). Installing under an older
Node silently skips the platform-specific `rolldown` binary and `astro dev`
then fails with "Cannot find native binding" — if you hit that, switch Node
version and reinstall from scratch.

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
| `npm run test:e2e` | Playwright smoke + a11y (builds + previews first) |

## Project layout

```
src/
  components/      BaseHead, JsonLd, Header, Footer, Button, Field, QuoteForm
  layouts/         BaseLayout
  lib/             seo.ts, schema.ts (JSON-LD), content-schemas.ts (Zod),
                   quote.ts (form validation — shared with the API)
  data/            catalog.ts — services + products (drives generated routes)
  content.config.ts  content collections (blog/services/products/industries)
  pages/           routes
  styles/          global.css — BRAND TOKENS swap point
functions/
  api/quote.ts     Cloudflare Pages Function — quote form endpoint
tests/
  unit/            Vitest (pure logic)
  e2e/             Playwright smoke + axe a11y + quote-form flows
```

## Quote form

`/request-a-quote/` posts to `/api/quote`, a **Cloudflare Pages Function** in
the repo-root `functions/` directory. Pages deploys it alongside the static
output, so the site stays fully static — no Astro adapter.

Both sides validate with the same module, [`src/lib/quote.ts`](./src/lib/quote.ts),
so client and server rules can't drift.

It is built to work **without JavaScript**: a native POST that the Function
answers with a 303 to `/quote-received/`. With JS, the form validates inline
and submits over `fetch` without losing what was typed.

### Environment bindings

Set these in the Cloudflare Pages project:

| Binding | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | **yes** | Mail transport. Without it the endpoint returns 503 and the form shows its "call us instead" fallback — it never silently drops a lead. |
| `LEAD_TO` | no | Recipient. Defaults to `sales@dyjkprint.com`. |
| `LEAD_FROM` | no | Verified sender. Defaults to `quotes@dyjkprint.com`. |
| `TURNSTILE_SECRET_KEY` | no | When set, a Turnstile token is required and verified. The widget still needs adding to the form once a site key exists; a honeypot guards spam until then. |

> Artwork upload is a **link field** (Drive/Dropbox/WeTransfer) today, not an
> R2 presigned upload. See ARCHITECTURE.md §7 for the intended end state.

## Brand tokens

All brand colors live in one place — the `@theme` block in
[`src/styles/global.css`](./src/styles/global.css). Values are currently sampled
from a low-res logo extraction; swap for exact brand values when the high-res
logo lands. Nothing else hard-codes brand colors.

## Conventions

- **No physical address / map / "local business" framing** anywhere — DYJK is
  positioned as a nationwide partner. Contact is phone + email + quote form.
  This is enforced by tests in `tests/unit/schema.test.ts` and
  `tests/e2e/smoke.spec.ts`.
- One `<h1>` per page; canonical URLs; trailing-slash policy `always`.

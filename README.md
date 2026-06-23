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

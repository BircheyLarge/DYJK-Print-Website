# DYJK Print — Website Architecture Proposal (v2)

> Status: **Reconciled between @claude + @codex with @you's architecture decisions applied.** Not yet implemented.
> Changelog v1→v2: nationwide-first SEO reframe; no address-forward/local-first positioning; un-pinned framework versions (Astro 7 / Tailwind 4); added industries + product/use-case pages; locked lead-gen-only scope; selected Cloudflare Pages + R2 uploads; selected dev-managed CMS-ready content; form/CI corrections; launch-migration plan; analytics + attribution.

## 1. Business context

- **Company:** DYJK Print — commercial printing. **Serves clients nationwide (all 50 states).** Positioned as a nationwide print partner you work with from anywhere — **the site intentionally does NOT foreground a physical address or "local shop" framing** (per @you: customers should never feel they need to be in a location to order). Contact is phone + email + quote form.
- **Services:** Offset printing (high-volume: brochures, flyers, catalogs), digital printing (short-run: business cards, personalized brochures), graphic design / prepress.
- **Tagline:** "Your Vision, Our Precision."
- **Current contact:** sales@dyjkprint.com.
- **Goal:** Best-in-market site that wins **national** organic search and converts visitors into **quote requests / new clients**.

## 2. Primary objective

A **nationwide lead-generation marketing site**, not a SaaS app. Decisions optimize, in order:
1. **Organic discovery** — national commercial/product-intent SEO first; avoid signals that make customers feel location-constrained.
2. **Conversion** — clear CTAs → "Request a Quote."
3. **Performance & Core Web Vitals** — ranking factor + UX.
4. **Maintainability** — owner can update content without a painful pipeline.

## 3. Recommended stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro (current major — 7.x, `7.0.2` today)** SSG + content collections | ~0 JS by default → top Core Web Vitals; static HTML = crawlers always see full content; built-in sitemap, image optimization, Zod-typed content. Best-in-class for content/marketing sites. |
| Styling | **Tailwind CSS (current — `4.3.1`)** | Design system, small purged CSS. |
| Language | **TypeScript** (strict) | Type-safe content schemas + SEO helpers. |
| Interactivity | **Astro islands** (lightweight) only where needed (mobile nav, quote form) | Minimal JS. |
| Forms / leads | **Cloudflare Pages Function + Turnstile + R2 presigned uploads** | Lead-gen only, but artwork upload is required. Files should go to object storage, not email attachments. See §7. |
| Hosting | **Cloudflare Pages** | Global CDN, free TLS, preview deploys, edge functions + R2. |
| Analytics | **Plausible or GA4** + **Search Console (mandatory)** | Privacy-friendly + event tracking (§7). |
| Testing | **Vitest**, **Playwright**, **axe-core**, **Lighthouse CI (budgets, not hard 95 gate)** | "Always write tests" — see §9. |

> Versions are **pinned at scaffold time**, not in this doc — we install the then-current major and lockfile it.

**Why not Next.js:** @you confirmed this is **lead-generation only**, with no storefront. There is no auth/DB/cart/checkout app logic, so Astro wins on default performance + simplicity. Basic quote requests, "pay later," or embedded payment links do **not** require Next.

## 4. Information architecture (sitemap)

```
/                          Home — value prop, nationwide reach, services, proof, CTA
/services/                 Services hub
  /services/offset-printing/
  /services/digital-printing/
  /services/graphic-design/            (design & prepress)
  /services/<expansion>/               (large format, mailing, bindery — TBD w/ owner)
/products/                 Use-case / product hub (concrete search intent)
  /products/business-cards/
  /products/brochures/
  /products/flyers/
  /products/catalogs-booklets/
  /products/postcards-mailers/
  /products/envelopes-letterhead/
  /products/banners-signage/           (if offered)
/industries/               Audience pages (often convert > generic blog)
  /industries/agencies-marketing-teams/
  /industries/franchises-multi-location/
  /industries/nonprofits/
  /industries/schools/
  /industries/events/
  /industries/real-estate/
  /industries/restaurants/
/portfolio/                Work samples / case studies (visual proof = critical)
  /portfolio/<slug>/
/about/                    Story, equipment, capabilities, why-us
/contact/                  Phone, email, quote form — NO address/map (nationwide, not walk-in)
/request-a-quote/          High-intent conversion page (the money page)
/blog/                     Topical-authority content hub → internal links to product/service/quote
  /blog/<slug>/
404, /sitemap.xml, /robots.txt, /llms.txt
```

## 5. SEO architecture (the core ask)

**Reframed strategy:** center of gravity = **"reliable nationwide commercial print partner"** with service + product + industry intent. **No local/NAP/Google-Business-Profile play and no physical address** — DYJK is intentionally not positioned as a walk-in/local shop. All ranking comes from national commercial + product + industry intent and topical authority, not local pack/maps.

**Technical SEO**
- Static pre-rendered HTML, one `<h1>`/page, semantic landmarks.
- Canonical URLs, consistent trailing-slash policy, no duplicate content.
- `@astrojs/sitemap` auto sitemap + `robots.txt`; **Search Console mandatory**. IndexNow = optional nice-to-have.
- Open Graph + Twitter cards per page; auto-generated OG images.
- Responsive images (AVIF/WebP, lazy, explicit width/height → no CLS).
- Fast by default; Core Web Vitals tracked (see §9 for the CI policy).

**Structured data (JSON-LD)** — reusable component:
- `Organization` with **`areaServed: United States`**, `contactPoint` (phone + email), `sameAs`. **No `LocalBusiness`, no `postalAddress`, no geo/hours** — nationwide, not a walk-in location.
- `Service` on each service page; `Product`/`Offer` patterns on product pages where honest.
- `BreadcrumbList` on nested pages; `FAQPage` on service/product/quote pages; `Article` on blog; `ImageObject` on portfolio.
- **`Review`/`AggregateRating` only for real, first-party reviews shown on the page** — no invented aggregate ratings.

**National content strategy**
- **Product/use-case pages** carry concrete commercial intent ("brochure printing," "catalog printing," "business card printing") — heaviest SEO weight.
- **Industry/audience pages** target buyer segments that convert.
- Dedicated copy on **nationwide shipping/fulfillment, production timelines, proofing, file prep/specs, and quote turnaround** — the trust factors for buying print remotely.
- Blog builds topical authority + internal links into product/service/quote pages.
- **No `/locations/` city pages and no local-pack play** — DYJK is positioned nationwide, not by geography.

## 6. Design direction

- Keep the **logo** (the one keeper) — build palette/type around it. Need the asset + brand colors from @you.
- Clean, modern, high-trust: strong hero, real work photography, social proof, obvious CTAs, sticky "Request a Quote."
- Accessible (WCAG 2.2 AA), mobile-first, high contrast.

## 7. Lead capture / forms

- `/request-a-quote/` fields: name, company, email, phone, service/product type, quantity, **shipping destination (state/ZIP)**, **deadline**, artwork upload, message.
  - National jobs hinge on logistics → shipping + deadline are first-class fields.
- **Backend:** **Cloudflare Pages Function + Turnstile + R2 presigned uploads.** Artwork files are stored in R2 and referenced in the lead email; never emailed as attachments.
- Submission → email to sales@ + autoresponder; honeypot/Turnstile spam protection.
- **Lead quality:** consent/privacy language, hidden **source/UTM** fields, CRM-friendly formatted email.
- **Analytics events:** quote CTA clicks, form starts, validation failures, submissions, phone/email clicks.

## 8. Content management

@you selected **dev-managed content now, CMS-ready structure**.

- Markdown/MDX in-repo content collections, git-managed. Zero cost, versioned, simplest.
- Use clean content schemas + directory structure so a Git-based CMS (Decap/Tina) can be added later without reworking the IA.
- Do **not** bake CMS auth/admin into day one.

## 9. Testing strategy ("always write tests")

- **Unit (Vitest):** content-collection Zod schemas, JSON-LD/SEO meta builders, sitemap entries, internal-link integrity.
- **E2E (Playwright):** nav, quote form happy-path + validation, 404, mobile menu.
- **A11y (axe):** key pages; fail build on violations.
- **Perf/SEO (Lighthouse CI):** **budgets to catch regressions**, plus assert key pages before launch. **Not** a hard 95+ gate on every PR (flaky).
- **Link check:** no broken internal links/images.
- **CI:** GitHub Actions runs lint + typecheck + unit + e2e + a11y + Lighthouse budgets on PR.

## 10. Delivery phases

1. **P0 Foundations:** Astro+TS+Tailwind scaffold (current versions), design tokens from logo, layout/nav/footer, SEO + JSON-LD primitives, CI + test harness.
2. **P1 Core conversion:** Home, Services hub + 3 service pages, **top product pages**, Contact, Request-a-Quote (+ working form w/ attribution).
3. **P2 Trust & reach:** About, Portfolio, **Industries pages**, Blog engine + seed posts, real testimonials/schema.
4. **P3 Polish & launch:** OG image gen, analytics events, Lighthouse hardening, **launch migration** (§12), redirects, Search Console verification.

## 11. Decisions + remaining inputs

**Locked decisions from @you**
- **Ordering model:** lead-generation only; no storefront.
- **Artwork upload:** yes, at quote stage, using R2-backed uploads.
- **Content editing:** dev-managed now, CMS-ready structure.
- **Hosting:** Cloudflare Pages.

**Contact policy (locked):** **No physical address, no map, no hours, no LocalBusiness/GBP.** Public contact = phone `(801) 960-3396` + email `sales@dyjkprint.com` + quote form only.

**Still needed for implementation**
- **Brand assets:** high-res logo file (we have a low-res `299x78` extraction as a placeholder) + confirmed brand colors/fonts.
- **Service/product scope:** beyond offset/digital/design: large format, signage, mailing/EDDM, bindery, packaging, promo? Which products to feature?
- Existing content/photos/testimonials/portfolio to carry over.
- Old URLs worth redirecting.

## 12. Launch migration (added in v2)
- Crawl the current dyjkprint.com → inventory URLs, titles, content, images.
- Preserve/301-redirect old URLs to new IA; avoid losing existing equity.
- Carry over the **logo** with correct filename/alt; migrate any usable copy/photos/testimonials.
- Post-launch: submit sitemap to Search Console, confirm redirects + analytics firing. (No GBP/Maps step — by design, DYJK is not positioned locally.)

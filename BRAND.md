# DYJK Print — Brand Guide

Single source of truth for the mark, palette and voice. If a page, deck or
social card disagrees with this file, the page is wrong.

## Logo

Source: `references/dyjk-logo-from-invoice.png`, a 299×78 raster extracted
from an invoice — the only mark on file. It has been vectorized (traced,
not redrawn) so the letterforms are pixel-faithful to the original while
being crisp at any size. There is still no original agency source file;
if one surfaces, reconcile against it before treating these as final.

| File | Contents | Use |
|---|---|---|
| `public/brand/logo.svg` | Monogram + "PRINT" | Header, footer, anywhere the mark sits under ~120px tall. This is *the* logo for UI use. |
| `public/brand/logo-full.svg` | Monogram + "PRINT" + tagline | Larger placements only (print collateral, a media/brand page) — at header/footer height the tagline is illegible, which is why the UI lockup omits it. Not currently referenced by any page. |
| `public/brand/logo-mark.svg` | Monogram only (the D/J/Y/K glyph) | Square-ish contexts: social avatars, app icons. Not currently referenced by any page. |
| `public/brand/logo.png` | Raster export of `logo.svg`, ~4x | `organizationSchema()` (`src/lib/schema.ts`) — schema.org/Google logo guidance wants JPG/PNG/GIF, not SVG. Don't hand-edit; regenerate from the SVG if the mark changes. |
| `public/favicon.svg` | White monogram on a rounded brand-blue square | Browser tab / bookmark icon. |

**Clearspace:** keep at least the height of the "P" in PRINT clear on all
sides. **Minimum size:** don't render the UI lockup narrower than ~90px
wide — the PRINT wordmark starts breaking up below that; drop to
`logo-mark.svg` alone if you need something smaller and square.

**Don't:**
- Recolor the mark outside the two blues and slate defined below.
- Recreate "DYJK Print" in a live font (Inter or otherwise) as a stand-in
  logo. The lettering is bespoke — treat the lockup as a fixed asset, not
  text.
- Stretch or skew it off its native aspect ratio.

## Color

### Two blues — read this before using either

The logo's true blue fails text contrast. That's not a bug to fix; it's
why there are two blue tokens with different jobs.

| Token | Hex | On white | Use |
|---|---|---|---|
| `--color-brand-blue-logo` | `#2a81c4` | ~4.2:1 — fails WCAG AA for text | The logo artwork itself, and large decorative fills/graphics only. **Never** body text, links, or a button label. |
| `--color-brand-blue` | `#1d6fa8` | ~5.4:1 — passes AA | Every interactive/text use: links, buttons, active nav state, focus rings. This is "brand blue" in UI copy — when in doubt, this is the one you want. |
| `--color-brand-blue-dark` | `#14517d` | ~8.4:1 | Hover/active states on `brand-blue`. |

`#2a81c4` is the exact color sampled from `logo.svg`'s vector paths (the
source raster only contains 4 flat colors, no anti-aliasing, so this is
exact, not estimated). It supersedes the `#2880c0` approximation in
`references/invoice-extraction.md` — same color, tighter sampling.

### Full palette

| Token | Hex | Role |
|---|---|---|
| `--color-brand-blue` | `#1d6fa8` | Primary interactive color |
| `--color-brand-blue-dark` | `#14517d` | Hover/active |
| `--color-brand-blue-logo` | `#2a81c4` | Logo + large decorative fills |
| `--color-brand-slate` | `#506870` | Secondary text, nav |
| `--color-brand-ink` | `#0b1a22` | Body text, headings |
| `--color-brand-muted` | `#5b6b73` | Deemphasized text |
| `--color-brand-surface` | `#f5f8fa` | Section background tint |
| `--color-brand-line` | `#e2e8f0` | Decorative borders/dividers (not for controls — see below) |
| `--color-brand-line-strong` | `#7d8b94` | Borders of anything operable (inputs, outlined buttons) — meets WCAG 1.4.11's 3:1 non-text contrast |

All tokens live in one place: `src/styles/global.css`'s `@theme` block.
Nothing else in the codebase should hard-code a brand hex — if you need a
color that isn't a token, that's a sign to add one here, not to inline a
hex in a component. Text-bearing tokens are contrast-checked by
`tests/unit/color.test.ts`.

The logo's "PRINT" wordmark sample color is `#54666d`, close enough to
`--color-brand-slate` (`#506870`) that they're treated as the same family
— the token is independently contrast-tuned for UI use, the logo keeps
its own exact value because it's a fixed asset.

## Typography

- **UI/body:** Inter (`--font-sans` in `global.css`), system-ui fallback
  stack. Used for every live text element on the site.
  - Live text should never try to imitate the logo's lettering or the
  tagline's script treatment — that's what `logo.svg` is for.

## Voice

- Tagline: **"Your Vision, Our Precision."** — used verbatim, not
  paraphrased, when quoting the brand line.
- Nationwide, not local: no address-forward or "visit our shop" framing.
  See `ARCHITECTURE.md` §1 and `references/invoice-extraction.md`.
- Confident and concrete over promotional: state what happens (a proof
  before printing, a timeline with the quote) rather than adjectives
  about quality.

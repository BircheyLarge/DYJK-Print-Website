# United Energy Workers Healthcare — 2026 cards

Six concepts for UEW Healthcare (Brightmore Home Care of Kentucky, LLC): three
Thanksgiving, three Christmas. Built on the GotPrint **6" x 8.5" vertical
greeting card** template the client supplied, so the print files can be uploaded
as-is.

**Pick from `out/contact-sheet-thanksgiving-2026.png` and
`out/contact-sheet-christmas-2026.png`.** Print files are in `out/print-final/`.

## The six concepts

Each holiday gets the same three art directions, numbered to match — so `01`/`01`,
`02`/`02` or `03`/`03` can be chosen together and read as one season's set.

| # | Direction | Thanksgiving (autumn ramp) | Christmas (brand hues) |
|---|---|---|---|
| 01 | Traditional — light stock, line art, one script word | **Gathered** — oat ground, wheat-and-foliage wreath around "grateful" in rust-deep | **Ornament** — cream ground, the logo's atom hung as an ornament |
| 02 | Formal — dark full bleed, metallic art | **Harvest** — rust-deep ground, wheat-gold sheaf | **Starlight** — navy ground, gold star with orbit rings |
| 03 | Editorial — light stock, oversized flush-left type | **Give Thanks** — rust-deep type, rust rule, three-tone leaf cluster | **Evergreen** — navy type, coral berries |

The artwork is not stock. Every motif is derived from the client's own mark —
the caduceus inside three crossed ellipses with three electron dots. The wreath
is those ellipses as a ring, the ornament is the atom itself, the star's orbits
and electrons are lifted straight from the logo. That is what keeps the set from
reading as generic seasonal clip-art.

`02 Starlight` is the closest successor to the 2025 card (navy, gold, star), with
the stock ornament photo replaced by drawn artwork.

## Print specification

Taken from the supplied template, `greetingcard-6inx8.5in-v.pdf`:

| | |
|---|---|
| Flat sheet with bleed | **8.6 x 6.1 in** (619.2 x 439.2 pt) |
| Trim | 8.5 x 6.0 in — 0.05 in bleed on every edge |
| Score | vertical, dead centre at 4.3 in |
| Folded card | 4.25 x 6.0 in, vertical (opens right, like a book) |
| Vendor safe zone | 0.05 in inside trim, and 0.05 in clear of the score |

**Panel map** — this is the part that is easy to get wrong:

```
PAGE 1 — OUTSIDE          PAGE 2 — INSIDE
+-----------+-----------+ +-----------+-----------+
|   BACK    |   FRONT   | |  INSIDE   |  INSIDE   |
|   COVER   |   COVER   | |   LEFT    |   RIGHT   |
|  (logo)   |   (art)   | | (write-in)| (message) |
+-----------+-----------+ +-----------+-----------+
            ^ score                   ^ score
```

The inside-left panel is deliberately near-empty: these cards get handwritten in.

Body copy is set at 11.5 pt with generous leading. The audience skews older, and
the card is meant to be read across a kitchen table.

## Files

| Path | What |
|---|---|
| `out/print-final/` | **Upload these.** 2-page PDFs, exact template size, Trim/Bleed boxes set |
| `out/print-final-split/` | Same files split into one PDF per side, if the vendor flow wants that |
| `out/proof/` | Same designs with trim / safe / score guides and panel labels, for review only |
| `out/contact-sheet-*.png` | All three concepts per holiday, side by side |
| `out/proof-png/` | 150 dpi PNGs of every page |
| `assets/logo*.svg` | Client's master logo, vector, in colour / white / knockout variants |
| `src/art.mjs` | The seasonal line art, drawn procedurally |
| `src/cards.mjs` | The six concepts — copy and layout |
| `src/base.css` | Print geometry and type scale |

### Colour

The Christmas cards run on the client's own three hues — navy `#133D64`, coral
`#F15933`, light coral `#F8A484` — plus a warm cream ground and a gold.

The Thanksgiving cards use an autumn ramp defined in `src/base.css`. These are
the same values the parallel Thanksgiving set uses, so the client sees one brand
extension rather than two:

| Token | Hex | Used for |
|---|---|---|
| `--fall-oat` | `#F7EDDC` | ground on 01 and 03, and every inside panel |
| `--fall-husk` | `#E0C395` | script and wheat on the dark ground |
| `--fall-amber` | `#DE9A3E` | wheat highlights |
| `--fall-goldenrod` | `#B8842B` | wheat — never on its own, see below |
| `--fall-pumpkin` | `#C9622A` | foliage |
| `--fall-rust` | `#A8431E` | eyebrows, rules, leaves |
| `--fall-rust-deep` | `#8E3616` | ground on 02; display type on 01 and 03 |
| `--fall-chestnut` | `#8A4E2B` | deepest wheat; hairline rules; write-in sprigs |
| `--fall-cranberry` | `#8E2F3C` | berries |
| `--fall-moss` / `--fall-olive` | `#878B57` / `#6B7148` | foliage only — never type |

Rust and rust-deep are the client's coral walked down in value at the same hue,
so the season reads warm without introducing a colour that isn't traceable to
the mark. The greens are the only genuinely new hues and appear as leaves only.
To be precise about how far the shift goes: navy is kept for **body copy, the
sign-offs and the small-caps "Happy Thanksgiving" line**, but the display type
moved — the front headline on 03 and the inside leads on all three are set in
rust-deep, not navy. `02b` is a colourway alternative that keeps the 2025 navy
field and carries the autumn palette in the sheaf instead, since navy is the
one field colour Thanksgiving and Christmas would otherwise no longer share.
It is a choice for the client, not a replacement — the main contact sheets
still show three per holiday.

Every text pairing clears WCAG AA; the tightest is the 7.6pt rust eyebrow on oat
at 5.19:1. One caveat worth recording: **goldenrod on oat is 2.84:1**, just under
the 3:1 non-text floor. It is therefore only ever used as one of three wheat
tones inside the wreath, never for type and never as the only colour carrying an
element — the hairline rules and the write-in sprigs use chestnut (5.66:1)
instead.

## Rebuilding

```bash
node build.mjs      # HTML -> PDF via headless Chromium
python3 finalize.py # exact page size, Trim/Bleed boxes, proofs, contact sheets
```

`build.mjs --html` writes HTML only; open `out/html/gallery.html` to review in a
browser.

`finalize.py` also runs two checks and fails if either does: every page is exactly
619.2 x 439.2 pt with the right TrimBox, and no live text sits outside the vendor
safe box or straddles the score line.

Fonts are self-hosted in `assets/fonts/` (Cormorant Garamond, Gelasio, Pinyon
Script, Montserrat — all SIL Open Font Licence). Gelasio is metrically compatible
with Georgia, which the 2025 card used for body copy.

## Notes for the client

- **Every message thanks the recipient for serving the country and for being
  part of the UEW family**, at the client's direction. Each card says it in the
  voice of its own art direction rather than repeating one sentence six times —
  see `paras` in `src/cards.mjs`, which is the only place copy lives.
- **The logo is the master lockup the client supplied** (`UEW Logo.pdf`), used on
  the back cover and as the signature inside. The lockup that carries
  "Brightmore Home Care of Kentucky, LLC" is also built, as
  `assets/logo-brightmore*.svg`, if the entity line needs to appear as it did on
  the 2025 card — it is a one-word change in `src/cards.mjs`.
- **No phone number, address or URL appears anywhere** — none was supplied. If
  contact details should go on the back cover, send them and they will be set.
- Text is live vector with embedded subset fonts rather than converted to
  outlines. GotPrint accepts this; if their preflight ever objects, the same
  build can emit a fully flattened version.
- **The only raster content in these files is in the client's own logo.** Each
  logo instance carries three inline bitmaps — the highlight dots on the three
  electrons, baked into the supplied artwork — at 90 dpi in the Brightmore
  lockup and 216 dpi in the master. Each is about 0.05 in across, so it is
  invisible at print size, but a preflight report may list them. Everything
  drawn for these cards is vector. (The star's halo is built from concentric
  opaque rings for exactly this reason: an SVG radial gradient gets flattened
  to a 72 dpi bitmap on the way into the PDF.)

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

| # | Direction | Thanksgiving | Christmas |
|---|---|---|---|
| 01 | Traditional — cream stock, navy line art, one script word | **Gathered** — wheat wreath around "grateful" | **Ornament** — the logo's atom hung as an ornament |
| 02 | Formal — deep navy full bleed, gold art | **Harvest** — gold wheat sheaf | **Starlight** — gold star with orbit rings |
| 03 | Editorial — cream stock, oversized flush-left type, coral accent | **Give Thanks** | **Evergreen** |

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

Colour is limited to the three hues in the client's logo artwork — navy `#133D64`,
coral `#F15933`, light coral `#F8A484` — plus a warm cream ground and a gold drawn
for the two navy cards. No other hues appear anywhere in the set.

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

- **Copy is a first draft and is meant to be edited.** The Thanksgiving messages
  lean on the idea that UEW's patients are former DOE / energy-programme workers
  and that the card is thanking them for that service. If that framing is wrong
  for any part of the mailing list, say so and it is a one-line change per card.
- **The back cover uses the lockup with "Brightmore Home Care of Kentucky, LLC"**
  (as the 2025 card did); the signature inside uses the plain master logo. Easy
  to swap either way.
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

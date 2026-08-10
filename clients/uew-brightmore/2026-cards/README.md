# UEW / Brightmore — 2026 Thanksgiving & Christmas cards

Six concepts (3 Thanksgiving, 3 Christmas) for **United Energy Workers Healthcare —
Brightmore Home Care of Kentucky, LLC**, built to the client's GotPrint template so
the files can go straight to upload.

Pick one per season; the rest are alternatives, not drafts.

**Start here:** `out/proof/00-contact-sheet.png` — all six front covers side by side.

---

## The six concepts

### Thanksgiving

| | Concept | Feel |
|---|---|---|
| **T1** | `thanksgiving-01-grateful` | Formal. Deep navy, gold script "Grateful", a harvest crown riding the brand's atom orbits. Closest sibling to the 2025 card. |
| **T2** | `thanksgiving-02-give-thanks` | Friendly. Ivory, hand-drawn leaves framing the type top and bottom, navy Playfair. Lightest ink coverage of the set. |
| **T3** | `thanksgiving-03-thankful` | Modern editorial. One engraved word, one coral orbit, one wheat sprig, a lot of quiet. |

### Christmas

| | Concept | Feel |
|---|---|---|
| **C1** | `christmas-01-peace-joy-light` | Navy night. The star is built from UEW's **own electron orbits** — the ornament is the brand, not stock clip art. Most ownable of the six. |
| **C2** | `christmas-02-merry-and-bright` | Light and contemporary. Geometric treeline in the two navies, coral trunks, peach snow. |
| **C3** | `christmas-03-seasons-greetings` | Classic. Laurel wreath on deep navy, engraved Cinzel caps. The one that looks like a card someone keeps on the mantel. |

Copy is new on every card — nothing reused from 2025. It leans on what this client
actually does (in-home care for the people who worked the country's energy program),
so the gratitude reads as specific rather than as generic card sentiment.

---

## What to upload

`out/print/<concept>.pdf` — one file per concept, **2 pages**:

- **Page 1 = OUTSIDE** — left half is the back cover, right half is the front cover
- **Page 2 = INSIDE** — left half is the blank write-in panel, right half is the message

If GotPrint asks for two separate files rather than one 2-page PDF, split page 1 as
"front/outside" and page 2 as "inside".

### Geometry (measured off `reference/gotprint-template-6x8.5-v.pdf`, not assumed)

| | |
|---|---|
| Artboard incl. bleed | **8.600 × 6.100 in** (619.2 × 439.2 pt) |
| Trim | 8.500 × 6.000 in — 0.05 in bleed per side |
| Score (fold) | vertical, **x = 4.300 in** |
| Panels | two of 4.250 × 6.000 in |
| Finished folded card | **4.250 w × 6.000 h in, portrait, fold on the left** |
| Vendor safe zone | 0.05 in inside trim |
| Our type margin | **0.42 in** inside trim — a 0.1 in cutting shift never lands near a word |

> Note: last year's card was a **7 × 10 in flat, top-fold** product — a different size
> and a different fold from this template. The layouts are not portable between them;
> these are built for the template you supplied.

### Verified before delivery

`python3 src/verify_print.py` — passes on all six:

- artboard exactly 619.2 × 439.2 pt, 2 pages
- `TrimBox` and `BleedBox` declared
- **zero raster images** — 100% vector, so there is no effective-DPI to worry about
- every font embedded (nothing can substitute on the RIP)
- background colour reaches all four bleed corners

The client's logo is placed as **vector CMYK art lifted straight from their own
Illustrator PDF** — it is never rasterised at any point in the pipeline.

---

## Decisions worth your sign-off

1. **"2026" is printed on every front.** It dates the card nicely, but it also means
   leftover stock can't be used in 2027. Say the word and it comes off — it's one line
   per concept in `src/concepts.py`.
2. **Logo lockup = the version with "Brightmore Home Care of Kentucky, LLC."** That
   matches the 2025 card and the envelope file. The corporate lockup without the
   Brightmore line is also built (`uew-logo-corporate*.pdf`) if you'd rather.
3. **No phone number, URL or address anywhere.** I don't have verified contact details
   and I won't invent them. Back panel is logo-only, same as 2025. Send me the details
   and I'll add them to the back panel.
4. **Fonts are embedded, not outlined.** The GotPrint template says "convert text to
   outline"; embedding achieves the same guarantee (no substitution) and every check
   passes. If their preflight insists on true outlines, that's one pass in
   Acrobat/Illustrator — or tell me and I'll add the step.
5. **FYI, a typo in the 2025 card:** the inside read "may your new year be filled
   success and lasting happiness" — missing "with". Worth knowing in case it went out
   that way. Not carried forward.

---

## Rebuilding / editing

```bash
python3 src/build_logo_assets.py   # logo variants from the client's vector source
python3 src/build_cards.py         # HTML -> Chromium -> press PDFs + proofs
python3 src/verify_print.py        # pre-press checks (exit 1 on failure)
```

| Path | What |
|---|---|
| `src/concepts.py` | **copy and art direction — edit here first** |
| `src/art.py` | vector illustration library (orbits, botanicals, evergreens) |
| `src/layout.py` | sheet geometry + shared CSS; every measurement in one place |
| `src/build_cards.py` | render pipeline |
| `src/verify_print.py` | pre-press assertions |
| `assets/logo/` | client logo, six variants (colour / knockout / mono, ±Brightmore) |
| `assets/fonts/` | self-hosted woff2 (Cormorant Garamond, Playfair, Cinzel, Lora, Montserrat, Great Vibes) |
| `out/print/` | **the files to upload** |
| `out/proof/` | contact sheet, flat sheets, folded front mockups, trim/safe overlays |
| `out/html/` | generated HTML previews (not committed — `build_cards.py` recreates them) |
| `reference/` | the GotPrint template + last year's card |

Proof naming: `--1-outside` / `--2-inside` are the flat press sheets,
`--front-folded` is the front cover at finished size, `--guides-*` overlays the
trim (magenta), safe zone (blue) and score line (grey).

Everything is generated — no binary design files to keep in sync. Change the copy in
`src/concepts.py`, re-run the two build commands, and all six PDFs and every proof
regenerate identically.

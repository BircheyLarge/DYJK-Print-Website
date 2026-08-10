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
| **T1** | `thanksgiving-01-grateful` | Formal. Deep navy ground with a harvest crown in rust, goldenrod, moss and cranberry riding the brand's atom orbits; cream script. Closest sibling to the 2025 card. |
| **T2** | `thanksgiving-02-give-thanks` | Friendly. Warm harvest paper, hand-drawn leaves across the full autumn range framing navy Playfair. Lightest ink coverage of the set. |
| **T3** | `thanksgiving-03-thankful` | Modern editorial, and the most unmistakably autumn: a full burnt-rust field, one engraved word in cream, one amber orbit. Heaviest ink coverage. |

### Christmas

| | Concept | Feel |
|---|---|---|
| **C1** | `christmas-01-peace-joy-light` | Navy night. The star is built from UEW's **own electron orbits** — the ornament is the brand, not stock clip art. Most ownable of the six. |
| **C2** | `christmas-02-merry-and-bright` | Light and contemporary. Geometric treeline in the two navies, coral trunks, peach snow. |
| **C3** | `christmas-03-seasons-greetings` | Classic. Laurel wreath on deep navy, engraved Cinzel caps. The one that looks like a card someone keeps on the mantel. |

Copy is new on every card — nothing reused from 2025. Every inside message now thanks
the recipient **for serving our country** and for **being part of the United Energy
Workers family**, in wording tuned to each card's register rather than pasted in.

> Spelled out as "the United Energy Workers family" rather than "the UEW family" —
> the audience includes patients and family members who may not read the initialism
> at a glance. One find-and-replace if you'd rather have "UEW".

**Autumn palette (Thanksgiving only).** Rust `#A8431E` and pumpkin `#C9622A` are the
brand coral `#F05932` walked darker, so the harvest range reads as UEW rather than as
stock autumn. Full set: rust, pumpkin, amber, goldenrod, moss, cranberry, chestnut,
husk, harvest cream. The Christmas three keep the core brand palette.

**The UEW mark appears twice per card:** at the foot of the front cover (the first
thing the recipient sees) and under the inside message (signing it off). The back
panel is deliberately left clear — a third impression on a 4.25in card reads as
branding noise. Say the word and I'll add it back.

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
- **no rasterised artwork** — everything we draw is vector, so there is no
  effective-DPI to worry about
- every font embedded (nothing can substitute on the RIP)
- background colour reaches all four bleed corners

The client's logo is placed as **vector CMYK art lifted straight from their own
Illustrator PDF** — we never rasterise it.

> **Two things worth knowing about the raster check.**
>
> 1. The supplied logo artwork itself contains **three inline bitmaps per instance** —
>    the highlight dots on the electrons, about 0.05–0.13in across. They are in the
>    client's own file. We place their mark unmodified rather than silently redrawing
>    it, so the verifier allows rasters up to 0.2in and flags anything larger.
> 2. `page.get_images()` does **not** report inline (`BI`/`ID`/`EI`) images, which is
>    exactly what Skia emits when Chromium flattens a gradient. An earlier build of
>    these cards carried a 311x440px **72 dpi bitmap under the whole front cover** — an
>    SVG `radialGradient` — and passed a check written against `get_images()`. The
>    verifier now uses `get_image_info()`, which sees both, and the glow is built from
>    concentric flat fills (`art.radial_rings`). **If you build print PDFs out of
>    Chromium anywhere else, check with `get_image_info()`.**

### Contrast

`python3 src/verify_contrast.py` — all 45 ink/ground pairings clear WCAG AA
(4.5:1 text, 3:1 non-text). This matters more than usual here: the list skews
older, and reduced contrast sensitivity comes with age. On paper a too-light fill
doesn't just look weak, it can drop out of uncoated stock or print as a smudge
that reads like a fault.

The audit caught nine real problems, seven of them in the first cut of the autumn
palette — a husk wheat sprig on harvest cream at **1.46:1** would have been
effectively invisible. Two rules came out of it:

- **Light tones (amber, goldenrod, husk) go on dark grounds; deep tones (rust,
  pumpkin, chestnut, moss, cranberry) go on light grounds.** `wheat_ink` exists
  because wheat needs a light-ground version.
- **`coral_ink` for coral text on cream/ivory.** The brand coral as body or lead
  text is only 3.1:1; `coral_ink` is the same hue walked dark enough to clear AA.
  Bright coral still does all the illustration work and all text on navy.

Watermarks are exempt and listed in the script — they're drawn at 30–40% opacity
on purpose.

---

## Decisions worth your sign-off

1. **"2026" is printed on every front.** It dates the card nicely, but it also means
   leftover stock can't be used in 2027. Say the word and it comes off — it's one line
   per concept in `src/concepts.py`.
2. **Logo lockup = the version with "Brightmore Home Care of Kentucky, LLC."** That
   matches the 2025 card and the envelope file. The corporate lockup without the
   Brightmore line is also built (`uew-logo-corporate*.pdf`) if you'd rather.
3. **No phone number, URL or address anywhere.** I don't have verified contact details
   and I won't invent them. Send them over and the back panel — currently clear — is
   the natural place for them.
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
python3 src/verify_contrast.py     # contrast audit    (exit 1 on failure)
```

| Path | What |
|---|---|
| `src/concepts.py` | **copy and art direction — edit here first** |
| `src/art.py` | vector illustration library (orbits, botanicals, evergreens) |
| `src/layout.py` | sheet geometry + shared CSS; every measurement in one place |
| `src/build_cards.py` | render pipeline |
| `src/verify_print.py` | pre-press assertions |
| `src/verify_contrast.py` | WCAG contrast audit of every ink/ground pairing |
| `assets/logo/` | client logo, six variants (colour / knockout / mono, ±Brightmore) |
| `assets/fonts/` | self-hosted woff2 (Cormorant Garamond, Playfair, Cinzel, Lora, Montserrat, Great Vibes) |
| `out/print/` | **the files to upload** |
| `out/proof/` | contact sheet, flat sheets, folded front mockups, trim/safe overlays |
| `out/html/` | generated HTML previews (not committed — `build_cards.py` recreates them) |
| `reference/` | the GotPrint template + last year's card |

### Reviewing

| Proof | Shows |
|---|---|
| `00-contact-sheet.png` | all six front covers, quick glance |
| `01-thanksgiving-all-panels.png` | **three Thanksgiving cards, every panel** |
| `02-christmas-all-panels.png` | **three Christmas cards, every panel** |
| `<concept>--all-panels.png` | one concept on its own sheet, every panel |
| `<concept>--1-outside` / `--2-inside` | the flat press sheets as imposed |
| `<concept>--front-folded` | front cover at finished size |
| `<concept>--guides-*` | trim (magenta), safe zone (blue), score line (grey) |

The all-panels sheets draw each panel at true trim size (1:1 in points) and in the
order the recipient meets them — front cover, inside spread, back cover — so what
you are judging is the finished 4.25 x 6in card rather than a thumbnail.

Everything is generated — no binary design files to keep in sync. Change the copy in
`src/concepts.py`, re-run the two build commands, and all six PDFs and every proof
regenerate identically.

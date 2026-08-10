"""Sheet geometry + shared CSS for the UEW 2026 greeting cards.

Every number here is measured off the client's GotPrint template
(`reference/gotprint-template-6x8.5-v.pdf`), not guessed:

    artboard / bleed   8.600 x 6.100 in   (619.2 x 439.2 pt)
    trim               0.050 in inset -> 8.500 x 6.000 in
    vendor safe zone   0.050 in inside trim (0.100 in from the bleed edge)
    score (fold)       x = 4.300 in, vertical
    panels             two of 4.250 x 6.000 in trimmed
    folded card        4.250 w x 6.000 h in, portrait, fold on the left

Imposition, page 1 is the OUTSIDE face and page 2 the INSIDE face:

    page 1   [ back cover ][ FRONT COVER ]
    page 2   [ inside left ][ inside right ]

Fold the left half of the outside behind the right half; the crease lands on the
left edge of the finished card and the inside opens as a natural left-right
spread. Confirmed against the folded mockup in out/proof/.

We hold text 0.42 in inside the trim rather than riding the vendor's 0.05 in
minimum — that is a visual margin, not a safety margin, and it means a 0.1 in
cutting shift never lands near a word.
"""

from __future__ import annotations

# ---- sheet geometry (inches) ---------------------------------------------- #
SHEET_W = 8.6
SHEET_H = 6.1
BLEED = 0.05
FOLD_X = 4.30
TRIM_W = 8.5
TRIM_H = 6.0
PANEL_TRIM_W = 4.25
VENDOR_SAFE = 0.05  # inside trim, per the template's blue box

# ---- design margins ------------------------------------------------------- #
MARGIN = 0.42  # from trim, our own (much more generous than VENDOR_SAFE)
PAD_OUT = BLEED + MARGIN  # 0.47in — outer edges carry the bleed too
PAD_FOLD = MARGIN  # 0.42in — measured from the score line
PAD_V = BLEED + MARGIN

# ---- front-cover logo ----------------------------------------------------- #
# Centre of the right (front) panel's trim, and the strip reserved for the mark.
FRONT_LOGO_CX = FOLD_X + PANEL_TRIM_W / 2  # 6.425in
FRONT_LOGO_CY = 5.26
FRONT_LOGO_W = 1.45
FRONT_LOGO_SLOT = 0.84  # padding-bottom on the front panel's content column

# ---- palette -------------------------------------------------------------- #
PALETTE = {
    "navy": "#123C64",
    "navy_deep": "#0B2942",
    "navy_soft": "#1B4C79",
    "coral": "#F05932",
    "peach": "#F8A383",
    "cream": "#FBF4E7",
    "ivory": "#FFFCF6",
    "gold": "#D9A566",
    "wheat": "#E8C48A",
    "ink": "#12283D",
    # --- autumn extension, Thanksgiving set only ---------------------------- #
    # Anchored on the brand coral (#F05932): rust and pumpkin are that hue walked
    # darker, so the harvest range still reads as UEW rather than as stock autumn.
    # Contrast against the rust ground: harvest 5.5:1, husk 3.9:1 (decorative).
    "rust": "#A8431E",
    "rust_deep": "#8E3616",
    "pumpkin": "#C9622A",
    "amber": "#DE9A3E",
    "goldenrod": "#B8842B",
    "moss": "#878B57",
    "olive": "#6B7148",
    "cranberry": "#8E2F3C",
    "chestnut": "#8A4E2B",
    "harvest": "#F7EDDC",
    "husk": "#E0C395",
    # Light tones (amber/goldenrod/husk) are for dark grounds; deep tones
    # (rust/pumpkin/chestnut/moss/cranberry) for light. wheat_ink is the wheat
    # colour for light grounds — husk on harvest cream is 1.46:1 and vanishes.
    "wheat_ink": "#9C7328",
    # Brand coral as *text* on cream/ivory is only 3.1:1. This is that same hue
    # walked dark enough to clear AA (4.67:1 on cream, 4.98:1 on ivory). The
    # recipients are largely older adults, where contrast sensitivity is reduced,
    # so this is legibility rather than box-ticking. Bright coral still does all
    # the illustration work and all text on navy.
    "coral_ink": "#C93A1B",
}

BASE_CSS = f"""
@page {{ size: {SHEET_W}in {SHEET_H}in; margin: 0; }}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}

html, body {{
  width: {SHEET_W}in;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  text-rendering: geometricPrecision;
}}

.sheet {{
  position: relative;
  width: {SHEET_W}in;
  height: {SHEET_H}in;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
}}
.sheet:last-of-type {{ page-break-after: auto; break-after: auto; }}

/* Each panel runs to the sheet edge so flood colours bleed off the trim. */
.panel {{
  position: absolute;
  top: 0;
  width: {FOLD_X}in;
  height: {SHEET_H}in;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}}
.panel--left  {{ left: 0;          padding: {PAD_V}in {PAD_FOLD}in {PAD_V}in {PAD_OUT}in; }}
.panel--right {{ left: {FOLD_X}in; padding: {PAD_V}in {PAD_OUT}in {PAD_V}in {PAD_FOLD}in; }}

/* Full-bleed artwork layer, ignores the padding. */
.bg {{ position: absolute; inset: 0; z-index: 0; }}
.bg svg {{ width: 100%; height: 100%; display: block; }}
.content {{ position: relative; z-index: 1; flex: 1; display: flex;
            flex-direction: column; width: 100%; }}

.center   {{ justify-content: center;      align-items: center; text-align: center; }}
.between  {{ justify-content: space-between; align-items: center; text-align: center; }}
.bottom   {{ justify-content: flex-end;    align-items: center; text-align: center; }}

/* ---- type scale (points; the card is a print object) -------------------- */
.eyebrow {{
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  font-size: 7.5pt;
  letter-spacing: 0.30em;
  text-transform: uppercase;
  line-height: 1.4;
  text-indent: 0.30em; /* optical: cancel the trailing letterspace when centred */
}}
.script     {{ font-family: 'Great Vibes', cursive; font-weight: 400; line-height: 1.06; }}
.display    {{ font-family: 'Playfair Display', serif; line-height: 1.1;
               letter-spacing: -0.005em; }}
.display-sc {{ font-family: 'Cinzel', serif; line-height: 1.2; letter-spacing: 0.06em; }}
.serif      {{ font-family: 'Cormorant Garamond', serif; line-height: 1.35; }}
.body       {{ font-family: 'Lora', serif; font-size: 10pt; line-height: 1.72; }}
.sans       {{ font-family: 'Montserrat', sans-serif; }}

.rule {{ width: 0.62in; height: 0.75pt; border: 0; }}

.year {{
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
  font-size: 7pt;
  letter-spacing: 0.34em;
  text-indent: 0.34em;
}}

/* Flex spacers — used to bias a centred stack up or down without magic margins. */
.grow     {{ flex: 1 1 auto; }}
.grow--2  {{ flex: 2 1 auto; }}
.grow--3  {{ flex: 3 1 auto; }}
.t3-gap   {{ height: 0.30in; }}

/* Inside-right message block. */
.msg-area {{
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; align-items: center; text-align: center;
}}
.lead {{ font-size: 15.5pt; font-style: italic; margin-bottom: 0.13in;
         max-width: 2.95in; }}
.copy {{ max-width: 2.85in; }}
.msg-rule {{ margin: 0.20in 0 0.13in; width: 0.5in; }}
.sign {{ font-size: 6.8pt; letter-spacing: 0.26em; text-indent: 0.26em; }}

/* The logo is placed as vector PDF in post-processing; this reserves its box
   so nothing else can drift into the space. */
.logo-slot {{ width: 100%; flex: 0 0 auto; }}

/* Front covers carry the mark at the foot of the panel. Reserving the strip with
   padding (rather than a flex child) lets each concept's existing composition
   simply shift up into the shorter box instead of being re-tuned one by one. */
.has-front-logo .content {{ padding-bottom: {FRONT_LOGO_SLOT}in; }}

/* Preview-only raster stand-in for the stamped vector logo. Positioned in sheet
   coordinates so the preview and the print stamp use the identical numbers. */
.stamp {{ position: absolute; z-index: 5; }}
.stamp img {{ width: 100%; height: 100%; display: block; }}

/* ---- proof-only overlay ------------------------------------------------- */
.guides {{ position: absolute; inset: 0; z-index: 99; display: none; }}
body.show-guides .guides {{ display: block; }}
.guides .trim {{
  position: absolute; left: {BLEED}in; top: {BLEED}in;
  width: {TRIM_W}in; height: {TRIM_H}in;
  outline: 0.5pt dashed #E6007E;
}}
.guides .safe {{
  position: absolute; top: {BLEED + VENDOR_SAFE}in;
  height: {TRIM_H - 2 * VENDOR_SAFE}in;
  outline: 0.5pt dashed #009FE4;
}}
.guides .safe--l {{ left: {BLEED + VENDOR_SAFE}in;
                    width: {PANEL_TRIM_W - 2 * VENDOR_SAFE}in; }}
.guides .safe--r {{ left: {FOLD_X + VENDOR_SAFE}in;
                    width: {PANEL_TRIM_W - 2 * VENDOR_SAFE}in; }}
.guides .score {{
  position: absolute; left: {FOLD_X}in; top: 0;
  width: 0; height: {SHEET_H}in; border-left: 0.5pt dashed #7A7A7A;
}}
"""

GUIDES_HTML = (
    '<div class="guides"><div class="trim"></div><div class="safe safe--l"></div>'
    '<div class="safe safe--r"></div><div class="score"></div></div>'
)


def page_html(title: str, css: str, sheets: str, *, guides: bool = False) -> str:
    body_class = "show-guides" if guides else ""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<link rel="stylesheet" href="fonts.css">
<style>{BASE_CSS}
{css}</style>
</head>
<body class="{body_class}">
{sheets}
</body>
</html>
"""


def sheet_html(left: str, right: str, *, guides: bool = False, extra: str = "") -> str:
    """`extra` is overlay markup in sheet coordinates (logo stamps in preview mode)."""
    return (
        '<div class="sheet">'
        f"{left}{right}{extra}"
        f"{GUIDES_HTML if guides else ''}"
        "</div>"
    )


def panel(side: str, *, bg: str = "", body: str = "", cls: str = "",
          align: str = "center") -> str:
    """side is 'left' or 'right'; bg is full-bleed SVG markup."""
    bg_layer = f'<div class="bg">{bg}</div>' if bg else ""
    return (
        f'<section class="panel panel--{side} {cls}">'
        f"{bg_layer}"
        f'<div class="content {align}">{body}</div>'
        "</section>"
    )


def stamp_html(cx: float, cy: float, w: float, h: float, src: str) -> str:
    """Preview-only logo image, positioned in sheet inches (same numbers as print)."""
    return (
        f'<div class="stamp" style="left:{cx - w / 2:.4f}in;top:{cy - h / 2:.4f}in;'
        f'width:{w:.4f}in;height:{h:.4f}in"><img src="{src}" alt=""></div>'
    )

"""The six 2026 card concepts: three Thanksgiving, three Christmas.

Each concept is deliberately a different *register* rather than a recolour of the
same idea, so the client is choosing between real alternatives:

  Thanksgiving  01  formal, navy + gold, script      — closest in feel to 2025
                02  light, illustrated, friendly
                03  modern editorial, big quiet type
  Christmas     01  navy night, brand atom-as-star   — the most ownable
                02  light, geometric evergreens
                03  classic navy wreath, engraved caps

Copy is new throughout. It leans on what this client actually is — in-home care
for the people who worked the country's energy program — so the gratitude is
specific rather than generic card sentiment.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import art
from layout import PALETTE as P


@dataclass(frozen=True)
class LogoBox:
    """Vector-logo placement in sheet inches (origin = top-left of the sheet)."""

    page: int  # 1 = outside, 2 = inside
    variant: str  # asset stem, e.g. "uew-logo-brightmore-ko"
    cx: float
    cy: float
    w: float


@dataclass(frozen=True)
class Concept:
    key: str
    season: str
    title: str
    pitch: str
    css: str
    front_bg: str
    front_body: str
    back_bg: str
    back_body: str
    inside_l_bg: str
    inside_l_body: str
    inside_r_bg: str
    inside_r_body: str
    logos: list[LogoBox] = field(default_factory=list)


# Panel art canvas: 430 x 610 units == 4.30in x 6.10in, so 1 unit = 0.01in.
VB_W, VB_H = 430, 610
# Trim-aware optical centres (the outer 5 units of each panel are bleed).
CX_L, CX_R, CY = 217.5, 212.5, 305


def flood(colour: str, body: str = "") -> str:
    return art.svg(
        f'<rect x="0" y="0" width="{VB_W}" height="{VB_H}" fill="{colour}"/>{body}',
        w=VB_W,
        h=VB_H,
        extra='preserveAspectRatio="none"',
    )


def glow(colour: str, halo: str, cx: float, cy: float, r: float, body: str = "") -> str:
    """Flood + a soft radial lift behind the focal point (SVG gradient = stays vector)."""
    return art.svg(
        f'<defs><radialGradient id="g" cx="{cx / VB_W:.4f}" cy="{cy / VB_H:.4f}" '
        f'r="{r / VB_W:.4f}">'
        f'<stop offset="0" stop-color="{halo}"/>'
        f'<stop offset="1" stop-color="{colour}"/></radialGradient></defs>'
        f'<rect x="0" y="0" width="{VB_W}" height="{VB_H}" fill="url(#g)"/>{body}',
        w=VB_W,
        h=VB_H,
        extra='preserveAspectRatio="none"',
    )


def msg(lead: str, body: str, sign: str, *, lead_cls: str = "serif") -> str:
    """Inside-right message block, with room reserved below for the logo."""
    return (
        '<div class="msg-area">'
        f'<p class="{lead_cls} lead">{lead}</p>'
        f'<p class="body copy">{body}</p>'
        f'<hr class="rule msg-rule">'
        f'<p class="eyebrow sign">{sign}</p>'
        "</div>"
        '<div class="logo-slot" style="height:0.92in"></div>'
    )


# --------------------------------------------------------------------------- #
# shared fragments
# --------------------------------------------------------------------------- #


def back_panel(colour: str, *, mark: str = "") -> str:
    """Back cover: flood colour, a whisper of ornament, logo stamped at centre."""
    return flood(colour, mark)


def corner_orbit(colour: str, opacity: float = 0.5) -> str:
    """Faint ornament for the otherwise-blank inside-left write-in panel.

    Anchored to the panel's *outer* (left) edge, never the fold: an ornament that
    runs into the score line reads as a printing error, and the fold is also where
    the eye enters the spread.
    """
    return art.orbits(
        44, VB_H - 30, 118, 52, angles=(18, -42), stroke=colour,
        width=1.1, opacity=opacity,
    )


# --------------------------------------------------------------------------- #
# THANKSGIVING 01 — "Grateful"
# --------------------------------------------------------------------------- #

# A harvest crown, not a harvest pile: one gold orbit, two wheat sprigs sweeping
# up either side, and three leaves big enough to actually read as leaves at 4.25in.
T1_ART = (
    art.orbits(CX_R, 208, 146, 63, angles=(0, 62, 124), stroke=P["gold"], width=1.25,
               opacity=0.62)
    + art.wheat(CX_R - 116, 296, angle=-38, scale=1.16, stroke=P["wheat"], grains=7)
    + art.wheat(CX_R + 116, 296, angle=38, scale=1.16, stroke=P["wheat"], grains=7)
    + art.maple_leaf(CX_R - 96, 176, angle=-28, scale=1.14, fill=P["coral"])
    + art.maple_leaf(CX_R + 96, 176, angle=28, scale=1.14, fill=P["gold"])
    + art.oak_leaf(CX_R, 116, angle=0, scale=1.22, fill=P["peach"], vein=P["navy_deep"])
    + art.oak_leaf(CX_R - 60, 268, angle=-40, scale=0.88, fill=P["gold"])
    + art.oak_leaf(CX_R + 60, 268, angle=40, scale=0.88, fill=P["coral"])
    + art.berry_cluster(CX_R - 8, 262, scale=0.94, fill=P["coral"])
)

T1 = Concept(
    key="thanksgiving-01-grateful",
    season="thanksgiving",
    title="Grateful — navy & harvest gold",
    pitch=(
        "The most formal of the three and the closest sibling to the 2025 card: deep "
        "navy, gold script, a harvest crown riding the brand's atom orbits. Reads as "
        "a corporate holiday card without feeling cold."
    ),
    css=f"""
    .t1-front .eyebrow {{ color: {P['peach']}; }}
    .t1-front .script  {{ color: {P['cream']}; font-size: 62pt; margin-top: 0.06in; }}
    .t1-front .year    {{ color: {P['gold']}; }}
    .t1-front .rule    {{ background: {P['gold']}; opacity: 0.8; margin: 0.14in 0; }}
    .t1-in .lead   {{ color: {P['coral']}; }}
    .t1-in .copy   {{ color: {P['ink']}; }}
    .t1-in .sign   {{ color: {P['navy']}; }}
    .t1-in .msg-rule {{ background: {P['peach']}; }}
    """,
    front_bg=glow(P["navy_deep"], P["navy"], CX_R, 200, 300, T1_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="eyebrow">Happy Thanksgiving</p>'
        '<p class="script">Grateful</p>'
        '<hr class="rule">'
        '<p class="year">2026</p>'
    ),
    back_bg=back_panel(P["navy_deep"], mark=art.orbits(CX_L, 96, 74, 32,
                       angles=(0, 60, 120), stroke=P["navy_soft"], width=1.2)),
    back_body="",
    inside_l_bg=flood(P["cream"], corner_orbit(P["peach"], 0.42)),
    inside_l_body="",
    inside_r_bg=flood(P["cream"],
                      art.wheat(VB_W - 58, VB_H - 42, angle=14, scale=0.62,
                                stroke=P["wheat"])),
    inside_r_body=msg(
        "For every door that opened to us this year&thinsp;&mdash;",
        "thank you. It is a privilege to care for the men and women who powered this "
        "country, and for the families who stand beside them. May your Thanksgiving be "
        "warm, unhurried, and full of the people you love.",
        "With gratitude from all of us",
    ),
    logos=[
        LogoBox(1, "uew-logo-brightmore-ko", 2.175, 3.05, 1.95),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


# --------------------------------------------------------------------------- #
# THANKSGIVING 02 — "Give Thanks"
# --------------------------------------------------------------------------- #

# Framed composition: leaves live in a top band and a bottom band only, so the
# centred title block sits in clean paper and nothing collides with the type.
T2_ART = (
    # top band, y < 150
    art.maple_leaf(58, 62, angle=-28, scale=1.02, fill=P["coral"])
    + art.oak_leaf(128, 104, angle=24, scale=0.86, fill=P["gold"])
    + art.leaf_simple(196, 48, angle=-46, scale=0.92, fill=P["peach"])
    + art.maple_leaf(300, 88, angle=34, scale=0.82, fill=P["wheat"])
    + art.oak_leaf(382, 52, angle=-16, scale=0.90, fill=P["peach"])
    + art.berry_cluster(238, 112, scale=0.92, fill=P["coral"])
    # bottom band, y > 455
    + art.wheat(66, VB_H - 34, angle=-18, scale=0.94, stroke=P["wheat"], grains=6)
    + art.oak_leaf(146, VB_H - 74, angle=18, scale=0.94, fill=P["gold"])
    + art.maple_leaf(222, VB_H - 34, angle=-24, scale=0.90, fill=P["coral"])
    + art.leaf_simple(300, VB_H - 84, angle=42, scale=1.0, fill=P["peach"])
    + art.maple_leaf(378, VB_H - 44, angle=16, scale=0.86, fill=P["wheat"])
    + art.berry_cluster(104, VB_H - 96, scale=0.86, fill=P["coral"])
)

T2 = Concept(
    key="thanksgiving-02-give-thanks",
    season="thanksgiving",
    title="Give Thanks — ivory & falling leaves",
    pitch=(
        "The friendliest of the three. Light ivory stock feel, hand-drawn leaves "
        "scattered top and bottom, navy Playfair. Prints beautifully on uncoated "
        "and photographs well for social."
    ),
    css=f"""
    .t2-front .eyebrow {{ color: {P['coral']}; }}
    .t2-front .display {{ color: {P['navy']}; font-size: 40pt; font-weight: 500;
                          margin: 0.10in 0; }}
    .t2-front .display em {{ font-style: italic; }}
    .t2-front .year    {{ color: {P['navy']}; opacity: 0.7; }}
    .t2-front .rule    {{ background: {P['coral']}; margin: 0.12in 0; }}
    .t2-in .lead   {{ color: {P['coral']}; }}
    .t2-in .copy   {{ color: {P['ink']}; }}
    .t2-in .sign   {{ color: {P['navy']}; }}
    .t2-in .msg-rule {{ background: {P['gold']}; }}
    """,
    front_bg=flood(P["ivory"], T2_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="eyebrow">Wishing you a warm</p>'
        '<p class="display"><em>Give</em> Thanks</p>'
        '<hr class="rule">'
        '<p class="year">Thanksgiving 2026</p>'
        '<div class="grow"></div>'
    ),
    back_bg=back_panel(P["cream"], mark=art.leaf_simple(CX_L, 96, scale=0.8,
                       fill=P["peach"], opacity=0.55)),
    back_body="",
    inside_l_bg=flood(P["ivory"], corner_orbit(P["gold"], 0.30)),
    inside_l_body="",
    inside_r_bg=flood(P["ivory"],
                      art.maple_leaf(VB_W - 54, 62, angle=22, scale=0.52,
                                     fill=P["peach"], opacity=0.85)
                      + art.oak_leaf(46, VB_H - 56, angle=-20, scale=0.50,
                                     fill=P["wheat"], opacity=0.85)),
    inside_r_body=msg(
        "Gratitude looks a lot like you.",
        "Thank you for welcoming our caregivers into your home, for your patience, and "
        "for the trust you place in us every week. We hope your Thanksgiving is full of "
        "good food, familiar faces, and time that feels like rest.",
        "Happy Thanksgiving from all of us",
    ),
    logos=[
        LogoBox(1, "uew-logo-brightmore", 2.175, 3.05, 1.95),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


# --------------------------------------------------------------------------- #
# THANKSGIVING 03 — "Thankful"
# --------------------------------------------------------------------------- #

# One ring, one node, one sprig. The restraint is the concept — a second ellipse
# turned the mark into a lens shape and fought the word for attention.
T3_ART = (
    art.orbits(CX_R, 252, 158, 158, angles=(0,), stroke=P["coral"], width=1.15,
               opacity=0.62)
    + art.nodes(CX_R, 252, 158, count=1, phase=-118, radius=4.6, fill=P["coral"])
    # Sprig clears the ring rather than piercing it — a botanical crossing a
    # geometric rule looks accidental at this size.
    + art.wheat(CX_R, 524, angle=0, scale=0.98, stroke=P["wheat"], grains=6)
    + art.leaf_simple(CX_R - 38, 512, angle=-62, scale=0.74, fill=P["peach"])
    + art.leaf_simple(CX_R + 38, 512, angle=62, scale=0.74, fill=P["peach"])
)

T3 = Concept(
    key="thanksgiving-03-thankful",
    season="thanksgiving",
    title="Thankful — editorial cream & coral",
    pitch=(
        "The modern one. A single engraved word, one coral orbit, a wheat sprig, and "
        "a lot of quiet. Feels current rather than seasonal-generic, and the restraint "
        "makes the inside message do the emotional work."
    ),
    css=f"""
    .t3-front .display-sc {{ color: {P['navy']}; font-size: 30pt; font-weight: 500;
                             letter-spacing: 0.20em; text-indent: 0.20em; }}
    .t3-front .eyebrow    {{ color: {P['coral']}; }}
    .t3-front .year       {{ color: {P['navy']}; opacity: 0.65; }}
    .t3-in .lead   {{ color: {P['coral']}; }}
    .t3-in .copy   {{ color: {P['ink']}; }}
    .t3-in .sign   {{ color: {P['navy']}; }}
    .t3-in .msg-rule {{ background: {P['coral']}; }}
    """,
    front_bg=flood(P["cream"], T3_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="eyebrow">Twenty twenty-six</p>'
        '<div class="t3-gap"></div>'
        '<p class="display-sc">THANKFUL</p>'
        '<div class="grow"></div>'
        '<p class="year">Happy Thanksgiving</p>'
    ),
    back_bg=back_panel(P["navy_deep"]),
    back_body="",
    inside_l_bg=flood(P["ivory"], corner_orbit(P["coral"], 0.28)),
    inside_l_body="",
    inside_r_bg=flood(P["ivory"],
                      art.orbits(VB_W - 30, 54, 96, 40, angles=(-22,),
                                 stroke=P["coral"], width=1.0, opacity=0.45)),
    inside_r_body=msg(
        "Some things are worth saying plainly.",
        "Thank you &mdash; for your service, for your trust, and for the privilege of "
        "caring for you and your family this year. We are grateful to be part of it, "
        "and we hope your Thanksgiving is a good one.",
        "Thanksgiving 2026",
    ),
    logos=[
        LogoBox(1, "uew-logo-brightmore-ko", 2.175, 3.05, 1.95),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


# --------------------------------------------------------------------------- #
# CHRISTMAS 01 — "Peace, Joy & Light"
# --------------------------------------------------------------------------- #

C1_ART = (
    art.orbits(CX_R, 208, 150, 64, angles=(0, 60, 120), stroke=P["peach"], width=1.4,
               opacity=0.85)
    + art.starburst(CX_R, 208, 104, fill=P["cream"], waist=0.085)
    + art.starburst(CX_R, 208, 58, fill=P["gold"], waist=0.11)
    + art.nodes(CX_R, 208, 150, count=3, phase=-90, radius=4.6, fill=P["coral"])
    + art.sparkle(CX_R - 168, 118, 15, fill=P["gold"], opacity=0.9)
    + art.sparkle(CX_R + 172, 96, 11, fill=P["peach"], opacity=0.85)
    + art.sparkle(CX_R + 154, 340, 9, fill=P["gold"], opacity=0.7)
    + art.sparkle(CX_R - 162, 352, 7, fill=P["peach"], opacity=0.6)
    # Snow stays out of the script's box (y > 430) — a dot inside the bowl of a
    # letter reads as a printing speck, not as weather.
    + art.snow([(42, 292, 1.5), (398, 258, 1.6), (48, 392, 1.4), (394, 380, 1.5),
                (28, 176, 1.3), (410, 150, 1.4)], fill=P["cream"], opacity=0.5)
)

C1 = Concept(
    key="christmas-01-peace-joy-light",
    season="christmas",
    title="Peace, Joy & Light — navy night, atom star",
    pitch=(
        "The most ownable of the six: the star is built from UEW's own electron "
        "orbits, so the ornament *is* the brand instead of stock holiday clip art. "
        "Deep navy night, gold and cream, big script. Strongest carry-over from the "
        "2025 card's navy-and-lights mood."
    ),
    css=f"""
    .c1-front .eyebrow {{ color: {P['peach']}; }}
    .c1-front .script  {{ color: {P['cream']}; font-size: 46pt; }}
    .c1-front .year    {{ color: {P['gold']}; }}
    .c1-front .rule    {{ background: {P['gold']}; opacity: 0.85; margin: 0.15in 0; }}
    .c1-in .lead   {{ color: {P['coral']}; }}
    .c1-in .copy   {{ color: {P['ink']}; }}
    .c1-in .sign   {{ color: {P['navy']}; }}
    .c1-in .msg-rule {{ background: {P['gold']}; }}
    """,
    front_bg=glow(P["navy_deep"], P["navy"], CX_R, 208, 330, C1_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="eyebrow">Wishing you</p>'
        '<p class="script">Peace, Joy<br>&amp; Light</p>'
        '<hr class="rule">'
        '<p class="year">2026</p>'
    ),
    back_bg=back_panel(P["navy_deep"], mark=art.starburst(CX_L, 92, 26,
                       fill=P["navy_soft"], waist=0.1)),
    back_body="",
    inside_l_bg=flood(P["cream"], corner_orbit(P["peach"], 0.40)),
    inside_l_body="",
    inside_r_bg=flood(P["cream"],
                      art.sparkle(VB_W - 52, 60, 13, fill=P["gold"], opacity=0.55)
                      + art.sparkle(44, VB_H - 64, 9, fill=P["peach"], opacity=0.5)),
    inside_r_body=msg(
        "May your home be full of light this Christmas&thinsp;&mdash;",
        "and your new year full of health, comfort, and the people who make it feel "
        "like home. Thank you for letting us be part of your family&rsquo;s year. It is our "
        "privilege to care for you.",
        "Merry Christmas from all of us",
    ),
    logos=[
        LogoBox(1, "uew-logo-brightmore-ko", 2.175, 3.05, 1.95),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


# --------------------------------------------------------------------------- #
# CHRISTMAS 02 — "Merry & Bright"
# --------------------------------------------------------------------------- #

# Ground band is painted FIRST so the trees stand on it; painting it last clipped
# the trunks and left coral stubs floating above the snow line.
GROUND_Y = 534
C2_ART = (
    f'<rect x="0" y="{GROUND_Y}" width="{VB_W}" height="{VB_H - GROUND_Y}" '
    f'fill="{P["cream"]}"/>'
    + art.geo_tree(66, GROUND_Y + 4, h=150, w=76, tiers=4, fill=P["navy"],
                   trunk=P["coral"])
    + art.geo_tree(146, GROUND_Y + 4, h=104, w=56, tiers=4, fill=P["navy_soft"],
                   trunk=P["coral"])
    + art.geo_tree(CX_R, GROUND_Y + 4, h=200, w=100, tiers=5, fill=P["navy_deep"],
                   trunk=P["coral"])
    + art.geo_tree(288, GROUND_Y + 4, h=118, w=62, tiers=4, fill=P["navy_soft"],
                   trunk=P["coral"])
    + art.geo_tree(370, GROUND_Y + 4, h=142, w=72, tiers=4, fill=P["navy"],
                   trunk=P["coral"])
    + art.snow([(52, 196, 2.4), (128, 244, 1.8), (196, 172, 2.0), (272, 228, 2.3),
                (344, 184, 1.9), (392, 252, 2.2), (88, 308, 2.0), (232, 322, 1.7),
                (352, 344, 2.1), (150, 376, 1.6), (300, 406, 1.9), (60, 432, 1.8),
                (398, 424, 1.7), (208, 452, 1.5)],
               fill=P["peach"], opacity=0.7)
    + art.sparkle(CX_R, 300, 16, fill=P["gold"], opacity=0.9)
)

C2 = Concept(
    key="christmas-02-merry-and-bright",
    season="christmas",
    title="Merry & Bright — ivory & geometric evergreens",
    pitch=(
        "Light, contemporary, and the most family-friendly. A treeline in the two "
        "navies with coral trunks, snow in peach. Cheapest to print well (flat "
        "colour, no heavy ink coverage) and the easiest to read at arm's length."
    ),
    css=f"""
    .c2-front .eyebrow {{ color: {P['coral']}; }}
    .c2-front .display {{ color: {P['navy']}; font-size: 34pt; font-weight: 500; }}
    .c2-front .display em {{ font-style: italic; }}
    .c2-front .year    {{ color: {P['navy']}; opacity: 0.68; }}
    .c2-front .rule    {{ background: {P['coral']}; margin: 0.12in 0; }}
    .c2-in .lead   {{ color: {P['coral']}; }}
    .c2-in .copy   {{ color: {P['ink']}; }}
    .c2-in .sign   {{ color: {P['navy']}; }}
    .c2-in .msg-rule {{ background: {P['peach']}; }}
    """,
    front_bg=flood(P["ivory"], C2_ART),
    front_body=(
        '<p class="eyebrow">Wishing you a season</p>'
        '<p class="display"><em>Merry</em> &amp; Bright</p>'
        '<hr class="rule">'
        '<p class="year">Christmas 2026</p>'
        '<div class="grow grow--3"></div>'
    ),
    back_bg=back_panel(P["cream"], mark=art.geo_tree(CX_L, 118, h=64, w=34, tiers=3,
                       fill=P["peach"], trunk=P["peach"], opacity=0.75)),
    back_body="",
    inside_l_bg=flood(P["ivory"], corner_orbit(P["peach"], 0.34)),
    inside_l_body="",
    inside_r_bg=flood(P["ivory"],
                      art.snow([(VB_W - 44, 58, 2.2), (VB_W - 74, 92, 1.6),
                                (40, VB_H - 70, 2.0), (72, VB_H - 44, 1.5)],
                               fill=P["peach"], opacity=0.8)),
    inside_r_body=msg(
        "Warmest wishes for a bright and peaceful season.",
        "Thank you for the trust you placed in us this year. May your Christmas be "
        "merry, your home be warm, and your new year bring good health and the good "
        "company of everyone you love.",
        "Christmas 2026",
    ),
    logos=[
        LogoBox(1, "uew-logo-brightmore", 2.175, 3.05, 1.95),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


# --------------------------------------------------------------------------- #
# CHRISTMAS 03 — "Season's Greetings"
# --------------------------------------------------------------------------- #

C3_ART = (
    art.laurel_wreath(CX_R, 228, 122, leaves=40, fill=P["peach"], berry=P["coral"],
                      leaf_scale=0.74, berries=6)
    + art.starburst(CX_R, 228, 54, fill=P["gold"], waist=0.1, opacity=0.95)
    + art.sparkle(CX_R - 156, 400, 9, fill=P["gold"], opacity=0.6)
    + art.sparkle(CX_R + 158, 392, 7, fill=P["peach"], opacity=0.55)
)

C3 = Concept(
    key="christmas-03-seasons-greetings",
    season="christmas",
    title="Season's Greetings — navy wreath, engraved caps",
    pitch=(
        "The classic. A fine line wreath on deep navy with engraved Cinzel caps — "
        "the safest choice if the list skews traditional or older, and the one that "
        "looks most like a card someone keeps on the mantel."
    ),
    css=f"""
    .c3-front .display-sc {{ color: {P['cream']}; font-size: 17pt; font-weight: 500;
                             letter-spacing: 0.22em; text-indent: 0.22em;
                             line-height: 1.55; }}
    .c3-front .eyebrow    {{ color: {P['peach']}; }}
    .c3-front .year       {{ color: {P['gold']}; }}
    .c3-front .rule       {{ background: {P['gold']}; opacity: 0.8; margin: 0.13in 0; }}
    .c3-in .lead   {{ color: {P['coral']}; }}
    .c3-in .copy   {{ color: {P['ink']}; }}
    .c3-in .sign   {{ color: {P['navy']}; }}
    .c3-in .msg-rule {{ background: {P['gold']}; }}
    """,
    front_bg=glow(P["navy_deep"], P["navy"], CX_R, 224, 300, C3_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="display-sc">SEASON&rsquo;S<br>GREETINGS</p>'
        '<hr class="rule">'
        '<p class="year">2026</p>'
    ),
    back_bg=back_panel(P["navy_deep"], mark=art.pine_sprig(CX_L, 118, scale=0.7,
                       stroke=P["navy_soft"], length=58)),
    back_body="",
    inside_l_bg=flood(P["cream"], corner_orbit(P["peach"], 0.38)),
    inside_l_body="",
    inside_r_bg=flood(P["cream"],
                      art.pine_sprig(VB_W - 46, 96, angle=18, scale=0.58,
                                     stroke=P["peach"])
                      + art.berry_cluster(46, VB_H - 62, scale=0.72, fill=P["coral"])),
    inside_r_body=msg(
        "From our family to yours&thinsp;&mdash;",
        "thank you for a year of trust, patience, and open doors. May your Christmas "
        "be peaceful, your table full, and your new year kind to you and everyone "
        "you love.",
        "Season&rsquo;s Greetings &middot; 2026",
    ),
    logos=[
        LogoBox(1, "uew-logo-brightmore-ko", 2.175, 3.05, 1.95),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


CONCEPTS: list[Concept] = [T1, T2, T3, C1, C2, C3]

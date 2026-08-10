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
import layout
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


def front_logo(variant: str) -> "LogoBox":
    """The mark at the foot of the front cover, from shared layout constants."""
    return LogoBox(1, variant, layout.FRONT_LOGO_CX, layout.FRONT_LOGO_CY,
                   layout.FRONT_LOGO_W)


def flood(colour: str, body: str = "") -> str:
    return art.svg(
        f'<rect x="0" y="0" width="{VB_W}" height="{VB_H}" fill="{colour}"/>{body}',
        w=VB_W,
        h=VB_H,
        extra='preserveAspectRatio="none"',
    )


def glow(colour: str, halo: str, cx: float, cy: float, r: float, body: str = "") -> str:
    """Flood + a soft radial lift behind the focal point.

    Built from concentric flat fills rather than an SVG gradient — see
    `art.radial_rings`; a gradient here gets flattened to a 72 dpi bitmap under
    the entire front cover.
    """
    return art.svg(
        f'<rect x="0" y="0" width="{VB_W}" height="{VB_H}" fill="{colour}"/>'
        + art.radial_rings(cx, cy, r, halo, colour)
        + body,
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
    """Back cover: flood colour plus a centred colophon.

    These were previously a single small ornament drifting near the top of an
    otherwise empty panel at 40-50% opacity. Seen at full size that reads as
    something forgotten, not as restraint. The mark is now centred, sized to
    about 1.6in, and coloured to clear the 3:1 non-text floor so it prints as a
    deliberate colophon. It is not a third logo — the logo is already on the
    front cover and again under the inside message.
    """
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
    art.orbits(CX_R, 208, 146, 63, angles=(0, 62, 124), stroke=P["goldenrod"],
               width=1.25, opacity=0.75)
    + art.wheat(CX_R - 116, 296, angle=-38, scale=1.16, stroke=P["husk"], grains=7)
    + art.wheat(CX_R + 116, 296, angle=38, scale=1.16, stroke=P["husk"], grains=7)
    + art.maple_leaf(CX_R - 96, 176, angle=-28, scale=1.14, fill=P["pumpkin"])
    + art.maple_leaf(CX_R + 96, 176, angle=28, scale=1.14, fill=P["amber"])
    + art.oak_leaf(CX_R, 116, angle=0, scale=1.22, fill=P["moss"], vein=P["navy_deep"])
    + art.oak_leaf(CX_R - 60, 268, angle=-40, scale=0.88, fill=P["goldenrod"])
    + art.oak_leaf(CX_R + 60, 268, angle=40, scale=0.88, fill=P["pumpkin"])
    + art.berry_cluster(CX_R - 8, 262, scale=0.94, fill=P["pumpkin"])
)

T1 = Concept(
    key="thanksgiving-01-grateful",
    season="thanksgiving",
    title="Grateful — deep navy & harvest (rust, goldenrod, moss, cranberry)",
    pitch=(
        "The most formal of the three and the closest sibling to the 2025 card: deep "
        "navy, gold script, a harvest crown riding the brand's atom orbits. Reads as "
        "a corporate holiday card without feeling cold."
    ),
    css=f"""
    .t1-front .eyebrow {{ color: {P['amber']}; }}
    .t1-front .script  {{ color: {P['harvest']}; font-size: 62pt; margin-top: 0.06in; }}
    .t1-front .year    {{ color: {P['amber']}; }}
    .t1-front .rule    {{ background: {P['goldenrod']}; margin: 0.14in 0; }}
    .t1-in .lead   {{ color: {P['rust']}; }}
    .t1-in .copy   {{ color: {P['ink']}; }}
    .t1-in .sign   {{ color: {P['navy']}; }}
    .t1-in .msg-rule {{ background: {P['chestnut']}; }}
    """,
    front_bg=glow(P["navy_deep"], P["navy"], CX_R, 200, 300, T1_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="eyebrow">Happy Thanksgiving</p>'
        '<p class="script">Grateful</p>'
        '<hr class="rule">'
        '<p class="year">2026</p>'
    ),
    back_bg=back_panel(P["navy_deep"], mark=art.orbits(CX_L, CY, 78, 34,
                       angles=(0, 60, 120), stroke=P["goldenrod"], width=1.15)
                       + art.nodes(CX_L, CY, 78, count=3, radius=3.2,
                                   fill=P["pumpkin"])),
    back_body="",
    inside_l_bg=flood(P["harvest"], corner_orbit(P["goldenrod"], 0.34)),
    inside_l_body="",
    inside_r_bg=flood(P["harvest"],
                      art.wheat(VB_W - 58, VB_H - 42, angle=14, scale=0.62,
                                stroke=P["wheat_ink"])),
    inside_r_body=msg(
        "Thank you for serving our country.",
        "It is a privilege to care for the men and women who powered America&rsquo;s "
        "energy program, and for the families who stand beside them. We are grateful "
        "you are part of the United Energy Workers family. May your Thanksgiving be "
        "warm, unhurried, and full of the people you love.",
        "With gratitude from all of us",
    ),
    logos=[
        front_logo("uew-logo-brightmore-ko"),
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
    art.maple_leaf(58, 62, angle=-28, scale=1.02, fill=P["rust"])
    + art.oak_leaf(128, 104, angle=24, scale=0.86, fill=P["chestnut"])
    + art.leaf_simple(196, 48, angle=-46, scale=0.92, fill=P["moss"])
    + art.maple_leaf(300, 88, angle=34, scale=0.82, fill=P["pumpkin"])
    + art.oak_leaf(382, 52, angle=-16, scale=0.90, fill=P["wheat_ink"])
    + art.berry_cluster(238, 112, scale=0.92, fill=P["cranberry"])
    # bottom band, y > 455
    # Kept out of x=140-285: that band is reserved for the front-cover logo.
    + art.wheat(52, VB_H - 30, angle=-18, scale=0.94, stroke=P["wheat_ink"], grains=6)
    + art.oak_leaf(112, VB_H - 68, angle=18, scale=0.90, fill=P["chestnut"])
    + art.maple_leaf(96, VB_H - 18, angle=-24, scale=0.84, fill=P["pumpkin"])
    + art.leaf_simple(322, VB_H - 88, angle=42, scale=0.96, fill=P["moss"])
    + art.maple_leaf(352, VB_H - 30, angle=16, scale=0.88, fill=P["rust"])
    + art.berry_cluster(392, VB_H - 96, scale=0.86, fill=P["cranberry"])
)

T2 = Concept(
    key="thanksgiving-02-give-thanks",
    season="thanksgiving",
    title="Give Thanks — harvest paper & falling autumn leaves",
    pitch=(
        "The friendliest of the three. Warm harvest paper, hand-drawn leaves in the "
        "full autumn range — rust, chestnut, goldenrod, moss, cranberry — framing "
        "navy Playfair. Prints beautifully on uncoated and photographs well for social."
    ),
    css=f"""
    .t2-front .eyebrow {{ color: {P['rust']}; }}
    .t2-front .display {{ color: {P['navy']}; font-size: 40pt; font-weight: 500;
                          margin: 0.10in 0; }}
    .t2-front .display em {{ font-style: italic; }}
    .t2-front .year    {{ color: {P['navy']}; opacity: 0.7; }}
    .t2-front .rule    {{ background: {P['rust']}; margin: 0.12in 0; }}
    .t2-in .lead   {{ color: {P['rust']}; }}
    .t2-in .copy   {{ color: {P['ink']}; }}
    .t2-in .sign   {{ color: {P['navy']}; }}
    .t2-in .msg-rule {{ background: {P['chestnut']}; }}
    """,
    front_bg=flood(P["harvest"], T2_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="eyebrow">Wishing you a warm</p>'
        '<p class="display"><em>Give</em> Thanks</p>'
        '<hr class="rule">'
        '<p class="year">Thanksgiving 2026</p>'
        '<div class="grow"></div>'
    ),
    back_bg=back_panel(P["harvest"],
                      mark=art.wheat(CX_L, CY + 52, angle=0, scale=1.0,
                                     stroke=P["wheat_ink"], grains=6)
                      + art.leaf_simple(CX_L - 40, CY + 40, angle=-62, scale=0.78,
                                        fill=P["moss"])
                      + art.leaf_simple(CX_L + 40, CY + 40, angle=62, scale=0.78,
                                        fill=P["chestnut"])),
    back_body="",
    inside_l_bg=flood(P["harvest"], corner_orbit(P["goldenrod"], 0.30)),
    inside_l_body="",
    inside_r_bg=flood(P["harvest"],
                      art.maple_leaf(VB_W - 54, 62, angle=22, scale=0.52,
                                     fill=P["pumpkin"])
                      + art.oak_leaf(46, VB_H - 56, angle=-20, scale=0.50,
                                     fill=P["chestnut"])),
    inside_r_body=msg(
        "Gratitude looks a lot like you.",
        "Thank you for serving our country, and for welcoming our caregivers into your "
        "home. We are proud you are part of the United Energy Workers family. May your "
        "Thanksgiving be full of good food, familiar faces, and time that feels like "
        "rest.",
        "Happy Thanksgiving from all of us",
    ),
    logos=[
        front_logo("uew-logo-brightmore"),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


# --------------------------------------------------------------------------- #
# THANKSGIVING 03 — "Thankful"
# --------------------------------------------------------------------------- #

# One ring, one node, one sprig. The restraint is the concept — a second ellipse
# turned the mark into a lens shape and fought the word for attention.
T3_ART = (
    art.orbits(CX_R, 252, 158, 158, angles=(0,), stroke=P["husk"], width=1.25,
               opacity=0.9)
    + art.nodes(CX_R, 252, 158, count=1, phase=-118, radius=4.6, fill=P["harvest"])
    # Sprig clears the ring rather than piercing it — a botanical crossing a
    # geometric rule looks accidental at this size.
    + art.wheat(CX_R, 452, angle=0, scale=0.92, stroke=P["husk"], grains=6)
    + art.leaf_simple(CX_R - 36, 442, angle=-62, scale=0.70, fill=P["husk"])
    + art.leaf_simple(CX_R + 36, 442, angle=62, scale=0.70, fill=P["husk"])
)

T3 = Concept(
    key="thanksgiving-03-thankful",
    season="thanksgiving",
    title="Thankful — burnt rust & cream, editorial",
    pitch=(
        "The modern one, and the most unmistakably autumn: a full burnt-rust field "
        "with a single engraved word in cream, one amber orbit, one wheat sprig. Rust "
        "is the brand coral walked darker, so it reads as UEW rather than as generic "
        "harvest. Heaviest ink coverage of the six."
    ),
    css=f"""
    .t3-front .display-sc {{ color: {P['harvest']}; font-size: 30pt; font-weight: 500;
                             letter-spacing: 0.20em; text-indent: 0.20em; }}
    .t3-front .eyebrow    {{ color: {P['harvest']}; }}
    .t3-front .year       {{ color: {P['harvest']}; }}
    .t3-in .lead   {{ color: {P['rust']}; }}
    .t3-in .copy   {{ color: {P['ink']}; }}
    .t3-in .sign   {{ color: {P['navy']}; }}
    .t3-in .msg-rule {{ background: {P['chestnut']}; }}
    """,
    front_bg=glow(P["rust"], P["pumpkin"], CX_R, 252, 300, T3_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="eyebrow">Twenty twenty-six</p>'
        '<div class="t3-gap"></div>'
        '<p class="display-sc">THANKFUL</p>'
        '<div class="grow"></div>'
        '<p class="year">Happy Thanksgiving</p>'
    ),
    back_bg=back_panel(P["rust"],
                      mark=art.orbits(CX_L, CY, 82, 82, angles=(0,),
                                      stroke=P["husk"], width=1.15)
                      + art.nodes(CX_L, CY, 82, count=1, phase=-118, radius=3.6,
                                  fill=P["harvest"])),
    back_body="",
    inside_l_bg=flood(P["harvest"], corner_orbit(P["goldenrod"], 0.30)),
    inside_l_body="",
    inside_r_bg=flood(P["harvest"],
                      art.orbits(VB_W - 30, 54, 96, 40, angles=(-22,),
                                 stroke=P["rust"], width=1.0, opacity=0.42)),
    inside_r_body=msg(
        "Some things are worth saying plainly.",
        "Thank you for serving our country. Thank you for trusting us with your care. "
        "And thank you for being part of the United Energy Workers family &mdash; it "
        "is the honour of our work. Happy Thanksgiving to you and yours.",
        "Thanksgiving 2026",
    ),
    logos=[
        # mono-white, not the knockout: on a rust field the knockout's coral
        # "UNITED"/"HEALTHCARE" sit almost on top of the background hue.
        front_logo("uew-logo-brightmore-mono-white"),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


# --------------------------------------------------------------------------- #
# CHRISTMAS 01 — "Peace, Joy & Light"
# --------------------------------------------------------------------------- #

C1_ART = (
    art.orbits(CX_R, 182, 150, 58, angles=(0, 60, 120), stroke=P["peach"], width=1.4,
               opacity=0.85)
    + art.starburst(CX_R, 182, 100, fill=P["cream"], waist=0.085)
    + art.starburst(CX_R, 182, 56, fill=P["gold"], waist=0.11)
    + art.nodes(CX_R, 182, 150, count=3, phase=-90, radius=4.6, fill=P["coral"])
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
    .c1-in .lead   {{ color: {P['coral_ink']}; }}
    .c1-in .copy   {{ color: {P['ink']}; }}
    .c1-in .sign   {{ color: {P['navy']}; }}
    .c1-in .msg-rule {{ background: {P['gold']}; }}
    """,
    front_bg=glow(P["navy_deep"], P["navy"], CX_R, 182, 330, C1_ART),
    front_body=(
        '<div class="grow"></div>'
        '<p class="eyebrow">Wishing you</p>'
        '<p class="script">Peace, Joy<br>&amp; Light</p>'
        '<hr class="rule">'
        '<p class="year">2026</p>'
    ),
    back_bg=back_panel(P["navy_deep"],
                      mark=art.orbits(CX_L, CY, 76, 32, angles=(0, 60, 120),
                                      stroke=P["peach"], width=1.15, opacity=0.9)
                      + art.starburst(CX_L, CY, 30, fill=P["gold"], waist=0.1)),
    back_body="",
    inside_l_bg=flood(P["cream"], corner_orbit(P["peach"], 0.40)),
    inside_l_body="",
    inside_r_bg=flood(P["cream"],
                      art.sparkle(VB_W - 52, 60, 13, fill=P["gold"], opacity=0.55)
                      + art.sparkle(44, VB_H - 64, 9, fill=P["peach"], opacity=0.5)),
    inside_r_body=msg(
        "May your home be full of light this Christmas&thinsp;&mdash;",
        "and your new year full of health, comfort, and the people who make it feel "
        "like home. Thank you for serving our country, and for being part of the "
        "United Energy Workers family. It is our privilege to care for you.",
        "Merry Christmas from all of us",
    ),
    logos=[
        front_logo("uew-logo-brightmore-ko"),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


# --------------------------------------------------------------------------- #
# CHRISTMAS 02 — "Merry & Bright"
# --------------------------------------------------------------------------- #

# Ground band is painted FIRST so the trees stand on it; painting it last clipped
# the trunks and left coral stubs floating above the snow line.
GROUND_Y = 470
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
                (344, 184, 1.9), (392, 252, 2.2), (30, 300, 1.8), (404, 320, 1.7),
                (24, 384, 1.6), (410, 402, 1.5)],
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
    .c2-front .eyebrow {{ color: {P['coral_ink']}; }}
    .c2-front .display {{ color: {P['navy']}; font-size: 34pt; font-weight: 500; }}
    .c2-front .display em {{ font-style: italic; }}
    .c2-front .year    {{ color: {P['navy']}; opacity: 0.68; }}
    .c2-front .rule    {{ background: {P['coral']}; margin: 0.12in 0; }}
    .c2-in .lead   {{ color: {P['coral_ink']}; }}
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
    back_bg=back_panel(P["ivory"],
                      mark=art.geo_tree(CX_L, CY + 58, h=118, w=60, tiers=4,
                                        fill=P["navy"], trunk=P["coral"])),
    back_body="",
    inside_l_bg=flood(P["ivory"], corner_orbit(P["peach"], 0.34)),
    inside_l_body="",
    inside_r_bg=flood(P["ivory"],
                      art.snow([(VB_W - 44, 58, 2.2), (VB_W - 74, 92, 1.6),
                                (40, VB_H - 70, 2.0), (72, VB_H - 44, 1.5)],
                               fill=P["peach"], opacity=0.8)),
    inside_r_body=msg(
        "Warmest wishes for a bright and peaceful season.",
        "Thank you for serving our country, and for the trust you place in us every "
        "week. We are glad you are part of the United Energy Workers family. May your "
        "Christmas be merry, your home be warm, and your new year bring good health "
        "and good company.",
        "Christmas 2026",
    ),
    logos=[
        front_logo("uew-logo-brightmore"),
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
    .c3-in .lead   {{ color: {P['coral_ink']}; }}
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
    back_bg=back_panel(P["navy_deep"],
                      mark=art.laurel_wreath(CX_L, CY, 62, leaves=24,
                                             fill=P["peach"], berry=P["coral"],
                                             leaf_scale=0.42, berries=4)),
    back_body="",
    inside_l_bg=flood(P["cream"], corner_orbit(P["peach"], 0.38)),
    inside_l_body="",
    inside_r_bg=flood(P["cream"],
                      art.pine_sprig(VB_W - 46, 96, angle=18, scale=0.58,
                                     stroke=P["peach"])
                      + art.berry_cluster(46, VB_H - 62, scale=0.72, fill=P["coral"])),
    inside_r_body=msg(
        "From our family to yours&thinsp;&mdash;",
        "thank you for serving our country, and for being part of the United Energy "
        "Workers family. May your Christmas be peaceful, your table full, and your "
        "new year kind to you and everyone you love.",
        "Season&rsquo;s Greetings &middot; 2026",
    ),
    logos=[
        front_logo("uew-logo-brightmore-ko"),
        LogoBox(2, "uew-logo-brightmore", 6.425, 5.06, 1.58),
    ],
)


CONCEPTS: list[Concept] = [T1, T2, T3, C1, C2, C3]

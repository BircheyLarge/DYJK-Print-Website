"""Vector illustration library for the UEW 2026 card set.

Everything here returns inline SVG markup. Inline SVG is the one reliable way to
keep Chromium's print-to-PDF output fully vector — CSS gradients and filters get
rasterised at 96dpi, which would be visible on press. No filters, no CSS
gradients: SVG shapes and SVG gradients only.

The recurring motif is the atom orbit lifted from the UEW mark. It gives the set
a brand-native ornament instead of generic clip art — a star made of electron
orbits at Christmas, a harvest wreath riding the same ellipses at Thanksgiving.
"""

from __future__ import annotations

import math

NAVY = "#123C64"
NAVY_DEEP = "#0B2942"
CORAL = "#F05932"
PEACH = "#F8A383"
CREAM = "#FBF4E7"
IVORY = "#FFFCF6"
GOLD = "#D9A566"
WHEAT = "#E8C48A"


# --------------------------------------------------------------------------- #
# primitives
# --------------------------------------------------------------------------- #


def orbits(
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    *,
    angles: tuple[float, ...] = (0, 60, 120),
    stroke: str = PEACH,
    width: float = 1.6,
    opacity: float = 1.0,
) -> str:
    """The atom's electron orbits — n ellipses share a centre at even rotations."""
    return "".join(
        f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" '
        f'stroke="{stroke}" stroke-width="{width}" opacity="{opacity}" '
        f'transform="rotate({a} {cx} {cy})"/>'
        for a in angles
    )


def nodes(cx: float, cy: float, r: float, *, count: int = 3, phase: float = -90,
          radius: float = 3.4, fill: str = CORAL) -> str:
    """Electron nodes sitting on an orbit radius."""
    out = []
    for i in range(count):
        a = math.radians(phase + i * 360 / count)
        out.append(
            f'<circle cx="{cx + r * math.cos(a):.2f}" cy="{cy + r * math.sin(a):.2f}" '
            f'r="{radius}" fill="{fill}"/>'
        )
    return "".join(out)


def sparkle(cx: float, cy: float, r: float, *, fill: str = CREAM,
            waist: float = 0.13, opacity: float = 1.0) -> str:
    """A four-point star drawn with concave sides — the classic 'shine' glyph."""
    w = r * waist
    d = (
        f"M {cx} {cy - r} C {cx + w} {cy - w} {cx + w} {cy - w} {cx + r} {cy} "
        f"C {cx + w} {cy + w} {cx + w} {cy + w} {cx} {cy + r} "
        f"C {cx - w} {cy + w} {cx - w} {cy + w} {cx - r} {cy} "
        f"C {cx - w} {cy - w} {cx - w} {cy - w} {cx} {cy - r} Z"
    )
    return f'<path d="{d}" fill="{fill}" opacity="{opacity}"/>'


def starburst(cx: float, cy: float, r: float, *, points: int = 8, fill: str = GOLD,
              waist: float = 0.10, opacity: float = 1.0) -> str:
    """Radiating star; long axes on the cardinals, short on the diagonals."""
    out = [sparkle(cx, cy, r, fill=fill, waist=waist, opacity=opacity)]
    if points >= 8:
        out.append(
            f'<g transform="rotate(45 {cx} {cy})">'
            + sparkle(cx, cy, r * 0.52, fill=fill, waist=waist * 1.4, opacity=opacity)
            + "</g>"
        )
    return "".join(out)


def mix(a: str, b: str, t: float) -> str:
    """Blend two #rrggbb colours; t=0 -> a, t=1 -> b."""
    ca = [int(a[i : i + 2], 16) for i in (1, 3, 5)]
    cb = [int(b[i : i + 2], 16) for i in (1, 3, 5)]
    return "#%02x%02x%02x" % tuple(
        round(x + (y - x) * t) for x, y in zip(ca, cb)
    )


def radial_rings(cx: float, cy: float, r: float, inner: str, outer: str,
                 *, steps: int = 44) -> str:
    """A radial lift built from concentric flat-filled circles.

    An SVG `radialGradient` is the obvious way to do this, and it is a trap:
    Chromium's print-to-PDF hands gradients to Skia, which flattens them to a
    72 dpi bitmap. On a 4.3 x 6.1in panel that is a 311 x 440px image sitting
    under the whole front cover. Flat fills stay vector, and at 44 steps between
    two near-identical navies each band moves a single value per channel — well
    under what any press can resolve.
    """
    parts = []
    for i in range(steps, 0, -1):
        t = i / steps  # 1 at the outer edge, where it must match the flood
        parts.append(
            f'<circle cx="{cx}" cy="{cy}" r="{r * t:.2f}" '
            f'fill="{mix(inner, outer, t)}"/>'
        )
    return "".join(parts)


def hairline(x1: float, y1: float, x2: float, y2: float, *, stroke: str = PEACH,
             width: float = 1.0, opacity: float = 1.0) -> str:
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" '
        f'stroke-width="{width}" opacity="{opacity}" stroke-linecap="round"/>'
    )


# --------------------------------------------------------------------------- #
# harvest botanicals
# --------------------------------------------------------------------------- #


def wheat(x: float, y: float, *, length: float = 78, angle: float = 0,
          stroke: str = WHEAT, width: float = 1.5, grains: int = 7,
          scale: float = 1.0) -> str:
    """A wheat sprig: a stem with paired teardrop grains climbing it."""
    parts = [f'<line x1="0" y1="0" x2="0" y2="{-length}" stroke="{stroke}" '
             f'stroke-width="{width}" stroke-linecap="round"/>']
    top = -length
    for i in range(grains):
        t = i / max(grains - 1, 1)
        gy = top * (0.40 + 0.56 * t)
        ry = 7.4 * (1 - 0.28 * t)  # grains shorten toward the tip
        rx = 2.5 * (1 - 0.18 * t)
        for side in (-1, 1):
            # seat the grain off the stem and tilt it up and outward
            cx, cy = side * 3.2, gy - ry * 0.55
            parts.append(
                f'<ellipse cx="{cx:.2f}" cy="{cy:.2f}" rx="{rx:.2f}" ry="{ry:.2f}" '
                f'fill="{stroke}" transform="rotate({side * 26} {cx:.2f} {cy:.2f})"/>'
            )
            parts.append(
                f'<line x1="0" y1="{gy:.1f}" x2="{side * 8.5:.1f}" '
                f'y2="{gy - ry * 2.1:.1f}" stroke="{stroke}" stroke-width="{width * 0.5}" '
                f'stroke-linecap="round" opacity="0.75"/>'
            )
    # terminal grain, upright
    parts.append(
        f'<ellipse cx="0" cy="{top + 5.5:.1f}" rx="2.5" ry="7.2" fill="{stroke}"/>'
    )
    return (
        f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})">'
        + "".join(parts)
        + "</g>"
    )


def oak_leaf(x: float, y: float, *, angle: float = 0, scale: float = 1.0,
             fill: str = CORAL, opacity: float = 1.0, vein: str | None = None) -> str:
    """Oak leaf: a full blade with four soft lobes a side, on a short stem.

    Drawn with shallow quadratics rather than deep notches — deep notches read as
    a starburst once the leaf is under about half an inch on the press sheet.
    """
    right = (
        "Q 17 22 14 14 Q 7 12 7 9 Q 19 8 18 0 Q 7 -3 7 -6 "
        "Q 18 -9 15 -16 Q 7 -19 7 -22 Q 12 -26 0 -31"
    )
    left = (
        "Q -12 -26 -7 -22 Q -7 -19 -15 -16 Q -18 -9 -7 -6 Q -7 -3 -18 0 "
        "Q -19 8 -7 9 Q -7 12 -14 14 Q -17 22 0 22"
    )
    d = f"M 0 22 {right} {left} Z"
    veins = ""
    if vein:
        veins = (f'<line x1="0" y1="19" x2="0" y2="-25" stroke="{vein}" '
                 f'stroke-width="1.2" opacity="0.5" stroke-linecap="round"/>')
    return (
        f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})" opacity="{opacity}">'
        f'<path d="{d}" fill="{fill}"/>'
        f'<line x1="0" y1="21" x2="0" y2="31" stroke="{fill}" stroke-width="2.2" '
        f'stroke-linecap="round"/>{veins}</g>'
    )


def maple_leaf(x: float, y: float, *, angle: float = 0, scale: float = 1.0,
               fill: str = GOLD, opacity: float = 1.0) -> str:
    """Five-lobe maple. Broad lobes, shallow sinuses — a leaf, not an asterisk."""
    d = (
        "M 0 -31 L 8 -17 L 17 -20 L 14 -6 L 27 -10 L 22 1 L 30 3 "
        "L 17 12 L 21 19 L 8 16 L 5 31 L 0 27 L -5 31 L -8 16 L -21 19 L -17 12 "
        "L -30 3 L -22 1 L -27 -10 L -14 -6 L -17 -20 L -8 -17 Z"
    )
    return (
        f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})" opacity="{opacity}">'
        f'<path d="{d}" fill="{fill}"/>'
        f'<line x1="0" y1="27" x2="0" y2="36" stroke="{fill}" stroke-width="2.2" '
        f'stroke-linecap="round"/></g>'
    )


def leaf_simple(x: float, y: float, *, angle: float = 0, scale: float = 1.0,
                fill: str = PEACH, opacity: float = 1.0, vein: str | None = None) -> str:
    """A plain pointed leaf — the quiet filler between the showier shapes."""
    veins = ""
    if vein:
        veins = (
            f'<line x1="0" y1="17" x2="0" y2="-17" stroke="{vein}" stroke-width="1" '
            f'opacity="0.6" stroke-linecap="round"/>'
        )
    return (
        f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})" opacity="{opacity}">'
        f'<path d="M 0 -20 C 9 -12 11 4 0 20 C -11 4 -9 -12 0 -20 Z" fill="{fill}"/>'
        f"{veins}</g>"
    )


def berry_cluster(x: float, y: float, *, scale: float = 1.0, fill: str = CORAL) -> str:
    dots = [(0, 0, 4.2), (7.5, 3.5, 3.4), (3.2, 8.4, 3.0)]
    body = "".join(f'<circle cx="{a}" cy="{b}" r="{r}" fill="{fill}"/>' for a, b, r in dots)
    return f'<g transform="translate({x} {y}) scale({scale})">{body}</g>'


# --------------------------------------------------------------------------- #
# evergreen
# --------------------------------------------------------------------------- #


def pine_sprig(x: float, y: float, *, angle: float = 0, scale: float = 1.0,
               length: float = 62, stroke: str = PEACH, width: float = 1.4,
               pairs: int = 9) -> str:
    """A fir sprig: central stem with needles swept toward the tip."""
    parts = [f'<line x1="0" y1="0" x2="0" y2="{-length}" stroke="{stroke}" '
             f'stroke-width="{width}" stroke-linecap="round"/>']
    for i in range(pairs):
        t = i / max(pairs - 1, 1)
        ny = -length * (0.08 + 0.88 * t)
        nl = 20 * (1 - 0.62 * t)
        for side in (-1, 1):
            parts.append(
                f'<line x1="0" y1="{ny:.1f}" x2="{side * nl:.1f}" '
                f'y2="{ny - nl * 0.72:.1f}" stroke="{stroke}" stroke-width="{width * 0.8}" '
                f'stroke-linecap="round"/>'
            )
    return (
        f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})">'
        + "".join(parts)
        + "</g>"
    )


def geo_tree(x: float, y: float, *, h: float = 120, w: float = 62, tiers: int = 4,
             fill: str = NAVY, trunk: str = CORAL, opacity: float = 1.0) -> str:
    """Flat geometric conifer — stacked chevrons over a slim trunk."""
    parts = []
    tier_h = h / (tiers + 0.6)
    bot = 0.0
    for i in range(tiers):
        t = i / max(tiers - 1, 1)
        half = (w / 2) * (0.42 + 0.58 * t)
        top = -h + i * tier_h * 0.92
        bot = top + tier_h * 1.35
        parts.append(
            f'<path d="M 0 {top:.1f} L {half:.1f} {bot:.1f} L {-half:.1f} {bot:.1f} Z" '
            f'fill="{fill}"/>'
        )
    # Trunk starts inside the lowest tier so the tree reads as one object; a trunk
    # that starts below the foliage looks like a separate coral tab on the snow.
    trunk_top = bot - 3
    parts.insert(
        0,
        f'<rect x="-3" y="{trunk_top:.1f}" width="6" height="{abs(trunk_top) + 6:.1f}" '
        f'rx="2" fill="{trunk}"/>',
    )
    return f'<g transform="translate({x} {y})" opacity="{opacity}">' + "".join(parts) + "</g>"


def laurel_wreath(cx: float, cy: float, r: float, *, leaves: int = 26,
                  fill: str = PEACH, berry: str = CORAL, leaf_scale: float = 0.62,
                  berries: int = 6, gap_deg: float = 0.0) -> str:
    """A laurel ring: individual leaves set tangent to the circle, alternating in
    and out, with berry clusters.

    Chosen over a needled pine wreath because at 4.25in every needle is under a
    third of a millimetre — pine turns into grey fur on press, while discrete
    leaves keep their silhouette and the ring keeps its shape.
    """
    # The stem ring first — without a continuous line under them the leaves read as
    # scattered petals rather than one wreath.
    parts = [
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{fill}" '
        f'stroke-width="1.3" opacity="0.8"/>'
    ]
    for i in range(leaves):
        a = i * 360 / leaves
        if gap_deg and abs(((a + 180) % 360) - 180) < gap_deg / 2:
            continue  # optional opening at the top
        rad = math.radians(a - 90)
        outward = 1 if i % 2 == 0 else -1
        rr = r + outward * r * 0.045
        px, py = cx + rr * math.cos(rad), cy + rr * math.sin(rad)
        parts.append(
            leaf_simple(px, py, angle=a + 118,
                        scale=leaf_scale * (1.0 if outward > 0 else 0.86), fill=fill)
        )
    for i in range(berries):
        a = math.radians(i * 360 / berries - 74)
        parts.append(
            berry_cluster(cx + r * math.cos(a) - 4, cy + r * math.sin(a) - 4,
                          scale=0.95, fill=berry)
        )
    return "".join(parts)


def snow(seed_points: list[tuple[float, float, float]], *, fill: str = IVORY,
         opacity: float = 0.85) -> str:
    return "".join(
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" opacity="{opacity}"/>'
        for x, y, r in seed_points
    )


def wreath(cx: float, cy: float, r: float, *, count: int = 16, stroke: str = PEACH,
           berry: str = CORAL, sprig_scale: float = 0.92, berries: int = 5,
           berry_r: float = 1.0) -> str:
    """A ring of pine sprigs laid tangent to a circle, with scattered berries.

    Long, heavily overlapping sprigs — short ones spaced evenly read as a hairy
    ring rather than a wreath, because the eye needs the needles to interleave.
    """
    parts = []
    # Two interleaved rings — one riding slightly outside the circle, one inside,
    # offset by half a step. A single ring of sprigs reads as fringe; two read as
    # foliage because the needles cross each other.
    for ring, (dr, sc, phase) in enumerate(
        ((6.0, 1.0, 0.0), (-9.0, 0.82, 0.5))
    ):
        for i in range(count):
            a = (i + phase) * 360 / count
            rad = math.radians(a - 90)
            rr = r + dr
            px, py = cx + rr * math.cos(rad), cy + rr * math.sin(rad)
            parts.append(
                pine_sprig(px, py, angle=a + 104, scale=sprig_scale * sc,
                           stroke=stroke, length=84, pairs=13, width=1.3)
            )
    for i in range(berries):
        a = math.radians(i * 360 / berries - 66)
        parts.append(
            berry_cluster(cx + r * berry_r * math.cos(a) - 4,
                          cy + r * berry_r * math.sin(a) - 4,
                          scale=1.05, fill=berry)
        )
    return "".join(parts)


# --------------------------------------------------------------------------- #
# canvas helper
# --------------------------------------------------------------------------- #


def svg(body: str, *, w: float, h: float, cls: str = "art", extra: str = "") -> str:
    """Wrap art in a viewBox'd svg that scales to its CSS box."""
    return (
        f'<svg class="{cls}" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid meet" '
        f'xmlns="http://www.w3.org/2000/svg" {extra}>{body}</svg>'
    )

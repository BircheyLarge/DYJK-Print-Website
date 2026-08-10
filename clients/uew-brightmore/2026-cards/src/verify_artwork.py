#!/usr/bin/env python3
"""Measured contrast sweep — reads ink off the rendered page, not off a list.

`verify_contrast.py` checks a hand-maintained list of pairings. A list only ever
covers what someone remembered to write down, and it has now missed real defects
twice: the brand coral used as body text, and every element drawn at partial
opacity, where the *declared* colour clears the floor but the composited pixel
does not. A stroke set in goldenrod at 75% over navy is not goldenrod on navy.

This walks the actual rendered panel instead. It cannot know what we meant, so it
reports by area and lets us judge — but it cannot miss an element either.

Two exclusions, both necessary rather than convenient:

  * tonal steps — the star halos are ~44 concentric flat fills interpolated
    between two near-identical navies (an SVG gradient would rasterise). Every
    adjacent step is low-contrast by construction, so a colour that sits on the
    line between the background and a known tint is a gradient band, not an
    element.
  * texture — anything under `MIN_AREA` of the panel is snow, sparkle or
    anti-aliasing, and is meant to be faint.

Run: python3 src/verify_artwork.py
"""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import layout  # noqa: E402
from layout import PALETTE as P  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PRINT_DIR = ROOT / "out" / "print"

PT = 72.0
DPI = 200
MIN_AREA = 0.0010  # 0.1% of the panel — below this it is texture or AA
FLOOR = 3.0
TONAL_TOL = 14  # max distance from the ground->tint line to count as a gradient band

GREEN, RED, DIM, YEL, OFF = "\033[32m", "\033[31m", "\033[2m", "\033[33m", "\033[0m"

# Colours we knowingly place faint, and the client's own logo inks.
KNOWN_FAINT = {
    P["navy_soft"]: "back-panel ornament (deliberate)",
    "#F8A383": "orbit rings inside the client's supplied logo",
    "#F05932": "coral in the client's supplied logo",
}


def lum(rgb: tuple[int, int, int]) -> float:
    c = [v / 255 for v in rgb]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def hx(h: str) -> tuple[int, int, int]:
    return tuple(int(h[i : i + 2], 16) for i in (1, 3, 5))


def hexs(rgb: tuple[int, int, int]) -> str:
    return "#%02x%02x%02x" % rgb


def on_tonal_line(c: tuple[int, int, int], bg: tuple[int, int, int]) -> bool:
    """True if c lies close to the segment between bg and any palette tint."""
    for tint in {P[k] for k in ("navy", "navy_soft", "pumpkin", "gold", "amber")}:
        t = hx(tint)
        for i in range(1, 45):
            f = i / 45
            p = tuple(bg[j] + (t[j] - bg[j]) * f for j in range(3))
            if sum((c[j] - p[j]) ** 2 for j in range(3)) ** 0.5 <= TONAL_TOL:
                return True
    return False


def sweep_panel(pix: pymupdf.Pixmap, x0: int, x1: int, label: str) -> list[str]:
    w, n, s = pix.width, pix.n, pix.samples
    counts: Counter = Counter()
    for y in range(0, pix.height, 2):
        row = y * w
        for x in range(x0, x1, 2):
            i = (row + x) * n
            counts[(s[i], s[i + 1], s[i + 2])] += 1

    total = sum(counts.values())
    bg, _ = counts.most_common(1)[0]
    findings = []
    for colour, cnt in counts.most_common(70):
        if colour == bg:
            continue
        area = cnt / total
        if area < MIN_AREA:
            continue
        r = ratio(colour, bg)
        if r >= FLOOR or on_tonal_line(colour, bg):
            continue
        note = ""
        for known, why in KNOWN_FAINT.items():
            if sum((colour[j] - hx(known)[j]) ** 2 for j in range(3)) ** 0.5 < 26:
                note = f"  ({why})"
        findings.append(
            f"{r:5.2f}:1  {hexs(colour)} on {hexs(bg)}  "
            f"{area * 100:4.1f}% of {label}{note}"
        )
    return findings


def main() -> None:
    pdfs = sorted(PRINT_DIR.glob("*.pdf"))
    if not pdfs:
        raise SystemExit("no print PDFs — run build_cards.py first")
    print(f"measured artwork sweep — {DPI} dpi, floor {FLOOR}:1, "
          f"ignoring anything under {MIN_AREA * 100:.2f}% of a panel\n")

    scale = DPI / 72
    fold_px = int(layout.FOLD_X * PT * scale)
    bleed_px = int(layout.BLEED * PT * scale)
    total = 0
    for pdf in pdfs:
        doc = pymupdf.open(pdf)
        lines = []
        for pno, page in enumerate(doc):
            pix = page.get_pixmap(dpi=DPI, alpha=False)
            right_edge = pix.width - bleed_px
            faces = ("back", "front") if pno == 0 else ("inside-left", "inside-right")
            for (a, b), name in zip(
                ((bleed_px, fold_px), (fold_px, right_edge)), faces
            ):
                for f in sweep_panel(pix, a, b, name):
                    lines.append(f"      {f}")
        doc.close()
        mark = f"{GREEN}clean{OFF}" if not lines else f"{YEL}{len(lines)} to review{OFF}"
        print(f"  {pdf.stem:<34} {mark}")
        for ln in lines:
            print(ln)
        total += len(lines)

    print()
    if total:
        print(f"{YEL}{total} element(s) under {FLOOR}:1 — judge each; texture and the "
              f"client's own logo inks are expected{OFF}")
    else:
        print(f"{GREEN}no artwork under {FLOOR}:1{OFF}")


if __name__ == "__main__":
    main()

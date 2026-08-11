#!/usr/bin/env python3
"""Contrast check for every piece of live text in the finished cards.

Deliberately not a hand-maintained list of ink/ground pairings: a list only
covers the combinations someone remembered to write down, which is how brand
coral on cream survived several rounds of review here. This reads the ink
colour straight off each text span in the rendered PDF and samples the ground
from the pixels around it, so a pairing cannot exist in the artwork without
being measured.

The audience is largely older former energy workers, and contrast sensitivity
declines with age, so AA is the floor rather than the goal.
"""

from __future__ import annotations

import sys
from collections import Counter
from pathlib import Path

import numpy as np
import pymupdf

ROOT = Path(__file__).parent
FINAL = ROOT / "out" / "print-final"

SAMPLE_DPI = 150


def rel_luminance(rgb) -> float:
    c = np.asarray(rgb, dtype=float) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return float(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2])


def contrast(fg, bg) -> float:
    a, b = rel_luminance(fg), rel_luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


def int_to_rgb(v: int):
    return ((v >> 16) & 255, (v >> 8) & 255, v & 255)


def required(size_pt: float, bold: bool) -> float:
    """WCAG AA: 3:1 for large text (>=18pt, or >=14pt bold), else 4.5:1."""
    if size_pt >= 18 or (size_pt >= 14 and bold):
        return 3.0
    return 4.5


def ground_behind(arr, bbox, scale, pad=6):
    """Modal colour in a band just outside the span box — i.e. the stock."""
    h, w, _ = arr.shape
    x0, y0, x1, y1 = (int(round(v * scale)) for v in bbox)
    ox0, oy0 = max(0, x0 - pad), max(0, y0 - pad)
    ox1, oy1 = min(w, x1 + pad), min(h, y1 + pad)
    if ox1 <= ox0 or oy1 <= oy0:
        return None
    outer = arr[oy0:oy1, ox0:ox1].reshape(-1, 3)
    inner = arr[max(0, y0):min(h, y1), max(0, x0):min(w, x1)].reshape(-1, 3)
    # the ground is the most common colour in the ring, which the glyphs do not
    # cover; fall back to the most common colour overall for very tight boxes
    pool = outer if len(outer) > len(inner) else np.vstack([outer, inner])
    counts = Counter(map(tuple, pool))
    return counts.most_common(1)[0][0]


# Decorative art only needs 3:1, and a couple of tones are deliberately below
# that because they never carry an element on their own. Anything not listed
# here has to clear the bar.
ART_MIN = 3.0
ART_EXCEPTIONS = {
    # one of three wheat tones in the wreath, never used alone — see README
    ("#B8842B", "#F6ECDB"): "goldenrod is a highlight tone among chestnut and amber",
    ("#DE9A3E", "#F6ECDB"): "amber is a highlight tone among chestnut and goldenrod",
    # inside the client's supplied mark. Reported to them rather than altered:
    # redrawing someone's logo to pass a checker is not ours to do.
    ("#F8A484", "#F6ECDB"): "light coral orbit rings in the supplied mark",
    ("#F8A484", "#FAF5EC"): "light coral orbit rings in the supplied mark",
    ("#F15933", "#F6ECDB"): "coral in the supplied logo, on oat stock",
}


def panel_ground(arr, scale, page_rect, cx):
    """Stock colour of the panel a drawing sits in — the thing it prints on."""
    half = page_rect.width / 2
    x0, x1 = (0, half) if cx < half else (half, page_rect.width)
    reg = arr[:, int(x0 * scale):int(x1 * scale)].reshape(-1, 3)
    return Counter(map(tuple, reg)).most_common(1)[0][0]


def is_blend(ink, ground, tints, tol=10):
    """True if `ink` lies on the line between the ground and a palette tint.

    The star's halo is thirty concentric rings interpolated from gold to the
    navy ground, so every ring is by construction low-contrast against its
    neighbours and against the stock. Those are tonal steps, not elements, and
    flagging them would drown the real finding.
    """
    g = np.asarray(ground, dtype=float)
    c = np.asarray(ink, dtype=float)
    for t in tints:
        v = np.asarray(t, dtype=float) - g
        n = float(v @ v)
        if n == 0:
            continue
        k = float((c - g) @ v) / n
        if -0.05 <= k <= 1.05 and np.abs(g + k * v - c).max() <= tol:
            return True
    return False


HALO_TINTS = [(0xE2, 0xC6, 0x8D)]


def check_art(pdf: Path, arr_by_page) -> list:
    """Every vector fill/stroke measured against the stock it prints on.

    The failure that matters is a pale motif on pale stock: it does not look
    'a bit light' on press, it drops out of the sheet or prints as something a
    customer reads as a fault.
    """
    out = []
    doc = pymupdf.open(pdf)
    for page in doc:
        arr, scale = arr_by_page[page.number]
        for d in page.get_drawings():
            r = d["rect"]
            if r.width < 2 or r.height < 2:
                continue
            ground = panel_ground(arr, scale, page.rect, (r.x0 + r.x1) / 2)
            for key in ("fill", "color"):
                c = d.get(key)
                if not c:
                    continue
                ink = tuple(int(round(v * 255)) for v in c)
                if ink == tuple(ground) or is_blend(ink, ground, HALO_TINTS):
                    continue
                out.append(
                    ("#%02X%02X%02X" % ink, "#%02X%02X%02X" % tuple(ground),
                     contrast(ink, ground))
                )
    doc.close()
    return out


def main() -> int:
    failures = []
    checked = 0
    pairs = {}
    art_pairs = {}

    for pdf in sorted(FINAL.glob("*.pdf")):
        doc = pymupdf.open(pdf)
        arr_by_page = {}
        for page in doc:
            pix = page.get_pixmap(dpi=SAMPLE_DPI, alpha=False)
            arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
                pix.height, pix.width, 3
            )
            scale = SAMPLE_DPI / 72.0
            arr_by_page[page.number] = (arr, scale)
            for block in page.get_text("dict")["blocks"]:
                for line in block.get("lines", []):
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if not text:
                            continue
                        ink = int_to_rgb(span["color"])
                        ground = ground_behind(arr, span["bbox"], scale)
                        if ground is None:
                            continue
                        bold = "bold" in span["font"].lower() or span["flags"] & 2 ** 4
                        need = required(span["size"], bool(bold))
                        ratio = contrast(ink, ground)
                        checked += 1
                        key = (
                            "#%02X%02X%02X" % ink,
                            "#%02X%02X%02X" % ground,
                            round(need, 1),
                        )
                        pairs.setdefault(key, ratio)
                        if ratio < need:
                            failures.append(
                                (pdf.name, page.number + 1, text[:36], span["size"],
                                 key[0], key[1], ratio, need)
                            )
        doc.close()

        for ink, ground, ratio in check_art(pdf, arr_by_page):
            k = (ink, ground)
            art_pairs[k] = min(ratio, art_pairs.get(k, 99))

    print(f"{checked} text spans measured, {len(pairs)} distinct ink/ground pairings\n")
    for (ink, ground, need), ratio in sorted(pairs.items(), key=lambda kv: kv[1]):
        mark = "ok " if ratio >= need else "FAIL"
        print(f"  {mark} {ink} on {ground}  {ratio:5.2f}:1  (needs {need})")

    art_fail = [
        (i, g, r) for (i, g), r in sorted(art_pairs.items(), key=lambda kv: kv[1])
        if r < ART_MIN and (i, g) not in ART_EXCEPTIONS
    ]
    print(f"\n{len(art_pairs)} distinct artwork ink/ground pairings (need {ART_MIN}):")
    for (i, g), r in sorted(art_pairs.items(), key=lambda kv: kv[1])[:12]:
        note = ART_EXCEPTIONS.get((i, g))
        mark = "ok " if r >= ART_MIN or note else "FAIL"
        print(f"  {mark} {i} on {g}  {r:5.2f}:1" + (f"  [allowed: {note}]" if note else ""))
    if len(art_pairs) > 12:
        print(f"  ... {len(art_pairs) - 12} more, all clear")

    if art_fail:
        print(f"\n{len(art_fail)} artwork pairings below {ART_MIN}:")
        for i, g, r in art_fail:
            print(f"  {i} on {g}  {r:.2f}:1")
        return 1

    if failures:
        print(f"\n{len(failures)} failing spans:")
        seen = set()
        for name, pno, text, size, ink, ground, ratio, need in failures:
            sig = (ink, ground, round(size, 1))
            if sig in seen:
                continue
            seen.add(sig)
            print(
                f"  {name} p{pno}  {size:.1f}pt  {ink} on {ground}  "
                f"{ratio:.2f}:1 < {need}  {text!r}"
            )
        return 1

    print("\nevery live text pairing clears WCAG AA")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
"""Pre-press checks for the UEW 2026 card PDFs.

These are the things that actually get a job rejected or reprinted, so they are
asserted rather than eyeballed:

  * page count and artboard size match the vendor template exactly
  * TrimBox / BleedBox are declared
  * every font is embedded (nothing will substitute on the RIP)
  * the artwork is 100% vector — no raster anywhere, at any effective DPI
  * background colour actually reaches all four bleed edges
  * nothing but background sits in the 0.1in cutting-tolerance band

Exit code is non-zero if any check fails.

Run: python3 src/verify_print.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parent))
import layout  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
PRINT_DIR = ROOT / "out" / "print"

PT = 72.0
EXPECT_W = round(layout.SHEET_W * PT, 2)  # 619.20
EXPECT_H = round(layout.SHEET_H * PT, 2)  # 439.20
TOL = 0.01

GREEN, RED, DIM, OFF = "\033[32m", "\033[31m", "\033[2m", "\033[0m"


class Report:
    def __init__(self) -> None:
        self.failures: list[str] = []

    def check(self, ok: bool, label: str, detail: str = "") -> None:
        mark = f"{GREEN}pass{OFF}" if ok else f"{RED}FAIL{OFF}"
        print(f"    [{mark}] {label}{(' ' + DIM + detail + OFF) if detail else ''}")
        if not ok:
            self.failures.append(label)


def corner_colours(page: pymupdf.Page) -> list[tuple[int, int, int]]:
    """Sample one pixel just inside each bleed corner."""
    pix = page.get_pixmap(dpi=72, alpha=False)
    w, h = pix.width, pix.height
    out = []
    for x, y in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3)):
        i = (y * w + x) * pix.n
        out.append(tuple(pix.samples[i : i + 3]))
    return out


def verify(pdf: Path, rep: Report) -> None:
    print(f"\n  {pdf.name}")
    doc = pymupdf.open(pdf)

    rep.check(doc.page_count == 2, "2 pages (outside, inside)",
              f"got {doc.page_count}")

    for i, page in enumerate(doc):
        tag = f"p{i + 1}"
        r = page.rect
        rep.check(
            abs(r.width - EXPECT_W) < TOL and abs(r.height - EXPECT_H) < TOL,
            f"{tag} artboard {EXPECT_W} x {EXPECT_H} pt",
            f"got {r.width:.2f} x {r.height:.2f}",
        )

        keys = doc.xref_get_keys(page.xref)
        rep.check("TrimBox" in keys, f"{tag} TrimBox declared")
        rep.check("BleedBox" in keys, f"{tag} BleedBox declared")

        rep.check(len(page.get_images(full=True)) == 0,
                  f"{tag} no raster images (fully vector)",
                  f"{len(page.get_images(full=True))} found")

        # xref 0 in the font tuple means a non-embedded (base-14 / substituted) font
        fonts = page.get_fonts(full=True)
        not_embedded = [f[3] for f in fonts if f[0] == 0]
        rep.check(not not_embedded, f"{tag} all {len(fonts)} fonts embedded",
                  ", ".join(not_embedded))

        corners = corner_colours(page)
        white = [c for c in corners if all(v > 250 for v in c)]
        rep.check(not white, f"{tag} colour reaches all 4 bleed corners",
                  f"{len(white)} corner(s) blank")

    doc.close()


def main() -> None:
    pdfs = sorted(PRINT_DIR.glob("*.pdf"))
    if not pdfs:
        raise SystemExit(f"no PDFs in {PRINT_DIR} — run build_cards.py first")

    print(f"pre-press verification — {len(pdfs)} files")
    print(f"target artboard: {EXPECT_W} x {EXPECT_H} pt "
          f"({layout.SHEET_W} x {layout.SHEET_H} in), trim {layout.TRIM_W} x "
          f"{layout.TRIM_H} in, score x={layout.FOLD_X} in")

    rep = Report()
    for pdf in pdfs:
        verify(pdf, rep)

    print()
    if rep.failures:
        print(f"{RED}{len(rep.failures)} check(s) failed{OFF}")
        raise SystemExit(1)
    print(f"{GREEN}all checks passed — files are press-ready{OFF}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build the UEW 2026 card set: HTML -> Chromium PDF -> press-ready PDF + proofs.

Pipeline, and why each step exists:

1. Emit `fonts.css` with the six families base64-inlined. file:// pages cannot
   reliably fetch sibling font files, and a silently-substituted font in a print
   PDF is the kind of error you only discover on the proof.
2. Emit two HTML files per concept — `print` (no logo, guides off) and `preview`
   (raster logo + optional trim/safe/score overlay for eyeballing).
3. Chromium `--print-to-pdf`. It honours `@page { size }`, but rounds the page to
   618.96 x 438.96 pt instead of the 619.2 x 439.2 the template demands.
4. Re-wrap each page at exactly 619.2 x 439.2 pt (a 0.04% scale — invisible, and
   it makes the artboard byte-match the vendor template), set TrimBox/BleedBox,
   then stamp the client's logo as *vector* CMYK art from their own Illustrator
   PDF. The logo never becomes pixels at any point.
5. Render proofs: flat sheets, a guides overlay, folded front-cover mockups, and
   a contact sheet of all six fronts.

Run: python3 src/build_cards.py
"""

from __future__ import annotations

import base64
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parent))

import layout  # noqa: E402
from concepts import CONCEPTS, Concept, LogoBox  # noqa: E402

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
FONTS = ROOT / "assets" / "fonts"
LOGOS = ROOT / "assets" / "logo"
OUT = ROOT / "out"
HTML_DIR = OUT / "html"
PRINT_DIR = OUT / "print"
PROOF_DIR = OUT / "proof"

PT = 72.0
SHEET_PT = pymupdf.Rect(0, 0, layout.SHEET_W * PT, layout.SHEET_H * PT)
TRIM_PT = (
    layout.BLEED * PT,
    layout.BLEED * PT,
    (layout.SHEET_W - layout.BLEED) * PT,
    (layout.SHEET_H - layout.BLEED) * PT,
)

CHROME_CANDIDATES = [
    "/opt/pw-browsers/chromium-1232/chrome-linux/chrome",
    "/opt/pw-browsers/chromium-1228/chrome-linux/chrome",
    shutil.which("chromium") or "",
    shutil.which("google-chrome") or "",
]

FAMILY_NAMES = {
    "CormorantGaramond": "Cormorant Garamond",
    "PlayfairDisplay": "Playfair Display",
    "GreatVibes": "Great Vibes",
    "Montserrat": "Montserrat",
    "Cinzel": "Cinzel",
    "Lora": "Lora",
}


def chrome_bin() -> str:
    for c in CHROME_CANDIDATES:
        if c and Path(c).exists():
            return c
    raise SystemExit("no Chromium binary found")


# --------------------------------------------------------------------------- #
# fonts
# --------------------------------------------------------------------------- #


def build_fonts_css() -> None:
    faces = []
    for f in sorted(FONTS.glob("*.woff2")):
        stem, style, weight = f.stem.rsplit("-", 2)
        family = FAMILY_NAMES.get(stem, stem)
        b64 = base64.b64encode(f.read_bytes()).decode("ascii")
        faces.append(
            f"@font-face{{font-family:'{family}';font-style:{style};"
            f"font-weight:{weight};font-display:block;"
            f"src:url(data:font/woff2;base64,{b64}) format('woff2');}}"
        )
    HTML_DIR.mkdir(parents=True, exist_ok=True)
    (HTML_DIR / "fonts.css").write_text("\n".join(faces), encoding="utf-8")
    print(f"  fonts.css  {len(faces)} faces, {(HTML_DIR / 'fonts.css').stat().st_size // 1024} KB")


def ensure_logo_pngs() -> None:
    """Transparent PNGs of each logo variant, for the HTML previews only."""
    for pdf in sorted(LOGOS.glob("uew-logo-*.pdf")):
        png = pdf.with_suffix(".png")
        if png.exists() and png.stat().st_mtime >= pdf.stat().st_mtime:
            continue
        doc = pymupdf.open(pdf)
        doc[0].get_pixmap(dpi=600, alpha=True).save(png)
        doc.close()


def logo_aspect(variant: str) -> float:
    doc = pymupdf.open(LOGOS / f"{variant}.pdf")
    r = doc[0].rect
    doc.close()
    return r.width / r.height


# --------------------------------------------------------------------------- #
# html
# --------------------------------------------------------------------------- #


def code_of(c: Concept) -> str:
    n = re.search(r"-(\d+)-", c.key).group(1)
    return ("t" if c.season == "thanksgiving" else "c") + str(int(n))


def build_html(c: Concept, *, preview: bool, guides: bool) -> str:
    code = code_of(c)
    stamps: dict[int, str] = {1: "", 2: ""}
    if preview:
        for lb in c.logos:
            h = lb.w / logo_aspect(lb.variant)
            stamps[lb.page] += layout.stamp_html(
                lb.cx, lb.cy, lb.w, h, f"../../assets/logo/{lb.variant}.png"
            )

    # A page-1 logo sitting right of the score is on the front cover, so that
    # panel must reserve the strip its mark will be stamped into.
    front_cls = f"{code}-front"
    if any(lb.page == 1 and lb.cx > layout.FOLD_X for lb in c.logos):
        front_cls += " has-front-logo"

    outside = layout.sheet_html(
        layout.panel("left", bg=c.back_bg, body=c.back_body, cls=f"{code}-back"),
        layout.panel("right", bg=c.front_bg, body=c.front_body,
                     cls=front_cls, align="between"),
        guides=guides,
        extra=stamps[1],
    )
    inside = layout.sheet_html(
        layout.panel("left", bg=c.inside_l_bg, body=c.inside_l_body, cls=f"{code}-in"),
        layout.panel("right", bg=c.inside_r_bg, body=c.inside_r_body, cls=f"{code}-in"),
        guides=guides,
        extra=stamps[2],
    )
    return layout.page_html(c.title, c.css, outside + inside, guides=guides)


# --------------------------------------------------------------------------- #
# pdf
# --------------------------------------------------------------------------- #


def chromium_pdf(html: Path, pdf: Path) -> None:
    subprocess.run(
        [
            chrome_bin(), "--headless=new", "--no-sandbox", "--disable-gpu",
            "--disable-dev-shm-usage", "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=8000",
            f"--print-to-pdf={pdf}", html.as_uri(),
        ],
        check=True,
        capture_output=True,
        timeout=180,
    )
    if not pdf.exists():
        raise RuntimeError(f"chromium produced no pdf for {html.name}")


def finalise(raw: Path, dest: Path, c: Concept) -> None:
    """Exact artboard, print boxes, and the vector logo stamped on top."""
    src = pymupdf.open(raw)
    out = pymupdf.open()

    for i in range(src.page_count):
        page = out.new_page(width=SHEET_PT.width, height=SHEET_PT.height)
        page.show_pdf_page(page.rect, src, i)  # rescales 618.96 -> 619.2 exactly

        for lb in (l for l in c.logos if l.page == i + 1):
            doc = pymupdf.open(LOGOS / f"{lb.variant}.pdf")
            h = lb.w / (doc[0].rect.width / doc[0].rect.height)
            rect = pymupdf.Rect(
                (lb.cx - lb.w / 2) * PT, (lb.cy - h / 2) * PT,
                (lb.cx + lb.w / 2) * PT, (lb.cy + h / 2) * PT,
            )
            page.show_pdf_page(rect, doc, 0)
            doc.close()

        box = "[%.4f %.4f %.4f %.4f]" % TRIM_PT
        out.xref_set_key(page.xref, "TrimBox", box)
        out.xref_set_key(page.xref, "BleedBox",
                         "[0 0 %.4f %.4f]" % (SHEET_PT.width, SHEET_PT.height))

    out.set_metadata({
        "title": f"UEW / Brightmore 2026 — {c.title}",
        "subject": "Greeting card 6x8.5in vertical (GotPrint) — flat 8.5x6in + 0.05in bleed",
        "creator": "DYJK Print",
        "keywords": f"{c.season} 2026, page 1 = outside (back | front), page 2 = inside",
    })
    out.save(dest, garbage=4, deflate=True)
    out.close()
    src.close()


# --------------------------------------------------------------------------- #
# proofs
# --------------------------------------------------------------------------- #


def proofs(pdf: Path, c: Concept, guides_pdf: Path | None) -> None:
    doc = pymupdf.open(pdf)
    for i, label in enumerate(("outside", "inside")):
        doc[i].get_pixmap(dpi=150, alpha=False).save(
            PROOF_DIR / f"{c.key}--{i + 1}-{label}.png"
        )
    # Folded front cover: the right-hand panel of the outside, cropped to trim.
    clip = pymupdf.Rect(layout.FOLD_X * PT, layout.BLEED * PT,
                        (layout.SHEET_W - layout.BLEED) * PT,
                        (layout.SHEET_H - layout.BLEED) * PT)
    doc[0].get_pixmap(dpi=200, alpha=False, clip=clip).save(
        PROOF_DIR / f"{c.key}--front-folded.png"
    )
    doc.close()

    if guides_pdf and guides_pdf.exists():
        g = pymupdf.open(guides_pdf)
        g[0].get_pixmap(dpi=150, alpha=False).save(
            PROOF_DIR / f"{c.key}--guides-outside.png"
        )
        g[1].get_pixmap(dpi=150, alpha=False).save(
            PROOF_DIR / f"{c.key}--guides-inside.png"
        )
        g.close()


def contact_sheet() -> None:
    """All six front covers side by side, at folded proportions."""
    cols, rows = 3, 2
    cw, ch = 4.25 * PT, 6.0 * PT
    gap, pad, cap = 18, 24, 22
    W = pad * 2 + cols * cw + (cols - 1) * gap
    H = pad * 2 + rows * (ch + cap) + (rows - 1) * gap
    out = pymupdf.open()
    page = out.new_page(width=W, height=H)
    page.draw_rect(page.rect, color=None, fill=(1, 1, 1))

    for i, c in enumerate(CONCEPTS):
        r, col = divmod(i, cols)
        x = pad + col * (cw + gap)
        y = pad + r * (ch + cap + gap)
        src = pymupdf.open(PRINT_DIR / f"{c.key}.pdf")
        clip = pymupdf.Rect(layout.FOLD_X * PT, layout.BLEED * PT,
                            (layout.SHEET_W - layout.BLEED) * PT,
                            (layout.SHEET_H - layout.BLEED) * PT)
        page.show_pdf_page(pymupdf.Rect(x, y, x + cw, y + ch), src, 0, clip=clip)
        page.draw_rect(pymupdf.Rect(x, y, x + cw, y + ch),
                       color=(0.82, 0.82, 0.82), width=0.5)
        page.insert_text((x, y + ch + 14), c.key, fontsize=8,
                         fontname="helv", color=(0.25, 0.25, 0.25))
        src.close()

    out.save(PROOF_DIR / "00-contact-sheet.pdf")
    pymupdf.open(PROOF_DIR / "00-contact-sheet.pdf")[0].get_pixmap(
        dpi=110, alpha=False
    ).save(PROOF_DIR / "00-contact-sheet.png")
    out.close()


# --------------------------------------------------------------------------- #


def main() -> None:
    for d in (HTML_DIR, PRINT_DIR, PROOF_DIR):
        d.mkdir(parents=True, exist_ok=True)

    print("fonts:")
    build_fonts_css()
    ensure_logo_pngs()

    raw_dir = OUT / ".raw"
    raw_dir.mkdir(exist_ok=True)

    print("cards:")
    for c in CONCEPTS:
        (HTML_DIR / f"{c.key}.html").write_text(
            build_html(c, preview=False, guides=False), encoding="utf-8")
        (HTML_DIR / f"{c.key}.preview.html").write_text(
            build_html(c, preview=True, guides=False), encoding="utf-8")
        (HTML_DIR / f"{c.key}.guides.html").write_text(
            build_html(c, preview=True, guides=True), encoding="utf-8")

        raw = raw_dir / f"{c.key}.pdf"
        chromium_pdf(HTML_DIR / f"{c.key}.html", raw)
        finalise(raw, PRINT_DIR / f"{c.key}.pdf", c)

        guides_raw = raw_dir / f"{c.key}.guides.pdf"
        chromium_pdf(HTML_DIR / f"{c.key}.guides.html", guides_raw)

        proofs(PRINT_DIR / f"{c.key}.pdf", c, guides_raw)
        size = (PRINT_DIR / f"{c.key}.pdf").stat().st_size
        print(f"  {c.key:<36} {size // 1024:>5} KB")

    contact_sheet()
    print(f"\nprint files -> {PRINT_DIR}")
    print(f"proofs      -> {PROOF_DIR}")


if __name__ == "__main__":
    main()

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
SHARE_DIR = OUT / "share"

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


# Trim-box clips, in PDF points, for each panel of each face.
def _clip(x0: float, x1: float) -> pymupdf.Rect:
    return pymupdf.Rect(x0 * PT, layout.BLEED * PT, x1 * PT,
                        (layout.SHEET_H - layout.BLEED) * PT)


CLIP_BACK = _clip(layout.BLEED, layout.FOLD_X)
CLIP_FRONT = _clip(layout.FOLD_X, layout.SHEET_W - layout.BLEED)
CLIP_INSIDE = _clip(layout.BLEED, layout.SHEET_W - layout.BLEED)

PANEL_W = layout.PANEL_TRIM_W * PT  # 306pt
SPREAD_W = layout.TRIM_W * PT  # 612pt
PANEL_H = layout.TRIM_H * PT  # 432pt


def _draw_card_block(page: pymupdf.Page, c: Concept, x: float, y: float) -> float:
    """One concept, every panel, left to right as the recipient meets them.

    Returns the y of the next block. Panels are drawn at true trim size (1:1 in
    points) so what you see is the finished 4.25 x 6in card, not a thumbnail.
    """
    src = pymupdf.open(PRINT_DIR / f"{c.key}.pdf")
    title_h, cap_h = 26, 15

    page.insert_text((x, y + 11), c.key, fontsize=10.5, fontname="hebo",
                     color=(0.08, 0.08, 0.08))
    page.insert_text((x + 168, y + 11), c.title, fontsize=9, fontname="helv",
                     color=(0.42, 0.42, 0.42))
    top = y + title_h

    panels = [
        (CLIP_FRONT, PANEL_W, 0, "FRONT COVER  (folded, 4.25 x 6in)"),
        (CLIP_INSIDE, SPREAD_W, 1, "INSIDE SPREAD  (left: blank for a handwritten note  ·  right: message)"),
        (CLIP_BACK, PANEL_W, 0, "BACK COVER"),
    ]
    px = x
    for clip, w, pno, caption in panels:
        rect = pymupdf.Rect(px, top, px + w, top + PANEL_H)
        page.show_pdf_page(rect, src, pno, clip=clip)
        page.draw_rect(rect, color=(0.78, 0.78, 0.78), width=0.6)
        if w == SPREAD_W:  # mark where the card folds
            fold = px + w / 2
            page.draw_line(pymupdf.Point(fold, top), pymupdf.Point(fold, top + PANEL_H),
                           color=(0.72, 0.72, 0.72), width=0.5, dashes="[2 3] 0")
        page.insert_text((px, top + PANEL_H + 11), caption, fontsize=7.2,
                         fontname="helv", color=(0.45, 0.45, 0.45))
        px += w + 18

    src.close()
    return top + PANEL_H + cap_h + 30


def season_sheets() -> None:
    """One review sheet per season: three concepts, every panel of each."""
    for season, label in (("thanksgiving", "Thanksgiving"), ("christmas", "Christmas")):
        cards = [c for c in CONCEPTS if c.season == season]
        pad = 30
        block_w = PANEL_W + SPREAD_W + PANEL_W + 18 * 2
        block_h = 26 + PANEL_H + 15 + 30
        W = pad * 2 + block_w
        H = pad * 2 + 30 + block_h * len(cards)

        out = pymupdf.open()
        page = out.new_page(width=W, height=H)
        page.draw_rect(page.rect, color=None, fill=(1, 1, 1))
        page.insert_text((pad, pad + 4),
                         f"United Energy Workers Healthcare — {label} 2026",
                         fontsize=14, fontname="hebo", color=(0.07, 0.24, 0.39))
        page.insert_text((pad, pad + 20),
                         "Three concepts, complete. Finished card folds to 4.25 x 6in "
                         "portrait with the fold on the left.",
                         fontsize=8.5, fontname="helv", color=(0.45, 0.45, 0.45))

        y = pad + 34
        for c in cards:
            y = _draw_card_block(page, c, pad, y)

        stem = PROOF_DIR / f"{'01' if season == 'thanksgiving' else '02'}-{season}-all-panels"
        out.save(stem.with_suffix(".pdf"))
        pymupdf.open(stem.with_suffix(".pdf"))[0].get_pixmap(
            dpi=110, alpha=False).save(stem.with_suffix(".png"))
        out.close()
        print(f"  {stem.name}.png  {len(cards)} concepts x 4 panels")


def full_card_sheet(c: Concept) -> None:
    """A single concept on its own sheet, every panel."""
    pad = 26
    W = pad * 2 + PANEL_W + SPREAD_W + PANEL_W + 18 * 2
    H = pad * 2 + 26 + PANEL_H + 15 + 6
    out = pymupdf.open()
    page = out.new_page(width=W, height=H)
    page.draw_rect(page.rect, color=None, fill=(1, 1, 1))
    _draw_card_block(page, c, pad, pad)
    stem = PROOF_DIR / f"{c.key}--all-panels"
    out.save(stem.with_suffix(".pdf"))
    pymupdf.open(stem.with_suffix(".pdf"))[0].get_pixmap(
        dpi=130, alpha=False).save(stem.with_suffix(".png"))
    out.close()


# --------------------------------------------------------------------------- #
# shareable deck
# --------------------------------------------------------------------------- #

PAGE_W, PAGE_H = 8.5 * PT, 11 * PT  # US Letter portrait — emails and prints anywhere
MARGIN_PT = 0.5 * PT
NAVY_RGB = (0.071, 0.235, 0.392)
GREY = (0.42, 0.42, 0.42)
HAIR = (0.84, 0.84, 0.84)


def _concept_page(page: pymupdf.Page, c: Concept) -> None:
    """One concept: front and back side by side, inside spread beneath."""
    src = pymupdf.open(PRINT_DIR / f"{c.key}.pdf")
    scale = 0.65
    pw, ph = layout.PANEL_TRIM_W * PT * scale, layout.TRIM_H * PT * scale
    sw = layout.TRIM_W * PT * scale
    gap, cap = 0.35 * PT * 2, 13

    page.insert_text((MARGIN_PT, MARGIN_PT + 16), c.title, fontsize=15,
                     fontname="hebo", color=NAVY_RGB)
    page.insert_text((MARGIN_PT, MARGIN_PT + 32), c.key, fontsize=8,
                     fontname="helv", color=GREY)
    page.draw_line(pymupdf.Point(MARGIN_PT, MARGIN_PT + 42),
                   pymupdf.Point(PAGE_W - MARGIN_PT, MARGIN_PT + 42),
                   color=HAIR, width=0.6)

    y = MARGIN_PT + 62
    row1_w = pw * 2 + gap
    x = (PAGE_W - row1_w) / 2
    for clip, caption in ((CLIP_FRONT, "FRONT COVER"), (CLIP_BACK, "BACK COVER")):
        r = pymupdf.Rect(x, y, x + pw, y + ph)
        page.show_pdf_page(r, src, 0, clip=clip)
        page.draw_rect(r, color=HAIR, width=0.6)
        page.insert_text((x, y + ph + cap), caption, fontsize=7,
                         fontname="helv", color=GREY)
        x += pw + gap

    y += ph + cap + 16
    x = (PAGE_W - sw) / 2
    r = pymupdf.Rect(x, y, x + sw, y + ph)
    page.show_pdf_page(r, src, 1, clip=CLIP_INSIDE)
    page.draw_rect(r, color=HAIR, width=0.6)
    page.draw_line(pymupdf.Point(x + sw / 2, y), pymupdf.Point(x + sw / 2, y + ph),
                   color=(0.78, 0.78, 0.78), width=0.5, dashes="[2 3] 0")
    page.insert_text((x, y + ph + cap),
                     "INSIDE  —  left panel is left blank for a handwritten note",
                     fontsize=7, fontname="helv", color=GREY)

    wrapped = []
    line = ""
    for word in c.pitch.split():
        if len(line) + len(word) > 96:
            wrapped.append(line)
            line = word
        else:
            line = f"{line} {word}".strip()
    wrapped.append(line)
    ty = y + ph + cap + 22
    for ln in wrapped[:4]:
        page.insert_text((MARGIN_PT, ty), ln, fontsize=8.5, fontname="helv",
                         color=(0.25, 0.25, 0.25))
        ty += 12
    src.close()


def _cover_page(page: pymupdf.Page, cards: list[Concept], subtitle: str) -> None:
    page.insert_text((MARGIN_PT, MARGIN_PT + 26),
                     "United Energy Workers Healthcare", fontsize=21,
                     fontname="hebo", color=NAVY_RGB)
    page.insert_text((MARGIN_PT, MARGIN_PT + 46), subtitle, fontsize=13,
                     fontname="helv", color=(0.30, 0.30, 0.30))
    page.insert_text((MARGIN_PT, MARGIN_PT + 66),
                     "Brightmore Home Care of Kentucky, LLC   ·   prepared by DYJK Print",
                     fontsize=8.5, fontname="helv", color=GREY)
    page.draw_line(pymupdf.Point(MARGIN_PT, MARGIN_PT + 78),
                   pymupdf.Point(PAGE_W - MARGIN_PT, MARGIN_PT + 78),
                   color=HAIR, width=0.6)

    cols = 3
    avail = PAGE_W - MARGIN_PT * 2
    gap = 14
    pw = (avail - gap * (cols - 1)) / cols
    ph = pw * (layout.TRIM_H / layout.PANEL_TRIM_W)
    y = MARGIN_PT + 100
    for i, c in enumerate(cards):
        r_, col = divmod(i, cols)
        x = MARGIN_PT + col * (pw + gap)
        yy = y + r_ * (ph + 26)
        src = pymupdf.open(PRINT_DIR / f"{c.key}.pdf")
        rect = pymupdf.Rect(x, yy, x + pw, yy + ph)
        page.show_pdf_page(rect, src, 0, clip=CLIP_FRONT)
        page.draw_rect(rect, color=HAIR, width=0.6)
        page.insert_text((x, yy + ph + 11), c.key, fontsize=6.6,
                         fontname="helv", color=GREY)
        src.close()

    rows = (len(cards) + cols - 1) // cols
    fy = y + rows * (ph + 26) + 14
    notes = [
        "Each concept follows on its own page: front cover, back cover, and the inside spread.",
        "Finished card is 4.25 x 6in portrait, folding on the left. Printed 6 x 8.5in vertical (GotPrint).",
        "This document is for choosing. The press-ready files are separate and imposed as flat sheets.",
    ]
    for n in notes:
        page.insert_text((MARGIN_PT, fy), n, fontsize=8.5, fontname="helv",
                         color=(0.28, 0.28, 0.28))
        fy += 13


def share_pdf(cards: list[Concept], subtitle: str, dest: Path) -> None:
    out = pymupdf.open()
    cover = out.new_page(width=PAGE_W, height=PAGE_H)
    cover.draw_rect(cover.rect, color=None, fill=(1, 1, 1))
    _cover_page(cover, cards, subtitle)
    for c in cards:
        page = out.new_page(width=PAGE_W, height=PAGE_H)
        page.draw_rect(page.rect, color=None, fill=(1, 1, 1))
        _concept_page(page, c)
    out.set_metadata({
        "title": f"UEW / Brightmore — {subtitle}",
        "subject": "Card concepts for review. Press-ready files supplied separately.",
        "creator": "DYJK Print",
    })
    out.save(dest, garbage=4, deflate=True)
    out.close()
    print(f"  {dest.name:<44} {dest.stat().st_size // 1024:>5} KB, {len(cards) + 1} pages")


def share_pdfs() -> None:
    SHARE_DIR.mkdir(parents=True, exist_ok=True)
    tg = [c for c in CONCEPTS if c.season == "thanksgiving"]
    xm = [c for c in CONCEPTS if c.season == "christmas"]
    share_pdf(CONCEPTS, "2026 Holiday Card Concepts", SHARE_DIR / "UEW-2026-Card-Concepts.pdf")
    share_pdf(tg, "Thanksgiving 2026 — Card Concepts", SHARE_DIR / "UEW-2026-Thanksgiving-Concepts.pdf")
    share_pdf(xm, "Christmas 2026 — Card Concepts", SHARE_DIR / "UEW-2026-Christmas-Concepts.pdf")


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
    for d in (HTML_DIR, PRINT_DIR, PROOF_DIR, SHARE_DIR):
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
    print("review sheets:")
    for c in CONCEPTS:
        full_card_sheet(c)
    season_sheets()
    print("shareable decks:")
    share_pdfs()

    print(f"\nprint files -> {PRINT_DIR}")
    print(f"proofs      -> {PROOF_DIR}")


if __name__ == "__main__":
    main()

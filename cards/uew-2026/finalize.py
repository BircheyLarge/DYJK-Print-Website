#!/usr/bin/env python3
"""Finish the Chromium PDFs into vendor-ready print files, then render proofs.

Chromium round-trips the CSS page size through microns and emits
618.96 x 438.96pt. GotPrint's template is exactly 619.2 x 439.2pt (8.6 x 6.1in),
so each page is re-placed into a correctly sized page -- a 1.00039x scale, which
is 0.003in across the whole sheet -- and the Trim/Bleed boxes are stamped so a
prepress operator sees the same geometry the template defines.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
OUT = ROOT / "out"

# Exact vendor geometry, in points.
PAGE_W, PAGE_H = 619.2, 439.2          # 8.6 x 6.1in, sheet with bleed
TRIM = (3.6, 3.6, 615.6, 435.6)        # 8.5 x 6.0in
FOLD_X = 309.6                         # vertical score, dead centre

TITLE = "United Energy Workers Healthcare"


def finalize(src: Path, dst: Path) -> None:
    """Re-page `src` onto exact-size pages and stamp the print boxes."""
    doc = pymupdf.open(src)
    out = pymupdf.open()
    for page in doc:
        new = out.new_page(width=PAGE_W, height=PAGE_H)
        new.show_pdf_page(pymupdf.Rect(0, 0, PAGE_W, PAGE_H), doc, page.number)
    out.set_metadata(
        {
            "title": f"{TITLE} — {src.stem}",
            "author": "DYJK Print",
            "subject": "Greeting card 6x8.5in vertical — flat 8.5x6.0in, centre score",
            "creator": "DYJK Print card build",
        }
    )
    out.save(dst, deflate=True, garbage=4)
    out.close()
    doc.close()

    # TrimBox/BleedBox have to be set on the saved file: they are page
    # attributes, and PyMuPDF only exposes the setters once a page is backed
    # by a real xref in the written document.
    doc = pymupdf.open(dst)
    for page in doc:
        page.set_bleedbox(pymupdf.Rect(0, 0, PAGE_W, PAGE_H))
        page.set_trimbox(pymupdf.Rect(*TRIM))
    doc.saveIncr()
    doc.close()


def render_png(pdf: Path, dst_dir: Path, dpi: int = 150) -> list[Path]:
    doc = pymupdf.open(pdf)
    paths = []
    for i, page in enumerate(doc):
        p = dst_dir / f"{pdf.stem}-p{i + 1}.png"
        page.get_pixmap(dpi=dpi, alpha=False).save(p)
        paths.append(p)
    doc.close()
    return paths


def label_font(size: int):
    for c in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        if Path(c).exists():
            return ImageFont.truetype(c, size)
    return ImageFont.load_default()


def contact_sheet(rows, dst: Path, title: str) -> None:
    """One column per card, outside sheet above inside sheet."""
    thumb_w = 900
    pad, gap, head, foot = 34, 16, 78, 30
    thumbs = []
    for name, pdf in rows:
        doc = pymupdf.open(pdf)
        ims = []
        for page in doc:
            zoom = thumb_w / page.rect.width
            pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            ims.append(Image.frombytes("RGB", (pix.width, pix.height), pix.samples))
        doc.close()
        thumbs.append((name, ims))

    th = thumbs[0][1][0].height
    col_w = thumb_w + pad
    W = pad + len(thumbs) * col_w
    H = head + th * 2 + gap + foot + pad
    canvas = Image.new("RGB", (W, H), "#4c555f")
    draw = ImageDraw.Draw(canvas)
    f_title = label_font(34)
    f_lab = label_font(26)
    draw.text((pad, 22), title, font=f_title, fill="#ffffff")

    for i, (name, ims) in enumerate(thumbs):
        x = pad + i * col_w
        draw.text((x, head - 34), name, font=f_lab, fill="#e8eaed")
        canvas.paste(ims[0], (x, head))
        canvas.paste(ims[1], (x, head + th + gap))
    draw.text(
        (pad, H - foot - 4),
        "top row: OUTSIDE (left panel = back cover, right panel = front cover)   "
        "bottom row: INSIDE (left = write-in panel, right = message)",
        font=label_font(21),
        fill="#cfd4d9",
    )
    canvas.save(dst)


# The four panels of a finished card, in the order you meet them: the cover you
# see closed, the spread you see open, then the back. Each is cropped to trim,
# so these are the card as it will be held rather than the flat printed sheet.
PANELS = [
    ("Front cover", 0, "right"),
    ("Inside left", 1, "left"),
    ("Inside right", 1, "right"),
    ("Back cover", 0, "left"),
]
PANEL_TRIM = {
    "left": (TRIM[0], TRIM[1], FOLD_X, TRIM[3]),
    "right": (FOLD_X, TRIM[1], TRIM[2], TRIM[3]),
}


def card_panels(pdf: Path, width: int):
    doc = pymupdf.open(pdf)
    out = []
    for label, page_no, side in PANELS:
        page = doc[page_no]
        clip = pymupdf.Rect(*PANEL_TRIM[side])
        zoom = width / clip.width
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip, alpha=False)
        out.append((label, Image.frombytes("RGB", (pix.width, pix.height), pix.samples)))
    doc.close()
    return out


def panel_sheet(rows, dst: Path, title: str) -> None:
    """One row per concept, all four panels of the finished card broken out."""
    pw = 384
    pad, gap, rowgap = 38, 20, 30
    lab_h, head = 34, 104

    sets = [(name, card_panels(pdf, pw)) for name, pdf in rows]
    ph = sets[0][1][0][1].height

    W = pad * 2 + len(PANELS) * pw + (len(PANELS) - 1) * gap
    H = head + len(sets) * (lab_h + ph + rowgap) + pad
    canvas = Image.new("RGB", (W, H), "#4c555f")
    draw = ImageDraw.Draw(canvas)
    draw.text((pad, 24), title, font=label_font(36), fill="#ffffff")

    f_col = label_font(20)
    for i, (label, _, _) in enumerate(PANELS):
        draw.text((pad + i * (pw + gap), head - 30), label.upper(), font=f_col, fill="#aeb6bf")

    f_row = label_font(26)
    for r, (name, panels) in enumerate(sets):
        y = head + r * (lab_h + ph + rowgap)
        draw.text((pad, y), name, font=f_row, fill="#ffffff")
        for i, (_, im) in enumerate(panels):
            x = pad + i * (pw + gap)
            top = y + lab_h
            canvas.paste(im, (x, top))
            # cream and white panels need an edge to read against the ground
            draw.rectangle([x, top, x + im.width - 1, top + im.height - 1], outline="#2b3138")
    canvas.save(dst)


# Vendor safe box: 0.05in inside trim, and 0.05in clear of the score line.
SAFE = (7.2, 7.2, 612.0, 432.0)
SAFE_FOLD_L, SAFE_FOLD_R = 306.0, 313.2


def check_safe_zones(folder: Path) -> bool:
    """No live text may sit outside the vendor safe box or straddle the score."""
    ok = True
    for pdf in sorted(folder.glob("*.pdf")):
        doc = pymupdf.open(pdf)
        for page in doc:
            for block in page.get_text("dict")["blocks"]:
                for line in block.get("lines", []):
                    for span in line["spans"]:
                        x0, y0, x1, y1 = span["bbox"]
                        txt = span["text"].strip()
                        if not txt:
                            continue
                        why = None
                        if not (SAFE[0] <= x0 and x1 <= SAFE[2] and SAFE[1] <= y0 and y1 <= SAFE[3]):
                            why = "outside safe box"
                        elif not (x1 <= SAFE_FOLD_L or x0 >= SAFE_FOLD_R):
                            why = "crosses the score line"
                        if why:
                            ok = False
                            print(
                                f"UNSAFE {pdf.name} p{page.number + 1}: {txt[:34]!r} "
                                f"{why} ({x0:.1f},{y0:.1f},{x1:.1f},{y1:.1f})"
                            )
        doc.close()
    print("safe-zone check: " + ("all live text inside the safe box" if ok else "FAILURES above"))
    return ok


def main() -> int:
    raw = OUT / "print"
    final = OUT / "print-final"
    proofs_png = OUT / "proof-png"
    for d in (final, proofs_png):
        d.mkdir(parents=True, exist_ok=True)

    index = json.loads((OUT / "index.json").read_text())

    for card in index:
        src = raw / f"UEW-2026-{card['id']}.pdf"
        finalize(src, final / src.name)
        # proofs get the same exact-size treatment, so a reviewer measuring one
        # is measuring the same artboard the print file uses
        proof = OUT / "proof" / f"UEW-2026-{card['id']}-proof.pdf"
        finalize(proof, proof)
        render_png(proof, proofs_png)
        render_png(final / src.name, proofs_png)

    for holiday in ("Thanksgiving", "Christmas"):
        rows = [
            (f"{c['number']} · {c['name']} · {c['direction']}", final / f"UEW-2026-{c['id']}.pdf")
            for c in index
            if c["holiday"] == holiday and not c.get("variant")
        ]
        contact_sheet(
            rows,
            OUT / f"imposition-{holiday.lower()}-2026.png",
            f"United Energy Workers Healthcare — {holiday} 2026 (printed sheets)",
        )
        panel_sheet(
            rows,
            OUT / f"cards-{holiday.lower()}-2026.png",
            f"United Energy Workers Healthcare — {holiday} 2026",
        )

    # A colourway alternative gets its own comparison sheet, so the
    # three-per-holiday choice the client is actually making stays uncluttered.
    for alt in [c for c in index if c.get("variant")]:
        base = next(
            c for c in index
            if c["holiday"] == alt["holiday"]
            and not c.get("variant")
            and c["number"] == alt["number"].rstrip("ab")
        )
        panel_sheet(
            [
                (f"{base['number']} · {base['name']}", final / f"UEW-2026-{base['id']}.pdf"),
                (f"{alt['number']} · {alt['name']}", final / f"UEW-2026-{alt['id']}.pdf"),
            ],
            OUT / f"comparison-{alt['id']}.png",
            f"{alt['holiday']} {base['number']} {base['name']} — colourway comparison",
        )

    # Split copies, for vendor flows that want one file per side.
    split = OUT / "print-final-split"
    split.mkdir(parents=True, exist_ok=True)
    for pdf in sorted(final.glob("*.pdf")):
        doc = pymupdf.open(pdf)
        for i, side in enumerate(("outside", "inside")):
            one = pymupdf.open()
            one.insert_pdf(doc, from_page=i, to_page=i)
            one[0].set_bleedbox(pymupdf.Rect(0, 0, PAGE_W, PAGE_H))
            one[0].set_trimbox(pymupdf.Rect(*TRIM))
            one.save(split / f"{pdf.stem}-{side}.pdf", deflate=True, garbage=4)
            one.close()
        doc.close()

    # Verify every finished file matches the template exactly.
    ok = True
    ok &= check_safe_zones(final)
    for pdf in sorted(final.glob("*.pdf")):
        doc = pymupdf.open(pdf)
        for page in doc:
            r, t = page.rect, page.trimbox
            good = (
                abs(r.width - PAGE_W) < 0.01
                and abs(r.height - PAGE_H) < 0.01
                and abs(t.x0 - TRIM[0]) < 0.01
                and abs(t.x1 - TRIM[2]) < 0.01
            )
            ok &= good
            print(
                f"{'ok ' if good else 'BAD'} {pdf.name} p{page.number + 1}  "
                f"{r.width:.2f}x{r.height:.2f}pt  trim {t.x0:.2f},{t.y0:.2f},{t.x1:.2f},{t.y1:.2f}"
            )
        doc.close()
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())

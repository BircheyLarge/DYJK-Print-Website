#!/usr/bin/env python3
"""Derive print-ready UEW logo variants from the client's vector source PDFs.

The client supplied the updated logo as pure-vector CMYK Illustrator PDFs. We keep
them vector the whole way through (no rasterising) so the cards stay press-quality,
and we re-colour by rewriting the CMYK operators in the content stream rather than
redrawing paths — geometry is never touched.

Outputs (all tight-cropped to the artwork bounding box):
  uew-logo-brightmore.pdf   full lockup + "Brightmore Home Care of Kentucky, LLC"
  uew-logo-brightmore-ko.pdf   navy -> white, coral kept (for navy backgrounds)
  uew-logo-corporate.pdf    corporate lockup, no Brightmore line
  uew-logo-corporate-ko.pdf    navy -> white, coral kept
  *-mono-white.pdf          every ink -> white (single-colour fallback)
"""

from __future__ import annotations

import re
from pathlib import Path

import pymupdf

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent / "assets" / "logo"

# Content-stream CMYK fill operator: "c m y k k"
CMYK_OP = re.compile(rb"([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(k|K)\b")

WHITE = (0.0, 0.0, 0.0, 0.0)


def classify(c: float, m: float, y: float, k: float) -> str:
    """Bucket a UEW brand ink. The logo only ever uses three."""
    if k > 0.1 and c > 0.5:
        return "navy"
    if m > 0.7:
        return "coral"
    return "peach"


def recolour(doc: pymupdf.Document, page: pymupdf.Page, mapping: dict[str, tuple]) -> int:
    """Rewrite CMYK fill operators in place according to `mapping`.

    Illustrator nests the artwork in Form XObjects in some exports, so the page
    content stream can be near-empty. Walk both.
    """

    def sub(match: re.Match) -> bytes:
        c, m, y, k = (float(match.group(i)) for i in range(1, 5))
        target = mapping.get(classify(c, m, y, k))
        if target is None:
            return match.group(0)
        return b"%s %s" % (b" ".join(b"%g" % v for v in target), match.group(5))

    xrefs = list(page.get_contents()) + [xo[0] for xo in page.get_xobjects()]
    if not xrefs:
        raise RuntimeError("page has no content stream")

    replaced = 0
    for xref in xrefs:
        try:
            stream = doc.xref_stream(xref)
        except (RuntimeError, ValueError):
            continue  # not a stream object (e.g. an image xobject reference)
        if stream is None or not CMYK_OP.search(stream):
            continue
        new, n = CMYK_OP.subn(sub, stream)
        doc.update_stream(xref, new)
        replaced += n

    if replaced == 0:
        raise RuntimeError("no CMYK fill operators were rewritten — colour map did not apply")
    return replaced


def art_bbox(page: pymupdf.Page) -> pymupdf.Rect:
    rects = [d["rect"] for d in page.get_drawings()]
    if not rects:
        raise RuntimeError("no vector art found")
    return pymupdf.Rect(
        min(r.x0 for r in rects),
        min(r.y0 for r in rects),
        max(r.x1 for r in rects),
        max(r.y1 for r in rects),
    )


def emit(src: Path, dest: Path, mapping: dict[str, tuple] | None = None) -> None:
    """Crop `src` to its artwork and write a tight vector PDF, optionally re-coloured."""
    if src.resolve() == dest.resolve():
        raise RuntimeError(f"refusing to overwrite source in place: {src}")
    doc = pymupdf.open(src)
    page = doc[0]
    if mapping:
        recolour(doc, page, mapping)

    clip = art_bbox(page)
    out = pymupdf.open()
    target = out.new_page(width=clip.width, height=clip.height)
    target.show_pdf_page(target.rect, doc, 0, clip=clip)
    out.save(dest, garbage=4, deflate=True)
    out.close()
    doc.close()
    print(f"  {dest.name:<34} {clip.width:7.2f} x {clip.height:6.2f} pt")


def main() -> None:
    sources = {
        "brightmore": ASSETS / "uew-envelope-source.pdf",
        "corporate": ASSETS / "uew-corporate-source.pdf",
    }
    variants = {
        "": None,
        "-ko": {"navy": WHITE},
        "-mono-white": {"navy": WHITE, "coral": WHITE, "peach": WHITE},
    }

    print("logo variants:")
    for name, src in sources.items():
        if not src.exists():
            raise SystemExit(f"missing source: {src}")
        for suffix, mapping in variants.items():
            emit(src, ASSETS / f"uew-logo-{name}{suffix}.pdf", mapping)


if __name__ == "__main__":
    main()

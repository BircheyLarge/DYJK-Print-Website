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
  *-mono-white.pdf          every CMYK ink -> white (the orbs stay coloured)
  *-solid-white.pdf         as above plus the orb shadings forced to white
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


REF = re.compile(r"(\d+) 0 R")


def _white_out_function(doc: pymupdf.Document, xref: int) -> int:
    """Force one function to return zero, whatever flavour it is."""
    obj = doc.xref_object(xref, compressed=True)

    if "/FunctionType 3" in obj:  # stitching — recurse into the parts
        funcs = re.search(r"/Functions\s*\[(.*?)\]", obj, re.S)
        return sum(_white_out_function(doc, int(m))
                   for m in REF.findall(funcs.group(1))) if funcs else 0

    if "/FunctionType 0" in obj:  # sampled table — zero every sample
        stream = doc.xref_stream(xref)
        if stream is None:
            return 0
        doc.update_stream(xref, b"\x00" * len(stream))
        return 1

    if "/FunctionType 2" in obj:  # exponential — collapse both endpoints
        done = 0
        for key in ("C0", "C1"):
            m = re.search(rf"/{key}\s*\[(.*?)\]", obj, re.S)
            if m:
                n = len(m.group(1).split())
                doc.xref_set_key(xref, key, "[" + " ".join(["0"] * n) + "]")
                done = 1
        return done

    return 0


def whiten_shadings(doc: pymupdf.Document) -> int:
    """Force every shading in the mark to paint white.

    The three coloured dots on the electrons — what the client calls the orbs —
    are not bitmaps. They are ShadingType 3 radial shadings, so re-colouring the
    `k` fill operators never touches them and they survive the knockout as warm
    specks on an otherwise white logo.

    (Worth knowing: PyMuPDF's get_image_info() reports these as small images,
    because MuPDF rasterises shadings when it inventories a page. They are vector
    in the file — nothing in the client's supplied artwork is raster.)

    The two lockups build them differently: the Brightmore file uses a sampled
    CMYK table, the corporate file an exponential ramp inside a Separation space.
    Walk from the shadings so both are covered, and zero the colour rather than
    delete the shading — the geometry is then untouched, it just paints white.
    """
    done = 0
    for xref in range(1, doc.xref_length()):
        obj = doc.xref_object(xref, compressed=True)
        if "/ShadingType" not in obj:
            continue
        m = re.search(r"/Function\s+(\d+) 0 R", obj)
        if m:
            done += _white_out_function(doc, int(m.group(1)))
    return done


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


def emit(src: Path, dest: Path, mapping: dict[str, tuple] | None = None,
         *, strip_highlights: bool = False) -> None:
    """Crop `src` to its artwork and write a tight vector PDF, optionally re-coloured."""
    if src.resolve() == dest.resolve():
        raise RuntimeError(f"refusing to overwrite source in place: {src}")
    doc = pymupdf.open(src)
    page = doc[0]
    if mapping:
        recolour(doc, page, mapping)
    if strip_highlights:
        if whiten_shadings(doc) == 0:
            raise RuntimeError("expected radial shadings for the orbs, found none")

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
        "": (None, False),
        "-ko": ({"navy": WHITE}, False),
        "-mono-white": ({"navy": WHITE, "coral": WHITE, "peach": WHITE}, False),
        # Solid white: every ink white AND the raster highlight dots removed, so
        # nothing warm survives on a dark card. This is the one to use on navy.
        "-solid-white": ({"navy": WHITE, "coral": WHITE, "peach": WHITE}, True),
    }

    print("logo variants:")
    for name, src in sources.items():
        if not src.exists():
            raise SystemExit(f"missing source: {src}")
        for suffix, (mapping, strip) in variants.items():
            emit(src, ASSETS / f"uew-logo-{name}{suffix}.pdf", mapping,
                 strip_highlights=strip)


if __name__ == "__main__":
    main()

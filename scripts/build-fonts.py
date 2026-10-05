"""Rebuild the self-hosted web fonts in src/assets/fonts/.

Downloads the upstream variable fonts from google/fonts (pinned commits,
checked by SHA-256), cuts one static instance per weight, subsets it to
Google's "latin" range plus the characters below, and writes WOFF2 files and
each family's OFL.txt.

    pip install fonttools brotli
    python3 scripts/build-fonts.py

If the metrics change (new upstream version), update the Syne fallback faces
in src/styles/global.css; tests/unit/fonts.test.ts prints the new values.
"""

import hashlib
import io
import pathlib
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "fonts"
UPSTREAM = "https://raw.githubusercontent.com/google/fonts"

FAMILIES = {
    "outfit": {
        "commit": "5f246070882b903ed95a911dba83d9d4a6836152",  # Outfit v1.100
        "font": "ofl/outfit/Outfit%5Bwght%5D.ttf",
        "sha256": "fc7287273e66929776e2ba54f144fe699080bec29f61bf649d70d871468aeade",
        "license": "ofl/outfit/OFL.txt",
        "weights": [400, 500, 600],
    },
    "syne": {
        "commit": "54fb97bd69162b95b2aa2c3996ffd71466c1aec2",  # Syne v2.200
        "font": "ofl/syne/Syne%5Bwght%5D.ttf",
        "sha256": "ce5ac77142a65cab2248a1a2ebb740b1d4d9c20b52488877d3ff664d1356104a",
        "license": "ofl/syne/OFL.txt",
        "weights": [600, 700, 800],
    },
}

# Google Fonts' "latin" subset...
LATIN = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,"
    "U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,"
    "U+FEFF,U+FFFD"
)
# ...plus the arrows the site's links use (← →), which Google leaves out, and
# the few extras Google's own latin files carry (Ă and combining accents).
EXTRA = "U+0102,U+0300-0301,U+0303,U+2190,U+2192"

# The OpenType features Google keeps in its latin subsets.
FEATURES = [
    "ccmp", "locl", "liga", "clig", "calt", "rlig", "rvrn",
    "kern", "mark", "mkmk", "frac", "numr", "dnom", "pnum", "tnum", "lnum",
]


def codepoints(ranges):
    out = []
    for part in ranges.split(","):
        start, _, end = part.strip().removeprefix("U+").partition("-")
        out.extend(range(int(start, 16), int(end or start, 16) + 1))
    return out


def fetch(path, commit):
    with urllib.request.urlopen(f"{UPSTREAM}/{commit}/{path}") as response:
        return response.read()


def main():
    unicodes = codepoints(LATIN) + codepoints(EXTRA)
    for family, spec in FAMILIES.items():
        source = fetch(spec["font"], spec["commit"])
        digest = hashlib.sha256(source).hexdigest()
        if digest != spec["sha256"]:
            raise SystemExit(f"{family}: unexpected SHA-256 {digest}")

        folder = OUT / family
        folder.mkdir(parents=True, exist_ok=True)
        (folder / "OFL.txt").write_bytes(fetch(spec["license"], spec["commit"]))

        for weight in spec["weights"]:
            # Fixed timestamps keep the output byte-for-byte reproducible.
            font = TTFont(io.BytesIO(source), recalcTimestamp=False)
            font = instancer.instantiateVariableFont(
                font, {"wght": weight}, updateFontNames=True
            )
            options = subset.Options()
            options.flavor = "woff2"
            options.layout_features = FEATURES
            options.name_IDs = ["*"]  # keeps the copyright and OFL records
            options.notdef_outline = True
            subsetter = subset.Subsetter(options=options)
            subsetter.populate(unicodes=unicodes)
            subsetter.subset(font)

            path = folder / f"{family}-latin-{weight}.woff2"
            font.flavor = "woff2"
            font.save(path)
            print(f"{path.relative_to(ROOT)}  {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()

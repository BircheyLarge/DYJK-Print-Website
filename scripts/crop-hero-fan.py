"""Cut the homepage hero's fan pieces out of the matched product shots.

Direction C showed each piece by zooming the whole 1800x1200 shot with CSS
(scale s, origin at a focal point). That downloads five full photos for five
small cards, so the same window is cut here at the source's own resolution:
a W/s x H/s rectangle whose left edge sits at ox*W*(1 - 1/s), and the same
for the top. Values are the designer's, from the draft.

    python3 scripts/crop-hero-fan.py
"""

import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "assets" / "matched"
OUT = SRC / "fan"

# name, matched shot, zoom, focal point (x, y as fractions)
PIECES = [
    ("business-card", "product-business-cards.jpg", 4.186, (0.2847, 0.5365)),
    ("menu", "product-menus.jpg", 3.636, (0.1111, 0.1034)),
    ("door-hanger", "product-door-hangers.jpg", 5.373, (0.2423, 0.3072)),
    ("brochure", "product-brochures.jpg", 3.75, (0.8788, 0.2841)),
    ("flyer", "product-flyers.jpg", 2.432, (0.1415, 0.2052)),
]


def main():
    OUT.mkdir(exist_ok=True)
    for name, shot, scale, (ox, oy) in PIECES:
        image = Image.open(SRC / shot)
        width, height = image.size
        left = round(ox * width * (1 - 1 / scale))
        top = round(oy * height * (1 - 1 / scale))
        box = (left, top, left + round(width / scale), top + round(height / scale))
        path = OUT / f"{name}.jpg"
        image.crop(box).save(path, quality=90, optimize=True)
        print(f"{path.relative_to(ROOT)}  {box}  {path.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()

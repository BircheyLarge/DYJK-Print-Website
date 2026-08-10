#!/usr/bin/env python3
"""Contrast audit for every ink/ground pairing used across the six cards.

Print has the same legibility floor as screen, and a worse failure mode: a fill
that is merely "a bit light" on a monitor can disappear into uncoated stock, or
worse, show up as a faint smudge that reads as a printing fault. A husk wheat
sprig on harvest cream measured 1.46:1 — invisible on paper.

The rule the palette follows, which this file enforces:

    light tones  (amber, goldenrod, husk)                 -> DARK grounds only
    deep tones   (rust, pumpkin, chestnut, moss, cranberry) -> LIGHT grounds only

Floors: WCAG AA 4.5:1 for text, 3:1 for meaningful non-text. Watermarks are
exempt and listed explicitly — they are drawn at 30-40% opacity precisely so
they sit below the threshold, and pretending otherwise would be dishonest.

Run: python3 src/verify_contrast.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from layout import PALETTE as P  # noqa: E402

GREEN, RED, DIM, OFF = "\033[32m", "\033[31m", "\033[2m", "\033[0m"

TEXT, DECO = 4.5, 3.0

# (label, ink, ground, floor)
PAIRINGS = [
    # --- T1 Grateful: deep navy field ------------------------------------- #
    ("T1  script harvest / navy_deep", "harvest", "navy_deep", TEXT),
    ("T1  eyebrow amber / navy_deep", "amber", "navy_deep", TEXT),
    ("T1  year amber / navy_deep", "amber", "navy_deep", TEXT),
    ("T1  rule goldenrod / navy_deep", "goldenrod", "navy_deep", DECO),
    ("T1  wheat husk / navy_deep", "husk", "navy_deep", DECO),
    ("T1  moss oak / navy_deep", "moss", "navy_deep", DECO),
    ("T1  pumpkin berry / navy_deep", "pumpkin", "navy_deep", DECO),
    ("T1  lead rust / harvest", "rust", "harvest", TEXT),
    ("T1  body ink / harvest", "ink", "harvest", TEXT),
    ("T1  msg-rule chestnut / harvest", "chestnut", "harvest", DECO),
    ("T1  inside wheat_ink / harvest", "wheat_ink", "harvest", DECO),
    # --- T2 Give Thanks: harvest cream field ------------------------------- #
    ("T2  eyebrow rust / harvest", "rust", "harvest", TEXT),
    ("T2  display navy / harvest", "navy", "harvest", TEXT),
    ("T2  body ink / harvest", "ink", "harvest", TEXT),
    ("T2  rust maple / harvest", "rust", "harvest", DECO),
    ("T2  chestnut oak / harvest", "chestnut", "harvest", DECO),
    ("T2  moss leaf / harvest", "moss", "harvest", DECO),
    ("T2  pumpkin maple / harvest", "pumpkin", "harvest", DECO),
    ("T2  wheat_ink oak / harvest", "wheat_ink", "harvest", DECO),
    ("T2  cranberry berry / harvest", "cranberry", "harvest", DECO),
    ("T2  msg-rule chestnut / harvest", "chestnut", "harvest", DECO),
    # --- T3 Thankful: burnt rust field ------------------------------------- #
    ("T3  display harvest / rust", "harvest", "rust", TEXT),
    ("T3  eyebrow harvest / rust", "harvest", "rust", TEXT),
    ("T3  year harvest / rust", "harvest", "rust", TEXT),
    ("T3  ring husk / rust", "husk", "rust", DECO),
    ("T3  wheat husk / rust", "husk", "rust", DECO),
    ("T3  leaves husk / rust", "husk", "rust", DECO),
    ("T3  lead rust / harvest", "rust", "harvest", TEXT),
    ("T3  msg-rule chestnut / harvest", "chestnut", "harvest", DECO),
    # --- Christmas: core brand palette ------------------------------------- #
    ("C1  script cream / navy_deep", "cream", "navy_deep", TEXT),
    ("C1  eyebrow peach / navy_deep", "peach", "navy_deep", TEXT),
    ("C1  orbits peach / navy_deep", "peach", "navy_deep", DECO),
    ("C1  lead coral_ink / cream", "coral_ink", "cream", TEXT),
    ("C1  body ink / cream", "ink", "cream", TEXT),
    ("C2  eyebrow coral_ink / ivory", "coral_ink", "ivory", TEXT),
    ("C2  lead coral_ink / ivory", "coral_ink", "ivory", TEXT),
    ("C2  rule coral / ivory", "coral", "ivory", DECO),
    ("C2  body ink / ivory", "ink", "ivory", TEXT),
    ("C2  display navy / ivory", "navy", "ivory", TEXT),
    ("C2  trees navy / ivory", "navy", "ivory", DECO),
    ("C3  display cream / navy_deep", "cream", "navy_deep", TEXT),
    ("C3  wreath peach / navy_deep", "peach", "navy_deep", DECO),
    ("C3  gold star / navy_deep", "gold", "navy_deep", DECO),
    ("C3  lead coral_ink / cream", "coral_ink", "cream", TEXT),
    ("C3  body ink / cream", "ink", "cream", TEXT),
]

# The client's supplied logo, measured against the grounds we actually place it
# on. REPORTED, NOT ENFORCED — this is their mark, and redrawing it so it passes
# a checker is not our call. Colours sampled from their own vector file.
LOGO_ON_LIGHT = [
    ("orbit rings (light coral)", "#F8A383", "harvest"),
    ("orbit rings (light coral)", "#F8A383", "cream"),
    ("orbit rings (light coral)", "#F8A383", "ivory"),
    ("UNITED / HEALTHCARE (coral)", "#F05932", "harvest"),
    ("UNITED / HEALTHCARE (coral)", "#F05932", "cream"),
    ("UNITED / HEALTHCARE (coral)", "#F05932", "ivory"),
]

# Drawn at 30-40% opacity on purpose; they are texture, never information.
EXEMPT = [
    "corner_orbit watermark on the inside-left write-in panel (goldenrod/peach, 30-42% opacity)",
    "back-panel ornament (navy_soft on navy_deep, deliberately near-invisible)",
]


def luminance(hex_colour: str) -> float:
    ch = [int(hex_colour[i : i + 2], 16) / 255 for i in (1, 3, 5)]
    ch = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in ch]
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]


def ratio(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def main() -> None:
    print("contrast audit — WCAG AA (4.5:1 text, 3:1 non-text)\n")
    failures = []
    for label, ink, ground, floor in PAIRINGS:
        r = ratio(P[ink], P[ground])
        ok = r >= floor
        mark = f"{GREEN}pass{OFF}" if ok else f"{RED}FAIL{OFF}"
        note = "" if ok else f"  needs {floor}:1"
        print(f"  [{mark}] {r:5.2f}:1  {label}{note}")
        if not ok:
            failures.append((label, r, floor))

    print(f"\n{DIM}client's own logo artwork on light grounds "
          f"(reported, not enforced — their mark, not ours to redraw):{OFF}")
    for element, colour, ground in LOGO_ON_LIGHT:
        r = ratio(colour, P[ground])
        note = "" if r >= 3.0 else "   faint on warm uncoated stock"
        print(f"{DIM}    {r:5.2f}:1  {element} on {ground}{note}{OFF}")
    print(f"{DIM}    (navy and rust cards use the knockout / mono-white "
          f"variants, so this does not apply there){OFF}")

    print(f"\n{DIM}exempt by design:{OFF}")
    for e in EXEMPT:
        print(f"{DIM}  - {e}{OFF}")

    print()
    if failures:
        print(f"{RED}{len(failures)} pairing(s) below floor{OFF}")
        raise SystemExit(1)
    print(f"{GREEN}all {len(PAIRINGS)} pairings clear{OFF}")


if __name__ == "__main__":
    main()

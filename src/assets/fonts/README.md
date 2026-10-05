# Web fonts

The type from Stan's Card B (#myfkg6), self-hosted:

| Family | Weights       | Token            | Use          |
| ------ | ------------- | ---------------- | ------------ |
| Outfit | 400, 500, 600 | `--font-sans`    | body and UI  |
| Syne   | 600, 700, 800 | `--font-display` | display type |

Each file is one static weight in WOFF2 (13–14 KB). It's subset to Google
Fonts' "latin" range, plus ← and →, which the site's links use but Google's
subset leaves out. They're cut from google/fonts' Outfit v1.100 and Syne v2.200,
the versions the card was set in. To rebuild them, run
`python3 scripts/build-fonts.py` (needs `pip install fonttools brotli`). The
script pins the upstream commits and checks their hashes.

Both families are under the SIL Open Font License 1.1 (`OFL.txt` in each
folder). Each file also keeps its copyright and license records.

- **Loading:** Astro's fonts API (`fonts` in `astro.config.mjs`, `<Font>` in
  `BaseHead.astro`) writes the `@font-face` rules and preloads Outfit 400 and
  Syne 700.
- **Outfit fallback:** the API generates Outfit's metric-matched fallback.
- **Syne fallbacks:** these are in `global.css`, one per weight, because Syne
  gets much wider as it gets heavier. `tests/unit/fonts.test.ts` keeps them in
  step with these files.
- **Missing characters:** anything outside the subset falls back to a system
  font. `tests/e2e/fonts.spec.ts` fails if any page draws text that way.

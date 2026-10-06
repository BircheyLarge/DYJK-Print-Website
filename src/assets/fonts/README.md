# Web fonts

Outfit, the site's one typeface since Stanley asked for readable headings:

| Family | Weights            | Token         | Use                                |
| ------ | ------------------ | ------------- | ---------------------------------- |
| Outfit | 400, 500, 600, 700 | `--font-sans` | body, UI, h3 at 600, h1/h2 at 700 |
| Syne   | 600, 700, 800      | (none)        | only the dev drafts, being removed |

Each file is one static weight in WOFF2 (13–14 KB). It's subset to Google
Fonts' "latin" range, plus ← and →, which the site's links use but Google's
subset leaves out. They're cut from google/fonts' Outfit v1.100, the version
Stan's card was set in. To rebuild them, run `python3 scripts/build-fonts.py`
(needs `pip install fonttools brotli`). The script pins the upstream commits
and checks their hashes.

The fonts are under the SIL Open Font License 1.1 (`OFL.txt` in each folder).
Each file also keeps its copyright and license records.

- **Loading:** Astro's fonts API (`fonts` in `astro.config.mjs`, `<Font>` in
  `BaseHead.astro`) writes the `@font-face` rules and preloads the faces each
  page's first screen draws with.
- **Fallbacks:** in `global.css`, one per weight, because Outfit 700 is 3.6%
  wider than 400. `tests/unit/fonts.test.ts` keeps them in step with these
  files.
- **Missing characters:** anything outside the subset falls back to a system
  font. `tests/e2e/fonts.spec.ts` fails if any page draws text that way.

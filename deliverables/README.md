# Deliverables — downloadable copies

`/workspace/*.zip` is a path inside the build container and is not reachable from
a laptop. This directory holds the same bundle inside the repository, so it can be
downloaded over HTTPS without a checkout.

| File | |
|---|---|
| `UEW-2026-FINAL-two-cards.zip` | the two cards the client selected: print-ready PDFs, proofs with guides, and a plain-English README for the printer |

Verified identical (SHA-256) to `cards/uew-2026/out/print-final/` at the time of
commit. If those files change, re-copy the zip — a stale bundle is the one that
gets uploaded by mistake.

The two selected cards, individually:

- `cards/uew-2026/out/print-final/UEW-2026-thanksgiving-02b-harvest-navy.pdf`
- `cards/uew-2026/out/print-final/UEW-2026-holiday-01-ornament.pdf`

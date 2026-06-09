# FRAC-44 — .text-control: invert case rule to uppercase

**Task:** task_01KTN7HS7XJ9QAJJ06KKCDBKPZ
**Branch:** frac-23-apply-home (bundled into PR #186)
**Origin:** FRAC-23 local review — user wants the JBM all-caps chrome identity preserved on inputs.

## Plan

1. `src/index.css` `.text-control` rule: change `text-transform: none` → `text-transform: uppercase`. Keep `letter-spacing: normal` (chrome tier's 0.1em tracking on typed text looks weird).
2. `DESIGN.md` — update the `.text-control` table row and the rationale paragraph to reflect the new spec. New rationale: `.text-control` keeps the chrome tier's `font-mono uppercase` identity but sizes up to `text-base` (16px = iOS no-zoom threshold) and drops the tracking. Typed text rendering uppercase is accepted per user review.
3. Commit on `frac-23-apply-home` so PR #186 carries the corrected design.

## Acceptance

- `.text-control` is uppercase in compiled CSS.
- DESIGN.md spec matches.
- Hero search input renders "EXPLORE FRACTAL..." uppercase placeholder; typed text uppercase; mirror span still tracks caret correctly.
- Lab archive search (the other `.text-control` consumer) also flips to uppercase — verify nothing else depends on the lowercase rendering.
- typecheck + tests baseline-only.

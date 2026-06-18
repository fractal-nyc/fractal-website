# FRAC-221 — LiberalArts heading: replace hand-rolled .text-display clone with utility

**Complexity:** low (one-line, fully specified).
**Source:** `/design-audit` 2026-06-17, CONSOLIDATE #3.

## Problem
`src/components/sections/LiberalArts.tsx:11` hand-rolls the Display tier:
`font-serif not-italic font-light text-3xl md:text-7xl tracking-[0.04em] uppercase leading-[1.1]`.
This is ~95% identical to the `.text-display` utility (`font-serif text-4xl md:text-7xl; normal;
weight 300; uppercase; tracking 0.04em; line-height 1.1`). The only difference is the **mobile size**
(`text-3xl` here vs the utility's `text-4xl`) — a near-miss = accidental drift.

## Change
Replace the class soup on the `<p>` with `.text-display`, preserving the non-type classes
(`mb-4 md:mb-6 text-center`).
- If the smaller `text-3xl` mobile size is intentional (it's a 4-word phrase, not a page H1), keep it
  as an explicit override: `class="text-display text-3xl md:text-7xl mb-4 md:mb-6 text-center"`.
- Otherwise use `.text-display` outright and let it default to `text-4xl` on mobile.
Decide by eye against the design intent; document the choice in the review comment.

## Acceptance criteria
- The heading uses `.text-display` (with at most an explicit size override).
- No bespoke `tracking-[..]`/`leading-[..]`/`not-italic`/`font-light` type soup remains on that node.
- Rendering matches intent (note any deliberate mobile-size override).
- `pnpm test` passes; build succeeds.

## Verify
`pnpm typecheck && pnpm test`

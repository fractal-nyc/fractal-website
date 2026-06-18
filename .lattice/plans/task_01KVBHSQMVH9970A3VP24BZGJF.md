# FRAC-222 — design-conformance: prune 7 stale grandfathered baseline colors

**Complexity:** low (tooling-driven, fully specified).
**Source:** `/design-audit` 2026-06-17, CONSOLIDATE #4.

## Problem
`scripts/design-conformance.baseline.json` lists 35 grandfathered colors, but only 28 are still used
in `src/` (the gate prints "28 grandfathered values"). Seven entries are dead — grandfathered for
code that no longer exists. DESIGN.md §"Design conformance" explicitly calls to "burn down the
grandfathered baseline over time."

Stale values (verified absent from `src/`): `#3d4654 #4e5869 #5a6577 #6b7585 #7a8494 #d8dce2 #dde0e5`.

## Change
Run `node scripts/design-conformance.mjs --update-baseline`. This regenerates the baseline from
values actually used in `src/`, dropping the 7 dead entries. Inspect the diff to confirm ONLY the 7
expected values are removed and nothing currently-used is dropped.

## Acceptance criteria
- Baseline `colors` length == distinct used values (28), down from 35.
- The 7 listed values are gone; no other change beyond those removals.
- `node scripts/design-conformance.mjs` exits 0 (green).

## Verify
`node scripts/design-conformance.mjs && git diff scripts/design-conformance.baseline.json`
(diff shows exactly the 7 removals)

# FRAC-220 — TagFilter: focus ring raw hex → house-publications-deep token

**Complexity:** low (one-line, fully specified).
**Source:** `/design-audit` 2026-06-17, CONSOLIDATE #2.

## Problem
`src/components/lab/TagFilter.tsx:53` uses a raw-hex focus ring `focus:ring-[#C44878]/40`. `#C44878`
is exactly the `house-publications-deep` token. DESIGN.md §Borders already cites the token form for
the sibling lab border (`focus:border-house-publications-deep/60`), so the raw hex is inconsistent
drift.

## Change
`focus:ring-[#C44878]/40` → `focus:ring-house-publications-deep/40` (single edit, line 53).

## Acceptance criteria
- No raw hex in `TagFilter.tsx` (`rg '#[0-9a-fA-F]' src/components/lab/TagFilter.tsx` → empty).
- Focus ring renders visually identical (same color + 40% opacity).
- `pnpm conformance` green, `pnpm test` passes.

## Verify
`pnpm test && pnpm conformance`

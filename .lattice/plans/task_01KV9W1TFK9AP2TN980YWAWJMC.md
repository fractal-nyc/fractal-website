# FRAC-217: TagFilter pills — full house-accent border on hover

One-line style change, follow-up to FRAC-216 (DocumentCard hover).

## Change
`src/components/lab/TagFilter.tsx:55` — the inactive-pill hover branch:
`hover:border-[#C44878]/40 hover:text-foreground` → `hover:[border-color:var(--accent,currentColor)] hover:text-foreground`.

- Drops the `/40` softening (40% → full opacity) — same fix as DocumentCard.
- Uses the `--accent` emphasis token instead of a raw hex; LabPage sets `--accent: var(--color-house-publications-deep)` (#C44878), and TagFilter renders within that scope (LabPage → ArchiveToolbar → TagFilter), so the color is unchanged.
- Bonus: removes a raw grandfathered hex from a className (conformance win).
- Resting border stays `var(--foreground-faint)` (structural, inline style); active-pill inline `LAB_DEEP` styles unchanged.

## Out of scope
- `focus:ring-[#C44878]/40` (line 53) — a focus STATE ring, intentionally softened; leave it.
- The active-pill inline `LAB_DEEP` bg/border styles.

## Acceptance
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass.
- `pnpm test` at FRAC-199 baseline (7 pre-existing failures), no new.
- No other styling changed.

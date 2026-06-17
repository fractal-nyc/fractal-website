# FRAC-216: DocumentBadge full-accent hover + rename to DocumentCard

Two related changes to `src/components/lab/DocumentBadge.tsx` and its references. One PR, two commits.

## Commit 1 — full house-accent border on hover
In the card's `<a>` className: `hover:border-house-publications-deep/40` → `hover:[border-color:var(--accent,currentColor)]`.
- Emphasis tier (matches FRAC-215 border system: themed edge via the page's `--accent`).
- Lab page sets `--accent: var(--color-house-publications-deep)` (#C44878) — same pink the card's icons already use, so the *color* is unchanged; only the resting `/40` softening is removed (40% → full opacity), which is the change the user wanted (they never noticed the soft pink, only the scale/shadow/corner-extend on hover).
- Resting border stays `border-foreground-faint` (structural). Focus ring stays `ring-foreground`.

## Commit 2 — rename DocumentBadge → DocumentCard
"Badge" misleads: it's a full clickable card (and is the explicit model for `TalkCard`). `DocumentCard` is collision-free and consistent with `TalkCard`.
- `git mv src/components/lab/DocumentBadge.tsx src/components/lab/DocumentCard.tsx`
- Inside: `DocumentBadge` → `DocumentCard`, `DocumentBadgeProps` → `DocumentCardProps`, header comment.
- `src/components/lab/DocumentGrid.tsx`: import path `./DocumentBadge` → `./DocumentCard`, symbol `DocumentBadge` → `DocumentCard` (1 import + 3 usages).
- `src/pages/StoryPage.tsx:118`: comment `styled after DocumentBadge` → `styled after DocumentCard`.

## Acceptance
- `grep -rn "DocumentBadge" src/` → 0.
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass.
- `pnpm test` at FRAC-199 baseline (7 pre-existing failures), no new ones.
- No test references DocumentBadge (verified); DocumentCard collision-free (verified).

## Out of scope
- TagFilter's `hover:border-[#C44878]/40` pill hover (the other flagged follow-up) — separate concern, not touched here.

# FRAC-206: FractalPattern var()→hex on PoliticalClub + People pages

## Context
The z-index stacking half of this task was folded into FRAC-205. This task now covers ONLY
the remaining latent bug: `FractalPattern` renders its `color` prop into SVG `stroke`/`fill`
presentation attributes, where `var()` does NOT resolve. Two pages (both merged but hidden
from launch) still pass a CSS var, so the pattern strokes silently fail to paint:
- `PoliticalClubPage.tsx:15` — `<FractalPattern color="var(--color-house-political-club-light)" />`
- `PeoplePage.tsx:15` — `<FractalPattern color="var(--color-section-people-deep)" />`

## Fix — mirror the established StoryPage/FRAC-205 pattern
StoryPage sources a real hex from the data model (`const STORY_COLOR = SECTIONS.story.accent;`)
and passes it to `<FractalPattern color={STORY_COLOR} />`. Do the same:

### PeoplePage.tsx
- Add `import { SECTIONS } from "@/data/houses";`
- Add a module const (with a short comment): `const PEOPLE_COLOR = SECTIONS.people.deep;` (= `#B65D19`)
- `<FractalPattern color="var(--color-section-people-deep)" />` → `<FractalPattern color={PEOPLE_COLOR} />`

### PoliticalClubPage.tsx
- Add `import { HOUSES } from "@/data/houses";`
- Add a module const (mirrors how DocumentCard/TagFilter source LAB_DEEP):
  `const PC_COLOR = HOUSES.find((h) => h.id === "forum")!.palette.light;` (= `#C83858`)
- `<FractalPattern color="var(--color-house-political-club-light)" />` → `<FractalPattern color={PC_COLOR} />`

## Explicitly OUT of scope (do NOT change)
- The `SectorHeader` `color="var(--color-...)"` props on both pages. SectorHeader renders `color`
  in **CSS** (`style={{ color }}`), where `var()` resolves correctly — matches StoryPage, which
  also keeps `color="var(--color-section-story)"` on its SectorHeader. Leave them.
- The `--accent` inline style on each `<main>` (CSS context, correct as-is).

## Acceptance
- Both pages pass a real hex (via data-model const) to `FractalPattern`; no `var()` reaches an
  SVG attribute.
- The two consts resolve to the same colors the tokens hold (#C83858 PC, #B65D19 People).
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass (consts come from the data model — no
  new literal quoted hex in the pages).
- `pnpm test` at FRAC-199 baseline (7 pre-existing failures), no new.
- Note: both pages are hidden from launch, so this is a latent-correctness fix (not user-visible
  yet) — no visual preview gate required.

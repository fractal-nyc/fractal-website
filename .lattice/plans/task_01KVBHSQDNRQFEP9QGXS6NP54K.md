# FRAC-219 — FractalPattern: literal house-hex → data-model ref on 5 pages

**Complexity:** low (fully specified — drift located, fix named, files identified).
**Source:** `/design-audit` 2026-06-17 (notes/design-audit-20260617.md), CONSOLIDATE #1.

## Problem
`<FractalPattern color={...} />` injects its `color` into SVG `stroke`/`fill` presentation
attributes, where `var()` does not resolve. FRAC-206 established the sanctioned fix — source the
color from the data model (`HOUSES`/`SECTIONS`), mirroring `StoryPage`'s `STORY_COLOR` — and applied
it to PoliticalClub + People. Five pages still pass a **literal house hex**, duplicating a token
value (the exact thing DESIGN.md §Colors warns against).

## Scope — 5 files, each gets a named color const sourced from the data model
| File | Current literal | = token | Replace with |
|---|---|---|---|
| `src/pages/CampusPage.tsx:14` | `#1A3A2E` | house-campus-deep | `HOUSES.find(h => h.id === "campus")!.palette.deep` |
| `src/pages/NeighborhoodPage.tsx:17` | `#4A5A30` | house-visit-deep | `HOUSES.find(h => h.id === "neighborhood")!.palette.deep` |
| `src/pages/LabPage.tsx:20` | `#C44878` | house-publications-deep | `HOUSES.find(h => h.id === "lab")!.palette.deep` |
| `src/pages/EventsPage.tsx:20` | `#C13B2A` | house-events-deep | `HOUSES.find(h => h.id === "events")!.palette.deep` |
| `src/pages/LiberalArtsPage.tsx:14` | `#C41E20` | house-education-light | `HOUSES.find(h => h.id === "school")!.palette.light` |

Note the internal IDs (neighborhood/events/campus/school/lab) per DESIGN.md §Houses, and that
**LiberalArts (Education) inverts** — its FractalPattern uses `.light` (its accent), matching the
page's `--accent: var(--color-house-education-light)`. Verify each page's existing `--accent` on
`<main>` and source the matching palette member so the wallpaper and accent stay in lockstep.

## Approach (mirror `PoliticalClubPage.tsx:12`)
1. In each page, import `HOUSES` (check exact export name + path used by PoliticalClubPage).
2. Add a module-level `const <PAGE>_COLOR = HOUSES.find(...)!.palette.<light|deep>;` with a one-line
   comment citing the SVG-presentation-attr reason (as PoliticalClubPage does).
3. `<FractalPattern color={<PAGE>_COLOR} />`.

## Acceptance criteria
- No literal hex remains in these 5 files (`rg '#[0-9a-fA-F]{6}' src/pages/{Campus,Neighborhood,Lab,Events,LiberalArts}Page.tsx` → empty).
- Each FractalPattern color equals its page's `--accent` value (lockstep preserved).
- `pnpm conformance` green, `pnpm typecheck` clean, `pnpm test` passes, build succeeds.
- Pages render visually identical.

## Verify
`pnpm typecheck && pnpm test && pnpm conformance && pnpm build`

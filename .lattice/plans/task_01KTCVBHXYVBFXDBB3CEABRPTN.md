# FRAC-34: Remove #6B4C9A Lab purple — migrate to canonical Lab palette

## Scope

DESIGN.md decision #7 (FRAC-19 design decisions, 2026-06-05) declares:

> Lab purple `#6B4C9A` is dead. DESIGN.md does NOT declare a `house-publications-accent` token. Lab has exactly two color tokens: `house-publications-light` (#E870A0) and `house-publications-deep` (#C44878). The raw `#6B4C9A` sites in `src/components/lab/` are legacy from pre-FRAC-24 and must be replaced.

This task replaces every raw `#6B4C9A` literal in `src/components/lab/*` with `palette.deep` (`#C44878`). The two `const LAB_COLOR = "#6B4C9A"` declarations are replaced by reading from `HOUSES` so the literal is removed from JS source. Tailwind arbitrary-value classes (e.g., `ring-[#6B4C9A]/40`) inline the hex `#C44878` directly since Tailwind cannot consume runtime constants.

The `houses.ts:319` `color: "#6B4C9A"` field is DEFERRED — see below.

## Why every site → palette.deep

LabPage sets `style={{ backgroundColor: "#E870A0" }}` (palette.light) as the page bg, and uses `#C44878` (palette.deep) for the FractalPattern wallpaper + SectorHeader accent. The 9 cleanup sites sit on either cream cards or the pink page bg. `palette.deep` reads correctly on both, matches LabPage's existing accent treatment, and keeps focus/hover/active states visually consistent. Implementer may pick `palette.light` on a per-site basis if the deep choice looks wrong in practice; the rubric is "default to deep, dissent allowed for visual reasons."

## Sites to edit

### `src/components/lab/TagFilter.tsx`
- **Line 8** — replace `const LAB_COLOR = "#6B4C9A";` with import + `const LAB_DEEP = HOUSES.find(h => h.id === "lab")!.palette.deep;`
- **Line 52** — `focus:ring-[#6B4C9A]/40` → `focus:ring-[#C44878]/40`
- **Line 54** — `hover:border-[#6B4C9A]/40` → `hover:border-[#C44878]/40`
- **Lines 59-60** — `backgroundColor: LAB_COLOR, borderColor: LAB_COLOR,` → `backgroundColor: LAB_DEEP, borderColor: LAB_DEEP,`

### `src/components/lab/ArchiveSearch.tsx`
- **Line 45** (two hits on same line) — `focus:ring-[#6B4C9A]/40 focus:border-[#6B4C9A]/60` → `focus:ring-[#C44878]/40 focus:border-[#C44878]/60`
- **Line 60** — `focus:ring-[#6B4C9A]/40` → `focus:ring-[#C44878]/40`

### `src/components/lab/DocumentBadge.tsx`
- **Line 33** — replace `const LAB_COLOR = "#6B4C9A";` with import + `const LAB_DEEP = HOUSES.find(h => h.id === "lab")!.palette.deep;`
- **Line 59** — `hover:border-[#6B4C9A]/40` → `hover:border-[#C44878]/40`
- **Line 70** — `backgroundColor: \`${LAB_COLOR}20\`` → `backgroundColor: \`${LAB_DEEP}20\``
- **Line 75** — `color: LAB_COLOR` → `color: LAB_DEEP`
- **Line 80** — `color: LAB_COLOR` → `color: LAB_DEEP`
- **Line 115** — `backgroundColor: LAB_COLOR` → `backgroundColor: LAB_DEEP`

### `src/components/lab/ArchiveToolbar.tsx`
- **Line 64** — `focus:ring-[#6B4C9A]/40` → `focus:ring-[#C44878]/40`

(Line numbers per planner findings; implementer should grep to confirm before editing — sibling agents may have shifted lines.)

## `houses.ts:319 color` field: DEFERRED

The `color: "#6B4C9A"` literal at `src/data/houses.ts:319` is **out of scope**.

**Why defer:**
1. `color: string` is a **required** field on the `House` interface (`houses.ts:44`). Removing only Lab's value won't compile.
2. `HouseBanner.tsx:95-96` reads `house.color` in its `?? house.color` fallback. Half-removal would leave a dead reference; full removal requires deleting `color` from all 6 house entries, making the field optional (or removing from interface), and dropping the HouseBanner fallback path. That's a system-wide cleanup, not a Lab-specific one.
3. The legacy purple field has zero runtime visual impact today — every house has a `palette`, so the `?? house.color` branch is dead code.

**Recommended follow-up task:** "Remove deprecated `color` field from all 6 House entries; make optional or delete from interface; drop HouseBanner fallback."

## Out of scope

- `houses.ts:319 color` field (deferred above).
- Other purples in the codebase that aren't `#6B4C9A` (none exist per repo grep).
- FRAC-46 charcoal drift (separate ticket).

## Approach

1. Branch from master: `git checkout -b frac-34-lab-purple-remove`.
2. Edit the 4 files in `src/components/lab/`. For TagFilter + DocumentBadge, replace the `const LAB_COLOR` with an import-backed `LAB_DEEP`. For Tailwind arbitrary classes, inline `#C44878` literally.
3. Typecheck (`pnpm tsc --noEmit` or equivalent).
4. Run test suite.
5. `pnpm dev` and visually verify `/lab` at 375px + desktop.
6. Confirm `grep -ri "#6B4C9A" src/` returns exactly ONE hit (`src/data/houses.ts:319`).
7. Commit, push, open PR.

## Acceptance criteria

- `grep -ri "#6B4C9A" src/` returns exactly 1 hit, and it's `src/data/houses.ts:319`. Zero hits in `src/components/lab/*`.
- `grep -rn "LAB_COLOR" src/` returns zero hits.
- TypeScript build passes.
- Test suite passes (no new failures vs. baseline 141 pass / 4 known-fail).
- Visual smoke at 375px and desktop on `/lab`:
  - DocumentBadge icon/label/accent-bar/hover-border render in `#C44878`.
  - ArchiveSearch focus ring + border, clear-button ring render in `#C44878`/40 + /60.
  - ArchiveToolbar "Clear filters" focus ring renders in `#C44878`/40.
  - TagFilter pill states render in `#C44878` (note: TagFilter is hidden via `showTags={false}` on LabPage today — verify by temporarily flipping the prop locally).
- PRD check (FRAC-22): no product surface / navigation / copy change; purely a color cleanup.

## Branch name

`frac-34-lab-purple-remove`

## Critical files

- `/Users/fractalos/Dev/fractal-nyc/src/components/lab/TagFilter.tsx`
- `/Users/fractalos/Dev/fractal-nyc/src/components/lab/DocumentBadge.tsx`
- `/Users/fractalos/Dev/fractal-nyc/src/components/lab/ArchiveSearch.tsx`
- `/Users/fractalos/Dev/fractal-nyc/src/components/lab/ArchiveToolbar.tsx`
- `/Users/fractalos/Dev/fractal-nyc/src/data/houses.ts` (reference; the `color: "#6B4C9A"` field at L319 is DEFERRED, not touched)
- `/Users/fractalos/Dev/fractal-nyc/src/pages/LabPage.tsx` (reference — visual context for color choice)
- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` (reference — decision #7)

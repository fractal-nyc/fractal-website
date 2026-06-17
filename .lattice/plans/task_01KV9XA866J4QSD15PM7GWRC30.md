# FRAC-218 — knip dead-code sweep (verified plan)

**Branch:** `frac-218-knip-sweep`
**Source of findings:** one-off `pnpm dlx knip` (default config, knip NOT added as a dep).
**Method:** every finding grep-verified across `src/` (incl. `src/__tests__/`). `.claude/worktrees/**` and `notes/.recovered/**` ignored — not real source.

## Verdict legend
- **SAFE-DELETE** — zero references outside its own declaration. Delete the whole declaration (and the file, where applicable).
- **DOWNGRADE-EXPORT** — referenced only *inside* its own file (over-exported). KEEP the declaration; remove only the `export` keyword.
- **KEEP** — knip false positive; the symbol *is* used (re-export consumer, internal type, etc.). Leave untouched.

## Verdict table

| # | Finding | Location | Verdict | Evidence (refs outside own decl) |
|---|---------|----------|---------|----------------------------------|
| 1 | `Skyline.tsx` (file) | src/components/three/Skyline.tsx | **SAFE-DELETE** | `grep -rn "Skyline" src/` → only `export function Skyline()` at line 27. Zero importers, not in the three.js scene graph. |
| 2 | `use-mobile.tsx` (file) | src/hooks/use-mobile.tsx | **SAFE-DELETE** | `grep -rn "use-mobile\|useMobile\|useIsMobile" src/` → only `export function useIsMobile()` at line 5. Zero importers. |
| 3 | `@testing-library/user-event` (devDep) | package.json:39 | **SAFE-DELETE** | Zero `user-event`/`userEvent` refs in `src/`. `vitest.config.ts` setup is `./src/test-setup.ts`, which imports only `@testing-library/jest-dom/vitest`. |
| 4 | `OUTER_NAV_NODES` (export) | OctahedronHero.tsx:105 | **SAFE-DELETE** (re-export line only) | The real `const` lives in `heroNavNodes.ts:29` and is used by Hero.tsx:13/138 + OctahedronHero.tsx:106/1017. Line 105 is a **dead back-compat re-export** — nobody imports `OUTER_NAV_NODES` *from OctahedronHero*. Internal import at line 106 STAYS. |
| 5 | `NavNode` (type) | OctahedronHero.tsx:105 | **SAFE-DELETE** (re-export line only) | Same as #4 — declared in `heroNavNodes.ts:22`, re-exported on line 105 with no consumer. Used internally via the line-106 import (type at line 772). Same physical line as #4. |
| 6 | `VISIBLE_HOUSES` (export) | houses.ts:358 | **SAFE-DELETE** | Only occurrence in repo is its own declaration. (The grep-count of 2 was the substring match inside `NAVBAR_VISIBLE_HOUSES`.) Zero consumers. |
| 7 | `NAVBAR_VISIBLE_HOUSES` (export) | houses.ts:361 | **SAFE-DELETE** | Declaration-only. Zero consumers. (Note: sibling `NAVBAR_HIDDEN_ROUTES` is NOT flagged — leave it.) |
| 8 | `getHouseBySlug` (export) | houses.ts:371 | **SAFE-DELETE** | Declaration-only; zero call sites. |
| 9 | `getPeopleByHouse` (export) | houses.ts:376 | **SAFE-DELETE** | Declaration-only; zero call sites. |
| 10 | `getHousesByPerson` (export) | houses.ts:381 | **SAFE-DELETE** | Declaration-only; zero call sites. |
| 11 | `LAB_DOCUMENTS_HIDDEN` (export) | lab-documents.ts:356–525 | **SAFE-DELETE** | Declaration-only; "NOT read by any UI" per its own comment. Zero consumers. |
| 12 | `getDocumentsByTag` (export) | lab-documents.ts:542 | **SAFE-DELETE** | Declaration-only; zero call sites. |
| 13 | `getDocumentsByAuthor` (export) | lab-documents.ts:589 | **SAFE-DELETE** | Declaration-only; zero call sites. |
| 14 | `getPrimaryAuthorId` (export) | lab-documents.ts:594 | **SAFE-DELETE** | Declaration-only; zero call sites. |
| 15 | `getPublishedDocuments` (export) | lab-documents.ts:599 | **SAFE-DELETE** | Declaration-only; zero call sites. |
| 16 | `storyPhotos` (export) | storyPhotos.ts:18 | **DOWNGRADE-EXPORT** | **False positive for deletion.** `storyPhotos` is consumed *internally* to build `gallerySections` (lines 48–88), and `gallerySections` IS imported by `StoryPage.tsx:7`. No external importer of `storyPhotos` itself → keep the const, drop `export`. |
| 17 | `StoryPhoto` (type) | storyPhotos.ts:1 | **DOWNGRADE-EXPORT** | Used internally by `GallerySection.photos` (line 9) and `storyPhotos` (line 18). No external importer (`PhotoGallery.tsx` imports `GallerySection`, not `StoryPhoto`). Keep interface, drop `export`. |
| 18 | `ButtonProps` (type) | button.tsx:85 | **DOWNGRADE-EXPORT** | Used internally as the `forwardRef<…, ButtonProps>` type param (line 126). No consumer imports it (tests import `Button` + `buttonVariants` only). Keep interface, drop `export`. |
| 19 | `ExternalLink` (type) | houses.ts:7 | **DOWNGRADE-EXPORT** | Used internally by `House.externalLinks: ExternalLink[]` (line 53). No external importer. Keep, drop `export`. |
| 20 | `PersonSocials` (type) | houses.ts:12 | **DOWNGRADE-EXPORT** | Used internally by `Person.socials?: PersonSocials` (line 23). Keep, drop `export`. |
| 21 | `HousePalette` (type) | houses.ts:28 | **DOWNGRADE-EXPORT** | Used internally by `House.palette: HousePalette` (line 49). Keep, drop `export`. |
| 22 | `SearchResultType` (type) | use-global-search.ts:10 | **DOWNGRADE-EXPORT** | Used internally by `SearchResult.type` (13), `SearchResultGroup.type` (236), `TYPE_LABELS` (241). No external importer. Keep, drop `export`. |
| 23 | `SearchResultGroup` (type) | use-global-search.ts:235 | **DOWNGRADE-EXPORT** | Used internally by the hook return type (256, 267, 294). No external importer. Keep, drop `export`. |

**Tally:** 13 SAFE-DELETE · 8 DOWNGRADE-EXPORT · 0 KEEP-full-false-positive.
(Findings #4 and #5 share one physical line, so 13 SAFE-DELETE = 2 files + 1 devDep + 1 shared re-export line + 9 declarations.)

### Surprising results
- **Knip over-reported every "unused type" (8/8) and one const (`storyPhotos`).** All 8 types and `storyPhotos` are genuinely *used* — just internally, by other types/values in the same file. Deleting them outright would break compilation. These are **DOWNGRADE-EXPORT**, not delete. Default knip flags "exported but never imported," which is correct, but the safe action is removing the `export`, not the declaration.
- **`OUTER_NAV_NODES` / `NavNode`** look used (Hero.tsx imports them) but the flagged occurrence is a *dead re-export line* in OctahedronHero.tsx (FRAC-181 back-compat shim with no remaining consumer). The genuine declarations in `heroNavNodes.ts` stay; only the re-export line 105 goes. The line-106 internal import must remain.

## Precise removal / edit list

### A. Files to `git rm`
```
git rm src/components/three/Skyline.tsx
git rm src/hooks/use-mobile.tsx
```

### B. devDependency to remove (package.json)
- Remove line 39: `"@testing-library/user-event": "^14.6.1",`
- Then run `pnpm install` to update `pnpm-lock.yaml`. Commit the lockfile change.

### C. Declarations to DELETE (SAFE-DELETE)

**src/components/three/OctahedronHero.tsx**
- Delete line 105 only: `export { OUTER_NAV_NODES, type NavNode } from "./heroNavNodes";`
  - KEEP line 106 (`import { OUTER_NAV_NODES, type NavNode, housePalette, PALETTE_FALLBACK } from "./heroNavNodes";`) — it feeds the internal render loop (1017) and the `NavNode` type (772). Optionally tidy the now-stale FRAC-181 comment on lines 100–104, but the import itself stays.

**src/data/houses.ts** (delete declaration + its doc comment)
- `VISIBLE_HOUSES` — line 357 comment + line 358.
- `NAVBAR_VISIBLE_HOUSES` — line 360 comment + lines 361–363. **Do NOT touch `NAVBAR_HIDDEN_ROUTES` (lines 365–368) — not flagged, keep it.**
- `getHouseBySlug` — lines 370–373.
- `getPeopleByHouse` — lines 375–378.
- `getHousesByPerson` — lines 380–385.

**src/data/lab-documents.ts**
- `LAB_DOCUMENTS_HIDDEN` — lines 350–525 (header comment block 350–355 + `export const … = [ … ];` array body 356–525). Verify the array closes at the `];` on line 525.
- `getDocumentsByTag` — lines 541–547 (doc comment + function).
- `getDocumentsByAuthor` — lines 588–591.
- `getPrimaryAuthorId` — lines 593–596.
- `getPublishedDocuments` — lines 598–601.
- **KEEP** the interleaved siblings: `getFeaturedDocuments` (532), `getRegularDocuments` (537), `getAllTags` (549), `getTagCounts` (560), `formatAuthors` (578) — none flagged. Edit carefully around them; line numbers shift as you delete top-down, so delete bottom-up or re-locate each symbol by name.

### D. Declarations to DOWNGRADE (remove `export` keyword only — KEEP body)

**src/data/storyPhotos.ts**
- Line 1: `export interface StoryPhoto {` → `interface StoryPhoto {`
- Line 18: `export const storyPhotos: StoryPhoto[] = [` → `const storyPhotos: StoryPhoto[] = [`
- KEEP `export interface GallerySection` and `export const gallerySections` (consumed by PhotoGallery/StoryPage).

**src/components/ui/button.tsx**
- Line 85: `export interface ButtonProps` → `interface ButtonProps`

**src/data/houses.ts**
- Line 7: `export interface ExternalLink {` → `interface ExternalLink {`
- Line 12: `export interface PersonSocials {` → `interface PersonSocials {`
- Line 28: `export interface HousePalette {` → `interface HousePalette {`
- KEEP `export interface Person` and `export interface House` (consumed across the app).

**src/hooks/use-global-search.ts**
- Line 10: `export type SearchResultType = …` → `type SearchResultType = …`
- Line 235: `export interface SearchResultGroup {` → `interface SearchResultGroup {`

### E. Cascade import removals
**None required.** Audited every SAFE-DELETE target for imports that would become unused after deletion:
- The deleted `houses.ts` / `lab-documents.ts` functions reference only in-file consts (`HOUSES`, `PEOPLE`, `LAB_DOCUMENTS`), all still used by surviving exports — no import lines are orphaned.
- `LAB_DOCUMENTS_HIDDEN` referenced `LabDocument` (a type used throughout the file) — no orphaned import.
- The OctahedronHero re-export deletion leaves the line-106 import intact (still used) — no cascade.
- `Skyline.tsx` / `use-mobile.tsx` are whole-file deletes, so their imports vanish with the file.

## Acceptance criteria
1. `pnpm tsc --noEmit` (typecheck) passes — no errors introduced by the downgrades/deletions.
2. `pnpm build` succeeds.
3. Conformance / lint checks pass (whatever the project's `pnpm lint` / conformance step is).
4. Test suite at the **FRAC-199 baseline: exactly 7 failing / 148 passing** (`pnpm vitest run`). No NEW failures introduced. (The 7 failures are pre-existing per commit `79d715d`.)
5. A fresh `pnpm dlx knip` run shows all 13 SAFE-DELETE items gone (2 files, 1 devDep, `OUTER_NAV_NODES`/`NavNode` re-export, and the 9 data declarations).
6. The 8 DOWNGRADE items no longer appear as "unused export/type" (they're now non-exported, so knip won't report them as unused exports). Any residual knip findings must be documented with rationale in the implementation commit/comment.
7. `package.json` devDeps no longer contain `@testing-library/user-event`; `pnpm-lock.yaml` regenerated via `pnpm install`.

## Implementation notes
- Delete bottom-up within each file (or locate symbols by name, not by the line numbers above) since deletions shift subsequent line numbers.
- Watch trailing/leading blank lines and doc-comment blocks when removing declarations to keep the files tidy.
- Mobile-first / PRD: this is a pure dead-code removal with no user-facing or layout change — no mobile-viewport impact. Confirm StoryPage and the Button still render in the test suite (covered by existing passing tests).

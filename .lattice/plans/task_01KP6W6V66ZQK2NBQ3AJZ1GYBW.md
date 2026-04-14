# FRAC-169 — Writing page v0 cleanup

## Scope
Three removals on the Writing page (currently routed `/lab`, `LabPage.tsx`). **Banner removal is NOT here** — moved to FRAC-161. **Rename Lab→Writing is FRAC-163**, not here.

Keep-but-hide pattern: data stays in files (commented blocks or hidden arrays), components stay on disk. Restoration = small revert.

## Removal 1 — Tags & filtering UI

**`src/pages/LabPage.tsx`**
- Drop `useArchiveFilter()` call.
- Remove `<ArchiveToolbar filter={filter} />` and its surrounding `FadeIn`.
- Remove the `documents={filter.isFiltering ? filter.filtered : undefined}` prop on `<DocumentGrid>` — call bare.
- Remove now-unused imports (`ArchiveToolbar`, `useArchiveFilter`).
- Add one-line comment: `// Archive toolbar (search + tags) intentionally removed for MVP v0; see FRAC-169.`

**`src/__tests__/pages.test.tsx`**
- Remove the `ArchiveToolbar` and `use-archive-filter` `vi.mock(...)` blocks.

**Keep:** `tags[]` field on docs, `getDocumentsByTag`/`getAllTags`/`getTagCounts` helpers, `TagFilter.tsx`, `ArchiveToolbar.tsx`, `ArchiveSearch.tsx`, `use-archive-filter.ts`, `lab-tags.ts`.

## Removal 2 — Per-author publication pages & aggregate Substack links

No per-author React route exists; "per-author publication pages" manifest as (a) `category:"substack"` aggregate entries in `LAB_DOCUMENTS` and (b) `socials.substack` icons in `AvatarBadge`.

**`src/data/lab-documents.ts`**
- Comment out (or move to `LAB_DOCUMENTS_HIDDEN` array) these six aggregate entries, each wrapped in `/* MVP v0: aggregate publication hidden — FRAC-169 */`:
  - `andrew-substack`, `nothing-human`, `fractal-nyc-substack`, `fractal-university-substack`, `improvisational-indian-cooking`, `psychofauna`
- Per-post entries (e.g. `tyranny-marginal-user`, `reversing-centrifuge`, `how-to-live-near-friends`, `keesh-teacher-spotlight`) **stay**.

**`src/components/ui/AvatarBadge.tsx`**
- In `SocialLinks`, remove the `if (socials.substack) { … }` block (lines ~56-62). Twitter + website stay.
- Mirror the change in `BadgePlayground.tsx` for consistency.

**Keep:** `PersonSocials.substack` field and values on people.

**Don't touch:** `LiberalArts.tsx:38` link to `https://fractaluniversity.substack.com/` — this is the institutional Substack (Fractal U), not a person's aggregate. Julianna confirmed reuse elsewhere (FRAC-168).

## Removal 3 — Ivan's posts entirely

**`src/data/lab-documents.ts`**
- Comment out or move to `LAB_DOCUMENTS_HIDDEN` every entry with `author: "ivan"` / `authors: ["ivan"]` — tag each `// MVP v0: Ivan's posts hidden — FRAC-169`:
  - `nothing-human` (already covered by Removal 2), `tyranny-marginal-user`, `metrics-cowardice`, `cultural-drift`, `andrew-communities`, `tree-of-evil`, `whole-activities`, `against-positive-sum`, `materialist-conceptions-god`, `to-all-language-models`.

**Keep:** Ivan's `Person` record in `houses.ts` and AvatarBadge on `/people`. Any `leaders: ["ivan", …]` house references stay.

## Suggested implementation order
1. Removal 3 (data-only).
2. Removal 2 (data + AvatarBadge).
3. Removal 1 (page + test).

## Acceptance
- `/lab` renders no search input, no tag chips, no result-count, no clear-filters button.
- No cards titled "Andrew Rose's Substack", "Nothing Human", "Fractal NYC Substack", "Fractal University Substack", "Improvisational Indian Cooking", or "Psychofauna".
- No AvatarBadge Newspaper/Substack icons anywhere on `/people`.
- Zero cards render with author Ivan.
- `/people` still shows Ivan's avatar.
- All vitest green; no lint warnings from unused imports.

## Coordination with FRAC-172
If FRAC-172 (multi-author schema) lands first, this task reads `doc.authors.includes("ivan")` instead of `doc.author === "ivan"`. Either order works.

## Mobile check
Removing toolbar reclaims ~100-140px above the grid on 375px. Grid layout unchanged (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). AvatarBadge social row shrinks from up to 3 icons to up to 2 — comfortable.

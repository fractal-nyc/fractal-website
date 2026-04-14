# FRAC-161 — Hide People, Political Club house, and home-page below-hero banners

## Goal
Hide three things from the live site without deleting any code — restoration should be a small surgical revert.
1. **People page** — remove from nav (keep route + component).
2. **Political Club house** (internal id `forum`, displayName "Political Club") — remove from nav and banner grid (keep data entry).
3. **Home-page below-hero banners** (the `HouseBannerGrid` "How Do I Get Involved" grid on `/`) — stop rendering on Home. Keep the component.

Naming: always "Political Club" in copy, never `forum`.

## Pattern
Use in-file filter sets (same technique as existing `innerPageHiddenLinks`).

## Files & changes

1. **`src/data/houses.ts`**
   - Add `export const HIDDEN_HOUSE_IDS = new Set<string>(["forum"]);`
   - Add `export const VISIBLE_HOUSES = HOUSES.filter(h => !HIDDEN_HOUSE_IDS.has(h.id));`
   - Do NOT mutate `HOUSES` or `PEOPLE[*].houses`.

2. **`src/components/house/HouseBannerGrid.tsx`**
   - Import/iterate `VISIBLE_HOUSES` instead of `HOUSES`.

3. **`src/pages/Home.tsx`**
   - Remove the `<HouseBannerGrid />` line (comment the import with a FRAC-161 restore note).

4. **`src/components/layout/Navbar.tsx`**
   - Add `const HIDDEN_SECTION_NAMES = new Set(["Political Club", "People"]);` above `sectionLinks`.
   - Derive `visibleSectionLinks` and use it in every iteration (desktop full, mobile row, overlay). Have `innerPageSectionLinks` derive from `visibleSectionLinks`.
   - Split `leftLinks = visibleSectionLinks.slice(0,3); rightLinks = visibleSectionLinks.slice(3);` (3/3 balanced around centered logo).

5. **Routes in `src/App.tsx`** — leave `/people` and `/political-club` mounted so direct URLs still render (bookmark safety).

6. **Tests** (`src/__tests__/navigation.test.tsx`, `pages.test.tsx`)
   - Drop "People" and "Political Club" from nav-visibility assertions.
   - Overlay button count 8 → 6.
   - Mobile abbreviated-labels: remove "PC" expectation.
   - Keep `PoliticalClubPage`/`PeoplePage` smoke render tests (routes still exist).
   - Add assertion that `HouseBannerGrid` does NOT render "Political Club".
   - Add assertion that Home does NOT render the "How Do I Get Involved" heading.

## Acceptance
- `/` shows Navbar, Hero, Golden Age Protocol section, Footer. No banner grid.
- Navbar (all variants) shows 6 sections: Story, Campus, Neighborhood, Events, New Liberal Arts, Lab. (Renames from FRAC-163 land separately.)
- Overlay menu has exactly 6 section buttons.
- Direct nav to `/people` and `/political-club` still renders the pages.
- All tests pass; `pnpm typecheck`/`lint`/`build` clean.

## Out of scope
- Removing the octahedron `forum` face (modeling, not nav).
- Removing Political Club from global search keywords.
- Deleting any page/component/route/data entry.

## Mobile check
- Mobile letter row drops from 8 to 6 letters — more comfortable at 375px.
- Home page is shorter without the banner grid; transition Hero → Golden Age is clean.

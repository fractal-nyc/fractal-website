# FRAC-163 — Rename houses: Neighborhood→Visit, New Liberal Arts→Education, Lab→Writing

## Scope

Rename user-visible labels only. **Keep internal ids, URL slugs, route paths, file names.**

| id | old labels | new label | slug (keep) | route (keep) |
|---|---|---|---|---|
| `neighborhood` | "Neighborhood", "The Neighborhood", "Co-Living" | **Visit** | `neighborhood` | `/neighborhood` |
| `school` | "New Liberal Arts", "The School" | **Education** | `new-liberal-arts` | `/new-liberal-arts` |
| `lab` | "Lab", "The Lab" | **Writing** | `lab` | `/lab` |

Political Club (`forum`) is NOT renamed.

## Files & changes

### Data (source of truth)
**`src/data/houses.ts`**
- `neighborhood`: `name: "Visit"`, `displayName: "Visit"`, `subtitle: "Visit"`.
- `school`: `name: "Education"`, `displayName: "Education"`, `subtitle: "Education"`.
- `lab`: `name: "Writing"`, add/set `displayName: "Writing"`, `subtitle: "Writing"`.

### Navigation
**`src/components/layout/Navbar.tsx`**
- `sectionLinks` & `innerPageHiddenLinks` Set: rename three strings.
- Mobile letter abbreviations: `"New Liberal Arts" ? "LA"` → `"Education" ? "E"`. Defaults handle V (Visit) and W (Writing).

**`src/components/sections/Directory.tsx`**
- `directoryItems`: rename three titles, keep hrefs.

### Sector headers
- **`src/pages/NeighborhoodPage.tsx`**: `<SectorHeader letter="V" name="Visit" />` (color unchanged).
- **`src/components/sections/LiberalArts.tsx`**: keep `id="new-liberal-arts"`; `<SectorHeader letter="E" name="Education" />`. Update copy line 22 "New Liberal Arts Launch" → "Education house launch".
- **`src/pages/LabPage.tsx`**: `<SectorHeader letter="W" name="Writing" />`. Keep the "Research + Writing" section heading inside the page (it's an archive section, not the house label).

### 3D hero
- **`src/components/three/OctahedronHero.tsx`** lines 89-94: label renames (keep route/color/vertexIndex).
- **`src/components/three/FractalObject.tsx`** lines 39, 42, 44: same.

### Search
**`src/hooks/use-global-search.ts`**
- Rename display strings for the three houses.
- Add legacy keyword aliases so old queries still resolve: "neighborhood"/"co-living"/"coliving" → Visit; "new liberal arts"/"liberal arts"/"school" → Education; "lab"/"research" → Writing.

### Tests
- `sector-header.test.tsx`: update fixtures.
- `pages.test.tsx`: update labels.
- `navigation.test.tsx`: update labels; mobile abbrev "LA" → "E".
- `neighborhood.test.tsx`: `getAllByText("Neighborhood")` → `"Visit"` (filename/helpers stay).

## Out of scope
- `src/data/lab-tags.ts` neighborhood tag (archive taxonomy).
- `storyPhotos.ts` alt text "Neighborhood block party" (literal).
- `StoryPage.tsx` "Neighborhood Campus" narrative.
- Any file/component renames.

## Acceptance
1. All user-visible renders use Visit/Education/Writing in navbar, inner-page nav, overlay, sector headers, Directory, Octahedron, FractalObject.
2. URLs unchanged; direct links to `/neighborhood`, `/new-liberal-arts`, `/lab` still render correct pages.
3. Global search resolves both new AND legacy terms.
4. `getHouseBySlug`/`getPeopleByHouse` unchanged behavior.
5. All vitest suites pass.
6. Mobile 320/375px: letter row still fits (two "E"s for Events+Education are color-distinguishable; if Julianna dislikes the collision, abbreviate Education to "Ed").

## Open questions (flag in PR, don't block)
- Education mobile abbreviation: "E" (collides visually with Events "E") vs "Ed"?
- `lab-documents.ts` line 122 description "dispatches from the New Liberal Arts" — update to "Education"?

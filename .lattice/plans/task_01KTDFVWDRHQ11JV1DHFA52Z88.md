# FRAC-47 — Convert octahedron 'Coming Soon' placeholder to Story node

**Complexity:** low
**Branch:** `frac-47-story-node`

## TL;DR

The "Coming Soon" placeholder is the **Political Club nav node at outer vertex 4** of the octahedron (added in FRAC-36 as a visible-but-non-navigable sphere). FRAC-47 replaces that placeholder with a **Story** nav node — color `#D4BA58`, label `Story`, route `/story`, full opacity, full tap navigation, no `comingSoon` flag. Navbar's hidden-house list (Political Club, People) is UNTOUCHED.

## Critical context the planner uncovered

1. **The handoff phrasing is slightly misleading.** "Coming Soon placeholder" is not a *Story* placeholder — it was the Political Club placeholder at outer vertex 4. Story has never had an outer nav node; it only has center-octahedron face 7. FRAC-47 swaps the Political Club placeholder out and Story in at vertex 4.
2. **Story is NOT a House.** No entry in `houses.ts`. No `house-story-*` token in DESIGN.md. Color stays as a literal hex `#D4BA58` matching the existing pattern at:
   - `src/components/layout/Navbar.tsx:8` — `{ name: "Story", href: "/story", color: "#D4BA58" }`
   - `src/pages/StoryPage.tsx:18` — `const STORY_COLOR = "#D4BA58"`
   - `src/components/three/OctahedronHero.tsx` (~line 391) — `story: "#D4BA58"` in `FACE_SECTION_COLORS` with comment "story and people are not Houses and keep literal hexes."
3. **Story page exists.** Route in `src/App.tsx:42`, page in `src/pages/StoryPage.tsx`. No new page work needed.
4. **`FractalObject.tsx` is dead code** with a stale "Our Story" icosahedron node. Do NOT touch — separate cleanup.
5. **Master HEAD at planning:** `7f6155a` (PR #168 merge — FRAC-44 Inter font).

## Locked decisions respected

- Face order unchanged (campus, events, lab, school, neighborhood, people, forum, story).
- Political Club + People stay hidden from Navbar.
- Story face index 7 / `#D4BA58` mapping in `FACE_SECTION_COLORS` unchanged.

## Files to edit

### `src/components/three/OctahedronHero.tsx`

The `OUTER_NAV_NODES` block at lines ~95-125 (on master HEAD). Replace the Political Club entry:

```ts
  // FRAC-36: Political Club placeholder — visible sphere, non-navigable.
  { label: "Political Club", route: "/political-club",   color: housePalette("forum", "light"), vertexIndex: 4, comingSoon: true },
```

with the Story entry:

```ts
  // FRAC-47: Story nav node at vertex 4 — fully active, navigates to /story.
  // Replaces the FRAC-36 Political Club "Coming Soon" placeholder (Political
  // Club stays hidden from Navbar per FRAC-161). Color matches Navbar Story
  // link and StoryPage STORY_COLOR (#D4BA58); Story is not a House so the
  // hex is literal rather than a palette ref.
  { label: "Story",          route: "/story",            color: "#D4BA58",                       vertexIndex: 4 },
```

Update the surrounding comment block (lines ~97-104) from the FRAC-36 wording to acknowledge FRAC-47:

```ts
// FRAC-5 / FRAC-161 / FRAC-36 / FRAC-47: Political Club is hidden from the
// navbar (FRAC-32) and its banner grid card stays hidden (FRAC-161). On the
// hero octahedron, vertex 4 was previously the FRAC-36 "Coming Soon"
// placeholder for Political Club. FRAC-47 converts that slot to a Story
// node — fully active, navigable to /story, in the Story brand color
// #D4BA58 (matches Navbar.tsx Story link + StoryPage STORY_COLOR). The
// geometry still reads as complete (6 vertices, 6 nodes); Political Club
// remains hidden from the navbar.
```

The `comingSoon?: boolean` field on the `NavNode` interface can stay (optional, harmless). Cleanup of `comingSoon` plumbing (consumer branches at ~715-716, ~736, ~758-763) is OUT OF SCOPE — can be removed in a follow-up once design is settled. Implementer may strip it inline if they want; it would shrink the diff to be more focused on the actual swap.

## Out of scope

- DO NOT touch `Navbar.tsx`. Political Club + People stay hidden.
- DO NOT reorder `FACE_SECTION_MAP`.
- DO NOT modify `houses.ts`.
- DO NOT touch `FractalObject.tsx`.
- DO NOT add a `house-story-*` token to DESIGN.md.

## Approach

1. Branch from latest `origin/master` (NOT a stale local branch — planner found local `frac-17-18-color-tweaks` is significantly behind).
2. Single-file edit to `OctahedronHero.tsx`.
3. `pnpm build` and `pnpm test` (baseline 143 pass / 4 fail).
4. Visual smoke at 375px + desktop:
   - Vertex 4 sphere reads as yellow-gold (#D4BA58).
   - Hover/tap tooltip shows `Story` (uppercased to `STORY`).
   - Tap navigates to `/story` (mobile uses double-tap pattern per FRAC-79; desktop click on sphere or tooltip).
   - Cursor is `pointer`.
   - No "Coming Soon" text.
   - `/story` renders post-navigation.
5. Commit, push, open PR.

## Acceptance criteria

- Vertex 4 node sphere renders in `#D4BA58`.
- Tooltip label is `Story`, not `Coming Soon`.
- Tap navigates to `/story`.
- Cursor is `pointer`.
- Navbar UNCHANGED.
- `FACE_SECTION_MAP` UNCHANGED.
- Build passes; tests pass at baseline 143/4 (no new failures).
- Diff touches exactly 1 file (`src/components/three/OctahedronHero.tsx`).

## Critical files

- `/Users/fractalos/Dev/fractal-nyc/src/components/three/OctahedronHero.tsx` — the only file edited.
- `/Users/fractalos/Dev/fractal-nyc/src/components/layout/Navbar.tsx` — reference (Story link pattern).
- `/Users/fractalos/Dev/fractal-nyc/src/pages/StoryPage.tsx` — reference (STORY_COLOR + page).
- `/Users/fractalos/Dev/fractal-nyc/src/data/houses.ts` — reference (no Story entry — confirms literal hex).
- `/Users/fractalos/Dev/fractal-nyc/src/App.tsx` — reference (route exists).
- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` — reference.

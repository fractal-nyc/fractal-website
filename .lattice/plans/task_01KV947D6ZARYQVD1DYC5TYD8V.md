# FRAC-208: Remove dead HouseBanner/HouseBannerGrid + reconcile DESIGN.md

## Context
`HouseBanner` (the pennant-shaped banner component) and `HouseBannerGrid` (a grid of them)
are **dead**, superseded by the new per-page banner SVGs:

| House page | Live banner |
|---|---|
| `NeighborhoodPage` (Visit) | `VisitBannerSVG` |
| `CampusPage` | `CampusBannerSVG` |
| `LiberalArtsPage` (Education) | `EducationBannerSVG` |
| `EventsPage` | `EventsBannerSVG` |
| `LabPage` (Publications) | `PublicationsBannerSVG` |

Evidence:
- `HouseBannerGrid` is rendered NOWHERE in the app — commented out on `Home.tsx` (FRAC-161);
  only `src/__tests__/pages.test.tsx:101` still renders it.
- `HouseBanner`'s only renderer is `HouseBannerGrid`; `variant="full"` is used nowhere.
- Nothing else imports `HouseBanner` (no consumers of its `isDark`/`BANNER_IMAGES`).

**No asset/preload changes.** The banner `.webp` images and the `index.html`
`<link rel=preload>` tags belong to the LIVE octahedron (`OctahedronHero` `FACE_BANNER_IMAGES`,
lines ~365-372; FRAC-192 preloads) and the `*BannerSVG` — `HouseBanner` only held a duplicate
`BANNER_IMAGES` map. DO NOT touch `index.html`, the `.webp` files, `OctahedronHero`, or the
`*BannerSVG`.

## Scope

### 1. Delete dead code
- `src/components/house/HouseBanner.tsx`
- `src/components/house/HouseBannerGrid.tsx`
- First re-confirm nothing imports them outside the test (grep). `HouseBanner` imports
  `CampusBannerSVG` + `MandelbrotIcon` — both live elsewhere, so no cascade; verify.

### 2. Tests
- `src/__tests__/pages.test.tsx`: remove the `HouseBannerGrid` import + the
  "HouseBannerGrid should NOT render Political Club" test (it exercises dead code). The
  *intent* (Political Club hidden from banners) is structurally satisfied now — there is no
  all-houses banner grid, banners are per-page, and Political Club has no `*BannerSVG` at all.
  Do NOT invent a contrived replacement; just remove the dead test and say so in the summary.
- `Home.tsx`: remove the dead FRAC-161 commented-out `HouseBannerGrid` import/render comment
  lines (they reference a now-deleted component).

### 3. DESIGN.md rewrite (the careful part)
Read the current DESIGN.md banner-related content AND read one `*BannerSVG` (e.g.
`VisitBannerSVG.tsx`) + how a house page uses it (e.g. `NeighborhoodPage.tsx` — the flanking
banner layout) to document the REAL design. Then:
- **`house-banner` YAML component** (one of the 5 modeled components in the frontmatter):
  it models the dead `HouseBanner`. Either replace it with the per-page banner SVG concept or
  remove it (dropping to 4 modeled components) — pick whichever reads cleanest; update the
  "Five components are modeled" / count prose to match.
- **Components section prose** — the `house-banner` bullet describes the dead component;
  rewrite it to describe the per-page `*BannerSVG` flanking banners (what they are, that each
  house page renders its own, that Political Club has none).
- **"Pennant clip-path" section** — verify whether the new `*BannerSVG` still use a pennant
  shape (read the SVG). If the pennant motif lives on in the SVGs, re-attribute the section to
  them; if it was `HouseBanner`-specific and the SVGs bake their own shape, retire/rewrite it
  accordingly. Be accurate to what the SVGs actually do.
- **DO NOT remove** still-live content: the house color tokens, the house-page color floods
  (`bg-house-*-light`), the four canonical surface+text pairings (those describe house PAGE
  surfaces, which are live), or anything about the octahedron. Only retire `HouseBanner`-
  component-specific docs.

### 4. Conformance baseline
Run `node scripts/design-conformance.mjs --update-baseline`. Deleting `HouseBanner` removes its
`#ffffff` usage + its `BANNER_IMAGES` hexes? (no hexes there) — regenerate and confirm pass.
(`#ffffff` may still be grandfathered via `TagFilter.tsx` — that's fine, leave it.)

## Acceptance criteria
- `HouseBanner.tsx` + `HouseBannerGrid.tsx` deleted; `grep -rn "HouseBanner" src/` → no
  references except possibly incidental comments you should also clean.
- No `index.html` / `.webp` / `OctahedronHero` / `*BannerSVG` changes (those are live).
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass.
- `pnpm test`: the only test-count change is the intentional removal of the HouseBannerGrid
  test; the pre-existing FRAC-199 failures (7) remain and NO new failures appear. Report counts
  and explain the delta.
- DESIGN.md no longer documents `HouseBanner` as a live component; the per-page `*BannerSVG`
  are documented; still-live house-page/token/pairing content is untouched. Modeled-component
  count updated.

## Out of scope
- The banner `.webp` assets, `index.html` preloads, octahedron, `*BannerSVG` internals.
- Any house-page color/token changes.

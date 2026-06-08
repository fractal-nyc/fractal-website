# FRAC-52 Plan: Hero display migration — adopt `.text-display`

## Summary

Replace 11 hero call-sites currently using `.display-roman` (low-level escape hatch) + explicit size classes with the canonical `.text-display` semantic utility (introduced by FRAC-51). Mechanical migration. Removes ~30 redundant class tokens per file. Standardises on the locked type system documented in `DESIGN.md` "Semantic type scale". One site (`HouseBannerGrid`) kept on `.display-roman` because of a deliberate wider letter-spacing override.

## State note

The original task description referenced 15 inline-style hero overrides (`style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}`). Those were migrated to `.display-roman` + explicit size classes in a prior PR (FRAC-31 introduced `.display-roman`). The post-FRAC-51 state is: 11 sites use `.display-roman` + size classes. This plan migrates them to `.text-display`.

## PRD alignment check

`.lattice/plans/FRAC-22.md` calls for "bold type" and a strong, brutalist aesthetic; it does not constrain exact hero sizes. `DESIGN.md` (post-FRAC-51) designates `.text-display` as the canonical hero default and `.display-roman` as the escape hatch. Migrating to `.text-display` is directly PRD-aligned. Mobile-first preserved — `.text-display` is `text-5xl` (48px) on mobile, slightly larger than the current `text-4xl` (36px) baseline, which strengthens "bold type" on the 375px primary viewport.

## Migration site list (11 sites)

| # | File | Line | Current class string | New class string | Notes |
|---|------|------|----------------------|------------------|-------|
| 1 | `src/pages/EventsPage.tsx` | 20 | `font-serif text-4xl md:text-6xl leading-[1.3] mb-6 text-center display-roman` | `text-display mb-6 text-center` | Clean. |
| 2 | `src/pages/EventsPage.tsx` | 51 | same | `text-display mb-6 text-center` | "Host Our Next Event". |
| 3 | `src/pages/EventsPage.tsx` | 60 | same | `text-display mb-6 text-center` | "Stay in the Loop". |
| 4 | `src/pages/PeoplePage.tsx` | 22 | `font-serif text-4xl md:text-6xl leading-[1.3] text-white mb-6 text-center display-roman` | `text-display text-white mb-6 text-center` | Preserve `text-white`. |
| 5 | `src/pages/StoryPage.tsx` | 211 | `font-serif text-4xl md:text-6xl leading-[1.3] mb-12 text-center display-roman` | `text-display mb-12 text-center` | Preserve `mb-12`. |
| 6 | `src/pages/LabPage.tsx` | 27 | `font-serif text-4xl md:text-6xl leading-[1.3] mb-6 text-center display-roman` | `text-display mb-6 text-center` | **Flag:** long copy may wrap aggressively at `text-7xl` md+. Visual-check item, not a blocker. |
| 7 | `src/pages/Home.tsx` | 28-30 | `font-serif text-5xl md:text-7xl leading-[1.3] display-roman` (on `<h2>`) | `text-display` | Already at target size. Drops `leading-[1.3]` — replaced by utility's `line-height: 1.1`. |
| 8 | `src/pages/PoliticalClubPage.tsx` | 19 | `font-serif text-4xl md:text-6xl leading-[1.3] text-center mb-10 display-roman` | `text-display text-center mb-10` | Clean. |
| 9 | `src/pages/NeighborhoodPage.tsx` | 23 | `font-serif text-xl md:text-6xl leading-[1.3] mb-3 md:mb-10 text-center display-roman` | `text-display mb-3 md:mb-10 text-center` | **Flag:** mobile size jumps from `text-xl` (20px) to `text-5xl` (48px) — 2.4×. Copy is short, should fit. Visual-check on 375px. |
| 10 | `src/components/sections/Campus.tsx` | 186-188 | `font-serif text-4xl md:text-6xl leading-[1.3] text-white mb-4 text-center display-roman` | `text-display text-white mb-4 text-center` | Clean. |
| 11 | `src/components/sections/LiberalArts.tsx` | 13 | `font-serif text-2xl sm:text-4xl md:text-6xl leading-[1.3] mb-4 md:mb-6 text-center display-roman` | `text-display mb-4 md:mb-6 text-center` | **Flag:** drops `sm:` breakpoint. Acceptable per spec ("no arbitrary sizes"). |

## Sites OUT of scope

- **`src/components/house/HouseBannerGrid.tsx:22`** — `.display-roman` + `text-5xl md:text-7xl` + `style={{ letterSpacing: "0.15em" }}`. Deliberate wider tracking (0.15em vs `.text-display`'s 0.04em). Keep on `.display-roman` as documented escape-hatch use.
- **`src/components/layout/Navbar.tsx`** — Jacquard wordmark/monogram, italic "Collective" sub-line, nav links. None are hero display. Out of scope.
- **`src/pages/Home.tsx:35`** — `style={{ fontStyle: "normal" }}` on a `font-mono uppercase font-thin` body paragraph. Not a hero. Out of scope.
- **`src/pages/BadgePlayground.tsx`** — no hero exists. Out of scope; task description incorrect.
- **`src/components/three/OctahedronHero.tsx:783-797`** — 3D HTML overlay tooltip, font-mono 12px. Not a hero.
- **`src/components/pretext/PretextLabel.tsx:28`** — Pretext renderer internal style. Out of scope.

## Open questions / resolutions

1. **`text-white` carry-forward?** → Yes, preserved inline. Page background context dictates colour.
2. **Drop `leading-[1.3]`?** → Yes everywhere. `.text-display` ships `line-height: 1.1` intentionally.
3. **LabPage long-copy risk?** → Migrate; flag for visual review in PR. If overflows post-merge, follow-up downgrades that single site to `.text-title`.
4. **Campus.tsx + sections/LiberalArts.tsx in scope?** → Yes, they grep-match the pattern. Original task description undercounted.

## Acceptance criteria

- `rg -n 'display-roman' src/` returns exactly **one** call-site: `src/components/house/HouseBannerGrid.tsx:22`.
- All 11 migration sites use `className="text-display ..."` with helper-class prefix removed (no `font-serif`, no explicit `text-4xl md:text-6xl`, no `leading-[1.3]` on hero `<p>`/`<h>`).
- `text-white`, `text-center`, `mb-*`, `md:mb-*` modifiers preserved on each site.
- `pnpm build` passes; no new TypeScript errors.
- No new test regressions vs origin/master baseline (4 pre-existing failures).
- Visual smoke test at 375px and 1280px on all 11 sites — headings render upright Fraunces, weight 300, uppercase.
- Diff is class-token only — no JSX structural changes, no new imports, no logic changes.

## Branch & PR plan

- **Branch:** `frac-52-display-migration` off `origin/master`.
- **PR title:** `FRAC-52: Migrate 11 hero sites to .text-display utility`
- **PR body:** Reference DESIGN.md "Semantic type scale" subsection (post-FRAC-51); reference FRAC-51 / PR #173 as the dependency. PR checklist must call out the LabPage long-copy and NeighborhoodPage mobile-jump visual-check items.

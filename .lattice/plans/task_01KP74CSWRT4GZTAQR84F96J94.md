# FRAC-4: Move Story page paragraph + diagram up, closer to main heading

## Goal
Move the FRAC-167 paragraphs (origin narrative about what a "fractal" is) and the `NeighborhoodCampusDiagram` so they render immediately below the Story page's main heading ("From a Single Apartment to a Neighborhood Campus"), not buried below the talks/podcasts grid.

## Approach
Approach (a): reorder in `src/pages/StoryPage.tsx`.

Split the existing `<section>` (which held heading + talks intro + TalkCard grid) into:
1. A heading-only section (SectorHeader + main heading).
2. `<OriginStory />` (paragraphs + `NeighborhoodCampusDiagram`) — rendered right after.
3. A trailing talks section with the talks-intro paragraph + TalkCard grid.

`OriginStory` is essentially just the new copy + diagram, so moving the whole component up is clean. Its internal `py-24 md:py-40` provides vertical rhythm.

## Key files
- `src/pages/StoryPage.tsx` — reorder.

## Acceptance criteria
- Story page renders: SectorHeader → main heading → origin paragraphs → NeighborhoodCampusDiagram → talks intro → TalkCard grid → PhotoGallery.
- Mobile 375px layout stays clean (no broken padding, heading section not stretched by `min-h-screen`).
- `pnpm typecheck` / `pnpm test` / `pnpm build` green modulo pre-existing failures (footer x2, navigation mobile labels, neighborhood min-h-screen).

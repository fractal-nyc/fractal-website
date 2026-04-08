# FRAC-85: SectorHeader height consistency across all individual pages

## Problem

The SectorHeader letter height/positioning is inconsistent across individual pages. The "good" pages (Story, Campus) use a consistent pattern: `min-h-screen flex flex-col items-center justify-center` to vertically center the hero section (including the SectorHeader letter) in the viewport.

## Analysis of Current State

| Page | Container Pattern | Issue |
|------|------------------|-------|
| **StoryPage** (good) | `min-h-screen flex flex-col items-center justify-center` on section | Correct |
| **CampusPage** (good) | `min-h-screen flex flex-col items-center justify-center w-full` on hero div | Correct |
| **LiberalArtsPage** (good) | `flex flex-col items-center pt-6 pb-24 md:pt-24` on section (no min-h-screen) | Looks good but different pattern |
| **EventsPage** | `min-h-screen flex flex-col items-center justify-center w-full` on div | Correct pattern |
| **NeighborhoodPage** | `min-h-screen flex items-center justify-center w-full` -- missing `flex-col` | Minor inconsistency |
| **PeoplePage** | `min-h-screen flex items-center justify-center w-full` -- missing `flex-col` | Minor inconsistency |
| **PoliticalClubPage** | `min-h-screen flex items-center justify-center w-full` -- missing `flex-col` | Minor inconsistency |
| **LabPage** | `min-h-[80vh] flex flex-col items-center justify-center w-full` | Uses 80vh not screen, plus extra "the lab" text with -mt-4 disrupts spacing |

## Fix

1. **LabPage**: Change `min-h-[80vh]` to `min-h-screen`. Remove the extra "the lab" paragraph that duplicates the SectorHeader name and has negative margin (-mt-4) disrupting letter positioning.
2. **NeighborhoodPage, PeoplePage, PoliticalClubPage**: Add `flex-col` to the centering container for consistency with the good pages.

## Acceptance Criteria

- All pages with SectorHeader use `min-h-screen flex flex-col items-center justify-center` for the hero container
- No extra elements disrupting vertical spacing around the SectorHeader letter
- `npm run build` passes
- No changes to Navbar.tsx or Footer.tsx

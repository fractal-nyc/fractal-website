# FRAC-41: Update navbar buttons and route order

## Changes

Single file: `src/components/layout/Navbar.tsx` — replace `sectionLinks` array with 7 items in correct order. Change desktop split from `.slice(0, 4)` / `.slice(4)` to `.slice(0, 3)` / `.slice(3)`.

## Acceptance Criteria

1. Navbar shows exactly 7 links: Our Story, Co-Living, Events, Campus, New Liberal Arts, Political Club, Lab
2. No dead routes (Research + Writing, Mission removed)
3. All links navigate to correct existing routes

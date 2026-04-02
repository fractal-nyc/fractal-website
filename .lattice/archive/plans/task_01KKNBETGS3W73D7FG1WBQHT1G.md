# FRAC-16: Update navbar and directory buttons to new labels

## Scope
Replace the 8 navigation items in both the Navbar and Directory components with the 7 new labels provided by the user.

## Current → New Labels

| # | Current (Navbar) | Current (Directory) | New Label |
|---|-----------------|---------------------|-----------|
| 1 | Liberal Arts | Futurist Liberal Arts | Neighborhood |
| 2 | Coliving | Coliving | New Liberal Arts |
| 3 | Campus | Campus | A Campus |
| 4 | Political Club | Political Club | Events |
| 5 | Research Lab | Research Lab | Political Club |
| 6 | Publication | Publication | Research + Publication |
| 7 | Protocol | Protocol | The Protocol |
| 8 | Events | Events | *(removed — 7 items now)* |

## Files to Change
1. `artifacts/fractal-nyc/src/components/layout/Navbar.tsx` — update `sectionLinks` array (8→7 items), adjust grid split (4+4 → 3+4 or 4+3)
2. `artifacts/fractal-nyc/src/components/sections/Directory.tsx` — update `directoryItems` array (8→7 items), update icons as appropriate

## Href Slugs
New href values derived from labels:
- `#neighborhood`
- `#new-liberal-arts`
- `#a-campus`
- `#events`
- `#political-club`
- `#research-publication`
- `#the-protocol`

## Navbar Grid Adjustment
Currently splits 8 items into two groups of 4. With 7 items, split as 3 left + 4 right (or 4+3). Keep the logo centered.

## Acceptance Criteria
- Navbar shows exactly the 7 new labels in both desktop and mobile views
- Directory section shows exactly the 7 new labels with appropriate icons
- All links use consistent href slugs
- No broken references or dead links within the nav

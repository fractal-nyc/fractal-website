# FRAC-17: Add Mission button, 4x2 directory grid, remove emojis

## Changes
1. Add "Mission" (`#mission`) to `sectionLinks` in Navbar.tsx and `directoryItems` in Directory.tsx — 8 items total
2. Change Directory grid from 3-column to 4-column (`grid-cols-4`) — 8 items = 4x2 perfect fit
3. Remove emoji icons from directoryItems — delete the `icon` field and its rendering

## Navbar grid split
With 8 items: 4 left + 4 right (restore original split). Mission can go first or last — placing it first since it's a foundational item.

## Directory grid
- Change `lg:grid-cols-3` to `lg:grid-cols-4`
- Remove filler divs (8 items fills 4x2 exactly)
- Remove icon rendering (`item.icon` span)

## Files
- `artifacts/fractal-nyc/src/components/layout/Navbar.tsx`
- `artifacts/fractal-nyc/src/components/sections/Directory.tsx`

## Acceptance Criteria
- 8 nav items in both navbar and directory
- Directory renders as 4x2 grid on desktop
- No emojis anywhere in directory

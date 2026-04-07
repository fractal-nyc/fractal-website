# FRAC-55: Apply Elegant palette color pairs to HouseBanner

## Scope
Add ELEGANT_PAIRS color mapping to HouseBanner.tsx. Use bg/letter colors per house. Remove h3 display name. Remove subtitle from grid. Complexity: low.

## Files
- `src/components/house/HouseBanner.tsx` — add color pair map, use bg/letter, remove h3
- `src/components/house/HouseBannerGrid.tsx` — remove "The sectors of Fractal." subtitle

## Acceptance Criteria
- Each banner uses paired bg + letter colors from the Elegant palette
- Dark backgrounds get contrasting light letter colors for legibility
- House name h3 is removed; only Jacquard letter + tagline remain
- Grid subtitle removed
- Build passes

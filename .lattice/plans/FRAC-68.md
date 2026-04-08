# FRAC-68: Liberal Arts banner readability

## Problem
The Liberal Arts (school) banner has a dark red bg (#C41E20) with 0.45 opacity overlay, making the "LA" letters (#8B1A1A dark red) nearly invisible against the dark background.

## Approach
1. Add per-banner overlay opacity via `OVERLAY_OPACITY` map, defaulting to 0.45
2. Set school overlay to 0.3 (lighter) so the image shows through more and the background is less dark
3. Change school letter color from dark red (#8B1A1A) to bright red (#C41E20) so it pops against the lighter overlay

## Acceptance criteria
- Liberal Arts banner text clearly readable
- Other banners unaffected (same 0.45 opacity)
- Mobile viewport not broken

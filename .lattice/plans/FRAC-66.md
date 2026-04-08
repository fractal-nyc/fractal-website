# FRAC-66: Navbar header alignment & sizing on mobile

## Problem
On mobile (375px), the top of the "Fractal" title text does not visually align with the top of the text blurb next to it. The Jacquard 24 font has built-in ascender space that creates a visual gap. Additionally, "Collective" is too small at 24px.

## Approach
1. Add a small negative top margin on the Fractal/Collective Link container to pull the visual top of "Fractal" up to align with the text blurb's top edge. Alternatively, add top padding to the text blurb paragraph.
2. Increase "Collective" font size from 24px to ~27px.

## Files
- `src/components/layout/Navbar.tsx` — mobile navbar section (lines 148-199)

## Acceptance criteria
- At 375px viewport, the top of "Fractal" text visually aligns with the top of the text blurb
- "Collective" is visibly larger than before
- No desktop regressions (desktop navbar is a separate section behind `max-md:hidden`)

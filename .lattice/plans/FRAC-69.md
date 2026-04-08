# FRAC-69: ASCII text clarity on 3D model

## Problem
The scrolling ASCII text ("THE PROTOCOL") rendered on the octahedron edges is blurry and hard to read due to low canvas texture resolution, thin tube geometry, low opacity, and capped device pixel ratio.

## Approach
1. **Increase canvas texture resolution**: From 1024x32 to 2048x64 with larger font (bold 28px)
2. **Increase tube radius**: From 0.015 to 0.025 so text is more visible
3. **Boost opacity**: Raise all streaming text opacity values
4. **Increase renderer DPR cap**: From 1.5 to 2.0 for retina sharpness
5. **Add texture filtering**: Use LinearFilter for sharper text rendering
6. **Higher contrast text color**: Use brighter/whiter gold tones

## Files
- `src/components/three/OctahedronHero.tsx` — texture, tube, opacity changes
- `src/components/three/FractalCityScene.tsx` — DPR cap increase

## Acceptance Criteria
- ASCII text clearly legible on the 3D model edges
- No visual regressions (wireframe, nav nodes, center octahedron intact)
- Mobile viewport still performs well (no excessive GPU load)

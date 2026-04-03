# FRAC-46: Replace Hero with WebGL 3D Animation from Prototype

## Scope

Replace the current Sierpinski ASCII art hero on the home page with an interactive 3D WebGL icosahedron hero. The prototype is fully working at `~/Documents/dev/fractal-nyc-3dprototype/` (commit `cd027c0`). This is a **3-file drop-in replacement** with no new dependencies.

## Files to Copy (Source -> Target)

1. **`src/components/sections/Hero.tsx`** — REPLACE current file
   - Removes: `SierpinskiCarpet` import and usage
   - Adds: Lazy-loaded `FractalCityScene`, `useLocation` from wouter, `FadeIn` component, skyline background with clip-path/mask, bottom text overlay

2. **`src/components/three/FractalCityScene.tsx`** — REPLACE current file
   - Adds: `OrbitControls` from drei, `onNavigate` prop, touch support (`touchAction: "none"`)

3. **`src/components/three/FractalObject.tsx`** — REPLACE current file
   - Adds: 8 interactive nav nodes (`NavNodeMesh`), clickable center sphere with hover, `Html` tooltips from drei, nav node mapping data

## Nav Node -> Vertex Mapping

| Label | Route | Color | Vertex Index | Position |
|-------|-------|-------|-------------|----------|
| Our Story | `/story` | `#E07A5F` | 2 | top-left |
| Co-Living | `/neighborhood` | `#8B7355` | 4 | upper-back |
| Events | `/events` | `#E07A5F` | 1 | upper-front |
| Campus | `/campus` | `#457B9D` | 6 | equator right-front |
| New Liberal Arts | `/new-liberal-arts` | `#1D3557` | 5 | equator left-back |
| Political Club | `/political-club` | `#CC2936` | 10 | equator right-back |
| Lab | `/lab` | `#6B4C9A` | 9 | lower-back |
| People | `/people` | `#457B9D` | 8 | bottom-left |

Center sphere click navigates to `/the-protocol`. All 9 routes verified against `App.tsx`.

## Implementation Steps

1. Create feature branch `frac-46-webgl-hero` from `master`
2. Copy the 3 prototype files over their counterparts:
   - `cp ~/Documents/dev/fractal-nyc-3dprototype/src/components/sections/Hero.tsx src/components/sections/Hero.tsx`
   - `cp ~/Documents/dev/fractal-nyc-3dprototype/src/components/three/FractalCityScene.tsx src/components/three/FractalCityScene.tsx`
   - `cp ~/Documents/dev/fractal-nyc-3dprototype/src/components/three/FractalObject.tsx src/components/three/FractalObject.tsx`
3. Run `pnpm typecheck` to verify no type errors
4. Verify the hero renders with 3D icosahedron, nav nodes work, etc.
5. Do NOT delete `SierpinskiCarpet.tsx` — it stays (moved to Protocol page by FRAC-45)
6. Commit and push

## Dependencies Verified

Already in `package.json` — no install needed:
- `three` ^0.183.2, `@react-three/fiber` ^9.5.0, `@react-three/drei` ^10.7.7
- `wouter` ^3.3.5, `framer-motion` 12.35.1

## Open Questions (flagged, not blocking)

1. **Mobile tap targets**: Nav node radius 0.06 may be small for phone fingers — test and consider 0.08-0.10
2. **Auto-rotation vs user interaction**: Currently auto-rotation continues after drag — may want to pause
3. **Node placement semantics**: Vertex-to-page mapping chosen for spatial spread, may iterate later
4. **DecorativeDot component**: Defined but unused — 4 skipped vertices could optionally show decorative dots

## Acceptance Criteria

1. The 3D icosahedron renders in the hero section on page load
2. 8 nav nodes visible on the icosahedron, each with correct color
3. Hovering a nav node shows a tooltip with the correct label
4. Clicking a nav node navigates to the correct route
5. Clicking the center sphere navigates to `/the-protocol`
6. OrbitControls allows rotation but not zoom/pan
7. Auto-rotation is active when user is not interacting
8. Skyline background visible behind the 3D scene
9. Bottom text overlay with "Explore our story" link visible
10. `pnpm typecheck` passes with no errors
11. No new dependencies added to `package.json`
12. Works on mobile viewport (375px) — scene renders, touch rotation works

## Complexity

Low. Direct file copy from a working prototype. No architectural changes, no new deps.

# FRAC-40: Prototype Metatron's Cube Hero Element

## Goal
Replace the icosahedron hero with a Metatron's Cube — nested hexahedra with all vertices interconnected, creating the sacred geometry pattern from the reference images.

## Geometry
- **13 Metatron nodes**: 1 center + 6 inner ring + 6 outer ring
- **All 78 connection lines** between every pair of nodes (C(13,2))
- **Central textured cube** (box geometry) with hero-bg.png wrapped around it
- **6 outer nodes** = the 6 houses (interactive, click-to-navigate)
- **6 inner nodes + 1 center** = decorative dots

## Layout (XY plane, Y-up)
- Outer ring (r≈2.0): 6 house nodes at 0°, 60°, 120°, 180°, 240°, 300°
- Inner ring (r≈1.0): 6 decorative nodes at 30°, 90°, 150°, 210°, 270°, 330°
- Center: (0, 0, 0)
- Inner ring nodes get slight Z alternation (±0.3) for 3D depth when rotating

## Interaction
- Slow auto-rotation (Y-axis primary, slight X tilt)
- Drag/touch to rotate (OrbitControls, no zoom/pan)
- Click outer nodes to navigate to house pages
- Hover shows tooltip with house name
- Central cube: click navigates to /the-protocol

## Files Changed
- `src/components/three/FractalObject.tsx` → rewrite as Metatron's Cube
- `FractalCityScene.tsx` and `Hero.tsx` stay mostly the same

## Acceptance Criteria
- Visual: dense web of lines forming Metatron's Cube pattern with textured cube center
- 6 outer nodes are the houses, clickable with tooltips
- Central cube has hero image texture
- Transparent background (no dark bg)
- Slow rotation + manual rotation
- Prototype quality — iteration expected

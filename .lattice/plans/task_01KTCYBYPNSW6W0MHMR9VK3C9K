# Octahedron face photos brightened — sRGB colorSpace fix

## Plan
Add `tex.colorSpace = THREE.SRGBColorSpace` after the successful `loadAsync(path).then(tex => ...)` in `src/components/three/OctahedronHero.tsx` (inside `usePerFaceMaterials`), before `setTextures(...)`.

One-line addition. Verify build + tests baseline.

## Acceptance
- colorSpace set on every loaded face texture
- Build passes
- Tests baseline preserved
- Manual smoke: photos render closer to raw JPEG colors (no over-bright shift)

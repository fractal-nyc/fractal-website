# Octahedron face photos brightened — sRGB colorSpace fix

## Plan
In `src/components/three/OctahedronHero.tsx` `usePerFaceMaterials` (around lines 485-492), add `tex.colorSpace = THREE.SRGBColorSpace;` right after the cancelled check and before `setTextures(...)`. Three.js renderer outputs to sRGB by default; without this flag, JPEG color data is treated as linear and renders ~20% brighter than source.

## Acceptance
- colorSpace set on every loaded face texture
- Build passes
- Tests baseline preserved
- Manual smoke: photos render with original tone

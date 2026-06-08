# Octahedron face color overlay (Photoshop overlay blend)

## Plan
In src/components/three/OctahedronHero.tsx `usePerFaceMaterials`:
1. Add a top-of-module constant `const OVERLAY_STRENGTH = 0.35;`
2. Replace the textured-branch `MeshBasicMaterial({ map: tex })` with a ShaderMaterial implementing Photoshop "Overlay" blend:
   ```glsl
   // For each channel:
   //   if (base < 0.5) result = 2.0 * base * blend
   //   else            result = 1.0 - 2.0 * (1.0 - base) * (1.0 - blend)
   // then lerp(base, result, strength)
   ```
3. Pass the per-face overlay color from `housePalette(sectionKey, "deep")` for House sections, or FACE_SECTION_COLORS[sectionKey] for story/people.
4. Keep the solid-color placeholder fallback (untextured) untouched.
5. Preserve tex.colorSpace = SRGBColorSpace setting from FRAC-35.

## Verify
- Build, tests
- Manual smoke: photos visibly tinted but detail intact

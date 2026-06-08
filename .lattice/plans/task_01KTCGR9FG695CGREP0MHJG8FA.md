# FRAC-20: Octahedron face tint + missing photo

## Decision (user, 2026-06-05)
- **Tint**: remove. Faces render untinted (texture as-is).
- **Missing photo**: political-club.jpeg (forum face). The file exists at public/images/banners/political-club.jpeg but was not in FACE_BANNER_IMAGES.

## Plan
1. Branch from master: `git checkout master && git pull && git checkout -b frac-20-octahedron-untint-restore-photo`
2. Edit src/components/three/OctahedronHero.tsx:
   - Add `forum: "/images/banners/political-club.jpeg"` to FACE_BANNER_IMAGES
   - Replace the ShaderMaterial branch (~lines 507-538) for textured faces with a plain MeshBasicMaterial:
     ```ts
     return new THREE.MeshBasicMaterial({
       map: tex,
       side: THREE.FrontSide,
     });
     ```
   - Remove the comment about tint blending — it's no longer accurate.
   - Leave the solid-color fallback for missing textures untouched.
3. Verify: build + tests, manual smoke (5 visible nav-node faces show their untinted photos; forum face now shows political-club.jpeg).

## Acceptance
- forum face has political-club.jpeg
- No ShaderMaterial in usePerFaceMaterials
- Faces render with their original photo colors (not darkened/shifted)
- Build passes, tests baseline preserved

## Reset 2026-06-05 by agent:claude-opus-4-7

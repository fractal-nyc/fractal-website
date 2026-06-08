# Revert overlay shader

## Plan
In src/components/three/OctahedronHero.tsx `usePerFaceMaterials`, remove the ShaderMaterial branch (added in FRAC-39, tweaked in FRAC-40) and restore plain MeshBasicMaterial for textured faces:

```ts
if (tex) {
  return new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.FrontSide,
  });
}
```

Remove:
- OVERLAY_STRENGTH constant
- HOUSE_SECTION_IDS Set (if added)
- overlayBlend GLSL helper
- ShaderMaterial / uniforms / vertex+fragment shaders

Keep:
- tex.colorSpace = THREE.SRGBColorSpace from FRAC-35
- Solid-color placeholder fallback untouched

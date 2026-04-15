# FRAC-9: 3D model: glowing + pulsing node animation

## Reset 2026-04-15 by agent:claude-opus-4-orchestrator

## Scope
Add subtle emissive pulse to each nav node sphere on the octahedron so the model feels alive. Ships with FRAC-5.

## Approach
- `src/components/three/OctahedronHero.tsx`:
  - `NavNodeMesh`: animate `emissiveIntensity` on the visible sphere via `useFrame`. Base intensity 1.0, pulse +/-0.6 sinusoidally with ~2.5s period. Phase offset per node (reuse the existing `phase` ref) so they don't all breathe in unison. Hover/reveal boosts intensity to 2.4 (still pulsing).
  - Implement via `materialRef` (ref on `meshStandardMaterial`), updated each frame.
  - Respect `prefers-reduced-motion`: when matched, clamp intensity to a static value (1.0 / 2.0 on hover).
- Keep existing scale pulse, click/hover behavior intact.

## Key files
- `src/components/three/OctahedronHero.tsx`

## Acceptance
- Nav nodes have visible glow that pulses slowly when reduced-motion is not set.
- `prefers-reduced-motion: reduce` disables the emissive pulse (static glow).
- No regressions to hover/click/tap behavior.
- Tests + typecheck + build green.

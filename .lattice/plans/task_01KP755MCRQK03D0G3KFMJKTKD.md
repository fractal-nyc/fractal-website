# FRAC-5: Update 3D model and popover menu to reflect nav changes

## Reset 2026-04-15 by agent:claude-opus-4-orchestrator

## Scope
Bring the 3D octahedron hero + overlay menu into parity with FRAC-161 (hide Political Club / People) and FRAC-163 (rename Neighborhood→Visit, NLA→Education, Lab→Publications). Ships in the same PR as FRAC-9 (glow/pulse).

## Approach
1. `src/components/three/OctahedronHero.tsx`:
   - Remove the `Political Club` entry from `OUTER_NAV_NODES`. Now 5 vertex nodes (Visit, Events, Campus, Education, Publications) on the 6-vertex octahedron — vertex index 4 simply has no node.
   - Labels already match (Visit / Education / Publications). No other renames needed.
   - Center octahedron: geometry is a regular 8-face octahedron where each face has a banner texture keyed to a section (one face per section). The whole center clicks to `/the-protocol` — there's no per-face click handler — so the Political Club face just shows as a texture. Desaturate the `forum` face visually: skip the banner texture for `forum` and fall back to a dimmed solid color so it reads as de-emphasized without breaking geometry.
2. `src/components/layout/Navbar.tsx`:
   - Overlay already renders 6 buttons (tests assert this). Verify rhythm at 375px — current `min-h-[56px]` + border rows stack comfortably. No structural changes; overlay parity is already achieved via FRAC-161. Keep as-is.

## Key files
- `src/components/three/OctahedronHero.tsx`
- `src/components/layout/Navbar.tsx` (verify only)

## Acceptance
- Octahedron has 5 visible labeled nav nodes, all matching current displayNames.
- `forum` face is visually de-emphasized (dim color, no banner).
- Overlay menu renders 6 buttons at 375px without layout issues.
- `pnpm typecheck`, `pnpm test`, `pnpm build` green relative to master baseline.

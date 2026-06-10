# FRAC-66: Octahedron photo orientation — top photos face up, bottom photos face down

## The rule (restated)

For every triangular face on the center octahedron, the **top edge of the photo** must point **AWAY from the equator**:

- **Upper-half faces** (4 faces sharing the +Y pole): photo's top edge points UP (toward +Y, away from the equator).
- **Lower-half faces** (4 faces sharing the -Y pole): photo's top edge points DOWN (toward -Y, away from the equator).

When viewed from above, all upper-half photos read right-side-up. When viewed from below, all lower-half photos read right-side-up.

## Background — how the photo lands on a face today

The center octahedron is built by `usePerFaceOctahedronGeometry(radius=1)` at `src/components/three/OctahedronHero.tsx:425-464`. Each of the 8 triangular faces is given its own material group (face `i` uses material `i`), and the 8 materials are built in `usePerFaceMaterials()` (`:486-550`) from textures loaded by `THREE.TextureLoader.loadAsync()`. Plain `MeshBasicMaterial` with `tex.colorSpace = SRGBColorSpace`. No per-face rotation today.

The orientation of the photo on each face is controlled entirely by the **UV coordinates** assigned in `usePerFaceOctahedronGeometry` (`:446-460`). The current UV scheme is uniform across all 8 faces:

```
vertex 0 of triangle → UV (0.5, 1.0)   // "top center" of the photo
vertex 1 of triangle → UV (0.0, 0.0)   // bottom-left of the photo
vertex 2 of triangle → UV (1.0, 0.0)   // bottom-right of the photo
```

So whichever 3D vertex of the triangle is **vertex 0 in the index buffer** gets mapped to the top of the photo (UV.y = 1.0). That is where the orientation is decided.

## Three.js OctahedronGeometry face layout

`new THREE.OctahedronGeometry(1, 0)` (`PolyhedronGeometry` source) declares 6 vertices and 8 triangle indices:

| Index | Vertex      |
|-------|-------------|
| 0     | (+1, 0, 0)  = +X (equator) |
| 1     | (-1, 0, 0)  = -X (equator) |
| 2     | ( 0, +1, 0) = +Y (TOP pole) |
| 3     | ( 0, -1, 0) = -Y (BOTTOM pole) |
| 4     | ( 0, 0, +1) = +Z (equator) |
| 5     | ( 0, 0, -1) = -Z (equator) |

Index buffer (8 triangles, in order):

| Face | Triangle indices | Vertices (v0, v1, v2)        | Pole vertex (which v0/v1/v2?) | Half  |
|------|------------------|------------------------------|-------------------------------|-------|
| 0    | 0, 2, 4          | +X, **+Y**, +Z                | v1 = +Y                       | UPPER |
| 1    | 0, 4, 3          | +X, +Z, **-Y**                | v2 = -Y                       | LOWER |
| 2    | 0, 3, 5          | +X, **-Y**, -Z                | v1 = -Y                       | LOWER |
| 3    | 0, 5, 2          | +X, -Z, **+Y**                | v2 = +Y                       | UPPER |
| 4    | 1, 2, 5          | -X, **+Y**, -Z                | v1 = +Y                       | UPPER |
| 5    | 1, 5, 3          | -X, -Z, **-Y**                | v2 = -Y                       | LOWER |
| 6    | 1, 3, 4          | -X, **-Y**, +Z                | v1 = -Y                       | LOWER |
| 7    | 1, 4, 2          | -X, +Z, **+Y**                | v2 = +Y                       | UPPER |

(Verified against Three.js' `OctahedronGeometry` source: `indices = [0,2,4, 0,4,3, 0,3,5, 0,5,2, 1,2,5, 1,5,3, 1,3,4, 1,4,2]`. `toNonIndexed()` preserves this order, so face `f` occupies vertices `[3f, 3f+1, 3f+2]` in the position attribute.)

The pole vertex is **v1** on faces `0, 2, 4, 6` and **v2** on faces `1, 3, 5, 7`. With current UVs (v0 → top of photo), the pole is at the BOTTOM of the photo and the top of the photo points to an EQUATOR vertex on every face — which is why some photos read wrong.

## Face inventory (with FACE_SECTION_MAP at `:409`)

Current FACE_SECTION_MAP (current `master`):
`[campus, events, lab, school, neighborhood, people, forum, story]`

Note: the order shipped in `task_01KTD2ASC6J8RW1NG1K3W4AT1N.md` (`people` at index 3) was later overwritten — verify with a fresh read at implementation time. The orientation logic does NOT depend on which photo is on which face, so FACE_SECTION_MAP can change without breaking this plan.

| Face | Section (today) | Pole at vertex | Half  | Current "top of photo" points to | Correct? | Required UV change |
|------|-----------------|----------------|-------|----------------------------------|----------|-----------------------|
| 0    | campus          | v1 (+Y)        | UPPER | v0 = +X (equator)                | **NO**   | move "top" to v1      |
| 1    | events          | v2 (-Y)        | LOWER | v0 = +X (equator)                | **NO**   | move "top" to v2      |
| 2    | lab             | v1 (-Y)        | LOWER | v0 = +X (equator)                | **NO**   | move "top" to v1      |
| 3    | school          | v2 (+Y)        | UPPER | v0 = +X (equator)                | **NO**   | move "top" to v2      |
| 4    | neighborhood    | v1 (+Y)        | UPPER | v0 = -X (equator)                | **NO**   | move "top" to v1      |
| 5    | people          | v2 (-Y)        | LOWER | v0 = -X (equator)                | **NO**   | move "top" to v2      |
| 6    | forum           | v1 (-Y)        | LOWER | v0 = -X (equator)                | **NO**   | move "top" to v1      |
| 7    | story           | v2 (+Y)        | UPPER | v0 = -X (equator)                | **NO**   | move "top" to v2      |

**All 8 faces need an orientation fix.** The current uniform UV scheme puts the photo "top" on an equator vertex for every face. None of them are correct.

## Approach

Change the UV mapping in `usePerFaceOctahedronGeometry` (`src/components/three/OctahedronHero.tsx:446-460`) so that the **pole vertex** of each triangle (whichever is +Y or -Y) gets UV `(0.5, 1.0)` and the two equator vertices get `(0,0)` and `(1,0)`.

Implementation:

1. Inside the `for (let f = 0; f < faceCount; f++)` loop, also inspect the three position vectors of the triangle (`posAttr.getX/Y/Z(3f), (3f+1), (3f+2)`).
2. Identify which of v0, v1, v2 is the pole — the vertex whose absolute Y is the largest (it will be ±1; the other two have y=0). Call it `poleIdx ∈ {0, 1, 2}`.
3. Assign UVs:
   - `poleIdx` → `(0.5, 1.0)`
   - The other two vertices (the equator vertices) → `(0.0, 0.0)` and `(1.0, 0.0)`. Order doesn't matter for orientation (it just mirrors the photo's left/right), but pick a stable rule for determinism — e.g. the vertex with the lower index in `[0,1,2] \ {poleIdx}` gets `(0,0)`.
4. **Lower-half faces additionally need the photo flipped vertically.** Putting the pole at UV (0.5, 1.0) and equator at y=0 makes the photo's "top edge" point toward the pole on every face. That is exactly the rule for upper faces (pole at +Y is UP). For lower faces, the pole is -Y (down) — pointing the photo's top toward the pole = pointing it DOWN, which is what we want. So **no additional flip is needed** — the single rule "pole vertex gets UV (0.5, 1.0)" satisfies both halves.

Concretely, the change is the UV assignment block. Pseudocode:

```ts
for (let f = 0; f < faceCount; f++) {
  const base2 = f * 3 * 2;
  // Find which of the 3 triangle vertices is the pole (|y| ~ radius).
  const ys = [posAttr.getY(3*f), posAttr.getY(3*f+1), posAttr.getY(3*f+2)];
  const poleIdx = ys.findIndex(y => Math.abs(y) > 0.5);  // the only pole vertex
  // Assign UVs: pole → top-center, equator pair → bottom-left/right.
  const equatorVerts = [0,1,2].filter(i => i !== poleIdx);
  const uvForTri: [number, number][] = [[0,0], [0,0], [0,0]];
  uvForTri[poleIdx]        = [0.5, 1.0];
  uvForTri[equatorVerts[0]] = [0.0, 0.0];
  uvForTri[equatorVerts[1]] = [1.0, 0.0];
  for (let v = 0; v < 3; v++) {
    uvs[base2 + v*2]     = uvForTri[v][0];
    uvs[base2 + v*2 + 1] = uvForTri[v][1];
  }
}
```

This is **one localized edit** to a single function. No other file changes, no FACE_SECTION_MAP edit, no per-face rotation property needed.

## Key files

- `src/components/three/OctahedronHero.tsx` — edit `usePerFaceOctahedronGeometry` UV loop at lines **446-460**. Sole change.

## Acceptance criteria

- **Visual:** Every photo on the center octahedron has its top edge pointing away from the equator.
  - The 4 upper faces (sharing the +Y top pole) read right-side-up when viewed from above.
  - The 4 lower faces (sharing the -Y bottom pole) read right-side-up when viewed from below.
- **Order preserved:** FACE_SECTION_MAP is NOT modified. The same photo lives on the same face index it does today.
- **No regression:** Auto-rotation still works, textures still load (`tex.colorSpace = SRGBColorSpace` preserved), no console errors, no Three.js geometry warnings.
- **`prefers-reduced-motion`** still freezes scene rotation (FRAC-28 behavior unaffected — we touch geometry, not motion).

## Validation

1. `npm run dev`, open `/`, watch the hero octahedron auto-rotate slowly. Verify by eye:
   - As an upper-half face rotates into view above the equator, its photo reads right-side-up (top toward +Y).
   - As a lower-half face rotates into view below the equator, its photo reads right-side-up when you tilt to look from below — i.e. the photo's "top" points toward -Y.
2. Check each of the 8 photos in turn (campus, events, lab, school, neighborhood, people, forum, story) — note that `forum` (Political Club) is a real photo per FRAC-20.
3. Test on **mobile viewport (375px baseline)** — this is a mobile-first site (per CLAUDE.md). Verify on iOS Safari that the orientation reads correctly throughout the 360° auto-rotation cycle.
4. Run unit tests: `npm test -- src/__tests__/hero-scroll.test.tsx` — the hero scroll test must still pass (not orientation-related but it's the only hero test).
5. Run `npm run lint` and `npm run build` to confirm no TS errors from the UV-loop change.

## Out of scope

- **Photo ORDER stays the same** — `FACE_SECTION_MAP` (`:409`) is NOT touched.
- Photo content / cropping / color (orientation only — no banner replacements).
- Nav node placement, edge text, octahedron motion behavior.
- Wireframe outer / inner octahedra (`octahedronGeometry args={[1.7, 1]}` and `args={[1.3, 0]}` at `:832, :844`) — those have no textures, only the center octahedron at radius 1 carries the photos.

## Complexity

Low. One function, ~15 lines of changed code, deterministic mapping. The whole investigation was the hard part.

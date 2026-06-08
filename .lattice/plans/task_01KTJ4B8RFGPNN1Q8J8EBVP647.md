# FRAC-49 — Strip dead comingSoon plumbing from OctahedronHero

**Complexity:** low
**Branch:** `frac-49-coming-soon-cleanup`

## Context

In FRAC-47 (PR #169) the only `OUTER_NAV_NODES` entry that set `comingSoon: true` — the FRAC-36 Political Club placeholder at vertex 4 — was replaced with a Story node. The `comingSoon?: boolean` field on the `NavNode` interface in `src/components/three/OctahedronHero.tsx` is now unused: no entry sets it, but four consumer branches still read it. FRAC-47's reviewer flagged these; the impl agent left them in place because removal was orthogonal to the swap. This task closes that follow-up.

**Planner-verified facts:**
- 5 references total: 1 interface field (line 112) + 4 consumer branches (lines 722, 742, 757, 765).
- 0 setters anywhere; no `OUTER_NAV_NODES` entry uses the field.
- `NavNode` is file-local (NOT exported). External callers (`Hero.tsx`, `hero-scroll.test.tsx`, `FractalCityScene.tsx`) read only `route` and `label`.
- Each consumer branch's "false" path is the always-taken behavior; collapsing each to that path is a pure no-op for every existing node.

## Scope

Pure dead-code removal in a single file:
1. Drop `comingSoon?: boolean` from the `NavNode` interface.
2. Remove every consumer branch that gates on `node.comingSoon`. Collapse each to the always-taken false-path.

## Files to edit

- `src/components/three/OctahedronHero.tsx` — only file touched.

## Line-by-line edits (line numbers at master HEAD post-PR #170)

### Edit 1 — NavNode interface (~line 112)

```ts
// Before
interface NavNode {
  label: string;
  route: string;
  color: string;
  vertexIndex: number;
  comingSoon?: boolean;
}

// After
interface NavNode {
  label: string;
  route: string;
  color: string;
  vertexIndex: number;
}
```

### Edit 2 — tap handler (~lines 718-723)

```ts
// Before
    // FRAC-36: "Coming Soon" placeholder nodes surface the tooltip on tap
    // but do not route. On touch the first-tap branch above already showed
    // the tooltip; on desktop the hover state shows it. Either way, swallow
    // the navigation here.
    if (node.comingSoon) return;
    onNavigate(node.route);

// After
    onNavigate(node.route);
```

(Comment block goes too — it describes a path that no longer exists.)

### Edit 3 — tooltip cursor (~line 742)

```ts
// Before
            <div
              style={{
                ...tooltipStyle(node.color),
                cursor: node.comingSoon ? "default" : "pointer",
              }}

// After
            <div
              style={{
                ...tooltipStyle(node.color),
                cursor: "pointer",
              }}
```

### Edit 4 — tooltip onClick (~lines 754-759)

```ts
// Before
              onClick={(e) => {
                e.stopPropagation();
                // FRAC-36: non-navigable placeholder. Tooltip is the surface.
                if (node.comingSoon) return;
                onNavigate(node.route);
              }}

// After
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(node.route);
              }}
```

### Edit 5 — tooltip label render (~lines 761-765)

```tsx
// Before
              {/* FRAC-37: Coming Soon placeholder shows ONLY "Coming Soon"
                  (rendered uppercase by tooltipStyle's textTransform), at
                  the same visual prominence as other nav tooltips — no
                  small subline, no Political Club caption. */}
              {node.comingSoon ? "Coming Soon" : node.label}

// After
              {node.label}
```

### Optional housekeeping

The block comment at lines ~95-105 describing the FRAC-47 swap stays — it's still accurate post-cleanup. Do not modify it.

## Out of scope

- Face order, FACE_SECTION_MAP, FACE_SECTION_COLORS.
- Navbar, houses.ts, Hero.tsx, FractalCityScene.tsx.
- The Story node visuals/routing (already shipped in FRAC-47).

## Approach

1. Apply the 5 edits in `src/components/three/OctahedronHero.tsx`.
2. `grep -n "comingSoon" src/components/three/OctahedronHero.tsx` → expect 0.
3. `grep -rn "comingSoon" src/` → expect 0.
4. `pnpm tsc --noEmit` + `pnpm build` clean.
5. `pnpm test` baseline 143/4.
6. Visual smoke at 375px + desktop — vertex 4 Story node still taps through to `/story`.

## Acceptance criteria

- `grep -n "comingSoon" src/components/three/OctahedronHero.tsx` returns 0.
- `grep -rn "comingSoon" src/` returns 0.
- TypeScript build passes.
- Tests pass baseline 143/4.
- Octahedron renders correctly at 375px + desktop.
- Vertex 4 Story node behavior unchanged.
- Diff touches exactly 1 file.
- No exports changed.

## Risk

Near-zero. Each removed branch is a pure short-circuit with no side effects. Interface field is optional and unset everywhere.

## Critical files

- `/Users/fractalos/Dev/fractal-nyc/src/components/three/OctahedronHero.tsx` — the only file edited.

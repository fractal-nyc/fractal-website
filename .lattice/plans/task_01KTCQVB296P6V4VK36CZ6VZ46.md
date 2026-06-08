# FRAC-25: Delete dead FractalObject.tsx

## Plan
1. Verify zero live imports: `grep -rn "from.*['\"].*FractalObject['\"]" src/ | grep -v OctahedronHero`. Should return only the commented-out reference in FractalCityScene.tsx:7.
2. `rm src/components/three/FractalObject.tsx`
3. Remove the commented-out import line in FractalCityScene.tsx:7 (or leave it as a one-line tombstone with date — implementer's call).
4. Verify: `pnpm build` succeeds; `pnpm test` passes.
5. Visual smoke: load home page + at least one house page (Campus or Events) — should look identical.
6. Commit on branch `frac-25-delete-fractalobject`. PR optional (small enough to wait until other cleanups batch).

## Acceptance
- File deleted
- Build passes
- Tests pass
- No visual regression

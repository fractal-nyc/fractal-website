# FRAC-29: Navbar Jacquard sizes — fixed-px to clamp()

## Plan
Convert every fixed-pixel Jacquard `fontSize:` literal in `src/components/layout/Navbar.tsx` to `clamp(min, vw, max)`, matching the existing mobile-variant pattern (lines 323, 329 already do this). Replacements:
- `"82px"` (:163) → `clamp(42px, 8vw, 82px)`
- `"50px"` (:255) → `clamp(28px, 5.5vw, 50px)`
- `"48px"` (:169) → `clamp(27px, 5vw, 48px)`
- `"42px"` (:200) → `clamp(24px, 4.5vw, 42px)`

Only edit Navbar.tsx. Verify build passes, no test regressions, 375px viewport doesn't horizontally overflow.

## Acceptance
- Zero fixed-px Jacquard fontSize in Navbar.tsx
- Build passes
- No new test failures vs master baseline

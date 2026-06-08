# FRAC-26: Cream normalize

## Plan
Canonical cream = #f8f6f0 (user-confirmed, recorded on FRAC-19).

1. Find every literal: `grep -rn '#faf8f5\|#FAF8F5\|rgba(250,\s*248,\s*245' src/`
2. Expected sites:
   - src/pages/Home.tsx:25 — `bg-[#faf8f5]` (Golden Age Protocol section)
   - src/components/sections/Hero.tsx (hero / search input / dropdown backgrounds)
   - src/index.css:152 — `.hero-text-shadow` rgba(250,248,245,...)
   - src/components/three/OctahedronHero.tsx:764 — tooltip rgba(250,248,245,...)
3. Replace each:
   - Tailwind classes: `bg-[#faf8f5]` → `bg-background`
   - Inline hex literals: `#faf8f5` → `#f8f6f0`
   - rgba: `rgba(250, 248, 245, X)` → `rgba(248, 246, 240, X)` (preserve alpha)
4. Fix the stale comment at src/index.css:46 — change `/* #f7f6f2 - Warm off-white */` to `/* #f8f6f0 — warm off-white */`
5. Do NOT touch FractalCityScene.tsx ambient light `#f5f0ea` — out of scope (3D ambient, not surface paint)

Verify: zero `#faf8f5` / `#FAF8F5` / `rgba(250,248,245` in src/, build passes, tests match master baseline.

## Acceptance
- grep clean
- Build passes
- Comment corrected
- No visible color regression

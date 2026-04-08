# FRAC-78: Move Fractal U button higher into view

## Problem
On 375px mobile, the Fractal U section is pushed below the fold by:
1. Giant "N" letter at `text-[10rem]` (160px) in SectorHeader
2. Large subtitle at `text-4xl` with `mb-6`
3. "Coming June 2026" paragraph with `mb-16` (64px bottom margin)
4. Section has `py-24` (96px top+bottom padding) and `min-h-screen` with flex centering

## Approach
1. Reduce `py-24` to `pt-6 pb-24` on `LiberalArts` section (less top padding since Navbar already provides offset)
2. Remove `min-h-screen` and vertical centering — let content flow naturally from top
3. Reduce SectorHeader letter size on mobile from `text-[10rem]` to `text-[7rem]` and reduce bottom margin
4. Reduce `mb-16` on the "coming June 2026" paragraph to `mb-8`
5. These changes combined should bring Fractal U heading and buttons into view or near-view on 375px

## Files
- `src/components/sections/LiberalArts.tsx` — main layout changes
- `src/components/layout/SectorHeader.tsx` — reduce mobile letter size

## Acceptance criteria
- Fractal U heading visible on 375px viewport without scrolling (or with minimal scroll)
- First paragraph ("Tech, Entrepreneurship...") still readable
- No layout regressions on desktop

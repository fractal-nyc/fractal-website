# FRAC-185: Fix banner/content overlap on events, visit, education pages

## Problem
Banners from FRAC-184 overlap hero text and Luma iframe because target pages have full-width content.

## Banner geometry (FRAC-184)
- inset-x: 16 → 64px (mobile → lg)
- width: `w-[24%] md:w-[16%] max-w-[210px]`
- Inner edge from viewport edge on md+: ~22% (banner takes ~16% + ~6% inset)

## Fix
1. **Hide banners < md**: change `flex justify-between` → `hidden md:flex md:justify-between` on each page's banner container. Mobile has no room for both banners + content.
2. **Add content-zone padding on md+**: change `md:px-[4.5%]` → `md:px-[22%]` on the content sections of all three pages. 22% > banner inner edge, so content always clears.

## Files
- `src/pages/EventsPage.tsx` — banner container + section padding
- `src/pages/NeighborhoodPage.tsx` — banner container + inner div padding
- `src/pages/LiberalArtsPage.tsx` — banner container only
- `src/components/sections/LiberalArts.tsx` — content padding (LiberalArtsPage uses this component)

## Acceptance
- No content overlap on md+ at events/visit/education pages
- Banners hidden on mobile (<md)
- Campus page untouched
- typecheck + build pass

## Complexity
low.

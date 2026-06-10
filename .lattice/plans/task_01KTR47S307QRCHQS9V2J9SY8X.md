# FRAC-184: Add flanking pennant banners to events, visit, and education pages

## Scope
Replicate the existing campus-page flanking-pennant pattern on three additional house pages, using the three banner SVGs the user dropped on the Desktop.

## Reference pattern (campus page)
`src/pages/CampusPage.tsx` lines 24–35 contain the pattern:
- `aria-hidden` absolutely-positioned flex container, `pointer-events:none`
- Inset: `inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16`
- Top: `top-28 md:top-36`
- Inline height: `min(72vh, 660px)`
- Two children, `pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]`, each rendering a banner component
- Banner component (`CampusBannerSVG`) loads `/images/banners/<name>.svg` via `<img>`, applies `drop-shadow(0 8px 20px rgba(0,0,0,0.22))`

The three new SVGs are drop-in replacements: same `viewBox="0 0 122.72 368.16"`, same V-notch path. No CSS or layout changes needed.

## Steps

1. **Copy SVG assets** into `public/images/banners/`:
   - `events-banner.svg`
   - `visit-banner.svg`
   - `education-banner.svg`

2. **Create three thin React components** in `src/components/house/`, mirroring `CampusBannerSVG.tsx` exactly (only the `src` differs):
   - `EventsBannerSVG.tsx`
   - `VisitBannerSVG.tsx`
   - `EducationBannerSVG.tsx`

3. **Insert the flanking-pennant block** into each page, immediately after `<Navbar />`, copying the campus page structure verbatim (only the banner component differs):
   - `src/pages/EventsPage.tsx` → `EventsBannerSVG`
   - `src/pages/NeighborhoodPage.tsx` → `VisitBannerSVG`
   - `src/pages/LiberalArtsPage.tsx` → `EducationBannerSVG`

   Note: these three pages don't have a discrete "hero" element like CampusPage does — they begin with `<SectorHeader>` content directly. The banners will flank the top of the main content area; the same `top-28 md:top-36` offset places them just below the navbar, matching campus.

## Acceptance criteria
- All three pages render with two flanking pennants in the same position/size as the campus page
- No regressions to existing page content (banners are `aria-hidden`, `pointer-events:none` at container)
- TypeScript and lint pass
- Banners hidden from assistive tech (aria-hidden inherited from container)

## Complexity
low — pure additive change, established pattern, no design decisions.

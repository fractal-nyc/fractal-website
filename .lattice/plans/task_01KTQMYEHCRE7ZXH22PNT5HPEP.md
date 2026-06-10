# FRAC-182 — Campus page flanking banners with new SVG art

## Goal
Wire `~/Desktop/campus-banner-final.svg` into the live site. Replace the existing campus.jpeg + HTML "C" + tagline with the SVG (which bakes those in), and add two flanking instances of the campus banner on the campus page hero, per the user-provided desktop and mobile mockups. Preserve the prior drop-shadow + hover animation behavior.

## Approach

1. **Save the SVG as a React component** at `src/components/house/CampusBannerSVG.tsx`.
   - Inline the SVG (paths verbatim from the source file).
   - Strip the embedded base64 `@font-face` for Jacquard 24 — the font is already loaded globally via Google Fonts in `src/index.css`, so the embedded font is ~70 KB of duplicate bytes.
   - Accept a `mirrored?: boolean` prop that horizontally flips the SVG via `transform: scaleX(-1)` (for the right-side flanker).
   - `preserveAspectRatio="xMidYMid meet"` and `width="100%" height="100%"` so the parent container controls size.

2. **Modify `HouseBanner.tsx`** — special-case `house.id === "campus"`:
   - Render `<CampusBannerSVG />` instead of the photo `<img>`, the bg-color overlay, the HTML `<span>` monogram, and the `<p>` tagline (all baked into the SVG).
   - Drop the outer `clipPath` for campus (the SVG provides its own V-notch).
   - Drop the outer `MandelbrotIcon` for campus (the SVG has the Mandelbrot pocket baked in via the elliptical mask).
   - Keep the wrapper `<div>` so existing layout/sizing props still apply.
   - Non-campus banners are unchanged.

3. **Add flanking banners to `CampusPage.tsx`**:
   - Wrap the page in a `relative` container; place two `CampusBannerSVG` instances absolutely positioned flanking the hero area (left flush, right flush, right one `mirrored`).
   - Use `pointer-events: none` so they don't block clicks on central content.
   - Desktop (≥ md): banners are ~14% viewport width each, anchored to the top of the hero.
   - Mobile (< md): banners are ~22% viewport width each, narrower so central hero content stays readable at 375px baseline.
   - Banners only flank the hero (top ~screen height). Below the fold the rest of the page renders normally.

4. **Drop shadow + hover animation**:
   - Baseline: `filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.22))` so the shadow follows the V-notch (same technique as FRAC-140 on the grid).
   - On hover: stronger shadow + scale up slightly (`transform: scale(1.02)`).
   - Smooth `transition: filter 300ms, transform 300ms`.

5. **Validation**:
   - Start the Vite dev server, load `/campus` in Chrome at desktop and 375px mobile widths.
   - Verify the central `C` (SectorHeader) sits between the two flanking banners.
   - Verify the home grid's campus banner now uses the new SVG.
   - Verify hover scales + lifts the shadow on both placements.
   - Verify no regression on the 5 other house banners in the home grid.
   - Verify central content remains visible and clickable (z-index + pointer-events correct).

## Key files
- `src/components/house/CampusBannerSVG.tsx` (new)
- `src/components/house/HouseBanner.tsx` (modified — campus branch)
- `src/pages/CampusPage.tsx` (modified — wrap with flanking layout)

## Acceptance criteria
- [ ] Campus page hero shows two flanking SVG banners (left + mirrored right) on desktop and mobile.
- [ ] Home grid's campus banner uses the new SVG (no jpeg, no HTML C, no HTML tagline).
- [ ] Drop shadow follows the V-notch (no rectangular shadow leaking past).
- [ ] Hover scales the banner and lifts the shadow.
- [ ] No regression on the 5 other house banners in the home grid.
- [ ] No regression on the campus page central content (SectorHeader, body content, buttons visible and clickable).
- [ ] Mobile 375px baseline does not crowd central content.

## Branch
`frac-182-campus-banner-svg`


# FRAC-190: Update Events banner SVG to new design, re-add EVENTS wordmark

## Scope
Replace `public/images/banners/events-banner.svg` with the user's redesign
(`~/Downloads/events-banner-final 1.svg`) and re-add the only missing element:
the blackletter **EVENTS** wordmark. (User confirmed the central monogram is
already present in the redesign — do NOT re-add it.)

## What's missing in the redesign
- The redesign exported without the live text: no `<text>`, no embedded
  `Jacquard 24` `@font-face`, no `EVENTS` string.
- The monogram glyph IS present (vectorized) — leave it.

## Approach
Transplant from the current `events-banner.svg` into the redesign:
1. The embedded `@font-face` (`Jacquard 24`, base64) `<style>` block — required
   for the blackletter wordmark to render.
2. The `#eventsArc` path: `M 17 56.85 Q 61.36 47.85 105.72 56.85`.
3. The EVENTS wordmark element:
   `<text font-family="'Jacquard 24'" font-size="17" fill="#D4857A" letter-spacing="0.5"><textPath href="#eventsArc" startOffset="50%" text-anchor="middle">EVENTS</textPath></text>`
- Coordinate systems match (current viewBox 122.72×368.16 ≈ redesign 123×369),
  so original coordinates align. Place the wordmark element after the main art
  group so it renders on top.
- Keep `#D4857A` (matches the redesign's decorative fills).
- Verify position vs the redesign's top flourishes; nudge the arc Y only if it
  overlaps.

## Key files
- `public/images/banners/events-banner.svg` (replace with merged redesign)
- `EventsBannerSVG.tsx` unchanged (still points at the same path).

## Acceptance criteria
- Banner shows the redesigned art + the EVENTS wordmark near the top, blackletter, `#D4857A`, not overlapping flourishes.
- Renders correctly (Chrome rasterization check) and on the Events page.
- `npm run build` succeeds.

## Complexity: low

# FRAC-188: Replace Fractal NYC diagram on Story page

## Scope
Swap the diagram rendered in `OriginStory.tsx` for the new octagon "Fractal Collective" diagram supplied by the user.

## Approach
- New asset is a transparent PNG (3833×3063). The Story page background is gold `#D4BA58`; the transparent PNG composites cleanly over it (verified by compositing preview — text/lines read well on gold). No dark backing panel needed.
- Downscale to ~1920px wide (matching the prior asset) and optimize to keep payload reasonable for a mobile-first site, then overwrite `public/images/fractal-nyc-diagram.png` (same filename → no path changes).
- Update the `alt` text in `OriginStory.tsx:25` to describe the new diagram's labels: Campus, Visit, Events, Education (Fractal Tech + Fractal University).

## Key files
- `public/images/fractal-nyc-diagram.png` (replace)
- `src/components/sections/OriginStory.tsx` (alt text)

## Acceptance criteria
- Story page renders the new diagram full-width, readable on the gold background, mobile + desktop.
- Image payload not larger than the previous asset.
- `npm run build` succeeds.
- Only the diagram asset and OriginStory.tsx are staged (do not touch unrelated pre-existing working-tree changes).

## Complexity: low

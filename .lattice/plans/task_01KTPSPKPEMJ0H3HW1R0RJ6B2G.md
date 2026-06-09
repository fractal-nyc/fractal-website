# FRAC-59: Story page: replace SVG diagram with PNG image that scales correctly on mobile

On the Story page, replace the existing SVG diagram (the Fractal NYC five-pillar diagram showing Events / Community-run University / Fractal Tech / Venues / Housing Network arranged around a central Fractal NYC node) with a PNG version of the same diagram.

Reason: the current SVG diagram scales oddly on mobile (likely because internal text/positioning isn't fluidly responsive). The PNG is a flat raster — it will scale predictably with object-fit / width constraints and avoid the mobile rendering glitch.

Source image: /Users/fractalos/Desktop/fractal nyc transparent.png (transparent background — should sit cleanly on Story page background).

Implementation steps:
1. Copy the source PNG into the project's public assets (e.g., public/images/ or wherever Story-page assets live — match existing conventions).
2. Locate the current SVG diagram component/element on the Story page.
3. Replace it with an <img> (or Next.js <Image>) pointing at the new PNG, with appropriate alt text ('Fractal NYC neighborhood campus diagram — five pillars: Events, Community-run University, Fractal Tech, Venues, Housing Network').
4. Constrain max-width so it sits centered and readable on desktop without being huge; full-width with mx-auto on mobile.
5. Delete the SVG component / file if no longer used.

Acceptance: (a) PNG renders on Story page in place of SVG; (b) scales cleanly at 375px (no oddly-cropped text or layout drift); (c) scales cleanly at desktop (not pixelated — source is high-res); (d) alt text present; (e) old SVG removed if dead.

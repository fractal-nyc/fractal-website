# FRAC-82: Footer - bold styling, large Jacquard fractal font, Mandelbrot branding

## Approach
- Add a dark branding band at the bottom of the footer with inverted colors (bg-foreground, text-background)
- Render large "FRACTAL" text using Jacquard 24 font with responsive sizing via clamp()
- Add MandelbrotIcon as watermark background and corner accents
- Add "New York City Collective" tagline and copyright
- Mobile-first: text scales from 64px (mobile) to 160px (desktop) using clamp(64px, 15vw, 160px)

## Acceptance criteria
- Large FRACTAL text visible in Jacquard 24 font
- Mandelbrot branding present (watermark + corners)
- Footer is visually bold and prominent with dark band
- Responsive on mobile viewports

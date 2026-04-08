# FRAC-88: Footer overhaul — Plan

## Scope
Rewrite `src/components/layout/Footer.tsx` to meet all 6 requirements.

## Approach
1. Restructure footer: upper CTA area (cream bg with border) and lower branding band (black bg, white text, centered).
2. CTA section: centered text with Discord link and Ian scheduling link as clickable anchors. Include "NEW YORK CITY" and "HELLO@FRACTALNYC.COM".
3. Lower branding band: "Fractal" in camelCase (not "FRACTAL"), italic, Jacquard 24 font. Keep Mandelbrot decorations.
4. All text in black area is white. Full-width centered layout.
5. Mobile-first: text wraps cleanly at 375px.

## Acceptance criteria
- "Fractal" appears as camelCase, never ALL-CAPS
- CTA text present with working Discord and calendar links
- NYC and email displayed
- All text white on black background
- Text centered, full-width
- Brand text is camelCase and italic
- Builds without errors

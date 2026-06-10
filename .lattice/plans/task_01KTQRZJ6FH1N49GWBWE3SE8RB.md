# FRAC-183 — Footer Fractal wordmark links to home

## Plan
Swap the `<div>Fractal</div>` wordmark in `src/components/layout/Footer.tsx` for a wouter `<Link href="/">`. Keep all inline typography (Jacquard 24, clamp size, letter-spacing). Add `cursor-pointer` + a hover color shift (`hover:opacity-80`) so the affordance reads.

## Acceptance
- Click the "Fractal" wordmark on any inner page → SPA-navigates to `/`.
- Typography unchanged from the existing render.

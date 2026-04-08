# FRAC-84: Home scroll-up menu: add Fractal Collective like mobile layout

## Scope
Update the scrolled home navbar (the compact bar that appears when scrolling up after scrolling down on the home page) to include "Fractal Collective" branding — matching the style used in the mobile full navbar.

## Current State
- The scrolled home navbar (line 288-301 of Navbar.tsx) only shows "Fractal" in Jacquard font + a hamburger menu button.
- The mobile full navbar (line 149-199) shows "Fractal" in Jacquard + "Collective" in serif italic below it.
- The desktop full navbar (line 101-146) shows the same "Fractal" + "Collective" layout at larger sizes.

## Approach
Replace the single "Fractal" text in the scrolled compact bar with the "Fractal" + "Collective" two-line logo treatment, scaled appropriately for the compact bar height. Use the same font families (Jacquard 24 for "Fractal", serif italic for "Collective") at sizes that fit within the h-20 bar.

### Key files
- `src/components/layout/Navbar.tsx` — lines 288-301 (the `/* Home page scrolled — compact bar */` section)

## Acceptance Criteria
- [x] Scrolled home navbar shows "Fractal" in Jacquard 24 font AND "Collective" in serif italic below it
- [x] Font sizes are proportional and fit within the existing h-20 bar height
- [x] Mobile-first: looks good at 375px width
- [x] Desktop: scales appropriately
- [x] No changes to inner page navbar or full home navbar
- [x] `npm run build` passes

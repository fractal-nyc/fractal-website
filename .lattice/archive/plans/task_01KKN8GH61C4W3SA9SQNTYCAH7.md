# FRAC-15: Polish hero section layout and alignment

## Files to Modify

1. `artifacts/fractal-nyc/src/components/layout/Navbar.tsx` — Grid layout for centering, font size adjustments
2. `artifacts/fractal-nyc/src/components/sections/Hero.tsx` — Skyline positioning/opacity, bottom text spacing, text shadow
3. `artifacts/fractal-nyc/src/components/three/FractalCityScene.tsx` — Camera position shift
4. `artifacts/fractal-nyc/src/components/three/FractalObject.tsx` — Group position shift
5. `artifacts/fractal-nyc/src/index.css` — `hero-text-shadow` utility class

## Changes

### 1. Navbar Centering (Navbar.tsx)

Replace absolute-positioned pill nav groups with CSS Grid `grid-cols-[1fr_auto_1fr]` layout:
- Left nav `justify-end`, right nav `justify-start` — pills cluster toward title
- `items-center` on grid for vertical alignment
- Reduce title from `text-7xl lg:text-8xl` to `text-6xl lg:text-7xl`
- Add `whitespace-nowrap` to pills

### 2. Skyline Background (Hero.tsx)

- Change from `absolute inset-0` + `flex items-end` to `absolute inset-x-0 bottom-0` with `h-[45%] md:h-[55%]`
- Reduce opacity from 0.50 to 0.35
- Add CSS `mask-image` gradient fade at top edge (with `-webkit-` prefix)
- Add `pointer-events-none`

### 3. 3D Fractal Position (FractalCityScene.tsx + FractalObject.tsx)

- Shift camera up: `position: [0, 0.8, 8]`
- Shift fractal group up: `position: [0, 0.6, 0]`

### 4. Bottom Text (Hero.tsx)

- Replace `py-24 md:py-32` with `justify-end pb-12 md:pb-16`
- Increase max-w from `md` to `lg`
- Reduce paragraph font: `text-sm md:text-base lg:text-lg`
- Add `gap-8` between paragraph and link
- Move `pointer-events-none/auto` properly

### 5. CSS Utility (index.css)

Add `.hero-text-shadow` utility class with cream text shadow.

## Acceptance Criteria

1. Navbar pills visually centered relative to title at all desktop breakpoints
2. Skyline fades in with no hard edge, doesn't compete with foreground
3. 3D fractal floats above skyline horizon
4. Bottom text readable with adequate text shadow
5. No horizontal overflow at standard breakpoints
6. Clear font hierarchy: title > paragraph > link/pills
7. TypeScript compiles without errors

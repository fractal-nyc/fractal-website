# FRAC-194 — Cap hero background responsive variants at 1280w

## Problem
The hero background is decorative: opacity 0.15, object-cover, transform scale(1.35).
Its responsive set goes up to 2560w (AVIF 242 KB) — the single heaviest asset on
the page. Large/retina desktops pull 2560 for a near-invisible, already-upscaled
backdrop. (Real 375px phones pick <=1280; the 2560 seen in a 3G trace was a 505px
DevTools viewport x high emulated-DPR artifact.) At 0.15 opacity + 1.35 scale the
extra resolution is imperceptible on any display, so the heavy variants are pure waste.

## Fix
Drop the 1920w and 2560w variants everywhere; keep 640w + 1280w:
1. `src/components/sections/Hero.tsx` (~306-325): remove 1920w/2560w from BOTH the
   AVIF and WebP `<source srcSet>`.
2. `index.html` (~20-22): remove 1920w/2560w from the AVIF preload `imagesrcset`.
3. `scripts/build-hero-bg.mjs` BUDGETS (~28-33): remove the 1920 and 2560 entries so
   the script stops generating + cleaning them.
4. Delete the now-unused `public/images/hero/fractal-background-{1920,2560}.{avif,webp}`.

## Acceptance criteria
- Largest AVIF the browser can pick is 1280 (~79 KB) on every viewport/DPR.
- `pnpm typecheck` + `pnpm build` pass; dist srcset/preload reference only 640+1280.
- No 1920/2560 files remain in public/images/hero or dist.
- Background still renders (visual: faint texture unchanged at 0.15 opacity).
- Trivially revertible (re-add widths + regen) if desktop crispness is later wanted.

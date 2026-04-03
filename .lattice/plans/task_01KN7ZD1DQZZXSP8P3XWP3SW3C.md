# FRAC-45: Move ASCII Sierpinski carpet art to Protocol page

## Scope

Move the SierpinskiCarpet component from the home page Hero section to the Protocol page (/the-protocol). The skyline background and Hero section structure remain on the home page.

## Approach

### Step 1: Remove SierpinskiCarpet from Hero.tsx

File: `src/components/sections/Hero.tsx`

- Delete the `SierpinskiCarpet` import
- Delete the `<SierpinskiCarpet ... />` JSX block
- Keep everything else (the section wrapper, the skyline background image)

After this change, Hero.tsx will contain only the skyline image in its section.

### Step 2: Add SierpinskiCarpet to ProtocolPage.tsx

File: `src/pages/ProtocolPage.tsx`

- Add import: `import { SierpinskiCarpet } from "@/components/sections/SierpinskiCarpet";`
- Insert a carpet container section between `<div className="pt-32">` and the existing `<section>`:
  - A `div` with classes `relative h-[50vh] md:h-[60vh] w-full` to contain the carpet
  - Background should match the page: `bg-background`
  - Inside it, render `<SierpinskiCarpet>` with:
    - `photoUrl={import.meta.env.BASE_URL + "images/hero-bg.png"}` (same image as before)
    - `autoPlay` (keep the animation)
    - `padding={40}` (smaller than the home page's 200, appropriate for a contained section)
    - `className="w-full h-full"` (fill the container)
- Keep the existing "Coming soon" section below the carpet

### Step 3: Verify no dead imports

- Confirm no other file imports SierpinskiCarpet besides ProtocolPage after the change

## Key Files

| File | Action |
|------|--------|
| `src/components/sections/Hero.tsx` | Remove SierpinskiCarpet import and usage |
| `src/pages/ProtocolPage.tsx` | Add SierpinskiCarpet import and render it as a hero section |
| `src/components/sections/SierpinskiCarpet.tsx` | No changes needed |

## Mobile-First Notes

- SierpinskiCarpet handles responsive sizing internally via container-reading resize logic
- `padding={40}` ensures the carpet has enough room on 375px screens (~335px available = ~4px cells, the component's minimum)
- Container height is responsive: `h-[50vh]` on mobile, `h-[60vh]` on md+ screens

## Acceptance Criteria

1. The home page Hero section no longer shows the Sierpinski carpet animation — only the skyline image remains
2. The Protocol page (/the-protocol) shows the Sierpinski carpet animation with the hero-bg.png photo overlay
3. The carpet animates (grows then streams text) on the Protocol page, same behavior as before
4. The carpet renders properly on mobile (375px) — visible, not clipped, reasonable cell size
5. The carpet renders properly on desktop — fills a generous portion of the viewport
6. No console errors or broken imports
7. All existing page routes still work (no regressions)

## Complexity

Low. Straightforward component relocation with no logic changes.

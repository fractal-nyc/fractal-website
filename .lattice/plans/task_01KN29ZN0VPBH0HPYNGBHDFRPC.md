# FRAC-27: Home page hero with Sierpinski carpet photo over skyline

## Scope

Replace the current Three.js 3D fractal animation hero with a simpler, faster-loading hero that uses a Sierpinski carpet photo composite over the NYC skyline. Update the hero text to match the PRD's one-line description of Fractal.

## Approach

The current hero uses `@react-three/fiber` + `@react-three/drei` + `three` for a 3D fractal animation — heavy dependencies for a hero section. Replace with a pure CSS/image-based hero that:

1. Keeps the skyline background image (`skyline4.png`)
2. Replaces the Three.js canvas with a CSS-based Sierpinski carpet pattern overlay (using CSS grid recursion or a pre-built SVG/CSS pattern)
3. Updates hero text to PRD copy: one-line description of Fractal
4. Keeps the FadeIn animation for text

## Key Decision: Sierpinski Carpet Implementation

The PRD references a Sierpinski carpet photo prototype. Since we don't have that exact asset, we'll create a CSS-based Sierpinski carpet pattern as an overlay. This can be done with:
- A recursive CSS grid pattern (8 nested divs with the center removed at each level)
- Or an SVG-based pattern
- Overlaid on a photo (hero-bg.png)

Simplest approach: Create a CSS/SVG Sierpinski carpet overlay component that sits above the skyline image with a photo (hero-bg.png) visible through the carpet holes.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/sections/Hero.tsx` | Replace Three.js import with new image-based hero |
| `src/pages/Home.tsx` | No changes needed (already imports Hero) |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/sections/SierpinskiCarpet.tsx` | CSS-based Sierpinski carpet pattern component |

## Files NOT to Delete (yet)

Keep `src/components/three/` — those can be cleaned up in a separate task. Just stop importing them.

## Hero Layout (target)

```
┌──────────────────────────────────┐
│  [skyline4.png background]       │
│                                  │
│  [Sierpinski carpet overlay      │
│   with hero-bg.png showing       │
│   through the pattern]           │
│                                  │
│  "An open source protocol for    │
│   creating golden ages —         │
│   starting in Brooklyn."         │
│                                  │
│  [Explore ↓]                     │
└──────────────────────────────────┘
```

## Acceptance Criteria

1. Hero section loads without Three.js (no Canvas, no WebGL)
2. Skyline image visible as background
3. Some form of Sierpinski carpet / fractal pattern visible as overlay
4. Hero text reflects PRD messaging
5. FadeIn animation preserved
6. Mobile responsive
7. TypeScript passes
8. Page loads significantly faster without Three.js bundle

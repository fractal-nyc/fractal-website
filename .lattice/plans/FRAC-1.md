# Plan: FRAC-1 — Scroll-Driven Octahedron Unfold Animation

## Summary

A scroll-pinned SVG animation between the Hero and HouseBannerGrid on the homepage. As the user scrolls, a 2D octahedron unfolds into its net, the triangular faces separate and align with the house banners, then reverse — reforming the net, rotating 90° to reveal it's the "F" in "fractal", dropping to center, and pulling out the full logo.

## Animation Stages

```
Stage 1: Simplified 2D octahedron (diamond silhouette, 6 house colors)
Stage 2: Octahedron unfolds into its geometric net (star/cross of 8 triangles)
Stage 3: Triangles separate into a horizontal row (6 colored, 2 neutral fade out)
Stage 4: Triangles align with the HouseBanner pennant tops below
Stage 5: Reverse — triangles lift off banners back to row
Stage 6: Reform net — triangles converge back into unfolded octahedron
Stage 7: Net rotates 90° → reveals "F" lettermark → drops to vertical center
Stage 8: "ractal" text pulls out right → whole "fractal" shifts left to center
```

### Stage 7-8 Detail (Logo Reveal)
- The net rotates 90° CW to become vertical — this IS the "F" shape
- The F moves to center of viewport vertically
- "ractal" text (pixel font) animates out to the right of the F
- As text appears, the entire "fractal" logo shifts left so the full word is horizontally centered
- Final hold: complete centered "fractal" logo

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/animation/OctahedronUnfold.tsx` | Main scroll-pinned section with sticky viewport + SVG |
| `src/components/animation/octahedron-geometry.ts` | Pure geometry: triangle positions for each stage |
| `src/components/animation/useScrollStages.ts` | Hook: `useScroll` + `useTransform` → per-triangle motion values |
| `src/components/animation/AnimatedTriangle.tsx` | Single SVG triangle with Framer Motion animated transforms |
| `src/components/animation/FractalLogo.tsx` | Stage 7-8: rotated net + "fractal" pixel text + centering shift |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Insert `<OctahedronUnfold />` between Hero and HouseBannerGrid |
| `src/components/house/HouseBannerGrid.tsx` | Add ref/id to grid container for Stage 4 position measurement |

## DO NOT MODIFY
- `src/components/three/OctahedronHero.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/house/HouseBanner.tsx`

## Architecture

```
Home.tsx
  <Hero />                              ← untouched
  <OctahedronUnfold gridRef={gridRef} /> ← NEW (500vh tall, 100vh sticky inner)
    <svg viewBox="...">
      <AnimatedTriangle /> x 8
    </svg>
    <FractalLogo />                      ← appears Stage 7-8
  <HouseBannerGrid ref={gridRef} />      ← add ref only
  <GoldenAgeProtocol />
  <Footer />
```

## Scroll Progress Mapping

Container: 500vh. Sticky viewport: 100vh.

```
0.00–0.05  Stage 1 hold (octahedron silhouette)
0.05–0.15  Transition 1→2 (unfold)
0.15–0.20  Stage 2 hold (net)
0.20–0.30  Transition 2→3 (separate)
0.30–0.35  Stage 3 hold (row)
0.35–0.45  Transition 3→4 (move to banners)
0.45–0.55  Stage 4 hold (aligned with banners)
0.55–0.65  Transition 4→5 (lift off)
0.65–0.70  Stage 5 hold (row again)
0.70–0.80  Transition 5→6 (reform net)
0.80–0.85  Stage 6 hold (net)
0.85–0.90  Transition 6→7 (rotate 90° + drop to center)
0.90–0.95  Transition 7→8 ("ractal" pulls out + shift left)
0.95–1.00  Stage 8 hold (full centered logo)
```

## House Color Mapping (6 triangles)

```
neighborhood: #889460 (olive)
events:       #D4857A (coral)
campus:       #2B5A48 (teal)
school:       #C41E20 (red)
forum:        #6E1830 (maroon)
lab:          #E870A0 (pink)
```

Two remaining octahedron faces: gold (#D4BA58) — fade out during Stage 2→3, fade back in during Stage 5→6.

## Mobile-First Responsive

- **375px (mobile):** SVG scales via viewBox. Stage 3-4: triangles arrange in 2-column layout matching `grid-cols-2`.
- **640px (tablet):** Stage 3-4: 3-column layout matching `sm:grid-cols-3`.
- **1024px+ (desktop):** Stage 3-4: single row of 6 matching `lg:grid-cols-6`.
- Scroll container height: 400vh on mobile, 500vh on desktop.
- Geometry module takes viewport width → returns stage positions.

## Stage 4 Banner Alignment

- `HouseBannerGrid` exposes ref to grid container
- `OctahedronUnfold` uses `ResizeObserver` to measure column positions
- Triangles morph from equilateral to banner V-notch proportions (matching `clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)`)
- Background matches `bg-[#faf8f5]` throughout

## Acceptance Criteria

1. Scroll pinning works without jank on desktop and mobile
2. All 8 stages are visually distinct when scrolling slowly
3. Stage 1 reads as the same octahedron from the 3D hero above
4. Stage 4 triangles align with real banner positions at all breakpoints
5. Stage 7 rotated net reads as "F"
6. Stage 8: "fractal" logo is horizontally centered, F drops to vertical center first, then text pulls out, then whole word shifts to center
7. Works at 375px — no overflow, smooth touch-scroll driven
8. No regressions to Hero, HouseBannerGrid, or any other component
9. `prefers-reduced-motion`: show static final logo, skip animation
10. `aria-hidden="true"` on animation section (decorative)

## Implementation Sequence

1. Geometry module + static SVG test (validate net layout + F lettermark)
2. Scroll scaffold (tall container, sticky viewport, basic scroll tracking)
3. Forward animation: Stages 1→4 with all 8 triangles
4. Reverse + logo: Stages 5→8 with centering shift
5. Integration into Home.tsx + banner alignment
6. Mobile responsiveness + polish + iOS testing

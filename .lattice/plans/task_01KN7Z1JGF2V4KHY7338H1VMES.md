# FRAC-43: Mandelbrot PNG in House Banners + Fix Display Names

## Scope

Two changes: (1) Replace inline SVG MandelbrotIcon with actual PNG, positioned outside the clip-path in the V-notch gap. (2) Fix banner display names to show user-facing labels.

## Part 1: Mandelbrot PNG

### Asset
Copy `/Users/jules/Documents/Artifacts/raw/software/fractal-nyc-design/mandelbrot.png` to `public/images/mandelbrot.png`. Already cropped and rotated — no processing needed.

### MandelbrotIcon.tsx Rewrite
Replace inline SVG with `<img>` tag:
- `src={import.meta.env.BASE_URL + "images/mandelbrot.png"}`
- Props: `size?: number` (default ~30-40px), `opacity?: number` (default 0.15-0.2), `className`
- The image renders at low opacity on the cream page background for a muted gray appearance

### HouseBanner.tsx Restructure
Current: entire component is one div with clipPath, icon inside gets clipped.
New structure:
```
<div className="relative">  <!-- outer wrapper, no clip -->
  <div style={{ clipPath }}>  <!-- banner content -->
    subtitle, name, tagline
  </div>
  <!-- Mandelbrot icon OUTSIDE clip, in the V-notch gap -->
  <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom positioning at V-notch tip }}>
    <MandelbrotIcon size={isGrid ? 24 : 36} opacity={0.2} />
  </div>
</div>
```

V-notch tip is at (50%, 85%) of banner height. Position icon at ~`bottom-[15%]` of outer wrapper, centered. Remove `iconColor` variable (no longer needed).

## Part 2: Fix Banner Display Names

Add `displayName?: string` to `House` interface in `src/data/houses.ts`.

Set `displayName` on 3 houses:
- neighborhood: `"Co-Living"` (was "The Neighborhood")
- school: `"New Liberal Arts"` (was "The School")
- forum: `"Political Club"` (was "The Forum")

Other 3 houses keep their `name` as-is (already correct).

In HouseBanner.tsx, change the H3 to render `house.displayName ?? house.name`.

## Key Files

| File | Action |
|------|--------|
| `public/images/mandelbrot.png` | New — copy from design assets |
| `src/data/houses.ts` | Add `displayName` to House interface + 3 entries |
| `src/components/house/MandelbrotIcon.tsx` | Rewrite: SVG → img tag |
| `src/components/house/HouseBanner.tsx` | Wrap in outer div, move icon outside clip, use displayName |

## Acceptance Criteria

1. Mandelbrot PNG renders at each banner's V-notch, ~30-40px, muted gray on cream bg
2. Icon is visually outside the colored banner area
3. Both grid and full variants render icon correctly
4. Banners show: "Co-Living", "Events", "The Campus", "New Liberal Arts", "Political Club", "The Lab"
5. Mobile (375px): renders correctly
6. No console errors or broken images

## Complexity
Low. Asset copy + component rewrite + data field addition.

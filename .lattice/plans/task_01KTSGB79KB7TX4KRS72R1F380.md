# FRAC-186 — Mobile-only flanking pennants before Footer

## Scope
On MOBILE viewports only, show the two flanking house pennants side-by-side as a
normal-flow block immediately before `<Footer />` on all 5 flanking pages.
Desktop behavior stays exactly as-is (the existing absolute `hidden md:flex`
layer is untouched). **Out of scope:** any desktop change, any change to the
`*BannerSVG` wrapper components.

## Pages and their banner components
| Page | File | Banner component | Page bg |
|---|---|---|---|
| Events | `src/pages/EventsPage.tsx` | `EventsBannerSVG` | `bg-house-events-light` |
| Visit | `src/pages/NeighborhoodPage.tsx` | `VisitBannerSVG` | `bg-house-visit-light` |
| Education | `src/pages/LiberalArtsPage.tsx` | `EducationBannerSVG` | `bg-house-education-deep` |
| Campus | `src/pages/CampusPage.tsx` | `CampusBannerSVG` | `bg-house-campus-light` |
| Lab/Publications | `src/pages/LabPage.tsx` | `PublicationsBannerSVG` | `bg-house-publications-light` |

All 5 render a flanking **pair** on desktop, so the mobile treatment is a pair too.

## Key technical gotcha — SVG sizing in normal flow
The banner components render an `<img className="block h-full w-full">`. On
desktop this works because the parent is an absolutely-positioned div with a
fixed `height: min(72vh,660px)`. In a normal-flow mobile block there is no
fixed-height ancestor, so the wrapper must supply its own height via an explicit
aspect-ratio matching the SVG viewBox (~122.7×368 ≈ 123:368). **Do not modify
the banner components.**

## Reusable JSX (insert immediately before `<Footer />`)
`BannerSVG` = the page's own component.

```jsx
{/* Mobile-only flanking pennants — bold moment before the footer.
    Desktop uses the absolute `hidden md:flex` layer above; this block is
    `flex md:hidden` and sits in normal flow. Each pennant gets an explicit
    aspect-ratio (SVG viewBox ~123:368) so `h-full w-full` on the inner
    <img> resolves without a fixed-height ancestor. */}
<div
  aria-hidden="true"
  className="flex md:hidden items-end justify-center gap-3 px-3 pt-8 pb-12"
>
  <div className="w-[48%] aspect-[123/368]">
    <BannerSVG />
  </div>
  <div className="w-[48%] aspect-[123/368]">
    <BannerSVG />
  </div>
</div>
```

- `flex md:hidden` — mobile only; desktop unaffected.
- `w-[48%]` each + `gap-3` → bold, near edge-to-edge.
- `aspect-[123/368]` — load-bearing: supplies the height the SVG needs.
- `items-end` — baseline-align (Campus banner is slightly shorter).
- `px-3 pt-8 pb-12` — edge breathing room + separation from footer.
- Inherits the page's `bg-house-*` background; no extra bg class needed.
- No new imports — each page already imports its banner for the desktop layer.

## Per-page insertion points (immediately before `<Footer />`)
- EventsPage.tsx — before `<Footer />` (~line 112)
- NeighborhoodPage.tsx — before `<Footer />` (~line 86)
- LiberalArtsPage.tsx — before `<Footer />` (~line 32)
- CampusPage.tsx — before `<Footer />` (~line 39)
- LabPage.tsx — before `<Footer />` (~line 85)

## Campus consistency fix (approved)
CampusPage's desktop flanking layer is `flex justify-between` (no `hidden md:`),
so its pennants currently overlap the hero on mobile — unlike the other four
pages. Change it to `hidden md:flex` so desktop stays pixel-identical while the
mobile overlap is removed, making the new bottom block the single mobile
treatment. This is the only edit to an existing element.

## Acceptance criteria
1. At 375px, each of the 5 pages shows two pennants side-by-side in normal flow
   directly above the footer, on the page's house background, visibly sized
   (no collapse to 0 height).
2. At ≥768px (`md`), the new block is `display:none` and desktop is unchanged.
3. Campus: no pennant overlap on mobile; desktop unchanged.
4. `npm run typecheck` passes.
5. `npm run build` passes.

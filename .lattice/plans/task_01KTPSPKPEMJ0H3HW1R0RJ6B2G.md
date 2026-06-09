# FRAC-59: Story page — replace SVG diagram with PNG

## Scope

Replace the responsive React/SVG "neighborhood campus" diagram on the Story page with a flat PNG. The PNG already exists at `/Users/fractalos/Desktop/fractal nyc transparent.png` (681 KB, transparent background). Goal: predictable mobile scaling, no internal-text drift, no card-stack layout fork between mobile and desktop.

## Where the diagram lives today

- Renders via `<OriginStory />` inside `src/pages/StoryPage.tsx` (origin/master line 215: `<OriginStory />`).
- `src/components/sections/OriginStory.tsx` (origin/master) imports `NeighborhoodCampusDiagram` on line 2 and renders it on line 23 inside a `<FadeIn>` block, immediately after the intro copy block.
- The diagram component itself is `src/components/sections/NeighborhoodCampusDiagram.tsx` (216 lines). It contains the PILLARS data array, a desktop circular layout with absolutely-positioned cards + SVG ring/arc, and a mobile vertical-stack fallback. This entire component is being retired.

## Sole consumer check

`git grep` for `NeighborhoodCampusDiagram` in `origin/master` returns only:
- `src/components/sections/NeighborhoodCampusDiagram.tsx` (definition)
- `src/components/sections/OriginStory.tsx` (only import)

Therefore `NeighborhoodCampusDiagram.tsx` is dead after the swap and should be deleted.

## Destination PNG path

Project convention (e.g. `src="/images/banners/..."` in `HouseBanner.tsx`, `OctahedronHero.tsx`) is to drop assets under `public/images/` and reference them with an absolute `/images/...` URL (Vite serves `public/` from root). The Story page does not have a dedicated subfolder for diagrams, so place the asset at the top of `public/images/`:

```
public/images/fractal-nyc-diagram.png
```

Source -> destination copy (implementer):

```bash
cp "/Users/fractalos/Desktop/fractal nyc transparent.png" \
   "/Users/fractalos/Dev/fractal-nyc/public/images/fractal-nyc-diagram.png"
```

## Implementation: edit OriginStory.tsx

Two changes to `src/components/sections/OriginStory.tsx`:

1. Remove the import line:

```tsx
import { NeighborhoodCampusDiagram } from "@/components/sections/NeighborhoodCampusDiagram";
```

2. Replace the diagram render block:

```tsx
      <FadeIn>
        <NeighborhoodCampusDiagram />
      </FadeIn>
```

with:

```tsx
      <FadeIn>
        <div className="max-w-5xl mx-auto px-[4.5%] mt-10 md:mt-16">
          <img
            src="/images/fractal-nyc-diagram.png"
            alt="Fractal NYC neighborhood campus diagram — five pillars: Events, Community-run University, Fractal Tech, Venues, Housing Network"
            className="block w-full h-auto mx-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      </FadeIn>
```

### Sizing rationale

- Wrapper `max-w-5xl mx-auto px-[4.5%]` mirrors the existing copy container above it in `OriginStory` — keeps the diagram visually aligned with the paragraphs that introduce it, prevents an oversized hero-width image on desktop.
- `mt-10 md:mt-16` mirrors the section's outer `py-10 md:py-16` cadence to give the diagram breathing room from the intro copy.
- `w-full h-auto` makes the PNG scale fluidly to container width on mobile (375px baseline) without aspect-ratio drift.
- Native `<img>` is correct here — project is Vite + React, not Next.js. No `<Image>` import available.
- `loading="lazy"` + `decoding="async"` keep the image off the critical render path; this section is below the fold.

## File deletion

Delete `src/components/sections/NeighborhoodCampusDiagram.tsx` after confirming no other references remain (re-grep `src/` post-edit). Sub-grep should return zero matches once the `OriginStory.tsx` import is removed.

## Acceptance criteria

1. `public/images/fractal-nyc-diagram.png` exists and is the file copied from the Desktop source (~681 KB).
2. `OriginStory.tsx` no longer imports or renders `NeighborhoodCampusDiagram`; instead renders the `<img>` block above.
3. `src/components/sections/NeighborhoodCampusDiagram.tsx` is deleted.
4. `git grep NeighborhoodCampusDiagram src/` returns no results.
5. Story page renders the PNG diagram at:
   - **375px viewport**: full container width minus `4.5%` side padding, no horizontal scroll, text inside the diagram remains legible.
   - **desktop (>=1024px)**: capped at `max-w-5xl` (~1024px), centered, not pixelated.
6. Alt text matches the string above.
7. No console errors / 404 for `/images/fractal-nyc-diagram.png`.
8. Lint + typecheck pass; no unused-import warning from the dropped import.

## Out of scope

- Tweaking the PNG itself (color, transparency, dimensions). If the rendered image looks wrong, that is a follow-up task — not this one.
- Changing surrounding copy in `OriginStory.tsx`.
- Touching the `StoryPage.tsx` file — the swap lives entirely inside `OriginStory`.

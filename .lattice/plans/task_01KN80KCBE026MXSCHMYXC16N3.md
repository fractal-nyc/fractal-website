# FRAC-49: Story Page — Photo Gallery + OriginStory/Vision Relocation

## Scope

Build a scroll-based photo gallery for the Story page, relocate OriginStory and Vision sections from Home, and process 17 raw photos for web.

## Photo Pipeline

Source: `/Users/jules/Documents/Artifacts/raw/software/fractal-nyc-design/raw photos/` (17 photos)
Target: `public/images/story/`

Formats: 9 JPG, 3 WEBP, 2 AVIF, 1 HEIC, mix of landscape/portrait/panoramic/square.

Processing:
- Convert 1 HEIC to JPEG via `sips`, downsize from 5712px to max 1920px
- Convert 2 AVIF to JPEG via `sips` (or keep if browser-supported)
- Copy JPG and WEBP directly
- Rename to sequential scheme: `story-01.jpg` through `story-17.ext`
- Compress large files, target <500KB each

## Photo Data Model

New: `src/data/storyPhotos.ts`
```typescript
export interface StoryPhoto {
  src: string;
  alt: string;
  aspect: "landscape" | "portrait" | "panoramic" | "square";
}

export interface GallerySection {
  type: "hero" | "pair" | "masonry" | "panoramic";
  photos: StoryPhoto[];
}
```

## Gallery Layout (Mobile-First)

Staggered scroll-reveal with alternating layout sections:
- **Hero**: Single full-width photo
- **Pair**: Two-column staggered (one offset vertically). Mobile: stacks to single column
- **Masonry**: Portrait + 2 landscape stacked. Mobile: single column
- **Panoramic**: Full-width wide crop

Sequence creates visual rhythm: hero → pair → masonry → pair → panoramic → pair → etc.

## Gallery Components

### `src/components/gallery/GalleryImage.tsx`
- Wraps `<img>` in `motion.div` from framer-motion
- Hover: `scale: 1.03`, `y: -4`, shadow lift
- Image inside: `scale: 1.05` on hover (overflow-hidden clips)
- `loading="lazy"` on all except first image

### `src/components/gallery/PhotoGallery.tsx`
- Renders GallerySection array with appropriate grid layouts per type
- Each section wrapped in FadeIn with staggered delays
- Uses direction prop on FadeIn for varied reveal directions

## OriginStory/Vision Relocation (FRAC-42)

### Home.tsx
Remove imports and JSX for `<OriginStory />` and `<Vision />`
Result: Hero → HouseBannerGrid → Directory → Footer

### StoryPage.tsx
Add imports for OriginStory, Vision, PhotoGallery
Layout: OriginStory → Vision → PhotoGallery → Footer

### Hero.tsx
Change `<a href="#story">` to navigate to `/story` route (use wouter Link or handleNavigate)

## Key Files

| File | Action |
|------|--------|
| `public/images/story/` | New dir — 17 processed photos |
| `src/data/storyPhotos.ts` | New — photo data + gallery sections |
| `src/components/gallery/GalleryImage.tsx` | New — image with hover animation |
| `src/components/gallery/PhotoGallery.tsx` | New — gallery layout component |
| `src/pages/StoryPage.tsx` | Modify — add OriginStory + Vision + gallery |
| `src/pages/Home.tsx` | Modify — remove OriginStory + Vision |
| `src/components/sections/Hero.tsx` | Modify — update #story link to /story route |

## Acceptance Criteria

1. All 17 photos in public/images/story/ in web-friendly formats, under 1MB each
2. OriginStory and Vision render on /story, not on Home
3. Home: Hero → HouseBannerGrid → Directory → Footer only
4. Gallery displays photos in editorial layout with scroll-reveal
5. Hover animations on desktop (scale + lift + shadow)
6. Mobile (375px): clean single-column stack, no horizontal overflow
7. Hero "Explore our story" link navigates to /story
8. pnpm typecheck passes
9. No regressions

## Complexity
Medium-High. Photo processing + new components + page restructure.

# FRAC-60: Integrate Pretext for text rendering

## Scope
Replace key CSS-rendered body text paragraphs with PretextParagraph components for consistent, pixel-perfect font sizing across the site.

## Approach
1. Add TEXT_SIZES scale to `src/lib/pretext.ts` (xs through 4xl)
2. Convert pure-text `<p>` tags to `<PretextParagraph>` on pages with the most body text
3. Skip paragraphs with mixed JSX/link content (PretextParagraph requires string children)
4. Do NOT touch Navbar, Jacquard 24 text, SectorHeader, or Instrument Serif headings

## Key files
- `src/lib/pretext.ts` — add TEXT_SIZES export
- `src/pages/StoryPage.tsx` — intro paragraph + talk card descriptions
- `src/pages/NeighborhoodPage.tsx` — note text + visitor prompt
- `src/components/sections/LiberalArts.tsx` — Fractal U descriptions
- `src/pages/PeoplePage.tsx` — portal teaser text
- `src/pages/LabPage.tsx` — lab description + archive subtitle

## Not converted (contain links/JSX)
- Home.tsx paragraphs (all have embedded links)
- EventsPage.tsx paragraphs (all have embedded links)
- PoliticalClubPage.tsx paragraph (has embedded link)
- PeoplePage.tsx first paragraph (has embedded link)

## Acceptance criteria
- TEXT_SIZES scale exported from pretext.ts
- Body text uses size 13px (TEXT_SIZES.base), intro text uses 15px (TEXT_SIZES.lg)
- `npx vite build` passes
- Pretext components fall back gracefully if measurement fails

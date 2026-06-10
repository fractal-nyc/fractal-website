# FRAC-189: Story hero — flank heading with favicon diamonds + lighten background

## Scope
Two changes to the Story page hero (`src/pages/StoryPage.tsx`):
1. Lighten the page background from `#D4BA58` to `#DFCA7A` (a lighter gold — also one of the favicon's own triangle colors, so it ties in).
2. Flank the hero heading ("From a Single Apartment to a Neighborhood Campus") on its left and right with the favicon SVG (`/favicon.svg`, the colored Fractal diamond mark), similar to the flanking-banner pattern on CampusPage.

## Decisions (from user)
- Flank on BOTH viewports: small diamonds on mobile, bold (large) on desktop.
- Layout: in-flow flex row `◆  HEADING  ◆` (matches the selected preview) — robust at every width, no absolute overlap with text.
- Purely decorative: `alt=""` + `aria-hidden="true"` (matches CampusPage flank convention).
- Change ONLY the page background. Leave `STORY_COLOR` / Navbar / OctahedronHero `#D4BA58` (the Story sector brand color) untouched.

## Approach
- `StoryPage.tsx:199`: `backgroundColor: "#D4BA58"` → `"#DFCA7A"`.
- Replace the hero `<p class="text-display mb-12 text-center">` with a flex wrapper:
  `flex items-center justify-center gap-3 md:gap-10 mb-12`, containing
  `<img src="/favicon.svg" />` · `<p class="text-display text-center">…</p>` · `<img src="/favicon.svg" />`.
- Diamond sizing (favicon viewBox 315×444, ~0.71 ratio): `shrink-0 w-10 sm:w-20 md:w-36 lg:w-44 h-auto` so the heading keeps room on a 375px phone while desktop reads as a bold brand moment (~176px).
- Keep `<p>` element (no semantic change) and the existing `FadeIn` wrapper.

## Key files
- `src/pages/StoryPage.tsx`

## Acceptance criteria
- Story page background is `#DFCA7A`.
- Favicon diamonds flank the heading on both sides, on mobile and desktop, without crowding the heading into illegibility on 375px.
- Diamonds are decorative (aria-hidden, empty alt).
- `npm run build` succeeds; diff scoped to StoryPage.tsx (+ FRAC-189 lattice files).
- The new diagram still reads on the lighter background (verified by composite).

## Complexity: low

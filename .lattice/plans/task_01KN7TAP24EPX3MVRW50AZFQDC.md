# FRAC-40: Faculty Directory Page with Avatar Badges

## Scope

Build an avatar badge component and compose it into a People directory page. Replaces the old Directory link grid on the home page. FRAC-44 (avatar badge) was merged into this task.

## Design (from template images)

- **Avatar Badge**: Tall vertical card (aspect 2:3), photo fills card with object-cover, thin border frame with corner pin details, name overlaid at bottom in serif (white text on gradient overlay), role text below name
- **Directory Grid**: 3x3 responsive grid on cream background, uniform card sizing, staggered FadeIn

## Data Model Changes

Add `bio?: string` to the `Person` interface in `src/data/houses.ts`. When no `avatar` is set, render initials on a colored background (first house's color).

## New Components

### `src/components/ui/AvatarBadge.tsx`
- Props: `person: Person`, `className?: string`
- Aspect-ratio container (2:3), photo with object-cover
- Thin border frame (1px, muted gray) with 4 corner pin dots (small circles at corners)
- Bottom gradient overlay (transparent → black/60) with name (serif, white) and role/bio text
- When no avatar: colored background with initials in serif
- Hover: `scale-[1.02]` transition matching HouseBanner pattern

### `src/components/sections/PeopleDirectory.tsx`
- Import PEOPLE from data, AvatarBadge, FadeIn
- Section header: serif heading "People", muted subtitle, bottom border (matches HouseBannerGrid pattern)
- Grid: `grid-cols-2` on mobile (375px), `sm:grid-cols-3` on tablet+
- FadeIn with staggered delays per badge

## Page Changes

### `src/pages/PeoplePage.tsx`
Replace "Coming soon" with `<PeopleDirectory />`

### `src/pages/Home.tsx`
Replace `<Directory />` with `<PeopleDirectory />`

## Acceptance Criteria

1. AvatarBadge renders person as tall vertical photo card with pinned-photo frame and text overlay
2. PeopleDirectory shows responsive grid of badges from PEOPLE data
3. People page (/people) shows full directory
4. Home page shows PeopleDirectory where Directory was
5. Mobile (375px): 2-column grid, readable
6. Tablet (640px+): 3-column grid
7. Initials fallback works when no avatar URL set
8. FadeIn animations with stagger on each badge
9. No regressions

## Complexity
Medium. New component + page update + data model extension.

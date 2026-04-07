# FRAC-43: Rewrite Story page — add talks/podcasts section, remove Vision

## Scope
Rewrite StoryPage to add a talks/podcasts card grid above OriginStory, styled like DocumentBadge from the Lab page. Remove the Vision section entirely.

## Approach
1. Create a `TalkCard` component inline in StoryPage (or a small dedicated component) that mirrors DocumentBadge styling: bordered card, category icon, title, author, description, external arrow on hover.
2. Define a const array of 7 talk/podcast items with the specified data.
3. Add a section heading ("STORY"), intro paragraph, card grid (1/2/3 col responsive), and outro paragraph with TPOT link.
4. Remove Vision import and usage from StoryPage.
5. Keep OriginStory and PhotoGallery in place.

## Key Files
- `src/pages/StoryPage.tsx` — main edit target
- `src/components/lab/DocumentBadge.tsx` — style reference (not imported, pattern replicated)
- `src/components/sections/Vision.tsx` — removed from StoryPage (file stays, just unused)

## Acceptance Criteria
- [ ] Talks/podcasts section renders above OriginStory with 7 cards
- [ ] Cards styled like DocumentBadge (border, hover scale, category icon, arrow)
- [ ] Grid: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] Vision section removed from StoryPage
- [ ] OriginStory and PhotoGallery still present
- [ ] Mobile-first responsive design
- [ ] Intro and outro text match spec exactly

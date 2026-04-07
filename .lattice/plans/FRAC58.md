# FRAC-58: Widen text containers to fix orphan/widow issues

## Scope
Widen max-width on text containers across pages to reduce text orphans/widows. Add `text-pretty` class to key paragraphs.

## Approach
- Change `max-w-4xl` to `max-w-5xl` on: EventsPage, PeoplePage, NeighborhoodPage, PoliticalClubPage, LiberalArts, LabPage, StoryPage
- Change `max-w-2xl`/`max-w-3xl` to `max-w-4xl` on Home.tsx vision quote and help section
- Widen Footer CTA if narrow
- Add `text-pretty` to key paragraph elements
- Do NOT touch Navbar or Campus page

## Acceptance Criteria
- All specified containers widened
- `text-pretty` added to key paragraphs
- Build passes
- No changes to Navbar or Campus page

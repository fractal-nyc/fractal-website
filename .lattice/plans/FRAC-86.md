# FRAC-86: Button containment — consistent sizing, no spreading

## Problem

All CTA buttons across the site use `<a>` tags with a shared class pattern that includes `block`, which causes them to stretch to fill their container width. They should be contained to a consistent max-width and centered.

## Buttons that spread (all 10 instances)

All share the class: `block border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden`

1. **EventsPage.tsx:23** — "Email Merlin's Place"
2. **EventsPage.tsx:38** — "Luma Calendar"
3. **EventsPage.tsx:53** — "Join Discord"
4. **PoliticalClubPage.tsx:25** — "Maximum New York"
5. **PeoplePage.tsx:28** — "Join Discord"
6. **NeighborhoodPage.tsx:63** — "Visitor Form"
7. **Campus.tsx:39** — "Email Merlin's Place" (inside flex row)
8. **Campus.tsx:48** — "Fractal Tech Hub" (inside flex row)
9. **LiberalArts.tsx:41** — "Learn More" (inside flex row)
10. **LiberalArts.tsx:50** — "Apply as Instructor" (inside flex row)

## Fix approach

- Change `block` to `inline-block` on all 10 instances
- Add `max-w-xs` (max-width: 20rem / 320px) to constrain width
- For standalone buttons in `text-center` parents: they auto-center via inline-block behavior
- For buttons in `flex` containers (Campus.tsx, LiberalArts.tsx): they're already inside `flex ... justify-center` or `flex ... gap-4` wrappers, so they'll size to content naturally

## Acceptance criteria

- No button stretches to full container width
- All buttons are centered within their section
- Buttons inside flex rows sit side-by-side on desktop, stack on mobile
- `npm run build` passes
- Mobile-first: buttons look good at 375px viewport

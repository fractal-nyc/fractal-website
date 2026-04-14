# FRAC-167 — Story page v0 update

## Goal

Update the Story page with (a) Julianna's new three-paragraph copy, and (b) a "neighborhood campus" diagram below or alongside the copy.

## Source of truth

All finalized content (exact copy + diagram structure) lives in `.lattice/notes/FRAC-167.md`. Implementation agent reads that file for verbatim text.

## Approach

### (a) Paragraph replacement

- Locate the Story page component.
- Replace the existing paragraph block with the three paragraphs from the notes file, verbatim.
- Preserve curly quotes and en-dashes as written.
- Match existing typography; only text content changes.

### (b) Neighborhood-campus diagram

- Render as a native responsive SVG/HTML component — **do not embed the reference PNG** (no white background, themeable, mobile-friendly).
- Center node: "Fractal NYC — A neighborhood campus founded in 2021".
- Five pillar cards around it: Events, Community-run University, Fractal Tech, Venues, Housing Network. Each card shows the stat bullets from the notes file.
- Desktop: circular arrangement (connected by an arc/ring) matching the reference screenshot.
- Mobile (375px): vertical stack — center block on top, five pillar cards below. Do NOT try to shrink the circular layout on narrow viewports.
- Emojis from reference (🎉 🏛️ 👾 📍 🏠) are fine as decorative anchors on each pillar card.

## Files likely touched

- Story page component (under `src/components/sections/` or `src/app/story/` — implementation agent to confirm).
- New component, e.g. `src/components/sections/NeighborhoodCampusDiagram.tsx`.

## Acceptance criteria

- [ ] Three new paragraphs render on Story page with site-matching typography; previous paragraph replaced.
- [ ] Diagram renders with all five pillars + center label, each showing the correct stats.
- [ ] No white background / card frame around the diagram — sits on the page background.
- [ ] Diagram legible at 375px (stacked) AND at desktop widths (circular).
- [ ] `pnpm typecheck` / `pnpm lint` / `pnpm build` clean.

## Out of scope

- Other Story page sections.
- Restyling the rest of the page.
- Other "neighborhood campus" occurrences across the site.

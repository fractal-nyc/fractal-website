# FRAC-48: Campus — center body containers, keep text left-aligned

## Scope (this PR)

Narrowed sweep for Campus only. The broader sitewide audit (other pages, DESIGN.md codification, side-padding reduction) stays open as follow-ups.

## Problem

On Campus, body sections use `max-w-3xl` WITHOUT `mx-auto`, so the column hangs to the left edge of the section wrapper instead of being centered. The canonical pattern from NLA (`src/components/sections/LiberalArts.tsx`) uses `max-w-3xl mx-auto` — a centered column with `text-left` content inside.

**Wrinkle:** On Campus, each `<h2>` heading sits OUTSIDE its `max-w-3xl` body block. Just adding `mx-auto` to body blocks alone would offset the heading from the body — the heading would be at the wider section wrapper's left edge while body would be centered. The fix: wrap **each h2 + its body block together** in a single `<div className="max-w-3xl mx-auto">`.

## Files

- `src/components/sections/Campus.tsx` — only file changed.

## Sections to wrap (13 total)

1. Overview
2. Four audiences
3. Get shit done
4. And have a good time
5. More than a WeWork
6. Meet the Space (prose intro only; photo grid keeps wider parent)
7. What's it like
8. Events
9. Merlin's Place
10. Williamsburg
11. McCarren Park
12. Build with us (prose + bios intro; bios grid keeps `max-w-4xl`)
13. By the way, what's Fractal

Hero (`Fractal Campus` + buttons) is already correctly centered via `text-center max-w-4xl mx-auto` — leave it alone.

For grid sections (Meet the Space photos, Build with us bios), keep their wider `max-w-7xl` parent for the grid; only the prose intro inside gets `max-w-3xl mx-auto`.

## Approach

For each of the 13 body sections inside Campus.tsx:

- The section wrapper stays `max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32`.
- Inside the `<FadeIn>`, wrap the h2 + body block in a single `<div className="max-w-3xl mx-auto">`.
- The inner `max-w-3xl` classes on body blocks become redundant once the outer wrapper provides the width — but leaving them in is harmless. Prefer removing inner duplicates to reduce noise where it's a clean change; otherwise keep.

## Acceptance criteria

- Each h2 + body block on Campus shares the same centered axis.
- Text within centered blocks remains left-aligned (no center-aligned prose).
- Hero unchanged.
- Grid sections' grids remain at wider width.
- `pnpm type-check` and `pnpm lint` pass.
- 375px mobile renders unchanged in feel (centering is a no-op when content fills the viewport).

## Out of scope

- DESIGN.md codification of canonical body-column rule.
- Sweep of other pages (Story, Lab, Political Club, Visit, Events, People, Protocol, Home).
- Reducing section-wrapper side padding (`px-[4.5%]`).
- Changing `max-w-3xl` to a different width.

These remain open under FRAC-48's broader description as follow-up work.

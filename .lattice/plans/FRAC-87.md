# FRAC-87: Neighborhood notes text container — smaller, consistent, centered

## Problem
In `src/pages/NeighborhoodPage.tsx`, the note container (`MandelbrotCorners`) is full-width within its parent, making it too large. The `<ol>` numbered list uses `text-xs md:text-base` which is fine, but the container itself is unconstrained in width. The list items grow in visual weight because longer items wrap and take more space. The list block is left-aligned but not centered in the container.

## Fix
1. **Constrain the note container width** — add `max-w-xl mx-auto` to the `MandelbrotCorners` wrapper so it's smaller and centered.
2. **Ensure consistent list item sizing** — the list items already use consistent text sizing; the visual "growing" is from the container being too wide. Constraining the container fixes this.
3. **Center the list block** — wrap the `<ol>` in a `flex justify-center` div so the list block is centered while text stays left-aligned.
4. **Reduce list font** — change `md:text-base` to `md:text-sm` for better proportion within the smaller container.

## Files
- `src/pages/NeighborhoodPage.tsx` — only file to touch

## Acceptance Criteria
- Note container is visually smaller and has a consistent max-width
- Numbered list items don't appear to grow progressively bigger
- List text is left-aligned but the list block is centered within the container
- Mobile-first: looks good at 375px, scales up for desktop
- `npm run build` passes

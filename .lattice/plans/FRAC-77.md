# FRAC-77: Entrepreneurship page text padding fix

## Problem
The "New Liberal Arts" page (`/new-liberal-arts`) has text content that overflows/hits the edges on mobile viewports (375px baseline).

Two issues identified in `src/components/sections/LiberalArts.tsx`:
1. The large heading "Tech, Entrepreneurship, Rhetoric, Civics" at `text-4xl` (36px) uppercase can overflow on 375px screens with only `px-6` (24px) side padding.
2. The "Fractal U" content block (line 26) has `max-w-3xl` but no `mx-auto`, so it's not centered within its parent.

## Approach
- Reduce the mobile heading size from `text-4xl` to `text-2xl` or `text-3xl` so it wraps properly within 327px content width.
- Add `mx-auto` to the Fractal U content block so it centers properly on wider screens.
- Add `overflow-hidden` or `overflow-x-hidden` to the section to prevent any horizontal scroll.

## Files
- `src/components/sections/LiberalArts.tsx`

## Acceptance criteria
- Text has proper padding on mobile (375px)
- No text overflow / no horizontal scroll
- Fractal U block is centered
- No regressions on desktop

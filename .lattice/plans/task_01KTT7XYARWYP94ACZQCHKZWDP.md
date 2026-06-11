# FRAC-197: Story page: nudge flanking favicon diamonds down and shrink slightly

Trivial visual tweak, fully specified. Complexity: low.

In `src/pages/StoryPage.tsx` (flanking favicon layer, ~lines 213-220):
- Move down: container `top-24 md:top-32` → `top-28 md:top-40`.
- Shrink: images `w-[18%] lg:w-[16%] max-w-[300px]` → `w-[16%] lg:w-[14%] max-w-[260px]`.

Desktop-only decorative layer (hidden on mobile), so no mobile-viewport impact. Acceptance: diamonds sit visibly lower beside the heading and are slightly smaller; no layout shift for the heading content.

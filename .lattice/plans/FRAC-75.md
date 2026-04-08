# FRAC-75: Shrink note container, show visitor form on initial view

## Approach
- Reduce the note container font sizes: change `text-base` on the `<ol>` to `text-sm`, reduce `PretextParagraph` from `TEXT_SIZES.base` to `TEXT_SIZES.sm`
- Reduce vertical spacing: smaller padding on the note container, smaller margins between elements
- Shrink the hero heading from `text-4xl` to `text-2xl` on mobile
- Reduce bottom margin on the note container
- Goal: on 375px viewport, the "Want to visit?" text and Visitor Form button are visible without scrolling

## Files
- `src/pages/NeighborhoodPage.tsx`

## Acceptance criteria
- On 375px mobile viewport, the visitor form CTA is visible on initial load
- Note content remains readable at smaller size
- No desktop regressions (md: breakpoints preserve larger sizes)

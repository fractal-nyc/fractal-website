# FRAC-70: Button text size consistency

## Problem
Button text uses `text-sm` (14px) while the body text defaults to `text-base` (16px / 1rem). This makes buttons feel smaller than surrounding JetBrains Mono body text.

## Approach
- Remove `text-sm` from the button base class in `button.tsx` so buttons inherit the body's default `text-base` size
- Update the `sm` size variant from `text-xs` (12px) to `text-sm` (14px) to maintain relative sizing

## Files
- `src/components/ui/button.tsx`

## Acceptance criteria
- Default button text matches body text size (text-base / 16px)
- Small button variant uses text-sm (14px) instead of text-xs (12px)
- No layout breakage

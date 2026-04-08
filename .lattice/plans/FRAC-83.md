# FRAC-83: Inner page navbar — remove Jacquard section headers

## Problem
Inner page navbars use `NavLink` component (desktop) and Jacquard abbreviations (mobile) for section links. The Jacquard drop-cap styling makes nav links feel like decorative section headers rather than navigation.

## Approach
1. **Desktop inner page nav** (lines 221-225): Replace `NavLink` with plain serif-styled links — no Jacquard first-letter treatment.
2. **Mobile inner page nav** (lines 260-283): Replace Jacquard abbreviations with full link names in a clean font.
3. Keep the `NavLink` component intact — it's still used by the home page full navbar.
4. Keep all link colors and hrefs unchanged.

## Key files
- `src/components/layout/Navbar.tsx`

## Acceptance criteria
- Inner page desktop nav links display full names without Jacquard drop-cap
- Inner page mobile nav links display full names without Jacquard font
- Home page navbar is unchanged
- `npm run build` succeeds
- Links remain functional with correct colors

# FRAC-52: Add Mandelbrot Badge Decoration to Lab Research Page

## Scope

Add the vectorized MandelbrotIcon as decorative elements on the Lab page: a large faint watermark behind the archive header and a small inline ornament next to the section title.

## Approach

### 1. Large watermark behind archive header

Inside the archive section container (`max-w-7xl` div), add an absolutely-positioned MandelbrotIcon:
- Size: 320px desktop, 200px mobile (via hidden/block responsive classes)
- Color: `#6B4C9A` (Lab purple), opacity: 0.04
- Position: right side, top of section
- `pointer-events-none`, `select-none`, `aria-hidden="true"`

### 2. Small inline ornament next to "Research + Writing" heading

Add MandelbrotIcon inline after the text:
- Size: 18px, color: `#6B4C9A`, opacity: 0.35
- H2 gets `flex items-center gap-2`

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/LabPage.tsx` | Import MandelbrotIcon, add watermark div, add inline ornament |

No changes to MandelbrotIcon, DocumentBadge, or DocumentGrid.

## Acceptance Criteria

1. Faint Mandelbrot watermark visible behind archive header area
2. Small Mandelbrot inline with "Research + Writing" label
3. No interaction interference (pointer-events-none)
4. Decorations are aria-hidden
5. Mobile (375px): appropriately sized
6. LAB_COLOR used consistently

## Complexity
Low. Single file modification, purely decorative.

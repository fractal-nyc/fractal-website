# FRAC-58: Campus page — hero-to-body spacing fix

## Current state

- **Hero block:** `src/components/sections/Campus.tsx:187` — the `<div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 w-full">` container. Closes at line 224. The block has `pt-16 md:pt-24` (top padding) but **no bottom padding / no bottom margin** at all.
- **First body section ("Overview"):** `src/components/sections/Campus.tsx:227` — `<div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">`. Has bottom padding (`pb-24 md:pb-32`) but **no top margin / no top padding**.
- **Gap currently:** effectively none. The "Want a reduced rate?" aside (line 218) sits inside the hero with `mb-4` on the button-cluster above it, but nothing separates the hero's closing `</div>` from the Overview's opening `<div>`. Because the hero uses `min-h-screen` + `justify-start`, the content is top-aligned and any free vertical space is absorbed *below* the hero content but *inside* the hero box — so visually the body section can begin right under the last hero element if the viewport is short, or get an arbitrary amount of space if it's tall. Either way, no intentional, consistent breathing room is being introduced between the hero and the first body section.

## Section-break rhythm pattern on Campus

- **Other sections use:** `pb-24 md:pb-32` as bottom padding on each section `<div>`. The rhythm is driven entirely by *bottom-padding on the previous section*, not top-margin on the next one.
- **Source (representative examples):**
  - `src/components/sections/Campus.tsx:227` (Overview): `pb-24 md:pb-32`
  - `src/components/sections/Campus.tsx:254` (Four audiences): `pb-24 md:pb-32`
  - `src/components/sections/Campus.tsx:297` (Get shit done): `pb-24 md:pb-32`
  - `src/components/sections/Campus.tsx:319, 349, 381, 398, 433, 463, 480, 494, 516`: all use `pb-24 md:pb-32`
  - `src/components/sections/Campus.tsx:578` (final section): `pb-24 md:pb-40` (slightly larger to seat the footer)
- **Canonical pattern:** bottom-padding lives on the *current* section. The first body section ("Overview") owns its bottom rhythm but currently has no upstream rhythm because the hero contributes nothing.

## Proposed change

- `src/components/sections/Campus.tsx:187` — add `pb-16 md:pb-24` to the hero container's className.
  - **Before:** `<div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 w-full">`
  - **After:** `<div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-16 md:pb-24 w-full">`

**Why bottom-padding on the hero (not top-margin on Overview):**

1. Matches the existing Campus rhythm convention (bottom-padding on the source section, not top-margin on the destination).
2. Keeps the spacing *inside* the hero container, so the `min-h-screen` calculation includes the breather — guarantees the gap is always there regardless of viewport height. (If we added `mt-*` to Overview instead, on shorter viewports the hero would still consume `min-h-screen` and Overview's `mt-*` would push it down — fine — but on very tall viewports the gap would appear doubled because the hero's flex `justify-start` would already have whitespace below the content.)
3. The hero is the *only* section without a `pb-*` — every other section has one. This change brings it into alignment with the rest of the page.

**Why `pb-16 md:pb-24` and not `pb-24 md:pb-32`:**

- `pb-24 md:pb-32` is what *full body sections* use between each other. The hero→first-body break is conceptually a *softer* transition (still inside the visual "title page" feeling), so a slightly smaller value reads more intentionally. The Story page uses an analogous-but-not-identical `pt-8 md:pt-12 pb-16 md:pb-24` rhythm for its first post-hero section, which corroborates that the first body break can be lighter than the inter-body breaks.
- `pb-16 md:pb-24` = 64px mobile, 96px desktop — substantial, intentional breathing room without over-padding the mobile viewport (which is the FRAC-22 PRD's non-negotiable constraint).

## FRAC-48 compatibility check

- **FRAC-48 (Campus page: match Story + Education centered-container / left-aligned-text formatting)** changes the *inner body block columns* (e.g., the `<div className="max-w-3xl">` and similar at `Campus.tsx:229, 259, 290, 302, 324, ...`) by applying `mx-auto` and reconciling `max-w-*` tokens against Story/Education conventions. It does NOT touch:
  - The top-level section wrappers (`<div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">`).
  - The hero container at line 187.
  - Any `pt-*` / `pb-*` / `mt-*` / `mb-*` spacing tokens.
- **Confirmed no conflict:** FRAC-48 operates on horizontal alignment (`mx-auto`, `max-w-*`) of inner content blocks; FRAC-58 adds a single vertical-padding token to the hero wrapper. The two edits touch different elements and different concerns. They can land in either order.

## Acceptance criteria

- Noticeable, intentional breathing room between the hero block (ending at the "Want a reduced rate?" aside) and the first body section ("A *campus* in the heart of Williamsburg…").
- Consistent rhythm with other section breaks on Campus — uses the same `pb-*` convention, just sized appropriately for a hero→first-body transition.
- 375px mobile + desktop both look correct: 64px (mobile) / 96px (desktop) of breathing room.
- No other pages affected — the change is a single className edit on a Campus-only element.

## Files to touch

- `src/components/sections/Campus.tsx` (1 line, line 187: add `pb-16 md:pb-24` to the hero container's className)

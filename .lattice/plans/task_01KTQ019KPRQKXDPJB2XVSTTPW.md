# FRAC-67: Search bar cursor animation — keep animating even when not focused (home + publications)

## Problem

The decorative thick-block cursor overlay (FRAC-43) inside both search inputs only renders while the input is focused. User wants the blink animation to play continuously on page load — to draw attention to the search affordance — and still degrade gracefully into typing mode without conflicting with the real text caret.

## Root cause

The CSS animation itself (`.animate-blink` in `src/index.css:300-307`) is unconditional and uses `animation: blink 1s step-end infinite`. There is no CSS `:focus` gating.

The focus gate is in React: each component conditionally renders the cursor overlay span only when `isFocused === true`. There are two callsites (mirrored implementations, NOT a shared component):

1. **Home** — `src/components/sections/Hero.tsx:218`
   ```tsx
   {isFocused && (
     <span ... className="absolute inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink pointer-events-none" ... />
   )}
   ```
   `isFocused` state declared at line 42; toggled by `onFocus`/`onBlur` on the input (lines 172-176).

2. **Publications (Lab)** — `src/components/lab/ArchiveSearch.tsx:106`
   ```tsx
   {isFocused && (
     <span ... className="absolute inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink pointer-events-none" ... />
   )}
   ```
   `isFocused` state declared at line 18; toggled by `onFocus`/`onBlur` on the input (lines 66-67).

The native browser caret is suppressed in both inputs via `style={{ caretColor: "transparent" }}` (Hero.tsx:193, ArchiveSearch.tsx:72), so the overlay is the ONLY visible cursor at all times when the input is focused.

## Approach

**Remove the `isFocused &&` render gate at both callsites.** The overlay span renders unconditionally — its `left` offset is already driven by the mirror span's measured `offsetWidth` regardless of focus state (the `useLayoutEffect` at Hero.tsx:51-54 and ArchiveSearch.tsx:32-41 keys on `[query/value, isFocused]`, so it updates on focus changes and on every keystroke — that behavior is preserved).

Specifically:

- **Hero.tsx** — change line 218 from `{isFocused && (` ... `)}` to render the `<span>` unconditionally (drop the `{isFocused && (` opener and matching `)}` closer).
- **ArchiveSearch.tsx** — same change at line 106.

The `isFocused` state itself stays — it's still used as a dependency in the `useLayoutEffect` measurement so the caret position recalculates when the placeholder string swaps in/out (placeholder is what's measured when `query` is empty, and real-typed text is what's measured when `query` is non-empty). Removing the state would be a tempting cleanup but is out of scope and risks regressing the measurement timing.

## Conflict with the real caret

There is no conflict, by design (already established by FRAC-43):
- Native caret is suppressed unconditionally via `caretColor: "transparent"` — set inline on both inputs at all times, not gated by focus. So even pre-focus, no native caret can appear.
- The overlay is positioned at `left = leftPadding + mirror.offsetWidth`. When `value === ""`, the mirror renders the placeholder string, so the cursor sits flush at the end of the placeholder text. When the user types, the mirror swaps to render the actual `value`, so the cursor follows the end-of-text. There is never a second cursor.
- The clamp logic in ArchiveSearch.tsx (lines 36-48) already prevents the cursor from colliding with the clear-X button.

Result: pre-focus the cursor sits at the end of the placeholder; on focus the input is interactive (placeholder remains, cursor in same place); on typing the cursor tracks the end of typed text. Single cursor at every step.

## Key files

- `src/components/sections/Hero.tsx` — home page search (line 218)
- `src/components/lab/ArchiveSearch.tsx` — publications page search (line 106)
- `src/index.css` — `.animate-blink` keyframes (no change needed; reduced-motion guard at lines 323-328 already handles accessibility)
- `src/components/lab/ArchiveToolbar.tsx` — consumer of ArchiveSearch (no change)

## Acceptance criteria

- On `/` (home) initial load, with no user interaction, the thick blinking cursor is visible at the end of the "Explore Fractal..." placeholder inside the search bar and animates (blinks).
- On `/lab` (publications) initial load, with no user interaction, the thick blinking cursor is visible at the end of the "SEARCH TITLES, AUTHORS, TOPICS..." placeholder and animates.
- Focusing either input does not produce a second cursor.
- Typing into either input: the cursor continues to blink and follows the end of the typed text. No native caret appears alongside it.
- Blurring either input: the cursor remains visible and continues to blink at the end of the current value (or placeholder if empty).
- Reduced-motion: with `prefers-reduced-motion: reduce`, the cursor is visible but frozen (no blink) — unchanged from FRAC-28.

## Validation

1. `npm run dev` (or whatever the standard dev command is here — confirm in package.json during implementation).
2. Load `/` — visually confirm the cursor is blinking at the end of "Explore Fractal..." before any click/tap.
3. Load `/lab` — visually confirm the cursor is blinking at the end of "SEARCH TITLES, AUTHORS, TOPICS..." before any click/tap.
4. Click into each input, type a few characters — confirm cursor follows end-of-text and there is no duplicate native caret.
5. Blur each input (click outside) — confirm cursor remains visible and animating.
6. Toggle macOS "Reduce motion" setting and reload — confirm cursor is visible but static (frozen).
7. Mobile (375px viewport) — same checks; the mobile-first PRD requires this works on phone-sized screens. Both inputs are responsive and the cursor is absolutely positioned within the same relative wrappers, so behavior should match desktop.

## Complexity

Low. Two-line change across two files, no new state, no CSS changes, no API changes. The hardest part is the visual verification across pages and viewports.

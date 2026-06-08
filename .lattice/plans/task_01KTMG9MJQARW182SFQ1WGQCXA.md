# FRAC-43: Restore thick blinking cursor on text inputs / search bars (regression)

## Context (archaeology)

The thick blinking cursor was a decorative 9px × 18px charcoal-on-cream span overlay that blinked end-of-text on the hero "search bar" in commit `1ba8aa2` (2026-04-06, "Redesign navbar with drop-cap nav links, move hero text below fold, add search bar"). The original markup was a `<div>` of two `<span>`s — a literal "Explore Fractal..." string plus the blinking span — wrapped to look like an input. There was no real input at that point. The `@keyframes blink` + `.animate-blink` CSS utility was authored in the same commit.

Commit `3572d27` (2026-04-06, "Make hero search bar functional with page navigation" — FRAC-59) replaced the static div with a real `<input type="text">`, deleting the only `animate-blink` consumer. The cursor reverted to the browser default thin caret and has stayed regressed since.

FRAC-28 (`423a479`) later added a `prefers-reduced-motion` guard to the CSS. The infrastructure has waited for a consumer:

- `@keyframes blink` — `src/index.css:253-256`
- `.animate-blink` — `src/index.css:258-260` (`animation: blink 1s step-end infinite`)
- `prefers-reduced-motion` opt-out — `src/index.css:262-270`

Zero call sites in `src/` reference `animate-blink` today. `input-otp.tsx` uses a separate `animate-caret-blink` utility (shadcn, out of scope).

## Goal

Restore the thick blinking cursor across the two real typeable search inputs (hero search, lab archive search) using the surviving `.animate-blink` infrastructure. Reproduce the historical 9px × 18px charcoal block aesthetic, honor `prefers-reduced-motion`, work cross-browser including iOS Safari at 375px.

## Restoration mechanism

**Span overlay** — a `<span>` rendered alongside the `<input>`, absolutely positioned at the end of the typed text (or placeholder when empty), classes `bg-foreground/70 animate-blink`. The input's own browser caret is suppressed with `caret-color: transparent`.

### Why span overlay vs caret-shape

- `caret-shape: block` would be cleaner but Safari 16.4+ has limited width control, Firefox no support. Cannot reliably reproduce 9px × 18px "thick".
- Original was a span overlay — we are restoring, not reinventing.
- Reuses `.animate-blink` CSS verbatim, inherits the FRAC-28 reduced-motion guard for free.

### Tradeoff (documented for review)

Overlay sits at end-of-text only — does not follow the browser caret when user moves mid-string. Matches original decorative intent and the regression report ("thick blinking cursor on search bars" — end-of-line behavior, not full IME caret tracking). On focus the overlay is visible; on blur it hides.

### Width measurement strategy

Anchor the overlay relative to a hidden mirror `<span>` containing the input's text + placeholder. The mirror's computed `offsetWidth` drives the overlay's `left` offset. Standard "cursor at end of input" technique. Both target inputs use mono families (font-mono for Hero's `.text-label`; JBM for ArchiveSearch's `.text-control`), so width measurement is stable.

## Files in scope

### 1. `src/components/sections/Hero.tsx`

Add a blinking cursor overlay to the hero search input.

Required edits:

1. **Add focus tracking state**: `const [isFocused, setIsFocused] = useState(false);` near existing search state.
2. **Add `caretColor: "transparent"` inline style** on the existing input. Keep the existing className unchanged.
3. **Add the overlay span** inside the same `<div className="relative">` wrapper, after the input. Render conditionally on `isFocused`. Visual: `absolute inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink pointer-events-none`, `aria-hidden="true"`. Match commit `1ba8aa2` styling verbatim.
4. **Positioning**: absolute, vertically centered (`top: 50%; transform: translateY(-50%)`), horizontally offset by the measured text width plus the input's left padding.
5. **Width measurement**: hidden mirror `<span aria-hidden="true">` with `position: absolute; visibility: hidden; white-space: pre; pointer-events: none`. Same typography class as the input (`text-label`). textContent from `query || "Explore Fractal..."`. Read `mirrorRef.current.offsetWidth` in `useLayoutEffect` keyed on `[query, isFocused]`; store in state.
6. **`onFocus`** wires both existing `setIsOpen(true)` AND new `setIsFocused(true)`. New `onBlur` sets `setIsFocused(false)` (be careful not to break the existing outside-click handler — keep them separate).

### 2. `src/components/lab/ArchiveSearch.tsx`

Mirror the same pattern. Edits:

1. Import `useState` and `useLayoutEffect` (file currently uses `useRef` and `useCallback` only).
2. Add `isFocused` state.
3. Add `caretColor: "transparent"` inline style on the input.
4. Add mirror `<span aria-hidden="true">` with same typography (`.text-control`) and computed-width measurement.
5. Add overlay span with `absolute inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink pointer-events-none`, `aria-hidden="true"`.
6. **Left offset**: `pl-10` = 40px (vs Hero's `pl-8` = 32px).
7. **Account for clear-X button**: when `value.length > 0` the right `pr-10` (40px) holds the X button. Clamp the overlay's `left` so it never exceeds `inputWidth - 40px - 9px`.

### 3. `src/index.css` — no changes needed

The infrastructure is already in place. We restore consumers, not author CSS.

### 4. `DESIGN.md` — no changes needed

DESIGN.md doesn't model cursor visuals as a token; the fat cursor is per-component.

## Reference implementation snippet

```tsx
// Hero.tsx (analogous in ArchiveSearch.tsx)
const mirrorRef = useRef<HTMLSpanElement>(null);
const [caretLeft, setCaretLeft] = useState(0);
const [isFocused, setIsFocused] = useState(false);

useLayoutEffect(() => {
  if (!mirrorRef.current) return;
  setCaretLeft(mirrorRef.current.offsetWidth);
}, [query, isFocused]);

// JSX inside <div className="relative">:
<input
  // ...existing props...
  onFocus={(e) => { setIsOpen(true); setIsFocused(true); }}
  onBlur={() => setIsFocused(false)}
  style={{ caretColor: "transparent" }}
  className="...existing classes..."
/>
<span
  ref={mirrorRef}
  aria-hidden="true"
  className="text-label"
  style={{
    position: "absolute",
    visibility: "hidden",
    whiteSpace: "pre",
    pointerEvents: "none",
    top: 0,
    left: 0,
  }}
>
  {query || "Explore Fractal..."}
</span>
{isFocused && (
  <span
    aria-hidden="true"
    className="absolute inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink pointer-events-none"
    style={{
      left: 32 + caretLeft, // pl-8 in hero; pl-10 (40) in ArchiveSearch
      top: "50%",
      transform: "translateY(-50%)",
    }}
  />
)}
```

For ArchiveSearch: mirror uses `text-control` className; left offset starts at `40` (pl-10).

## prefers-reduced-motion handling

Already handled by the surviving CSS at `src/index.css:262-270`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-blink {
    animation: none;
    opacity: 1;
  }
}
```

When reduced-motion is enabled, the overlay still renders but is solid (no blink). Correct treatment — cursor still communicates focus, just without the pulse. No JS changes required.

## Mobile / iOS Safari notes

- `caret-color: transparent` is supported in iOS Safari 11.1+, Chrome, Firefox, Edge. No fallback needed.
- 9px × 18px reads correctly at 375px. Hero input `h-[30px]` leaves 6px vertical padding around the 18px caret; ArchiveSearch `h-11` (44px) leaves 13px.
- Mirror-span `offsetWidth` measurement is same-frame, no layout thrash.
- iOS keyboard push: overlay's absolute position is relative to `<div className="relative">` parent, both move together with the input.

## Test plan

1. **Typecheck** — `pnpm typecheck` clean.
2. **Tests** — `pnpm test` shows exactly the 4 documented baseline failures (footer FRAC-88 italic, footer Jacquard, navigation mobile labels, neighborhood min-h-screen). No new failures.
3. **Build** — `pnpm build` succeeds.
4. **Manual smoke at 375px**:
   - Hero: focus search input → thin browser caret invisible, thick charcoal block blinks at end-of-text. Type → block advances. Clear → block returns to end-of-placeholder. Blur → block disappears.
   - Lab archive: same checks at `/lab`. Type → block advances. Clear-X button doesn't collide.
   - Toggle macOS Reduce Motion → reload → block renders solid, no blink.
5. **Cross-browser smoke** (optional): Chrome, Firefox, Safari desktop.

## Acceptance criteria

- [ ] `src/components/sections/Hero.tsx` renders `animate-blink` span overlay on hero search input when focused.
- [ ] `src/components/lab/ArchiveSearch.tsx` renders same on archive search.
- [ ] Both inputs have `caret-color: transparent` (native caret suppressed).
- [ ] Overlay visual: `w-[9px] h-[18px] bg-foreground/70` — matches commit `1ba8aa2`.
- [ ] Overlay is `aria-hidden="true"` and `pointer-events-none` — decorative.
- [ ] Overlay disappears on blur, reappears on focus.
- [ ] `prefers-reduced-motion: reduce` makes overlay solid (existing CSS guard applies).
- [ ] No changes to `src/index.css`.
- [ ] No changes to `src/components/ui/input.tsx` or `input-otp.tsx`.
- [ ] No changes to `.text-control` typography (FRAC-41; out of scope).
- [ ] Typecheck clean; existing test failures unchanged; build succeeds.
- [ ] Mobile 375px verified visually (or compiled fallback if sandbox blocks dev server).

## Commit strategy

Two commits:

1. **`FRAC-43: restore thick blinking cursor on hero search (regression)`** — `src/components/sections/Hero.tsx` only. Span overlay + mirror + focus state + `caret-color: transparent`. Calls out the archaeology.
2. **`FRAC-43: extend thick cursor to lab archive search`** — `src/components/lab/ArchiveSearch.tsx`. Mirror pattern adapted to `.text-control` typography and `pl-10`.

## Open questions

None blocking. Two soft notes for transparency:

1. **Hero search typography is still `text-label`** (uppercase, tracking 0.1em) — not FRAC-41's `.text-control`. The cursor works on either. If hero search later migrates to `.text-control` for iOS no-zoom reasons, re-check caret height/width.
2. **Caret width 9px** is the literal pixel value from commit `1ba8aa2`. If a future polish task wants this to scale with font size, it becomes a derived value (e.g., `0.55em`). For now: restore the literal value.

## Out of scope

- Changing search bar typography (FRAC-41 just landed).
- Adding cursor to inputs that didn't have it originally.
- shadcn `input-otp.tsx` (`animate-caret-blink` is separate).
- Visual-regression snapshot tests (no existing harness).

## Pre-existing repo state

`git status` should be clean off master at branch creation. Only the standard untracked files (`.claude/`, `notes/.recovered/`, etc.) and sibling FRAC-40 task files in `.lattice/` — leave all untouched per shared-worktree discipline.

If lattice CLI calls during planning created uncommitted `.lattice/` state, absorb in the first commit explicitly by filename.

# Combined Plan: FRAC-60 + FRAC-68 — Navbar polish

Bundled tasks shipping on one branch `frac-60-68-navbar` / one PR. Both touch `src/components/layout/Navbar.tsx`.

- **FRAC-60** — Hamburger: alignment, sizing, interactive affordances (cursor + hover + focus + active), and panel-item affordances.
- **FRAC-68** — Wordmark: "Fractal" shrinks disproportionately to "Collective" on mobile.

---

## Key file

- `src/components/layout/Navbar.tsx` — the only file edited.

There is no separate `MobileMenu` component. All four navbar layout variants live inside `Navbar.tsx`:

| Variant | Location (line range) | Renders when |
|---|---|---|
| Full desktop home (3-col grid) | 163–212 | `isHome && !hasScrolledPast`, `lg:` only |
| Mobile/tablet home | 215–265 | `isHome && !hasScrolledPast`, `<lg` (hamburger NOT present in this variant — uses inline letter nav) |
| Inner-page desktop | 271–310 | `!isHome`, `md:` only (has hamburger button) |
| Inner-page mobile | 313–336 | `!isHome`, `<md` (has hamburger button) |
| Home scrolled (compact) | 340–361 | `isHome && hasScrolledPast` (has hamburger button) |
| Menu overlay panel | 366–420 | `mobileMenuOpen` |

The hamburger button appears in **three variants** (lines 303–308, 329–335, 355–360). All three carry the same string and must be updated together.

---

## Section 1 — Wordmark (FRAC-68): root cause & fix

### Root cause

The wordmark is rendered as two stacked `<span>` blocks: "Fractal" in Jacquard 24, "Collective" in italic serif. Each variant sizes them independently and the two halves use **inconsistent sizing strategies** — one is fluid (`clamp()` keyed off `vw`), the other is fixed `px`. At narrow viewports `clamp()` clamps to its lower bound while the fixed `px` value remains constant, breaking proportion.

The intended desktop proportion is **Fractal ≈ 1.71× Collective** (e.g. `82px / 48px` and `42px / 27px` upper bounds in the existing clamps). Below we restore that ratio at every viewport.

Per-variant audit:

| Variant | Fractal current | Collective current | Bug at 375px |
|---|---|---|---|
| Full desktop (lines 184, 190) | `clamp(42px, 8vw, 82px)` | `clamp(27px, 5vw, 48px)` | OK — both fluid, same ratio. **No change needed.** |
| Mobile home (lines 221, 227) | `clamp(24px, 4.5vw, 42px)` | `27px` fixed | At 375px: Fractal = `max(24, 4.5vw)` = `24px`; Collective = `27px`. **Fractal smaller than Collective.** |
| Inner desktop (lines 276, 282) | `clamp(28px, 5.5vw, 50px)` | `30px` fixed | At md breakpoint (768px): Fractal = `5.5vw` = `42px`; Collective fixed `30px` (ratio 1.4 — narrower than 1.71). At larger desktop, ratio drifts further. |
| Inner mobile (lines 318, 324) | `36px` fixed | `22px` fixed | OK proportion (36/22 = 1.64, close to 1.71) — leave as-is OR snap to canonical ratio for consistency. |
| Home scrolled (lines 344, 350) | `clamp(42px, 8vw, 82px)` | `clamp(27px, 5vw, 48px)` | OK — both fluid. **No change needed.** |

### Fix

Unify so **Fractal and Collective always scale together** using the canonical **1.71 ratio**. Strategy: both halves use `clamp()` with the same `vw` driver scaled by the ratio, OR both halves use the same fixed `px` value (when the variant calls for a non-fluid size).

Exact edits:

1. **Mobile home variant (lines 215–265)** — line 221 already uses `clamp(24px, 4.5vw, 42px)` for Fractal. Replace line 227's `fontSize: "27px"` with a matching clamp scaled by `1/1.71 ≈ 0.585`:
   ```
   fontSize: "clamp(14px, 2.63vw, 25px)"
   ```
   This preserves the desktop 1.71 ratio at every point in the fluid curve. (Lower-bound 14px is intentionally smaller than 24/1.71 = 14.04; upper-bound 25px = 42/1.71.)

2. **Inner desktop variant (lines 271–310)** — line 282 fixed `30px` is wrong against fluid Fractal. Replace with a clamp scaled by 1/1.71 off line 276's Fractal clamp `clamp(28px, 5.5vw, 50px)`:
   ```
   fontSize: "clamp(16px, 3.22vw, 29px)"
   ```

3. **Inner mobile variant (lines 313–336)** — both currently fixed. Existing ratio 36/22 = 1.64 is close enough; snap to canonical 1.71 by changing line 324 from `22px` to `21px` (= 36/1.71 rounded). Low-stakes consistency fix.

4. **Full desktop home (lines 163–212)** and **home scrolled (lines 340–361)**: **no change** — both halves already use matched clamps at the canonical ratio.

### Acceptance (FRAC-68)

- At 320 / 375 / 414 / 768 / 1024 / 1440 px viewports, the rendered height ratio of "Fractal" : "Collective" stays within ±5% of 1.71 in every navbar variant.
- Neither word visibly grows or shrinks relative to the other when the viewport is dragged through a breakpoint.
- No regression to the full-desktop home variant (which already shipped correctly).

---

## Section 2 — Hamburger affordances (FRAC-60 part 1: cursor / hover / focus-visible / active)

### Current state

All three hamburger buttons (lines 303–308, 329–335, 355–360) share this string:
```
className="z-50 relative p-2 -mr-2"
```
- No `cursor-pointer` (Tailwind doesn't apply it to `<button>` by default in some browser/CSS-reset combos; existing site convention is to set it explicitly).
- No `hover:` rule.
- No `focus-visible:` rule.
- No `active:` rule.
- No `aria-label`, no `aria-expanded` (accessibility miss; add while in the area).

### Pattern reference (from `src/components/ui/button.tsx`)

The Button component's `buttonVariants` base string establishes the site's affordance pattern (button.tsx:34–39):
```
transition-colors duration-300
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background
disabled:pointer-events-none disabled:opacity-50
```
And the `outline` variant (button.tsx:62) gives the hover/active pattern:
```
hover:bg-foreground/5
```
The NavLink letters (line 70) use `hover:opacity-70 transition-opacity`. That is the other established affordance dialect on this site.

We will adopt **both**: opacity-based hover (matches NavLink dialect — the hamburger is sibling to NavLink letters at the same nav level) plus the canonical focus-visible ring (matches Button — the hamburger is a `<button>`).

### Exact classes to add to every hamburger button

Replace:
```
className="z-50 relative p-2 -mr-2"
```
With:
```
className="z-50 relative cursor-pointer transition-opacity duration-200 hover:opacity-70 active:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md flex items-center justify-center"
```

And add accessibility props on each button:
```
aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
aria-expanded={mobileMenuOpen}
type="button"
```

Notes:
- `cursor-pointer` — explicit, matches site convention.
- `transition-opacity duration-200 hover:opacity-70` — matches NavLink dialect (line 70).
- `active:opacity-90 active:scale-95` — tactile press feedback. `scale-95` is small enough to read as "press" without distorting the icon.
- `focus-visible:ring-2 ring-foreground ring-offset-2 ring-offset-background` — canonical from Button.
- `rounded-md` — gives the ring a clean shape (current `p-2` is a square with no radius).
- `flex items-center justify-center` — needed for the alignment work in Section 3 (icon center anchored).

---

## Section 3 — Hamburger alignment + size (FRAC-60 part 2)

### Vertical centering with wordmark

Today's inner-page mobile variant (lines 313–336):
```tsx
<div className="flex items-center justify-between">
  <Link ... wordmark stack ... />
  <button ... />
</div>
```
The parent already uses `items-center`. But the wordmark is a **two-line stack** (`Fractal` / `Collective`), so `items-center` centers the button against the **vertical midpoint of the entire two-line block**. That is the correct "shared baseline" per FRAC-60 acceptance ("both share one centered baseline"). **No structural change needed for vertical centering** — confirm `items-center` is the value on the flex parent.

The inner-page desktop variant (line 272) uses `items-end` — that is intentional for desktop (baselines align). **Mobile-first scope is `<md`**; desktop is fine as is. We will leave inner-desktop's `items-end` untouched.

The home-scrolled variant (line 340) already uses `items-center` — also correct.

So: **no change to vertical alignment is required at the flex-parent level.** What we need to add is `flex items-center justify-center` **on the button itself** (already included in Section 2 string) so the icon sits dead-center inside the now-larger tap target — without it, an enlarged `<button>` with default block content would top-left the SVG.

### Size — meet >= 44px tap target AND look proportional to wordmark

Current icon: `<Menu size={24} />` (and `<X size={24} />`). Container is `p-2` (8px padding) so the tap target is `24 + 16 = 40px`. **Below 44px.**

Wordmark heights at 375px after FRAC-68 fix:
- Mobile home: Fractal ≈ 24px, Collective ≈ 14px (line-height 0.9 stack ≈ ~36px tall total).
- Inner mobile: Fractal 36px, Collective 21px (stack ≈ ~52px tall).
- Home scrolled: Fractal `clamp(42, 8vw, 82)` ≈ 42px at 375px, Collective ~27px (stack ≈ ~62px tall).

A 24px icon next to a 36px–62px-tall wordmark reads small. Bump to:

**Icon size: 32px. Container padding: `p-3` (12px). Tap target: 32 + 24 = 56px.** Exceeds 44px comfortably; 56px is the same `min-h-[56px]` already used on the menu-overlay items (line 397), so the navbar trigger and the panel rows share one tap-target rhythm.

Exact edits on the three hamburger buttons:
- Change `<Menu size={24} />` → `<Menu size={32} />`
- Change `<X size={24} />` → `<X size={32} />`
- In the className string, replace `p-2 -mr-2` with `p-3 -mr-3` (preserves the same visual right-edge alignment; the -mr offset is already a "pull the tap target into the gutter" trick — scale it with the new padding).

The Section 2 className string becomes (with these edits folded in):
```
className="z-50 relative cursor-pointer transition-opacity duration-200 hover:opacity-70 active:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md flex items-center justify-center p-3 -mr-3"
```

(Note: the `p-3 -mr-3` replaces the original `p-2 -mr-2`. Do not double-apply.)

### Inner-page desktop hamburger (line 303–308)

Same treatment — bump icon to 32 and padding to p-3. The desktop variant lives at `md:` and above; the larger icon scales fine against the larger desktop wordmark.

---

## Section 4 — Open-panel menu items affordances

### Current state (lines 390–417)

```tsx
<button
  ...
  className="flex items-center gap-5 min-h-[56px] py-3 border-b border-foreground/10 hover:bg-foreground/5 transition-colors text-left"
  ...
>
```
Already has:
- `min-h-[56px]` — tap target OK.
- `hover:bg-foreground/5` — hover state OK.
- `transition-colors` — animation OK.

Missing:
- `cursor-pointer` — add for explicit cursor on desktop.
- `focus-visible:` ring — add to match the hamburger trigger and Button pattern.
- `active:` state — add subtle press feedback consistent with trigger.

### Exact edit

Replace the menu-item className:
```
"flex items-center gap-5 min-h-[56px] py-3 border-b border-foreground/10 hover:bg-foreground/5 transition-colors text-left"
```
With:
```
"flex items-center gap-5 min-h-[56px] py-3 border-b border-foreground/10 cursor-pointer hover:bg-foreground/5 active:bg-foreground/10 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
```

`ring-inset` is used (not `ring-offset-*`) because the row sits flush against full panel width — a non-inset ring would clip on the left/right edges.

---

## Acceptance criteria

### FRAC-68 (wordmark)

- [ ] At 320 / 375 / 414 / 768 px, the ratio of rendered "Fractal" height to "Collective" height is within ±5% of 1.71.
- [ ] Both words scale together — dragging the viewport from 320px to 1440px never produces a moment where one word visibly grows while the other stays put.
- [ ] Full-desktop-home and home-scrolled variants are unchanged (regression check).
- [ ] No new font sizes introduced; only the inconsistent fixed-px values are replaced with matching clamps.

### FRAC-60 (hamburger)

- [ ] Hovering the hamburger trigger on desktop shows `cursor: pointer`.
- [ ] Hovering shows a visible state change (opacity drops to 70%).
- [ ] Pressing (mouse-down or touch-down) shows the active state (opacity 90% + scale 95%).
- [ ] Keyboard-focusing (Tab) shows a 2px charcoal ring with cream offset.
- [ ] Icon size is 32px (up from 24px); tap target is 56px (up from 40px) — comfortably exceeds 44px.
- [ ] At mobile widths (<md), hamburger and wordmark share one centered vertical axis (`items-center` on the flex parent; icon centered inside the button via `flex items-center justify-center`).
- [ ] Hamburger button has `aria-label`, `aria-expanded`, and `type="button"`.
- [ ] Menu-overlay items show `cursor: pointer` on hover, retain their existing `hover:bg-foreground/5`, gain a `focus-visible:ring-inset` ring, and a subtle `active:bg-foreground/10` press state.
- [ ] All three hamburger button occurrences (lines 303–308, 329–335, 355–360 of `Navbar.tsx`) receive the same treatment — do not update one and skip the others.

---

## Validation

**Mobile-first viewports (mandatory):**
- 320px — narrowest supported. Verify wordmark proportion AND hamburger is reachable + visible.
- 375px — PRD baseline. Run the full acceptance checklist here.
- 414px — common iPhone width.

**Desktop regression:**
- 768px (md breakpoint switch).
- 1024px (lg breakpoint switch — full-desktop-home variant kicks in).
- 1440px (typical desktop).

**Interaction checks (375px):**
- Tap hamburger → menu opens.
- Hover hamburger with desktop pointer → cursor changes, opacity dips.
- Tab to hamburger via keyboard → ring appears.
- Tab through open-menu items → each row's inset ring is visible.
- Tap a menu item → navigation succeeds, menu closes.

**Visual smoke checks (look-at-it):**
- Wordmark on inner pages (e.g. `/events`) at 375px — does "Fractal" look larger than "Collective"? It should.
- Hamburger icon next to wordmark — does it feel proportionate? Not dwarfed, not dominating.

**Tests:**
- Run `pnpm test` (or whatever the project's runner is) to confirm no Navbar test breaks. If tests assert on icon size or button classes, update assertions to match new values.

---

## Implementation notes (for the impl sub-agent)

- Single file changed: `src/components/layout/Navbar.tsx`.
- Three hamburger buttons. **Do not factor out into a shared component** — the variant context (parent flex behavior, the surrounding `<div>` classes) is different at each site and the wins of inlining the change beat the risk of premature abstraction. If a follow-up FRAC wants a shared `HamburgerButton` component, it gets its own task.
- Three "Collective" fontSize lines change. **No other Collective sites in the codebase** — `grep` confirms the wordmark only renders in `Navbar.tsx`.
- Lucide `Menu` and `X` icons accept a numeric `size` prop — no className width/height surgery needed.
- Keep diffs minimal — do not reformat the surrounding JSX or rewrite the variant structure.

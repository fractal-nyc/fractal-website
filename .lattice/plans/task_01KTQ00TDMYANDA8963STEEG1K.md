# FRAC-64 + FRAC-65 — Visit Page Note: Mandelbrot Collision Fix + CTA Reorder

**Bundled PR:** `frac-64-65-visit-note` — single branch, single PR covering both tasks.
**Page:** `src/pages/NeighborhoodPage.tsx` (the "Visit" page; the route is `/neighborhood`).
**Complexity:** Low for FRAC-65 (markup reorder). Medium for FRAC-64 (root-cause + small sitewide design rule).
**Mobile-first:** Both fixes verified at 320px / 375px / 414px before desktop.

---

## Section 1 — FRAC-64: Mandelbrot/text collision in the Note container

### Root cause

The `MandelbrotCorners` wrapper (`src/components/ui/MandelbrotCorners.tsx`) places four absolutely-positioned `<span>` glyphs **inside** the wrapper's box at small insets from each corner. For `size="sm"` the icon is **30px** and the inset is **6px**, so each corner glyph occupies a 30×30 region whose outer extent is **~36px from the corner** (inset + icon size).

The Visit page Note container (`NeighborhoodPage.tsx` line 31) uses:

```
className="border border-foreground/20 rounded-md
           px-6 py-5 md:px-10 md:py-8
           ...
           bg-foreground/[0.03] text-foreground text-left max-w-xl mx-auto"
```

That is **24px horizontal / 20px vertical padding on mobile**. Content starts at (24, 20). The top-left corner glyph extends from (6, 6) to (36, 36). The overlap region — where the glyph rectangle and the content box intersect — is roughly **x: 24–36, y: 20–36** (top-left), and mirrored at the other three corners. The eyebrow "Note" sits exactly inside that overlap zone on the top-left, and the trailing list items / final paragraph lines collide at the bottom corners.

At `md:` (`px-10 py-8` = 40/32px) the padding clears the 36px outer extent, which is why the bug only shows on mobile.

The collision is therefore **a violation of an unwritten invariant**: a `MandelbrotCorners` container's padding must be greater than or equal to `inset + iconSize` of the chosen `size` preset on **every** side. Currently no code, comment, or doc states this.

Safe-padding lookup per size (inset + iconSize):

| `size` | inset | icon | safe-padding (min) |
|--------|-------|------|--------------------|
| `xs`   | 4px   | 20px | **24px** (`p-6`)   |
| `sm`   | 6px   | 30px | **36px** (`p-9`)   |
| `md`   | 8px   | 45px | **53px** (`p-14`)  |
| `lg`   | 10px  | 60px | **70px** (closest token `p-16`+) |

### Decision — local fix AND a sitewide DESIGN.md note

`MandelbrotCorners` / `CornerDecorations` is used in three places today:
- `NeighborhoodPage.tsx` (Visit page Note — `size="sm"`, currently broken on mobile).
- `src/components/lab/DocumentBadge.tsx` (`size="xs"` with `p-5`/`p-6` — `p-5` = 20px is **below the 24px minimum**; needs a tiny bump too).
- `src/pages/EventsPage.tsx` uses `CornerDecorations size="xs"` on the calendar iframe — the iframe is not text, no collision risk, leave alone.

This is a **shared pattern with a recurring footgun** (already broken in 2 of 3 use-sites once measured), so this fix is **local + sitewide**:

1. **Local (FRAC-64 primary):** Bump the Note container's mobile padding from `px-6 py-5` to `p-9` (36px all sides), keeping `md:px-10 md:py-8`. This satisfies the safe-padding rule for `size="sm"`.
2. **Local (DocumentBadge follow-along):** Bump `p-5` → `p-6` for the non-featured branch in `DocumentBadge.tsx` so it satisfies the 24px minimum for `size="xs"`. Featured `p-6 md:p-8` is already safe.
3. **Sitewide (codification):** Add a short subsection to `DESIGN.md` under `### Mandelbrot corner motif` (line 351) titled `### Mandelbrot corners on text containers`. State the invariant and the per-size minimum-padding table above. One paragraph + table. No other DESIGN.md restructuring.
4. **Sitewide (code self-documenting):** Add a top-of-file JSDoc note to `MandelbrotCorners.tsx` documenting the safe-padding invariant, referencing the DESIGN.md section. No API change, no new prop. (Considered exposing a `safeArea` prop or auto-applying min-padding via a `style`; rejected because (a) it would hide the constraint instead of teaching it, and (b) authors choose paddings for visual rhythm — silent overrides would surprise.)

**Out of scope for this PR:** refactoring `MandelbrotCorners` to enforce padding programmatically, or extracting a `<Note>` component. If the pattern recurs further, file a follow-up.

### Files touched (FRAC-64)

- `src/pages/NeighborhoodPage.tsx` — padding bump on the Note container.
- `src/components/lab/DocumentBadge.tsx` — `p-5` → `p-6` on the non-featured anchor.
- `src/components/ui/MandelbrotCorners.tsx` — JSDoc-only addition documenting the safe-padding invariant.
- `DESIGN.md` — short subsection under §Shapes / Mandelbrot corner motif.

---

## Section 2 — FRAC-65: Reorder so CTA sits above the Note

### Current order (Visit page, `NeighborhoodPage.tsx` lines 24–69)

1. SectorHeader "V / Visit"
2. `text-display` "Live Near 100 Friends & Peers"
3. **`<FadeIn delay={0.15}>` → `<MandelbrotCorners>` Note block** (lines 30–52)
4. **`<FadeIn delay={0.15}>` → `<div>` with "Want to visit?" subtitle + Visitor Form `<Button>`** (lines 54–69)

### Target order

1. SectorHeader "V / Visit"
2. `text-display` "Live Near 100 Friends & Peers"
3. **CTA block** ("Want to visit? Fill out this form." + Visitor Form button) — formerly lines 54–69.
4. **Note block** — formerly lines 30–52.

### Exact change

Swap the two adjacent `<FadeIn delay={0.15}>…</FadeIn>` siblings inside the centered `<div className="px-6 md:px-[4.5%] text-center">`. No other markup, no className changes, no spacing tweaks needed because both blocks already carry consistent `mb-3 md:mb-10` rhythm.

### Mobile-first verification

- The CTA block uses `text-subtitle` + `Button max-w-xs w-full text-center` — stays comfortably within the 375px column with the page's `px-6` gutter.
- The Note block (with the Section-1 padding bump) sits below as supporting content with the same `max-w-xl mx-auto` constraint.
- Reading flow at 375px becomes: hero copy → "Want to visit?" CTA + button (primary action) → explanatory Note (supporting context). Matches the intent in FRAC-65's description.

### Files touched (FRAC-65)

- `src/pages/NeighborhoodPage.tsx` — reorder the two `<FadeIn>` siblings only.

---

## Section 3 — Key files (all paths absolute from repo root)

| File | Why it's touched |
|---|---|
| `src/pages/NeighborhoodPage.tsx` | Both fixes: Note padding bump (FRAC-64) + CTA-above-Note reorder (FRAC-65). |
| `src/components/lab/DocumentBadge.tsx` | Tiny padding bump (`p-5` → `p-6`) to satisfy the new invariant. |
| `src/components/ui/MandelbrotCorners.tsx` | JSDoc addition documenting the safe-padding invariant. |
| `DESIGN.md` | Short subsection codifying the rule under the Mandelbrot corner motif section (~line 351). |
| `src/__tests__/neighborhood.test.tsx` | **Do not modify in this PR.** Existing test at line 130 already references `justify-center` while the live code uses `justify-start` — that's a pre-existing stale assertion unrelated to FRAC-64/65. Flag to the orchestrator; do not silently rewrite it. |

---

## Section 4 — Acceptance criteria

### FRAC-64

- [ ] At viewport widths **320 / 360 / 375 / 414**, the four Mandelbrot corner glyphs in the Visit page Note container do **not** visually overlap any text node (eyebrow "Note", body paragraph, list items).
- [ ] Same holds for the Lab `DocumentBadge` cards (non-featured and featured) at the same widths.
- [ ] No collision at any width ≥ 320px for any `MandelbrotCorners` use-site.
- [ ] DESIGN.md contains a new subsection stating the safe-padding invariant with the per-size table.
- [ ] `MandelbrotCorners.tsx` JSDoc references the safe-padding rule.

### FRAC-65

- [ ] On the Visit page (`/neighborhood`), the "Want to visit? Fill out this form." subtitle + Visitor Form button appear **above** the Note container.
- [ ] Vertical rhythm between Hero-copy → CTA → Note remains consistent at all breakpoints (no doubled or missing `mb-*` gaps).
- [ ] No regression in the SectorHeader or Footer.
- [ ] Existing tests in `neighborhood.test.tsx` that don't depend on order (`Visitor Form` link existence, Note container `max-w-xl`, ordered list structure) still pass.

---

## Section 5 — Validation

### Manual viewport sweep

1. `pnpm dev` (or repo equivalent) and navigate to `/neighborhood`.
2. DevTools → Responsive mode. Step through:
   - **320px** (smallest supported phone).
   - **375px** (mobile baseline per CLAUDE.md).
   - **414px** (larger phone).
   - **768px** (md: breakpoint — verify nothing regresses here either).
   - **1280px** (desktop).
3. At each width, confirm:
   - No glyph touches/overlaps the "Note" eyebrow, body paragraph, or any list item.
   - CTA block is above the Note block, in that order, with intact spacing.
4. Repeat on `/lab` (or whatever route renders `DocumentBadge`) at 320 / 375 to confirm the `p-5` → `p-6` bump didn't break visual rhythm.

### Tests

- Run `pnpm test src/__tests__/neighborhood.test.tsx` and confirm:
  - Note container `max-w-xl.mx-auto` still found.
  - "Visitor Form" link still present.
  - **Expected pre-existing failure** at the `justify-center` assertion (line 130) — not caused by this PR; flag in the review comment so the orchestrator can decide whether to spin a separate FRAC task to fix the stale test.
- Run the full test suite to confirm no other regressions.

### Lint / typecheck

- `pnpm lint && pnpm typecheck` (or repo equivalents) — must pass clean.

---

## Notes for the implementation sub-agent

- This is a **single PR on `frac-64-65-visit-note`**. Make one branch from master, do all four file edits in one or two commits (suggested: one commit for FRAC-64 fix + DESIGN.md note, a second for FRAC-65 reorder — keeps the diff easy to review).
- Use `lattice branch-link` for **both** FRAC-64 and FRAC-65 once the branch exists.
- When moving to `review`, open one PR titled e.g. `FRAC-64 + FRAC-65: Visit page note — safe corner padding + CTA-above-Note`. Reference both task short codes in the body.
- Re-read `.lattice/plans/FRAC-22.md` (PRD) before opening the PR, per CLAUDE.md mandate.

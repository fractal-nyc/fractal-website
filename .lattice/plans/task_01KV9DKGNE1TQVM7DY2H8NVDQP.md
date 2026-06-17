# FRAC-213 — Plan

Three small, finalized visual/cleanup changes. **Mobile-first** (375px baseline) — all changes apply equally at mobile; nothing is desktop-only. No structural changes.

User decisions (finalized, do not re-litigate):
- "Get rid of grain for now" → remove the **body** grain only.
- `.hero-text-shadow` is dead → delete it.
- TalkCard and DocumentBadge are sibling cards that should match → mute TalkCard's secondary text; strengthen DocumentBadge's focus ring (a11y).

**Scope guard:** Do NOT touch `PAPER_GRAIN_BG` in `src/components/ui/button.tsx` (button grain) or the StoryPage section gold band. Only the BODY grain in `src/index.css`.

---

## Change 1 — Remove body grain

### `src/index.css` (body rule, ~lines 81–85)
Delete the comment + `background-image` line. The `@apply` line stays.

**Before:**
```css
  body {
    @apply font-sans antialiased bg-background text-foreground;
    /* Subtle noise texture for a slightly tactile, premium feel */
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  }
```

**After:**
```css
  body {
    @apply font-sans antialiased bg-background text-foreground;
  }
```

(Removes the comment on line 83 AND the `background-image` line 84. The blank line before the next `h1,h2…` block stays.)

### `DESIGN.md` — two mentions to update

**(a) Overview, line 85** — drop the noise clause:

Before:
```
Fractal NYC is an editorial site in a warm-print key: cream surfaces, charcoal type, oversized italic Fraunces headings, a JetBrains Mono body, Jacquard 24 display accents, and a subtle noise texture that gives the page a faintly printed feel. There is one color scheme — surfaces are always cream, type is always charcoal.
```
After:
```
Fractal NYC is an editorial site in a warm-print key: cream surfaces, charcoal type, oversized italic Fraunces headings, a JetBrains Mono body, and Jacquard 24 display accents. There is one color scheme — surfaces are always cream, type is always charcoal.
```

**(b) Elevation & Depth, lines 272–277** — remove BOTH the "Body noise" bullet (Change 1) and the `.hero-text-shadow` bullet (Change 2 below). With both bullets gone the "Two touches add tactility:" lead-in is left dangling, so rewrite the lead-in too.

Before:
```
The system is **near-flat**: hierarchy is carried by typography (oversized Fraunces vs. mono body), color contrast (charcoal on cream, house deep on house light), and editorial whitespace.

Two touches add tactility:

- **Body noise.** The `body` background carries an inline SVG `feTurbulence` texture at opacity `0.03` — it reads as printed paper rather than digital flatness.
- **`.hero-text-shadow`.** A two-layer cream text-shadow utility that lifts hero text over photographic backgrounds.

The one true-depth surface is the OctahedronHero 3D scene — see **Components**.
```
After:
```
The system is **near-flat**: hierarchy is carried by typography (oversized Fraunces vs. mono body), color contrast (charcoal on cream, house deep on house light), and editorial whitespace.

The one true-depth surface is the OctahedronHero 3D scene — see **Components**.
```

---

## Change 2 — Delete dead `.hero-text-shadow`

Verified: **0 call sites** in `src/` (`grep -rn "hero-text-shadow" src/` → only the definition in `src/index.css:125`). No test references it.

### `src/index.css` (~lines 125–127, inside `@layer utilities`)
Delete the whole utility block (and a surrounding blank line so two blank lines don't pile up).

**Before:**
```css
  .hero-text-shadow {
    text-shadow: 0 1px 6px rgba(248,246,240,0.95), 0 0 20px rgba(248,246,240,0.8);
  }

  .link-underline {
```

**After:**
```css
  .link-underline {
```

(`.border-grid` precedes it; the file should flow `.border-grid { … }` → blank line → `.link-underline`.)

### DESIGN.md
Handled in Change 1(b) — the `.hero-text-shadow` bullet is removed together with the Body noise bullet.

---

## Change 3 — Card text alignment (visual)

### `src/pages/StoryPage.tsx` — TalkCard (mute secondary text to match DocumentBadge)

**Author line (line 178):**
Before:
```tsx
      <p className="text-label text-foreground mt-1">
```
After:
```tsx
      <p className="text-label text-foreground-muted mt-1">
```

**Description line (line 183):**
Before:
```tsx
      <p className="text-body-lead text-foreground mt-3">
```
After:
```tsx
      <p className="text-body text-foreground-muted mt-3">
```

Rationale: DocumentBadge's author is `text-label text-foreground-muted` (line 99) and its description is `text-body text-foreground-muted ... leading-relaxed` (line 103). We match tier + color. NOTE: DocumentBadge's description also carries `leading-relaxed`; the task spec only calls for `text-body text-foreground-muted`, so default to that and do NOT add `leading-relaxed`. If the line-height reads cramped in the PREVIEW step, flag it for the human rather than silently diverging.

### `src/components/lab/DocumentBadge.tsx` — strengthen focus ring (a11y)

**Line 61** (inside the `className` template literal):
Before:
```
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-publications-deep/40
```
After:
```
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground
```

Change ONLY `focus-visible:ring-house-publications-deep/40` → `focus-visible:ring-foreground`. **Leave** the `hover:border-house-publications-deep/40` on line 60 untouched (it's a hover border, not the focus ring). TalkCard's focus ring is already `focus-visible:ring-foreground` (line 134), so this brings DocumentBadge into parity.

---

## Tests

No test asserts on any changed class, the body grain, or `.hero-text-shadow`:
- `src/__tests__/pages.test.tsx` — smoke-renders `StoryPage` (line 58) only; no class assertions.
- `src/__tests__/scroll-to-top.test.tsx` — **mocks** `StoryPage` (lines 77–78); never renders real TalkCard.
- `grep` for `hero-text-shadow|feTurbulence|background-image|ring-house|text-body-lead` across `src/__tests__` → no matching assertions (only an unrelated comment in `buttons.test.tsx`).

**No test updates required.** Class-presence assertions would be optional polish, not in scope.

---

## PREVIEW gate (visual changes — human review before merge)

These are visual changes. After implementing and before merging, run the dev server and have the human confirm:
1. **Story page** (`/story`) — TalkCard description + author now render in muted charcoal (`text-foreground-muted`), visually matching DocumentBadge siblings. Description tier dropped from `text-body-lead` (18px/300) to `text-body` (16px/400) — confirm it reads well, not too small/heavy.
2. **DocumentBadge** (Lab page, `/lab`) — keyboard-focus a card (Tab) and confirm the focus ring is now a clear charcoal `ring-foreground` (not the faint pink).
3. **Grain gone** — confirm no visible regression anywhere; body background is flat cream. (It was effectively invisible already — an opaque `min-h-screen <main>` covers it — so expect no perceptible change, which is the point.)
4. Confirm button grain (PAPER_GRAIN_BG) and StoryPage gold band are untouched.

Verify at **375px mobile viewport** first, then desktop.

---

## Acceptance criteria

- `npx tsc --noEmit` (typecheck) passes — no new errors.
- `npm run build` succeeds.
- Conformance/lint passes (repo's `npm run lint` / conformance script).
- Test suite at the **FRAC-199 baseline of 7 pre-existing failures** — no new failures introduced.
- `grep -rn "hero-text-shadow" src/` → 0 results after the change.
- `grep -rn "feTurbulence" src/` → 0 results after the change.
- DESIGN.md: no remaining "Body noise" or "hero-text-shadow" mention; Overview no longer claims a noise texture; Elevation section reads cleanly without the dangling "Two touches" lead-in.
- PREVIEW gate signed off by human.

complexity: low

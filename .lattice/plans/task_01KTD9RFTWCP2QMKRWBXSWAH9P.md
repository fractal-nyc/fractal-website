# FRAC-44 — Add Inter font + swap --font-sans

**Complexity:** low
**Branch:** `frac-44-inter-font`

## Scope

Align `--font-sans` with DESIGN.md. Today `src/index.css:6` defines `--font-sans: 'JetBrains Mono', monospace;` (pre-DESIGN.md artifact); DESIGN.md Typography section declares the canonical token as `Inter, system-ui, sans-serif`. This task adds Inter to the Google Fonts `@import` in `src/index.css:1` and swaps `--font-sans` to match. `--font-mono` stays JetBrains Mono per FRAC-19 decision #1.

Closes DESIGN.md "Accepted divergences from shipped code" item #2.

## Important architectural notes (from planning investigation)

- **Tailwind v4 CSS-first config.** No `tailwind.config.ts` exists. The `font-sans` Tailwind utility resolves from `--font-sans` via the `@theme inline { ... }` block in `src/index.css:5–42`. No JS config edit needed.
- **Fonts load via CSS `@import`, not `<link>` in `index.html`.** `index.html:7-8` only has `preconnect` hints. The actual stylesheet load happens via the `@import url(...)` at `src/index.css:1`. Add Inter there, not in `index.html`.
- **Handoff said "edit `index.html`'s `<link>`."** That was misleading — the codebase doesn't have a `<link>` to Google Fonts in `index.html`. Follow the existing `@import` pattern.

## Files to edit

### 1. `src/index.css:1` — add Inter to the Google Fonts `@import`

**Before:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Jacquard+24&family=JetBrains+Mono:wght@100;200;300;400;500;600;700&display=swap');
```

**After:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600;700&family=Jacquard+24&family=JetBrains+Mono:wght@100;200;300;400;500;600;700&display=swap');
```

Inter inserted alphabetically between Fraunces and Jacquard 24. Weights `300;400;500;600;700`. Other fonts unchanged.

### 2. `src/index.css:6` — swap `--font-sans` to Inter

**Before:**
```css
--font-sans: 'JetBrains Mono', monospace;
```

**After:**
```css
--font-sans: 'Inter', system-ui, sans-serif;
```

Fallback stack matches DESIGN.md.

### 3. `index.html` — no change required

`preconnect` hints already present.

### 4. `tailwind.config.ts` — does not exist, no change

## Weight set decision: `300;400;500;600;700`

Audit of `src/`:
- `font-light` (300): Projects, Vision, OriginStory, Directory, Campus body copy.
- `font-normal` (400): global default + breadcrumb, field, item, calendar.
- `font-medium` (500): kbd (explicit `font-sans font-medium`) + shadcn UI.
- `font-semibold` (600): alert-dialog, card title, sheet, menubar, dialog, badge, toast, select, context-menu, Projects.tsx headings.
- `font-bold` (700): not currently used, included defensively to prevent faux-bold synthesis on `<strong>` or future bolds.
- 100/200/800/900: not used; omitted.

## Out of scope

- Changing `--font-mono` or `--font-serif`.
- Codified `text-*` size/weight scale (separate follow-up).
- Body font-size, line-height, letter-spacing.
- Migrating intentional inline `fontFamily: 'JetBrains Mono'` / `'Jacquard 24'` literals (unaffected by sans swap).
- Removing `body { text-transform: uppercase }` rule at `src/index.css:84` — intentional editorial voice; Inter inherits it correctly.

## Acceptance criteria

- `src/index.css:1` `@import` includes `Inter:wght@300;400;500;600;700`; still loads Fraunces, Jacquard 24, JetBrains Mono.
- `src/index.css:6` is `--font-sans: 'Inter', system-ui, sans-serif;`.
- `--font-mono` and `--font-serif` unchanged.
- Build passes (`pnpm build`).
- Tests pass (no NEW failures vs. baseline 143/4).
- DevTools computed `font-family` on `body` reports Inter as first family.
- DevTools computed `font-family` on a `font-mono` element still reports JetBrains Mono.
- Visual smoke at 375px: no flash-of-unstyled-text regression (`display=swap` already in query).
- Diff touches exactly 1 file (`src/index.css`), 2 lines.

## Approach

1. Branch from master: `git checkout -b frac-44-inter-font`.
2. Edit the 2 lines in `src/index.css`.
3. Typecheck + build + test.
4. Commit, push, open PR.

## Risk / flagged items

- PRD (`.lattice/plans/FRAC-22.md`:84) still names old fonts (Space Grotesk / Space Mono / Instrument Serif) — superseded by DESIGN.md per FRAC-19; not this task's job, but flagged.
- DESIGN.md "Accepted divergences from shipped code" item #2 becomes stale after this lands; expected — the next DESIGN.md revision will drop it.

## Critical files

- `/Users/fractalos/Dev/fractal-nyc/src/index.css` — the only file edited.
- `/Users/fractalos/Dev/fractal-nyc/index.html` — verified no change.
- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` — source of truth.
- `/Users/fractalos/Dev/fractal-nyc/.lattice/notes/FRAC-19-design-decisions-20260605.md` — decision #1.
- `/Users/fractalos/Dev/fractal-nyc/.lattice/plans/FRAC-22.md` — PRD re-read gate.

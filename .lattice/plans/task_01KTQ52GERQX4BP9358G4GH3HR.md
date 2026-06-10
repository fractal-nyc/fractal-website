# FRAC-174: Events page polish — inline host-an-event pairs on desktop, mono Luma CTA

Two small follow-up tweaks to `src/pages/EventsPage.tsx` from the FRAC-70 work that just merged.

## Changes

### 1. Top Luma CTA → JetBrains Mono

The wrapping anchor "Our community hosts events nearly every day. See upcoming events on our Luma calendar →" currently renders in the page's default body font. Apply the existing `font-mono` utility (JetBrains Mono is the canonical mono in the system) to the whole sentence.

- Class on the anchor (or its inner content): add `font-mono`.
- Do **not** change tracking, size, or color — only the family.

### 2. Host-an-event label+button pairs → inline at desktop, stacked at mobile

The two paired blocks under "Host an event in our space" currently render as `flex flex-col gap-6` (always stacked). User wants the label and button on the **same line at desktop (≥768px)** while keeping the mobile-first stacked layout at narrow widths so long labels don't clip.

For each of the two pairs (free event + paid event):
- Wrap each label + button pair in `flex flex-col gap-3 md:flex-row md:items-center md:gap-4`.
- Outer container of both pairs stays `flex flex-col gap-6` (vertical gap between the two pairs).
- Label is the existing copy text; button stays the existing `<Button asChild><a/></Button>`.

## Key files

- `src/pages/EventsPage.tsx` only.

## Acceptance

- At **375px** (mobile): both pairs stay stacked exactly like FRAC-70 shipped — no regression.
- At **≥768px** (desktop): label and button sit on one row per pair, label left and button right, vertically centered.
- Top Luma CTA sentence renders in mono on all viewports.
- No other visual changes.

## Out of scope

- No copy changes.
- No URL changes (still goes through `LUMA_EVENTS_URL` / `CRYSTAL_MAILTO` constants).
- No font changes anywhere outside the top Luma CTA.

## Branch / PR

- Branch: `frac-174-events-inline-pairs-mono-cta`
- PR title: "FRAC-174: events page — inline label+button on desktop, mono top Luma CTA"

## Reset 2026-06-09 by agent:claude-opus-4-7-orchestrator

## Review Cycle 2 Findings (user followup)

Two tweaks to the rework on top of cycle 1:

1. **Copy:** drop the colon after "event" in the paid-event label. Current: `"To host a paid event: email:"` → new: `"To host a paid event email:"` (literal removal of the first colon; trailing colon before the button stays).

2. **Label sizing:** restore `text-subtitle` on both labels — the user expects the grid layout from cycle 1 (`md:max-w-4xl`, auto-width column 1) to give text-subtitle enough room. Class on both `<p>` labels goes:
   - Before: `text-body text-foreground/90 leading-relaxed text-center md:text-right`
   - After: `text-subtitle text-foreground/90 leading-relaxed text-center md:text-right`

Fallback if it still wraps at desktop: switch to `text-body-lead`. Do not pre-emptively widen the grid; let the user decide based on what they see.

## Review Cycle 1 Findings (human QA on deploy preview)

The initial approach — `md:flex-row` on each pair wrapper — failed visually at desktop for two reasons:

1. **Buttons don't align vertically.** The two pairs sit in separate flex rows, so each row sizes its label column independently. The "free event" label ("To host a free event, add it directly to our:") is much longer than the "paid event" label ("To host a paid event: email:"), so the buttons land at different X positions. They look misaligned because they are.

2. **Labels still wrap at desktop.** The labels render at `text-subtitle` (`text-xl md:text-2xl` = 20-24px). With `Button max-w-xs w-full` (320px) and the section's content width, the long label has only ~300-350px to fit ~47 characters at 24px — it wraps to multiple lines, defeating the inline intent.

### Rework approach

Replace the per-pair `md:flex-row` wrappers with a **single 2-column grid** that spans both pairs at desktop. Both buttons land in the same grid column → vertically aligned. Both labels share grid column 1 → equal column widths, no per-row sizing divergence.

Concrete changes to `src/pages/EventsPage.tsx`:

- Outer container of the two pairs:
  - Before: `flex flex-col gap-6 justify-center items-center mb-12`
  - After: `flex flex-col gap-6 items-center mb-12 md:grid md:grid-cols-[auto_auto] md:gap-x-4 md:gap-y-4 md:items-center md:justify-center md:max-w-4xl md:mx-auto`
- Remove the two inner pair wrappers (`<div className="flex flex-col gap-3 items-center md:flex-row md:items-center md:gap-4">…</div>`) — promote labels and buttons to direct grid children.
- Labels:
  - Drop `text-subtitle`, use `text-body` (smaller — fits on one line at desktop).
  - Drop `text-center`, use `text-center md:text-right` so labels align flush against their buttons at desktop.
- Buttons unchanged.

### Acceptance (revised)

- **375px / mobile**: vertical stack of label, button, label, button with consistent `gap-6` separation. Pair grouping implicit from order. No clipping.
- **≥768px / desktop**: 2-column grid, both buttons share column 2 (vertically aligned), labels right-aligned in column 1. Labels fit on one line each.
- Top Luma CTA still mono.
- No copy changes.

## Reset 2026-06-09 by agent:claude-opus-4-7-orchestrator

## Review Cycle 3 Findings (font-mono not visually winning)

User reports the top Luma CTA still renders in sans on the deploy preview despite `font-mono` being in the className.

**Root cause:** the `.text-body` utility in `src/index.css` is defined with `@apply font-sans text-base` — so `.text-body` literally has `font-family: <sans>` baked into its rule. Both `.text-body` and `.font-mono` are single-class selectors with equal specificity. CSS source order decides which wins, and `.text-body` (defined later in our index.css custom utilities) overrides `.font-mono`. ClassName order in HTML does not affect CSS specificity.

**Fix:** drop `text-body` from the top Luma CTA anchor's className and replace it with a raw `text-base` so font-mono is the only font-family setter on the element. `font-weight: 400` and `text-transform: none` are browser defaults for `<a>`, so they don't need to be re-specified.

Concrete change in `src/pages/EventsPage.tsx`, top Luma CTA anchor className:
- Before: `block max-w-3xl mx-auto mb-12 text-body font-mono text-foreground/90 leading-relaxed text-center underline decoration-foreground/40 hover:decoration-foreground transition-colors`
- After: `block max-w-3xl mx-auto mb-12 font-mono text-base text-foreground/90 leading-relaxed text-center underline decoration-foreground/40 hover:decoration-foreground transition-colors`

Out of scope: do NOT change the host-an-event block, the buttons, or any copy.

## Reset 2026-06-09 by agent:claude-opus-4-7-orchestrator

## Review Cycle 4 Findings (use DESIGN.md semantic token)

User: "it should be all caps mono — use the design.md tokens".

The right utility per DESIGN.md is **`.text-body-display`** in the Body-display tier:

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-body-display` | mono, weight 100, uppercase, normal tracking, relaxed leading | `text-sm md:text-base` |

DESIGN.md describes it explicitly as: *"body-length passages should carry the chrome tier's mono-uppercase identity but read as paragraphs"* — which is exactly what this top Luma CTA is (a body-length CTA sentence).

`.text-body-display` already applies `font-mono`, `uppercase`, `font-thin` (weight 100), `text-sm md:text-base`, and `leading-relaxed`. So we drop the raw replacements from cycle 3 (`font-mono text-base`) and the `leading-relaxed` utility, and add `text-body-display` in their place.

Concrete change in `src/pages/EventsPage.tsx`, top Luma CTA anchor className:
- Before: `block max-w-3xl mx-auto mb-12 font-mono text-base text-foreground/90 leading-relaxed text-center underline decoration-foreground/40 hover:decoration-foreground transition-colors`
- After: `block max-w-3xl mx-auto mb-12 text-body-display text-foreground/90 text-center underline decoration-foreground/40 hover:decoration-foreground transition-colors`

Out of scope: host-an-event block, buttons, copy, iframe — all unchanged.

## Reset 2026-06-09 by agent:claude-opus-4-7-orchestrator

## Review Cycle 5 Findings (use .text-label instead)

User: "just use the mono label font". Switch from `.text-body-display` (font-thin weight 100, can read too delicate) to `.text-label` — the dedicated mono-label chrome utility:

| Utility | Rendering | Tailwind size |
|---|---|---|
| `.text-label` | mono, uppercase, weight 500, tracking 0.1em | `text-sm` |

Concrete change in `src/pages/EventsPage.tsx`, top Luma CTA anchor className:
- Before: `block max-w-3xl mx-auto mb-12 text-body-display text-foreground/90 text-center underline decoration-foreground/40 hover:decoration-foreground transition-colors`
- After: `block max-w-3xl mx-auto mb-12 text-label text-foreground/90 text-center underline decoration-foreground/40 hover:decoration-foreground transition-colors`

Out of scope: same as before — host-an-event, buttons, iframe, other sections all untouched.

# FRAC-70 — Events page: copy edits + restructure host-an-event CTAs

## Summary
Update three pieces of display copy on the Events page and restructure the host-an-event section so the two CTAs (free via Luma, paid via email) are clearly separated, with the email CTA button showing the address itself (`crystal@fractalnyc.com`) rather than the current "Email Crystal" label. No layout redesign, no embed changes.

Complexity: **low**. Pure JSX text/markup edits inside `src/pages/EventsPage.tsx`. Existing `Button` component and existing URL constants are reused — nothing new gets imported.

## Key file
- **`src/pages/EventsPage.tsx`** — single file edit. All changes live in this file.
- Constants already present and reused as-is:
  - `LUMA_EVENTS_URL = "https://lu.ma/nyc-tech"` (line 10)
  - `CRYSTAL_MAILTO = "mailto:crystal@fractalnyc.com"` (line 11)
- Button component: `@/components/ui/button` → `Button` with `asChild` + nested `<a>` (the pattern already used three times on this page).

## Current state vs. requested state

The page already broadly matches the spec. The remaining gaps are:

| Where | Current | Should be |
|---|---|---|
| First section body copy (lines 47–58) | A `<p>` containing the target sentence with "Luma calendar" as an inline underlined `<a>` and a trailing arrow | A single CTA-style element treated as one link (still anchor-based, no separate Button — see "Decision: keep as anchor CTA" below) with the exact arrow affordance |
| Section 2 heading (line 63) | `Host Our Next Event` | `Host an event in our space` |
| Section 2 preamble (lines 65–69) | "Anyone can host an event in our space, even non-members:" + 🆓 line + 💰 line | Two short labels, each rendered directly above its button: "To host a free event, add it directly to our:" / "To host a paid event: email:" |
| Section 2 second button label (line 81) | `Email Crystal` | `crystal@fractalnyc.com` |

The first section's calendar link is already the correct sentence — what changes is treating it as a single CTA block (one link, arrow as part of the link's hit target) rather than prose with an inline underline.

## Decision: keep the calendar CTA as an anchor, not a `<Button>`

The description says "link or button with arrow affordance" — i.e. an anchor with a button-like presence is fine. The page already uses `<Button asChild><a/></Button>` for the Discord CTA at the bottom; using the same pattern here would put a third pill-shaped button between the embed and the host-an-event section, which adds visual weight in a place that currently breathes. The cleaner read is to keep this as a single underlined anchor (the whole sentence + arrow), so:

- It reads as one CTA (whole sentence is the link target, not just two words).
- The arrow becomes part of the link, not a stranded glyph after a closing tag.
- Visual hierarchy stays: calendar embed → one link → big "Host an event" heading → two buttons.

Implementation = wrap the whole sentence (including the trailing arrow) in a single `<a>` with the existing underline classes.

## Exact diffs

### Diff 1 — first section CTA (lines 47–58)

**Before:**
```tsx
<p className="max-w-3xl mx-auto mb-12 text-body text-foreground/90 leading-relaxed text-center">
  Our community hosts events nearly every day. See upcoming events on our{" "}
  <a
    href={LUMA_EVENTS_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="underline decoration-foreground/40 hover:decoration-foreground transition-colors"
  >
    Luma calendar
  </a>{" "}
  →
</p>
```

**After:**
```tsx
<p className="max-w-3xl mx-auto mb-12 text-body text-foreground/90 leading-relaxed text-center">
  <a
    href={LUMA_EVENTS_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="underline decoration-foreground/40 hover:decoration-foreground transition-colors"
  >
    Our community hosts events nearly every day. See upcoming events on our Luma calendar →
  </a>
</p>
```

Net effect: the whole sentence becomes the link; the arrow is inside the anchor; spacing/wrapping behavior is preserved.

### Diff 2 — section 2 heading (line 63)

**Before:**
```tsx
<p className="text-display mb-6 text-center">
  Host Our Next Event
</p>
```

**After:**
```tsx
<p className="text-display mb-6 text-center">
  Host an event in our space
</p>
```

### Diff 3 — section 2 preamble + buttons block (lines 65–83)

The current structure has one preamble paragraph followed by an emoji line per CTA, then a single flex row containing both buttons. The new structure pairs each label with its button.

**Before:**
```tsx
<div className="max-w-3xl mx-auto mb-6 space-y-3 text-subtitle text-foreground/90 leading-relaxed text-center">
  <p>Anyone can host an event in our space, even non-members:</p>
  <p>🆓 To host a free event, add it directly to our Luma calendar</p>
  <p>💰 To host a paid event, email crystal@fractalnyc.com</p>
</div>
<div className="flex flex-col md:flex-row gap-3 justify-center items-center mb-12">
  <Button asChild className="max-w-xs w-full text-center">
    <a
      href={LUMA_EVENTS_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Luma calendar
    </a>
  </Button>
  <Button asChild className="max-w-xs w-full text-center">
    <a href={CRYSTAL_MAILTO}>Email Crystal</a>
  </Button>
</div>
```

**After:**
```tsx
<div className="max-w-3xl mx-auto mb-12 flex flex-col items-center gap-8 text-subtitle text-foreground/90 leading-relaxed text-center">
  <div className="flex flex-col items-center gap-3">
    <p>To host a free event, add it directly to our:</p>
    <Button asChild className="max-w-xs w-full text-center">
      <a
        href={LUMA_EVENTS_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Luma calendar
      </a>
    </Button>
  </div>
  <div className="flex flex-col items-center gap-3">
    <p>To host a paid event: email:</p>
    <Button asChild className="max-w-xs w-full text-center">
      <a href={CRYSTAL_MAILTO}>crystal@fractalnyc.com</a>
    </Button>
  </div>
</div>
```

Notes on this restructure:
- Each label sits directly above its button — pair clarity matches the description's `[Luma calendar]` / `[crystal@fractalnyc.com]` shape.
- Always stacked vertically (mobile-first; no `md:flex-row`). With one button per pair this is clearer than a side-by-side row, and the page already has narrow `max-w-xs` buttons that look fine stacked at any width.
- `gap-8` between pairs, `gap-3` between label and its button — visually groups each pair as one unit.
- `max-w-xs w-full text-center` on the buttons matches the existing Discord CTA and the FRAC-86 regression-test pattern noted in `button.tsx`.
- Email address button label: the email reads in mono uppercase via Button's base `font-mono uppercase` — `crystal@fractalnyc.com` will render as `CRYSTAL@FRACTALNYC.COM`. This matches the existing button typography on this page (`LUMA CALENDAR`, `JOIN DISCORD`).

## Layout / mobile-first

- 375px baseline: each label + button pair is centered, full-width up to `max-w-xs` (~20rem / 320px). With page padding `px-6` (24px each side), buttons fit comfortably in 327px of usable width with margin to spare. No clipping risk.
- The first section's CTA `<a>` wraps naturally because it's inside a `max-w-3xl` centered paragraph with `leading-relaxed`. At 375px it will break across ~3 lines, with the arrow at the end of the last visual line — same wrap behavior as today.
- No horizontal scrolling introduced anywhere.

## Acceptance criteria mapping

| Criterion | How the plan satisfies it |
|---|---|
| 'OPEN CALENDAR IN NEW TAB' text is replaced with the new sentence + arrow CTA pointing to Luma | Diff 1 — whole sentence becomes one anchor to `LUMA_EVENTS_URL` with trailing `→` inside the link |
| 'Host an event' heading reads 'Host an event in our space' | Diff 2 — `text-display` paragraph copy replaced |
| Two new buttons exist below that heading: 'Luma calendar' and 'crystal@fractalnyc.com' (mailto) | Diff 3 — both `Button asChild` instances present, hrefs `LUMA_EVENTS_URL` and `CRYSTAL_MAILTO` |
| Preceding copy ('To host a free event...' / 'To host a paid event: email:') rendered above each button | Diff 3 — each label is a `<p>` directly above its button inside a paired `flex-col` |
| Mobile layout reads cleanly at 375px (buttons stack, no clipping) | Always-stacked `flex-col`, `max-w-xs` buttons, no width changes to surrounding container |

## Validation (for implementer)

- `npm run typecheck` / `npm run lint` clean.
- `npm test` — existing tests for EventsPage (if any) still pass; update any that assert the old copy verbatim.
- Render at 375px (devtools mobile preset): confirm buttons stack with their labels, no horizontal scroll, no clipping. The big sentence-link wraps naturally.
- Click each button:
  - "Luma calendar" → opens `https://lu.ma/nyc-tech` in a new tab.
  - "crystal@fractalnyc.com" → triggers mail client with To: crystal@fractalnyc.com.
- Click the first section's wrapped sentence: opens Luma in a new tab.

## Out of scope (do NOT touch)
- The Luma iframe embed (URL, height, border, corner decorations).
- The `Stay in the Loop` / Join Discord block.
- `SectorHeader`, navbar, footer, fractal pattern background.
- The `Button` component itself.
- Any other page.

## Open questions / risks
- None. The Luma URL, the mailto, and the Button pattern are already wired and proven on this page.

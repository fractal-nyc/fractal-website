# FRAC-57 — Campus + Events: event-hosting copy (Luma link + Crystal contact)

**Ships bundled with FRAC-56 + FRAC-57 in one PR.**

## Scope

Add this verbatim event-hosting copy to **both** the Campus page (`src/components/sections/Campus.tsx`) and the Events page (`src/pages/EventsPage.tsx`):

> Our community hosts events nearly every day. See upcoming events on our Luma calendar 🎉
>
> Anyone can host an event in our space, even non-members:
>
> 🆓 To host a free event, add it directly to our Luma calendar
>
> 💰 To host a paid event, email crystal@fractalnyc.com

- "Luma calendar" → hyperlink to **`https://lu.ma/nyc-tech`** (see "Luma URL" below).
- "crystal@fractalnyc.com" → mailto link. On Campus, reuses the `CRYSTAL_MAILTO` constant introduced by FRAC-56. On EventsPage, declare a local constant.

## Luma URL — chosen

Campus.tsx already exports two Luma constants:

- `LUMA_URL = "https://luma.com/nyc-tech"` (used for big CTA buttons like "Visit by joining us for an event")
- `LUMA_EVENTS_URL = "https://lu.ma/nyc-tech"` (used for **inline body-copy** links like "5+ events we host per week" and "regular events")

EventsPage embeds `https://lu.ma/embed/calendar/nyc-tech/events` in the iframe and links `https://luma.com/nyc-tech` for "Open calendar in new tab".

**Use `LUMA_EVENTS_URL` (`https://lu.ma/nyc-tech`)** for the new "Luma calendar" inline link on both pages — matches the established inline-body-copy convention on Campus. Both URLs resolve to the same Luma calendar; `lu.ma` is Luma's short domain. On EventsPage, declare a local `LUMA_EVENTS_URL` to mirror the Campus pattern.

## Existing pattern references

- **FRAC-48 centered-container pattern**: Campus body sections wrap in `<div className="max-w-3xl mx-auto">`. EventsPage section is `text-center` with content blocks ≤ `max-w-5xl`; the new copy block wraps in `max-w-3xl mx-auto` to match the FRAC-48 reading-column rule.
- Campus inline-link mailto pattern: `<InlineLink href={MAILTO_CONST} external={false}>label</InlineLink>`.
- EventsPage uses raw `<a>` tags for its existing mailto (`mailto:events@merlins.place`) and uses `text-foreground` colors since it sits on a light house background (not Campus's dark green).
- Emojis 🎉 / 🆓 / 💰 are plain Unicode and render fine in modern browsers.

## Exact edits

### Edit A — Campus.tsx (depends on FRAC-56's `CRYSTAL_MAILTO`)

**Insertion point**: the existing **Events section** (the one with the "Types of events…" list, the "Join events at Fractal Campus" button, and the trailing "Want to host an event here? Email Merlin's Place" aside). The new copy belongs **inside this same `max-w-3xl mx-auto` container** so we don't introduce a second event-hosting cluster.

Replace the existing trailing aside:

```tsx
<p className="mt-4 text-aside text-background/70">
  Want to host an event here?{" "}
  <InlineLink href={MERLINS_EVENTS_MAILTO} external={false}>
    Email Merlin's Place
  </InlineLink>
</p>
```

with the new block (placed **after** the "Join events at Fractal Campus" button group, **replacing** the Merlin's aside — the new copy supersedes it):

```tsx
<div className="mt-8 space-y-4 text-body text-background/90 leading-relaxed">
  <p>
    Our community hosts events nearly every day. See upcoming events on our{" "}
    <InlineLink href={LUMA_EVENTS_URL}>Luma calendar</InlineLink> 🎉
  </p>
  <p>Anyone can host an event in our space, even non-members:</p>
  <p>
    🆓 To host a free event, add it directly to our{" "}
    <InlineLink href={LUMA_EVENTS_URL}>Luma calendar</InlineLink>
  </p>
  <p>
    💰 To host a paid event, email{" "}
    <InlineLink href={CRYSTAL_MAILTO} external={false}>
      crystal@fractalnyc.com
    </InlineLink>
  </p>
</div>
```

Rationale for removing the "Email Merlin's Place" aside: the new copy answers the same "want to host?" question with clearer free/paid guidance and updates the contact owner from Merlin's to Crystal for paid hosting. Free-event self-service via Luma is now the documented path. The `MERLINS_EVENTS_MAILTO` constant remains declared at module top; if lint flags it unused, the implementer removes it.

**Depends on FRAC-56**: this edit references `CRYSTAL_MAILTO` defined by FRAC-56's Edit 1. In the bundled PR, FRAC-56 lands first; FRAC-57 builds on it.

### Edit B — EventsPage.tsx

**Insertion point**: above the existing Luma iframe block, between `<p className="text-display mb-6 text-center">Join Tech Events</p>` and the iframe container `<div className="relative w-full max-w-5xl mx-auto ...">`. This frames the calendar with the event-hosting context exactly where the calendar lives.

Add two constants at the top of the file (after the imports, before `export function EventsPage`):

```tsx
const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";
const CRYSTAL_MAILTO = "mailto:crystal@fractalnyc.com";
```

Then, inside the `<FadeIn delay={0.1}>` block, **after** `<p className="text-display mb-6 text-center">Join Tech Events</p>` and **before** the iframe container, insert a centered copy block (FRAC-48 pattern):

```tsx
<div className="max-w-3xl mx-auto mb-8 space-y-4 text-body text-foreground/90 leading-relaxed text-left">
  <p>
    Our community hosts events nearly every day. See upcoming events on our{" "}
    <a
      href={LUMA_EVENTS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-foreground/40 hover:decoration-foreground transition-colors"
    >
      Luma calendar
    </a>{" "}
    🎉
  </p>
  <p>Anyone can host an event in our space, even non-members:</p>
  <p>
    🆓 To host a free event, add it directly to our{" "}
    <a
      href={LUMA_EVENTS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-foreground/40 hover:decoration-foreground transition-colors"
    >
      Luma calendar
    </a>
  </p>
  <p>
    💰 To host a paid event, email{" "}
    <a
      href={CRYSTAL_MAILTO}
      className="underline decoration-foreground/40 hover:decoration-foreground transition-colors"
    >
      crystal@fractalnyc.com
    </a>
  </p>
</div>
```

Notes:
- EventsPage has no `InlineLink` component imported and uses `text-foreground` (not `text-background`) since it sits on a light house background — link decoration colors swap accordingly.
- `text-left` overrides the section-wide `text-center` so the multi-paragraph copy reads naturally as prose.
- Wraps in `max-w-3xl mx-auto` per FRAC-48.

## Dedup with FRAC-56

- **Campus**: FRAC-56 owns the canonical Crystal contact treatment (top badge + "First time here?" CTA). FRAC-57 on Campus uses Crystal's email only as one inline mailto on the "paid event" line — no new badge, no new styled CTA. FRAC-57 reuses the `CRYSTAL_MAILTO` constant defined by FRAC-56.
- **EventsPage**: FRAC-57 is the sole source of the Crystal mention there. FRAC-56 does not touch EventsPage.tsx.
- No copy overlap with FRAC-56: FRAC-57's copy is exclusively about event hosting (free vs paid); FRAC-56's copy is exclusively about visiting Campus.

## Acceptance criteria

- (a) Copy renders on both Campus (inside existing Events section) and EventsPage (above the embedded calendar).
- (b) "Luma calendar" hyperlinks to `https://lu.ma/nyc-tech` on both pages.
- (c) `crystal@fractalnyc.com` is a mailto link on both pages.
- (d) Emojis 🎉 / 🆓 / 💰 render correctly.
- (e) Mobile-first: legible at 375px on both pages; copy block sits in a `max-w-3xl mx-auto` container per FRAC-48.
- (f) No duplicated Crystal contact treatment on Campus (verified against FRAC-56's plan — only one badge, one CTA, and one inline mailto).

## Complexity

low — copy + links, one constant addition per file, two insertion points. No new components or routing.

## Test plan

- Visual check at 375px and ≥768px on both pages.
- Click "Luma calendar" links on both pages — opens `https://lu.ma/nyc-tech` in new tab.
- Click `crystal@fractalnyc.com` on both pages — opens mail client.
- Verify Campus events-section layout still works after replacing the Merlin's aside.
- `npm run lint` / typecheck clean.

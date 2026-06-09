# FRAC-56 — Campus page: Crystal contact email (top badge + visitor CTA)

**Ships bundled with FRAC-56 + FRAC-57 in one PR.**

## Scope

Add Crystal's contact email to `src/components/sections/Campus.tsx` in two places:

1. **Top-of-page contact badge** (inside the hero block, just below the existing "Want a reduced rate?" aside) — `✉️ crystal@fractalnyc.com` as a small, prominent mailto line.
2. **In-body visitor CTA** in the "Four audiences" section — verbatim copy:
   > First time here? Drop by for free! Contact Crystal (crystal@fractalnyc.com) for a guided tour.

This task owns the **canonical Crystal contact treatment on Campus**. FRAC-57 reuses the same `CRYSTAL_MAILTO` constant for its single "paid event" mailto link but adds **no new contact badge or CTA** — see "Dedup with FRAC-57" below.

## Existing pattern references

- Campus already uses a module-level mailto constant pattern: `HELLO_FRACTAL_MAILTO`, `CONTACT_ANDREW_MAILTO`, `MERLINS_EVENTS_MAILTO` (Campus.tsx lines ~22-24). Add `CRYSTAL_MAILTO` alongside.
- `InlineLink` with `external={false}` is the established mailto-link pattern (used for `HELLO_FRACTAL_MAILTO` in the "Build with us" section).
- **FRAC-48 centered-container pattern**: every body section wraps its content in `<div className="max-w-3xl mx-auto">`. Both Crystal additions must live inside the existing centered containers (the hero is already centered via `text-center max-w-4xl mx-auto`; the four-audiences section is wrapped in `max-w-3xl mx-auto`).
- Aside copy convention: `text-aside text-background/70 text-center`.

## Exact edits

### Edit 1 — add mailto constant (Campus.tsx, near line 24, after `HELLO_FRACTAL_MAILTO`)

```tsx
const CRYSTAL_MAILTO = "mailto:crystal@fractalnyc.com";
```

### Edit 2 — top-of-page badge (Campus.tsx, hero block)

Inside the hero `<div className="text-center max-w-4xl mx-auto">` block, **after** the existing `<p className="text-aside text-xs md:text-sm text-background/70 text-center">Want a reduced rate? Let us know. ...</p>` line, add a new paragraph:

```tsx
<p className="text-aside text-xs md:text-sm text-background/70 text-center mt-4">
  ✉️{" "}
  <InlineLink href={CRYSTAL_MAILTO} external={false}>
    crystal@fractalnyc.com
  </InlineLink>
</p>
```

This keeps the badge inside the hero, visually subordinate to the CTA buttons but discoverable as "near top of page". Uses `text-aside text-xs md:text-sm` to match the existing reduced-rate aside; `mt-4` separates it from the line above.

### Edit 3 — visitor CTA in "Four audiences" section

Inside the four-audiences `<div className="max-w-3xl mx-auto">`, **after** the closing `</ul>` of the audiences list and **before** the existing "Fractal U" button group `<div className="mt-10 flex flex-col sm:flex-row gap-4 ...">`, insert:

```tsx
<p className="mt-8 text-body text-background/90 leading-relaxed">
  First time here? Drop by for free! Contact Crystal (
  <InlineLink href={CRYSTAL_MAILTO} external={false}>
    crystal@fractalnyc.com
  </InlineLink>
  ) for a guided tour.
</p>
```

Placement rationale: the four-audiences list ends with "Guests coming to one of the 5+ events we host per week" — the "First time here?" CTA is the natural action for that "Guests" audience, and it sits inside the same centered container, satisfying FRAC-48.

## Dedup with FRAC-57

- FRAC-57 reuses the same `CRYSTAL_MAILTO` constant defined here for its single mailto link in the event-hosting copy ("To host a paid event, email crystal@fractalnyc.com").
- FRAC-57 must **not** add a second contact badge, CTA paragraph, or styled email treatment on Campus. Its Crystal mention is plain inline body copy with a mailto link only.
- Implementation order in the bundled PR: FRAC-56 lands the constant first; FRAC-57 reuses it.

## Acceptance criteria

- (a) ✉️ crystal@fractalnyc.com appears in the Campus hero block as a mailto link.
- (b) "First time here?" line appears in the four-audiences section with crystal@fractalnyc.com as a mailto link.
- (c) Both treatments use existing Campus typography classes (`text-aside` / `text-body` / `InlineLink` underline).
- (d) Mobile-first: both render legibly at 375px; the badge wraps within hero container, the CTA wraps within `max-w-3xl`.
- (e) ✉️ emoji renders correctly (plain Unicode U+2709, supported across browsers).
- (f) Both additions live inside FRAC-48 centered containers.

## Complexity

low — copy + mailto, no new components, no routing, no state. Two insertion points + one constant.

## Test plan

- Visual check at 375px and ≥768px: hero badge sits below the reduced-rate aside; visitor CTA sits between the audiences list and the Fractal U button.
- Click both mailto links — opens default mail client.
- `npm run lint` / typecheck clean.

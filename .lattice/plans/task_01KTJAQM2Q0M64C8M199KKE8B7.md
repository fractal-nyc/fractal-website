# FRAC-53 Plan: Button consolidation — final sweep + text containment

## Summary

**Most fake-button → `<Button>` migration already shipped in a prior PR** (likely as a sibling to FRAC-51 — branches `f1fb9e6..ec32a34`). All seven canonical sites already consume `<Button asChild>`. FRAC-53's remaining work is:
1. Migrate the one leftover fake-button in `not-found.tsx` to `<Button asChild><Link href="/">…</Link></Button>` (wouter, not react-router).
2. Update the `FRAC-86 regression test` in `src/__tests__/buttons.test.tsx` — it currently asserts the OLD fake-button pattern, which no longer exists in product code.
3. Execute the **mandatory text-containment sweep** at 375px mobile baseline — the scope addition pinned via Lattice comment. Found ~9 Campus CTAs at high risk of overflow.

## PRD alignment

The PRD (`.lattice/plans/FRAC-22.md`) is explicit: **mobile-first, 375px baseline**. Discord/Luma/membership CTAs are the wayfinding mechanism that reduces "leader burden" — broken CTAs directly contradict the stated success metric. The text-containment scope addition is PRD-critical, not cosmetic. No PRD constraint blocks `whitespace-normal` or `min-w-0`; the only red line is "no truncation" (per FRAC-53 comment), which aligns with the editorial voice.

## Button component changes

`asChild` is **already implemented** (`src/components/ui/button.tsx:82, 105, 149–179`) — Radix Slot + `React.cloneElement` injects Mandelbrot corners as siblings of the consumer's child. No structural change required.

**Wrap behavior:** Button's base class includes `whitespace-nowrap` (line 35). For Campus long labels (44–53 chars) at 375px, this forces horizontal overflow. Recommended path: keep `whitespace-nowrap` as base; consumers opt out via `className="whitespace-normal leading-snug"` (Tailwind merges last-wins).

**Campus PrimaryButton wrapper:** Extend with a `wrap?: boolean = true` prop that appends `whitespace-normal leading-snug` to `className`. Single component change instead of 11 per-site sprinkles. Single audit point if we revisit.

## Migration site list

| File | Line | Action |
|---|---|---|
| `src/pages/not-found.tsx` | 8 | Migrate `<Link href="/" className="px-6 py-3 border border-foreground/20 …">` to `<Button asChild><Link href="/">Return Home</Link></Button>`. wouter `Link`. |
| `src/__tests__/buttons.test.tsx` | 118–154 | "CTA link button styling (FRAC-86 regression)" suite renders the fake-button as the assertion. Replace with: `<Button asChild className="max-w-xs w-full">…</Button>` renders `<a>` with `inline-flex`, `max-w-xs`, `w-full`, border/bg classes from `buttonVariants`, and four Mandelbrot corners. |

All other named sites (EventsPage, PeoplePage, PoliticalClubPage, NeighborhoodPage, LiberalArts section, Campus PrimaryButton) **already use `<Button asChild>`** — audit-only.

## Text-containment audit (375px mobile baseline)

Math: Button default = `px-8` (32px each side) = 64px chrome. `max-w-xs` = 320px wrapper → ~256px inner. At `text-sm` (14px) Mono `tracking-widest` (0.1em), effective char width ~10–11px. **~22–24 chars per line.**

| Site | Line | Label | Chars | Container | Risk | Fix |
|---|---|---|---|---|---|---|
| EventsPage | 55 | "Email Merlin's Place" | 20 | `max-w-xs w-full` | low | none |
| EventsPage | 69 | "Join Discord" | 12 | `max-w-xs w-full` | low | none |
| PeoplePage | 31 | "Join Discord" | 12 | `max-w-xs w-full` | low | none |
| PoliticalClubPage | 28 | "Maximum New York" | 16 | `max-w-xs w-full` | low | none |
| NeighborhoodPage | 66 | "Visitor Form" | 12 | `max-w-xs w-full` | low | none |
| LiberalArts | 43 | "Learn More" | 10 | `max-w-xs w-full` | low | none |
| LiberalArts | 52 | "Apply as Instructor" | 19 | `max-w-xs w-full` | low | none |
| Campus | 198 | "Visit by joining us for an event" | 33 | `fullWidth` inside `max-w-2xl` | **medium** | `whitespace-normal leading-snug` (via wrap=true) |
| Campus | 202 | "Co-work with us — $300/mo" | 25 | half-row `fullWidth` | **medium** | same |
| Campus | 205 | "Day Pass — $40" | 14 | half-row `fullWidth` | low | none |
| Campus | 282 | "Fractal U" | 9 | `max-w-xs w-full` | low | none |
| Campus | 361 | "I'm in, I want to become a member! ($300/mo)" | 44 | `max-w-xs w-full` | **HIGH** | `whitespace-normal leading-snug` |
| Campus | 364 | "Or I want to purchase a Day Pass for $40!" | 41 | `max-w-xs w-full` | **HIGH** | same |
| Campus | 413 | "You've inspired me, I'm up for membership! — $300/mo" | 53 | `max-w-xs w-full` | **HIGH** | same |
| Campus | 416 | "Or I'm interested in a day pass! — $40" | 39 | `max-w-xs w-full` | **HIGH** | same |
| Campus | 442 | "Join events at Fractal Campus" | 30 | `max-w-xs w-full` | **medium** | same |
| Campus | 465 | "Visit Merlin's Place" | 20 | `max-w-xs w-full` | low | none |
| Campus | 554 | "Become a coworking member — $300/mo" | 36 | `max-w-xs w-full` | **HIGH** | same |
| Campus | 557 | "Just want a day pass — $40" | 26 | `max-w-xs w-full` | **medium** | same |

Recommended Campus fix: `PrimaryButton` wrapper gets `wrap?: boolean = true` default. The two "Hosts" of the high-risk labels — the "More than a WeWork" section and the "What's it like" section — are the "at least 2 places" the FRAC-53 comment refers to.

## Sites OUT of scope

- `src/components/sections/Hero.tsx:173` — search input, not a CTA.
- `src/components/sections/Hero.tsx:115–135` — sr-only skip-nav.
- `src/components/sections/Events.tsx:17` — image-card link, not a Button.
- `src/pages/StoryPage.tsx` TalkCard — bespoke card with arrow icon.
- `src/components/layout/Footer.tsx` — inline prose links.
- `src/pages/NeighborhoodPage.tsx:29` — `MandelbrotCorners` wrapping content block (info panel), not a button.
- `src/pages/EventsPage.tsx:28` — iframe container.
- Vendored shadcn `ui/*` Button consumers (calendar, carousel, sidebar, input-group).

## Open questions / resolutions

1. **`<Link>` vs `<a>` for internal nav?** Project uses **wouter**, not React Router. `not-found.tsx` uses `import { Link } from "wouter"`.
2. **Wrap inside Campus `PrimaryButton` or per-site?** Inside the wrapper with `wrap` prop defaulting to `true`.
3. **Mandelbrot corner placement on wrapped multi-line buttons?** Corners are `position: absolute` at 4px insets — they hug the border regardless of height. Visually verify at 375px.
4. **Update FRAC-86 regression test?** Yes — current test asserts the fake pattern; rewrite to assert Button-based pattern.

## Acceptance criteria

- `src/pages/not-found.tsx` renders its "Return Home" CTA via `<Button asChild><Link href="/">…</Link></Button>`.
- No inline `border-foreground/20 + bg-foreground/[0.03]` class string remains in `src/pages/*` or `src/components/sections/*` outside the Button component itself.
- At 375px viewport, every CTA on every page renders entirely inside its container. No text crosses the right border; no horizontal scrollbar.
- No ellipsis truncation introduced; labels wrap to 2–3 lines where needed.
- Mandelbrot corners still render in all four positions on wrapped (multi-line) buttons.
- `buttons.test.tsx` "CTA link button styling (FRAC-86 regression)" suite updated to Button-based pattern.
- All existing tests pass (4 pre-existing failures baseline).
- `pnpm build` succeeds.

## Branch & PR plan

- **Branch:** `frac-53-button-consolidation` (impl agent creates).
- **PR title:** `FRAC-53: Button consolidation — migrate last fake CTA + 375px text containment sweep`
- **PR body:** spec → `.lattice/notes/typography-spec-20260607.md`; plan → this file; PRD → `.lattice/plans/FRAC-22.md`; depends-on FRAC-51 (done).
- **Scope discipline:** do NOT touch eyebrow / heading / body utilities. FRAC-54/55/56 territory.

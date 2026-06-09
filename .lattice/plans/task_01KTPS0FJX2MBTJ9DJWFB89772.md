# FRAC-55: Campus — Full-time + Part-time membership tier buttons

## Scope

Replace the single "Co-work with us / Become a member — $300/mo" CTA wherever it appears on Campus with a **paired Full-time + Part-time** tier offering. Day Pass CTAs stay (different product). Use the current `Button` API (FRAC-52 frost overhaul deferred to Phase 4).

## URLs (confirmed via lattice comments on FRAC-55)

```ts
const STRIPE_FULLTIME_URL = "https://buy.stripe.com/4gM5kDckk5r008p3B608g0L";  // $300/mo
const STRIPE_PARTTIME_URL = "https://buy.stripe.com/eVq4gzckk06G3kB1sY08g0G";  // $150/mo
```

These replace `FLOWGLAD_MEMBERSHIP_URL`. Drop the `FLOWGLAD_MEMBERSHIP_URL` constant entirely — every use site gets rewritten. Keep `FLOWGLAD_DAYPASS_URL` (Day Pass is a separate product, not membership).

## File

`src/components/sections/Campus.tsx` (origin/master). Four use sites for the membership CTA today (line numbers approximate, off origin/master):

| Section | Lines (approx) | Today | Action |
|---|---|---|---|
| Hero | ~166–179 | `Co-work with us — $300/mo` + `Day Pass — $40` side-by-side, both inside `max-w-2xl mx-auto` | Replace the $300/mo button with a **Full-time + Part-time** pair. Day Pass stays. |
| "More than a WeWork" | ~298–305 | `I'm in, I want to become a member! ($300/mo)` + `Or I want to purchase a Day Pass for $40!` | Replace the membership button with **Full-time + Part-time** pair. Day Pass stays. |
| "What's it like to be here" | ~347–354 | `You've inspired me, I'm up for membership! — $300/mo` + `Or I'm interested in a day pass! — $40` | Same swap. |
| "Build with us" | ~440–447 | `Become a coworking member — $300/mo` + `Just want a day pass — $40` | Same swap. |

(Search anchor for the implementer: every line containing `FLOWGLAD_MEMBERSHIP_URL` needs to be rewritten. After the change, that identifier should be unused and removed from the constants block.)

## What gets added

A small local sub-component `MembershipTiers` (or inline JSX — implementer's call) that renders the two tier CTAs as a row on desktop, stacked on mobile. Each tier shows:

- **Tier label** (Full-time / Part-time)
- **Price** ($300/mo / $150/mo)
- **One-line terms** (Unlimited 24/7 access / Up to 50 hr per week)
- **"Sign up here"** → Stripe URL (`target="_blank"`, `rel="noopener noreferrer"`)

Use the existing `PrimaryButton` for the CTA itself so corner mandelbrots, focus ring, hover tint, and wrap behavior match the rest of Campus. Wrap the label/price/terms above the button in plain text — no card chrome (Campus body uses no boxes; preserve that).

Suggested per-tier markup (inside a `max-w-3xl mx-auto` container, flex row on `md`, stacked on mobile):

```tsx
<div className="flex flex-col gap-2 flex-1 max-w-xs">
  <div>
    <p className="text-subtitle text-background normal-case">Full-time</p>
    <p className="text-body text-background/80">$300/mo</p>
    <p className="text-aside text-background/70 normal-case">Unlimited 24/7 access</p>
  </div>
  <PrimaryButton href={STRIPE_FULLTIME_URL} fullWidth>
    Sign up here
  </PrimaryButton>
</div>
```

And the Part-time twin alongside it (`Up to 50 hr per week`).

Container wrapper for each placement:
```tsx
<div className="flex flex-col md:flex-row gap-6 md:gap-4 items-start md:items-stretch w-full">
  {/* Full-time */}
  {/* Part-time */}
</div>
```

(In the Hero, this row sits alongside the existing "Visit by joining us for an event" + "Day Pass — $40" buttons inside the existing `max-w-2xl mx-auto` block. In the body sections, it sits inside the already-present `max-w-3xl mx-auto` wrapper from FRAC-48 — do not introduce a second container.)

## Lead-in copy

The brief opens with "We offer two kinds of membership:" — render this as a single intro line **only at the first occurrence** (Hero replacement is too dense; use it at "More than a WeWork" or "What's it like" where there's room for a lead-in). Implementer chooses based on visual fit. The line:

```tsx
<p className="text-body text-background/90 leading-relaxed mb-4">
  We offer two kinds of membership:
</p>
```

For the other three placements, the tiers are self-explanatory and don't need the lead-in.

## What gets deleted

- The `FLOWGLAD_MEMBERSHIP_URL` constant (line ~5–6 of Campus.tsx).
- Every `<PrimaryButton href={FLOWGLAD_MEMBERSHIP_URL}>…</PrimaryButton>` element (4 total).
- The Day Pass buttons stay untouched. The "Visit by joining us for an event" Luma button in the Hero stays untouched.

## Acceptance criteria

1. Two membership tiers (Full-time $300/mo, Part-time $150/mo) render on the Campus page with the exact copy from the brief.
2. Each "Sign up here" CTA opens the correct Stripe URL in a new tab (`target="_blank" rel="noopener noreferrer"`).
3. Every prior `$300/mo` membership CTA on the page is gone; `FLOWGLAD_MEMBERSHIP_URL` is no longer imported or referenced.
4. Day Pass CTAs are preserved unchanged.
5. The tier row sits inside the FRAC-48 `max-w-3xl mx-auto` centered container in body sections (no double-wrapping); in the Hero, it sits inside the existing `max-w-2xl mx-auto` block.
6. At 375px mobile, tiers stack vertically; each "Sign up here" button is fully tappable (≥44px target via existing Button `py-5` padding), text is legible, no horizontal overflow.
7. Mandelbrot corners render on each tier CTA (`PrimaryButton` → `Button` default variant — already handles this).
8. Hero `pb-16 md:pb-24` from FRAC-58 is preserved.
9. `pnpm typecheck` and `pnpm lint` pass; visual smoke at 375px and 1280px confirms layout.

## Out of scope

- FRAC-52 frost effect / house-accent treatment (deferred to Phase 4; this task ships with the current `PrimaryButton`).
- Day Pass copy or URL changes.
- Any change to other Campus sections (Overview, Amenities, Events, etc.).
- Card chrome / boxed tier visuals — Campus body is uncarded; keep it that way.

## Complexity

Medium — four use sites, but mechanical replacement using an existing pattern. No new design primitives.

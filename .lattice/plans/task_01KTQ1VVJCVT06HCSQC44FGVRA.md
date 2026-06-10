# FRAC-173 — Campus page: copy edits, membership button restructure, bullet list cleanup, photo replacements

## Scope

A multi-part editorial pass on the Campus section component. No new components, no
new tokens, no new files. All work lives in `src/components/sections/Campus.tsx`.
The only new asset references are nine photos already staged in
`public/images/campus/`.

The work breaks into four independent slices, all in the same file:
1. Hero copy + "First time here?" replacement + lead-in above amenities + body-lead style.
2. Membership buttons restructured — Day Pass removed, two stacked-label buttons.
3. Amenity bullet list cleanup — drop hot desk + private startup office; add lead-in.
4. Photo grid wired to real Williamsburg photos with staggered FadeIn.

NOTE: this plan supersedes a colliding short-ID FRAC-61 that was re-created with
a fresh short ID. Original ULID of the superseded sibling:
`task_01KTPZZWADKD2SHMWY8W6YY151`.

## Key files

- `src/components/sections/Campus.tsx` — the only file to edit. Both the hero
  and "Meet the Space" gallery live here, as do the `MembershipTiers`,
  `PrimaryButton`, and `PhotoPlaceholder` helpers and the `amenities` /
  `photoCaptions` arrays.
- `public/images/campus/` — staged photos to wire up (read-only for this task).
- `src/pages/StoryPage.tsx:230-235` — reference pattern for staggered FadeIn:
  `{ARRAY.map((item, i) => <FadeIn key={...} delay={i * 0.05}>...)`.
- `src/components/ui/FadeIn` — accepts `delay` prop.
- `src/components/ui/button.tsx` — Button is the primary CTA. JetBrains Mono /
  uppercase / `tracking-widest` is baked into `buttonVariants`. Stacked content
  inside a Button is fine — `whitespace-normal leading-snug` already comes
  through `PrimaryButton` via `wrap=true` (default).
- `DESIGN.md` — confirms `.text-body-lead` is the canonical lead body utility
  (Inter, weight 300, `leading 1.7`, `text-lg`); `.text-body` is the default.

## Photo inventory

`ls public/images/campus/` returns nine files:

```
bathroom.webp
coworking-space.webp
kitchen.webp
large-call-booths.webp
parth-and-norman-cozy.webp
private-office.avif
rooftop.webp
seating.webp
small-call-booths.webp
```

The current `photoCaptions` array has 7 entries (rooftop, kitchen, seating,
clean, Felix, Parth+Norman, private office). Felix is being removed. The
mapping below assigns all nine staged photos to captions; the gallery becomes
9-up (mobile 1-col, sm 2-col, lg 3-col — `grid-cols-1 sm:grid-cols-2
lg:grid-cols-3`, already in place at line 497). This is consistent with the
description's instruction to "wire up the new photos" without prescribing exact
captions per photo. The captions stay close to the existing voice.

## Slice 1 — Copy diffs

### 1a. Hero display heading (line 237)

**Before** (lines 234-238):
```
              <p
                className="text-display text-background mb-4 text-center"
              >
                Fractal Campus
              </p>
```

**After**:
```
              <p
                className="text-display text-background mb-4 text-center"
              >
                Be Ambitious at Fractal Campus
              </p>
```

Wraps cleanly at 375px under `.text-display` (`text-4xl md:text-7xl`,
`leading 1.1`); no class changes.

### 1b. Replace "Want a reduced rate?" paragraph (lines 253-261)

**Before**:
```
              <p className="text-aside text-xs md:text-sm text-background/70 text-center">
                Want a reduced rate? Let us know. We want the space to be accessible to all.
              </p>
              <p className="text-aside text-xs md:text-sm text-background/70 text-center mt-4">
                ✉️{" "}
                <InlineLink href={CRYSTAL_MAILTO} external={false}>
                  crystal@fractalnyc.com
                </InlineLink>
              </p>
```

**After** (single paragraph, with inline `crystal@fractalnyc.com` link;
collapses the two-paragraph mail-icon block since the email now lives inline):
```
              <p className="text-aside text-xs md:text-sm text-background/70 text-center">
                First time here? Drop by for free! Contact Crystal (
                <InlineLink href={CRYSTAL_MAILTO} external={false}>
                  crystal@fractalnyc.com
                </InlineLink>
                ) for a guided tour.
              </p>
```

Rationale: the description gives the literal string with `crystal@fractalnyc.com`
in parens. We keep the existing `CRYSTAL_MAILTO` constant (line 22) and the
existing `InlineLink` helper for the underline-on-hover affordance. The old
envelope-icon paragraph is now redundant — folded into the same sentence.

### 1c. Apply `text-body-lead` to the "meeting place in the heart of Williamsburg" paragraph (lines 274-281)

**Before**:
```
            <div className="space-y-6 text-body text-background/90 leading-relaxed">
              <p>
                The Fractal Campus is a meeting place in the heart of Williamsburg to do your
                most ambitious work. We offer 4000+ square feet of both shared office space and
                private offices, two kitchens, a communal lounge, and a 5000+ square foot private
                roof deck.
              </p>
            </div>
```

**After** (swap `text-body` → `text-body-lead`; keep `space-y-6
text-background/90`; drop `leading-relaxed` because `.text-body-lead` already
sets `leading: 1.7` per DESIGN.md):
```
            <div className="space-y-6 text-body-lead text-background/90">
              <p>
                The Fractal Campus is a meeting place in the heart of Williamsburg to do your
                most ambitious work. We offer 4000+ square feet of both shared office space and
                private offices, two kitchens, a communal lounge, and a 5000+ square foot private
                roof deck.
              </p>
            </div>
```

The copy itself is verbatim from the current code; the description quotes it as
the lead-style target without changing wording.

### 1d. Lead-in above the bullet list (between line 281 and 282)

**Before** (lines 281-283):
```
            </div>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-body text-background/90">
              {amenities.map((item) => (
```

**After** (insert a new `<p>` between the closing `</div>` of the lead body and
the `<ul>`; use `text-body` for consistency with the bullet text and to step
down from the body-lead block above):
```
            </div>
            <p className="mt-8 text-body text-background/90">
              All members have access to:
            </p>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-body text-background/90">
              {amenities.map((item) => (
```

Note: `mt-8` moves from the `<ul>` to the new lead-in `<p>` so vertical rhythm
above the lead-in matches the previous gap above the bullets. The `<ul>` gets
`mt-3` so the bullets sit close under the lead-in.

## Slice 2 — Membership buttons (Day Pass removed, stacked labels inside buttons)

This affects **four** locations where membership CTAs render. All four
currently call `<MembershipTiers />` (lines 248, 475, 531, 694), three with a
separate Day Pass button below. One of them (`MembershipTiers showLeadIn`, line
475) also renders a "We offer two kinds of membership:" lead-in.

### 2a. Rewrite `MembershipTiers` to render two stacked-label buttons

**Before** (lines 171-207):
```
function MembershipTiers({ showLeadIn = false }: { showLeadIn?: boolean }) {
  return (
    <div className="w-full">
      {showLeadIn && (
        <p className="text-body text-background/90 leading-relaxed mb-4">
          We offer two kinds of membership:
        </p>
      )}
      <div className="flex flex-col md:flex-row gap-6 md:gap-4 items-stretch w-full">
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <p className="text-subtitle text-background normal-case">Full-time</p>
            <p className="text-body text-background/80">$300/mo</p>
            <p className="text-aside text-background/70 normal-case">
              Unlimited 24/7 access
            </p>
          </div>
          <PrimaryButton href={STRIPE_FULLTIME_URL} fullWidth>
            Sign up here
          </PrimaryButton>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <p className="text-subtitle text-background normal-case">Part-time</p>
            <p className="text-body text-background/80">$150/mo</p>
            <p className="text-aside text-background/70 normal-case">
              Up to 50 hr per week
            </p>
          </div>
          <PrimaryButton href={STRIPE_PARTTIME_URL} fullWidth>
            Sign up here
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
```

**After** (description-mandated structure: stacked label + price inside each
button; outer scaffolding stays for the side-by-side layout at md+; `showLeadIn`
is preserved for the one call site that uses it):
```
function MembershipTiers({ showLeadIn = false }: { showLeadIn?: boolean }) {
  return (
    <div className="w-full">
      {showLeadIn && (
        <p className="text-body text-background/90 leading-relaxed mb-4">
          We offer two kinds of membership:
        </p>
      )}
      <div className="flex flex-col md:flex-row gap-4 items-stretch w-full">
        <PrimaryButton href={STRIPE_FULLTIME_URL} fullWidth>
          <span className="flex flex-col items-center gap-1">
            <span>Full time membership</span>
            <span className="opacity-80">24/7 access $300/mo</span>
          </span>
        </PrimaryButton>
        <PrimaryButton href={STRIPE_PARTTIME_URL} fullWidth>
          <span className="flex flex-col items-center gap-1">
            <span>Part time membership</span>
            <span className="opacity-80">50 hr/wk $150/mo</span>
          </span>
        </PrimaryButton>
      </div>
    </div>
  );
}
```

Notes:
- Button content is two `<span>`s stacked via `flex flex-col items-center
  gap-1`. The outer wrapper `<span>` exists so it sits inside the `<a>` slotted
  into the Button (`PrimaryButton` already wraps the consumer's child in `<a>`
  via `asChild` — see lines 159-168). The inner stack is `<span>`s, not `<div>`s,
  to stay valid inside `<a>`.
- The button retains JetBrains Mono / uppercase / `tracking-widest` from
  `buttonVariants`. Both lines render uppercase by design — this is the system
  voice for Button content.
- `PrimaryButton` already passes `wrap=true` by default, which adds
  `whitespace-normal leading-snug` — important here because the second line may
  wrap at 375px. `24/7 access $300/mo` is 19 chars; `50 hr/wk $150/mo` is 16
  chars. Both should fit on one line at the button's `max-w-xs` width, and the
  wrap class keeps us safe if not.
- `opacity-80` on the price line matches the previous `text-background/80`
  intent without contradicting the Button's `text-current` / hover color.
- The flex `gap-6 md:gap-4` becomes `gap-4` because we no longer have the
  multi-element column scaffolding that needed the extra mobile vertical gap.

### 2b. Remove the four external Day Pass buttons (and adjust their surrounding wrappers)

Four Day Pass buttons exist:

**Hero (lines 249-251):**
```
                <PrimaryButton href={FLOWGLAD_DAYPASS_URL} fullWidth>
                  Day Pass — $40
                </PrimaryButton>
```
Delete entirely (still inside the same `flex flex-col gap-4 items-center mb-4
max-w-2xl mx-auto` wrapper). The `MembershipTiers` call on line 248 remains.

**"More than a WeWork" (lines 476-480):**
```
              <div className="flex flex-col sm:flex-row gap-4 justify-start items-center">
                <PrimaryButton href={FLOWGLAD_DAYPASS_URL}>
                  Or I want to purchase a Day Pass for $40!
                </PrimaryButton>
              </div>
```
Delete this entire `<div>` wrapper (the wrapper exists only for the Day Pass
button). The outer `<div className="mt-10 flex flex-col gap-6">` stays and
contains just `<MembershipTiers showLeadIn />`.

**"What's it like" (lines 532-536):**
```
              <div className="flex flex-col sm:flex-row gap-4 justify-start items-center">
                <PrimaryButton href={FLOWGLAD_DAYPASS_URL}>
                  Or I'm interested in a day pass! — $40
                </PrimaryButton>
              </div>
```
Delete this entire wrapper. The outer `<div className="mt-10 flex flex-col
gap-6">` and the `<MembershipTiers />` inside it remain.

**"Build with us" (lines 695-699):**
```
              <div className="flex flex-col sm:flex-row gap-4 justify-start items-center">
                <PrimaryButton href={FLOWGLAD_DAYPASS_URL}>
                  Just want a day pass — $40
                </PrimaryButton>
              </div>
```
Delete this entire wrapper. The outer `<div className="flex flex-col gap-6
mb-10">` and the `<MembershipTiers />` inside it remain.

### 2c. Remove the now-unused `FLOWGLAD_DAYPASS_URL` constant

Lines 11-12:
```
const FLOWGLAD_DAYPASS_URL =
  "https://app.flowglad.com/price/vrnt_19pxxXOzdUd3xiBVilFYB/purchase";
```
Delete — no remaining references after slice 2b. (Avoids lint
unused-variable warning.)

## Slice 3 — Bullet list cleanup

### 3a. Trim `amenities` array (lines 81-90)

**Before**:
```
const amenities = [
  "24/7 hot desk access",
  "Stocked kitchen w/ espresso machine",
  "3D printer and tool library",
  "Cozy lounge for relaxing and chatting",
  "Private startup offices",
  "Soundproof phone booths",
  "Rooftop coworking (with wifi!)",
  "Free near-daily tech events",
];
```

**After** (remove first and fifth entries):
```
const amenities = [
  "Stocked kitchen w/ espresso machine",
  "3D printer and tool library",
  "Cozy lounge for relaxing and chatting",
  "Soundproof phone booths",
  "Rooftop coworking (with wifi!)",
  "Free near-daily tech events",
];
```

(The lead-in `<p>` is handled by slice 1d.)

## Slice 4 — Photo grid

### 4a. Replace `photoCaptions` with `campusPhotos` array

**Before** (lines 92-100):
```
const photoCaptions = [
  "Did we mention we had 5000 sq. ft of private rooftop? We have 5000 sq. ft of private rooftop.",
  "A full kitchen, with an island",
  "Seating, seating, and more seating",
  "Nice and clean",
  "Felix doesn't live here, but he does love it here.",
  "Parth and Norman proving that cozy engineers are productive engineers",
  "Roomy private office or large meeting room",
];
```

**After** (array of `{ src, caption, alt }`; Felix removed; nine photos mapped
to descriptive captions in the voice of the existing copy; rooftop leads
because it's the showcase shot):
```
const campusPhotos = [
  {
    src: "/images/campus/rooftop.webp",
    alt: "Fractal Campus private rooftop deck in Williamsburg",
    caption:
      "Did we mention we had 5000 sq. ft of private rooftop? We have 5000 sq. ft of private rooftop.",
  },
  {
    src: "/images/campus/kitchen.webp",
    alt: "Fractal Campus kitchen",
    caption: "A full kitchen, with an island",
  },
  {
    src: "/images/campus/coworking-space.webp",
    alt: "Fractal Campus coworking floor",
    caption: "Open coworking space with room to spread out",
  },
  {
    src: "/images/campus/seating.webp",
    alt: "Lounge seating at Fractal Campus",
    caption: "Seating, seating, and more seating",
  },
  {
    src: "/images/campus/large-call-booths.webp",
    alt: "Large call booths at Fractal Campus",
    caption: "Large call booths for meetings and focused calls",
  },
  {
    src: "/images/campus/small-call-booths.webp",
    alt: "Small call booths at Fractal Campus",
    caption: "Small call booths for quick one-on-ones",
  },
  {
    src: "/images/campus/parth-and-norman-cozy.webp",
    alt: "Two members working side-by-side at Fractal Campus",
    caption:
      "Parth and Norman proving that cozy engineers are productive engineers",
  },
  {
    src: "/images/campus/private-office.avif",
    alt: "Private office at Fractal Campus",
    caption: "Roomy private office or large meeting room",
  },
  {
    src: "/images/campus/bathroom.webp",
    alt: "Bathroom at Fractal Campus",
    caption: "Nice and clean",
  },
];
```

### 4b. Replace `PhotoPlaceholder` with a real-image component

**Before** (lines 209-220):
```
function PhotoPlaceholder({ caption }: { caption: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/5] md:aspect-square w-full bg-background/5 border border-background/10 text-background flex items-center justify-center">
        <span className="text-label text-background/40">Photo</span>
      </div>
      <p className="text-body text-background/70 leading-relaxed">
        {caption}
      </p>
    </div>
  );
}
```

**After** (real `<img>`; keep the same aspect-ratio scaffold so layout doesn't
shift; `loading="lazy"` because there are nine images well below the fold;
`decoding="async"`):
```
function CampusPhoto({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/5] md:aspect-square w-full overflow-hidden border border-background/10 bg-background/5">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <p className="text-body text-background/70 leading-relaxed">
        {caption}
      </p>
    </div>
  );
}
```

### 4c. Wire the grid + add staggered FadeIn (and unnest from the outer FadeIn)

**Before** (lines 487-503):
```
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-title mb-6">Meet the Space</h2>
            <p className="text-body text-background/90 leading-relaxed">
              4200 sq ft of open working space, kitchen, phone booths, and large meeting rooms. Oh,
              and 5000 sq. ft of sunny rooftop. We're re-decorating the space now, and will continue
              to do so throughout winter, with an eye towards creativity, focus, and sunny vibes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {photoCaptions.map((caption) => (
              <PhotoPlaceholder key={caption} caption={caption} />
            ))}
          </div>
        </FadeIn>
      </div>
```

**After** (each photo card wrapped in its own `FadeIn` with `delay={i * 0.05}`;
the grid lives *outside* the outer `FadeIn` so nested `FadeIn`s fire
independently and don't wait on the parent):
```
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-title mb-6">Meet the Space</h2>
            <p className="text-body text-background/90 leading-relaxed">
              4200 sq ft of open working space, kitchen, phone booths, and large meeting rooms. Oh,
              and 5000 sq. ft of sunny rooftop. We're re-decorating the space now, and will continue
              to do so throughout winter, with an eye towards creativity, focus, and sunny vibes.
            </p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {campusPhotos.map((photo, i) => (
            <FadeIn key={photo.src} delay={i * 0.05}>
              <CampusPhoto
                src={photo.src}
                alt={photo.alt}
                caption={photo.caption}
              />
            </FadeIn>
          ))}
        </div>
      </div>
```

This matches the `StoryPage.tsx:230-235` reference pattern. The intro section
(heading + paragraph) gets its own FadeIn; the photo grid is a sibling block
whose children are individually FadeIn-wrapped with stagger.

## Potential overlap with FRAC-11 (note, do not fail over)

Active in-progress task **FRAC-11** ("[Bug] Campus desktop: full-width Visit
CTA on top, Co-work + Day Pass on one line below") touches the same hero CTA
cluster this task restructures. FRAC-173 removes the Day Pass entirely and
collapses `MembershipTiers` to two side-by-side buttons, which materially
changes the layout FRAC-11 was trying to fix. The implementing agent should:

1. Re-check the FRAC-11 status before starting work. If FRAC-11 lands first,
   reconcile with whatever the FRAC-11 layout looks like; if FRAC-173 lands
   first, the FRAC-11 task may become moot or need re-scoping.
2. Leave a comment on FRAC-11 once FRAC-173 ships pointing at the new hero CTA
   structure, so the FRAC-11 owner can re-evaluate.

This is a flag, not a blocker. Proceed.

## Acceptance criteria

Mapped from the description:

- [ ] Hero display reads "Be Ambitious at Fractal Campus" (rendered with
      `.text-display`).
- [ ] "Want a reduced rate?" paragraph is gone; the new paragraph reads "First
      time here? Drop by for free! Contact Crystal (crystal@fractalnyc.com) for
      a guided tour." with `crystal@fractalnyc.com` as a clickable mailto.
- [ ] The "meeting place in the heart of Williamsburg…" paragraph uses
      `.text-body-lead`.
- [ ] A lead-in paragraph "All members have access to:" sits directly above the
      amenities bullet grid.
- [ ] The amenities grid no longer contains "24/7 hot desk access" or "Private
      startup offices"; the other six bullets are unchanged.
- [ ] `MembershipTiers` renders exactly two buttons, side-by-side at md+ and
      stacked at mobile. Each button contains a two-line stacked label:
      - Button 1: "Full time membership" / "24/7 access $300/mo" → `STRIPE_FULLTIME_URL`
      - Button 2: "Part time membership" / "50 hr/wk $150/mo" → `STRIPE_PARTTIME_URL`
- [ ] Literal "$300/mo" and "$150/mo" strings appear in the button labels.
- [ ] No Day Pass button is rendered anywhere on the Campus page; the
      `FLOWGLAD_DAYPASS_URL` constant is deleted.
- [ ] The "Meet the Space" gallery shows nine photos sourced from
      `/images/campus/*`; no Felix photo.
- [ ] Each gallery photo card fades in independently with `delay={i * 0.05}` —
      the inner `FadeIn`s are NOT nested inside an outer `FadeIn`.
- [ ] Lint and typecheck pass (no unused-import / unused-variable warnings from
      the deleted constants/components).

## Validation at 375px and desktop

- **375px (mobile baseline):**
  - Hero heading "Be Ambitious at Fractal Campus" wraps cleanly; no horizontal
    scroll.
  - Membership buttons stack vertically; each two-line label fits without
    awkward wraps. The `whitespace-normal leading-snug` from `PrimaryButton`
    keeps long lines safe.
  - Bullet grid is single-column; lead-in "All members have access to:" sits
    directly above with consistent rhythm.
  - "First time here?" paragraph is centered and wraps to 2-3 lines.
  - Photo gallery is single-column; each photo fades in in sequence as the user
    scrolls.
- **Desktop:**
  - Membership buttons sit side-by-side (`md:flex-row`).
  - Bullet grid splits into 2 columns at `sm:`.
  - Photo gallery splits into 2 columns at `sm:` and 3 columns at `lg:`.
  - Staggered FadeIn produces the expected diagonal sweep across the grid.
- **Reduced motion:** `FadeIn` honors `prefers-reduced-motion` already
  (project-wide via FRAC-28), so no extra handling is needed.

## Out of scope

- Other Campus sections (AI Accelerator, Get shit done, What's it like, Events,
  Merlin's Place, Williamsburg, McCarren Park, Build with us, By the way) are
  untouched.
- No new tokens, utilities, or design system changes.
- No image optimization beyond `loading="lazy"` and `decoding="async"`.
- No follow-up to FRAC-11 layout work — flagged above; not absorbed.

## Reset 2026-06-09 by agent:claude-opus-4-7-orchestrator

## Reset 2026-06-09 by agent:claude-opus-4-7-orchestrator

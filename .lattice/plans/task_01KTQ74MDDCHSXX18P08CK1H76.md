# FRAC-175: Navbar polish — home mobile wordmark vertical center + Story hamburger alignment

Two follow-up fixes from human QA of the FRAC-60+68 PR (#207) that merged earlier today.

## Issue 1 — Home page mobile: wordmark misaligned with the mono blurb and reads too small

**Where:** `src/components/layout/Navbar.tsx`, lines 215-238 (the `lg:hidden` mobile + tablet variant on the home page).

**Current state:**
```jsx
<div className="lg:hidden px-6 pt-5 pb-3">
  <div className="flex items-start gap-3">  // ← items-start = top-aligned
    <Link href="/" className="tracking-tighter shrink-0 leading-[0.9] text-center">
      <span style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "clamp(24px, 4.5vw, 42px)" }}>Fractal</span>
      <span className="font-serif block italic" style={{ fontSize: "clamp(14px, 2.63vw, 25px)", ... }}>Collective</span>
    </Link>
    <p
      className="font-mono uppercase font-thin text-justify flex-1"
      style={{ fontSize: "8px", lineHeight: 1.35, letterSpacing: "0.01em", paddingTop: "8px" }}  // ← paddingTop hack to fake center
    >
      {RIGHT_TEXT}
    </p>
  </div>
```

**Problems user reported:**
1. The wordmark is top-aligned to the mono blurb (`items-start` + paddingTop hack), so its baseline sits at the top of the blurb, not centered against it.
2. The wordmark reads too small at 375px — Fractal clamp resolves to 24px, Collective to 14px. Visually under-weighted relative to the dense mono block beside it.

**Fix:**
1. Parent flex: `items-start` → `items-center`. Wordmark and mono blurb now share a horizontal axis (vertical center).
2. Drop `paddingTop: "8px"` from the mono `<p>` — no longer needed once the parent centers.
3. Bump the wordmark sizes proportionally (preserving the FRAC-68 1.71 ratio between Fractal and Collective):
   - Fractal: `clamp(24px, 4.5vw, 42px)` → `clamp(32px, 6vw, 42px)`. At 375px: 24 → 32 (+33%).
   - Collective: `clamp(14px, 2.63vw, 25px)` → `clamp(18px, 3.5vw, 25px)`. At 375px: 14 → 18 (+29%). Ratio 32/18 = 1.78, within tolerance of the 1.71 design intent (Collective deep-end stays 25 to match Fractal's 42 cap at wider viewports).
4. User permitted shrinking the mono blurb if needed, but the bump above doesn't force it — the wordmark is `shrink-0` and the mono block has `flex-1` so the mono just gets a slightly narrower column. If the impl sub-agent finds the mono now overflows or wraps badly at 375px, drop mono fontSize from `8px` → `7px` (and only then).

**Acceptance:**
- At **375px**: wordmark and mono blurb vertically centered against each other on a shared horizontal axis. Wordmark visibly larger than before. Mono blurb still readable, no overflow.
- At **414px / 768px / 1023px** (still in the lg:hidden zone): same centering holds, ratio of Fractal:Collective preserved.
- At **≥1024px (lg)**: the lg:hidden block hides — unchanged.

## Issue 2 — Story page mobile: hamburger horizontally misaligned

**User reported:** on every other page mobile the hamburger looks good, but on Story specifically it sits at the wrong horizontal position. They specified "horizontal position wrong".

**Investigation needed:** No code-level cause is obvious from a static read of `Navbar.tsx` + `StoryPage.tsx`. The Navbar is `position: fixed` and renders identically across pages. Story uses the same `<Navbar />` instance with no wrapper overrides.

**Hypotheses to test in the impl sub-agent's local dev server:**
1. Story sets a custom `--btn-accent` and `backgroundColor` on `<main>` — neither should affect the hamburger button's geometry, but verify with devtools.
2. Some descendant of Story page horizontally overflows the viewport (causing the body to scroll, shifting the fixed navbar relative to perceived viewport).
3. The `FractalPattern` SVG noise overlay paints differently and visually shifts perception of where the right edge sits.
4. Could be a Safari mobile vs. Chrome mobile rendering difference.

**Approach:**
- Impl agent starts `pnpm dev`, opens `/story` in browser at 375px, and inspects the hamburger button's bounding box vs. the same on `/events` or `/visit` (which user says look fine).
- If a code-level cause is found, fix it (most likely culprit: a Story page descendant overflowing horizontally).
- If no cause is found after ~10 minutes of investigation, report back with what was checked and how it looks; we'll then ask the user for a screenshot to disambiguate.

**Acceptance (if cause is found and fixed):**
- Hamburger on `/story` mobile sits at the same right-edge position as on `/events`, `/visit`, `/lab`, etc.

**Acceptance (if cause is NOT found):**
- The investigation is documented in the impl commit message or a Lattice comment, and the human is asked for a screenshot.

## Key files

- `src/components/layout/Navbar.tsx` — Issue 1 changes go here.
- `src/pages/StoryPage.tsx` and/or descendants (`src/components/sections/OriginStory.tsx`) — Issue 2 investigation target.

## Out of scope

- Wordmark fixes on inner pages, home-scrolled, full-desktop-home variants — those aren't reported as broken.
- The hamburger affordances (cursor, hover, focus, active) — those shipped with FRAC-60, not in scope here.
- The mobile menu panel itself — not in scope.

## Branch / PR

- Branch: `frac-175-navbar-home-mobile-and-story-hamburger`
- PR title: "FRAC-175: navbar polish — home mobile wordmark center + Story hamburger alignment"

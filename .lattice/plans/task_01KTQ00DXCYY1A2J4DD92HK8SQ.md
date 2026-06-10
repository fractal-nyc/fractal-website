# FRAC-62: Display text too large on mobile — getting cut off

## Problem (verified)

The `.text-display` utility in `src/index.css:187-194` sizes at `text-5xl md:text-7xl`. Tailwind v4 defaults:
- `text-5xl` = 48px (3rem)
- `text-7xl` = 72px (4.5rem)

At the 375px mobile baseline with `px-6` page gutters (24px each side → ~327px usable), 48px italic-or-upright Fraunces with `letter-spacing: 0.04em` and `text-transform: uppercase` only fits roughly 5–6 glyphs per line. Real call sites push 12–24 characters of display text per line:

- `src/pages/EventsPage.tsx:27,62,87` — "Join Tech Events", "Host Our Next Event", "Stay in the Loop"
- `src/pages/Home.tsx:28-31` — "A Golden Age Protocol" (already manually `<br/>`-split)
- `src/pages/NeighborhoodPage.tsx:25` — "Visit Us"-style heading
- `src/pages/LabPage.tsx:29`, `src/pages/PeoplePage.tsx:26`, `src/pages/PoliticalClubPage.tsx:23`, `src/pages/StoryPage.tsx:210`, `src/pages/not-found.tsx:7`
- `src/components/sections/Campus.tsx:235`, `src/components/sections/LiberalArts.tsx:11`

Two raw-Tailwind-class display headings shadow the same scale and must move with it (Tier 2 below):

- `src/components/house/HouseBannerGrid.tsx:22` — `text-5xl md:text-7xl font-serif display-roman` on "How Do I Get Involved" (currently hidden on Home per FRAC-161 but reachable elsewhere)
- `src/components/sections/Projects.tsx:31` — `text-3xl md:text-5xl font-serif` (this is title-tier sizing matching `.text-title`; OUT OF SCOPE for this task — display tier only)

## Approach

**Single source of change, one file:** `src/index.css`. The display tier is centrally defined in the `.text-display` utility class. Reducing the mobile size there fixes every consumer in one stroke. This is exactly the pattern that makes FRAC-51's semantic-utility decision pay off — no per-page typography changes needed.

**Mobile breakpoint strategy:** Tailwind responsive variants (NOT `clamp()`). The current rule is `@apply font-serif text-5xl md:text-7xl`. Lower the mobile (base) step; keep the `md:text-7xl` desktop step untouched.

**Proposed change to `.text-display` (line 188):**

```css
/* before */
@apply font-serif text-5xl md:text-7xl;
/* after */
@apply font-serif text-4xl md:text-7xl;
```

- `text-4xl` = 36px (2.25rem). Roughly 25% smaller than `text-5xl`.
- At 375px with `px-6`: ~327px usable width. 36px uppercase Fraunces with 0.04em tracking fits ~8–9 glyphs per line — comfortably accommodating natural word-wrap on phrases like "Host Our Next" / "Event" without mid-word clipping or single-letter orphans.
- Desktop (`md:` ≥ 768px) is unchanged at `text-7xl` (72px).

**Why `text-4xl` and not `text-3xl`:**
- `text-3xl` (30px) is the size of `.text-title`'s mobile step. Collapsing display and title at mobile destroys the type hierarchy the system was built to maintain.
- `text-4xl` (36px) preserves a clear 36 → 30 step between display and title at mobile, mirroring the desktop 72 → 48 step.

**Tier 2 (raw-class display heading):** `src/components/house/HouseBannerGrid.tsx:22` uses `text-5xl md:text-7xl` directly to match `.text-display` rendering ("How Do I Get Involved"). Update to `text-4xl md:text-7xl` in lockstep so the two display surfaces stay aligned. If the implementer prefers, they may instead refactor this h2 to use `.text-display` (it already pairs with `display-roman` and a custom `letterSpacing`); but the minimum required change is the size swap to keep the diff small.

**Do NOT touch:**
- `.text-title` (`text-3xl md:text-5xl`) — out of scope.
- `.text-subtitle` (`text-xl md:text-2xl`) — out of scope.
- `SectorHeader.tsx` Jacquard monogram (`text-[7rem]`) — single character, fits fine.
- Navbar/Footer Jacquard `clamp()` sizes — separate type family, separate FRAC-29 system.
- `src/components/sections/Projects.tsx:31` — title-tier, not display-tier.
- `src/components/house/HouseBanner.tsx:128` — monogram letter, not running display text.

## Key files

- `src/index.css` (line 188) — primary change: `.text-display` mobile size.
- `src/components/house/HouseBannerGrid.tsx` (line 22) — Tier-2 lockstep change on inline `text-5xl md:text-7xl`.
- `DESIGN.md` (lines 235–242) — documentation update: the "Display tier" table row for `.text-display` currently reads `text-5xl md:text-7xl`; update to `text-4xl md:text-7xl`.

## Acceptance criteria

At each of the following viewport widths, every `.text-display` call site (and the HouseBannerGrid heading) must render without:
- Horizontal clipping past the viewport edge
- Mid-word breaks
- Lone-letter orphans on their own line
- Visible overflow of any parent container

**Test widths (browser devtools responsive mode):**
- **375px (iPhone SE / 13 mini)** — the non-negotiable baseline per CLAUDE.md and FRAC-22 PRD
- **320px** — smallest in-the-wild Android target (safety floor)
- **414px** — iPhone Pro Max widths (verify we did not over-shrink)

**Desktop regression check at 768px and 1280px:** `.text-display` headings must look identical to before the change — only the mobile step moved.

## Validation plan

1. Run the dev server (`pnpm dev` or equivalent).
2. Open browser devtools, toggle mobile responsive mode.
3. Walk each page at 375px:
   - `/` (Home) — "A Golden Age Protocol" hero-adjacent display heading
   - `/visit` (NeighborhoodPage) — first display line at top of page
   - `/story` (StoryPage) — display heading at line 210
   - `/campus` (CampusPage / Campus.tsx section line 235) — section display
   - `/events` (EventsPage) — three display lines (Join / Host / Stay in the Loop)
   - `/lab` (LabPage) — display heading at line 29
   - `/people` (PeoplePage) — display heading at line 26
   - `/political-club` (PoliticalClubPage) — display heading at line 23
   - `/new-liberal-arts` (LiberalArts.tsx section line 11) — section display
   - Any 404 path — `/not-found.tsx` "404"
4. Re-walk at 320px (Chrome → "Responsive" → 320×800). Verify no clipping.
5. Re-walk at 414px. Verify hierarchy still reads as "display = biggest, then title, then subtitle".
6. At ≥768px, spot-check Home, Events, Visit, Story — desktop sizing should be visually identical to pre-change.
7. (Optional) Search the diff for any other unintended changes: `git diff src/index.css src/components/house/HouseBannerGrid.tsx DESIGN.md`.

## Out of scope

- Do NOT change desktop sizing (the `md:` step) on any tier.
- Do NOT redesign per-page typography or rewrite any heading content.
- Do NOT touch `.text-title`, `.text-subtitle`, `.text-body*`, chrome tier, or control tier.
- Do NOT migrate display sizing to `clamp()` — the FRAC-51 decision is explicit Tailwind responsive variants, and this task does not relitigate that.
- Do NOT introduce a new `sm:` breakpoint inside `.text-display` — the desktop step is `md:` and that is the locked system breakpoint for display tier.
- Do NOT touch Jacquard monograms (Navbar, Footer, HouseBanner letter, SectorHeader).
- Political Club page is still hidden from nav per FRAC-30/47 — verify at direct route only.

## Commit & PR conventions

- Branch: `frac-62-mobile-display-size`
- Single commit with the three-file diff (`src/index.css`, `src/components/house/HouseBannerGrid.tsx`, `DESIGN.md`).
- PR title: "FRAC-62: shrink display tier at mobile baseline (text-5xl → text-4xl)"
- Body should include before/after screenshots at 375px of at least Events and Home.

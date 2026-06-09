# FRAC-52 — Sitewide Button Overhaul

## Goal

Restyle the Button primitive sitewide so every CTA reads as **frosted glass with a house-accent border + house-accent Mandelbrot corners**, and inherits the page's own text color. The Button keeps its existing API, layout, padding, and `asChild` contract — only its visual chrome changes.

## Reference

**Source repo:** `/Users/fractalos/Dev/renoverse-ai-website` — chosen over `renoverse-site` and `renoverse-prototype` because its `shared/button.css` is the most mature, comments out the WCAG reasoning, and is the version actually shipped on the live Renoverse marketing site. Two specific files port over:

- `shared/button.css` → the `.btn--frosted` variant (lines 133–148). Recipe:
  ```css
  background: rgba(242, 234, 216, .08);   /* cream-tinted glass */
  border: 1px solid var(--accent);        /* accent stroke */
  color: #fff;                            /* text inherits */
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  /* hover bumps tint to .16 */
  ```
- `shared/components/site-nav/index.css` → the always-on `.16` opacity used by the floating frosted bar (lines 70–79). Confirms: when the surface is *persistent* chrome (like a navbar), park at the hover-state opacity to stay legible regardless of what's behind it.

## Frost recipe (Tailwind, ported)

The exact class string injected into the `default` variant of `Button`:

```
border bg-[rgba(242,234,216,0.08)] backdrop-blur-md
[border-color:var(--btn-accent,currentColor)]
text-current
hover:bg-[rgba(242,234,216,0.16)]
```

Notes:

- **`backdrop-blur-md`** = `backdrop-filter: blur(12px)`. Renoverse uses 6px on buttons, 6px on the always-on nav, and 14px+saturate on the cream filled variant. Fractal's house backgrounds are saturated solid colors (no halftone video behind them), so a slightly heavier 12px reads as clearly glassy without going hazy. (Easy to dial down to `backdrop-blur-sm` = 4px during impl if it feels too soft.)
- **`bg-[rgba(242,234,216,0.08)]`** = literal cream tint at 8% opacity (same cream as Fractal's `--background` channel, `#f8f6f0`-ish). Hover bumps to `.16`. This works on both light and dark house backgrounds because cream is neutral against every house color.
- **`[border-color:var(--btn-accent,currentColor)]`** — single line that does all three jobs of the brief: the *border* takes the house accent if set, otherwise falls back to whatever text color is in scope. No new prop, no context provider.
- **`text-current`** — the button inherits the page's text color. Today every page sets `text-foreground` (charcoal) or `text-white` / `text-background` (cream) on its root; that flows in via `currentColor`.

The current Button's existing classes (`relative inline-flex … rounded-md … focus-visible:ring-2 …`) all stay. We **remove** `border-foreground/20`, `bg-foreground/[0.03]`, `text-foreground`, and `hover:bg-foreground/10` from the `default` variant and replace them with the frost recipe above.

## Accent-color propagation mechanism

Each house page already passes its accent as a literal hex/CSS-var into `SectorHeader` (e.g. `color="#C83858"` on PoliticalClub, `color="var(--color-house-events-deep)"` on Events). We mirror that exact contract on the page root by setting a single CSS custom property:

```tsx
<main
  className="..."
  style={{ "--btn-accent": "#C83858" } as React.CSSProperties}
>
```

Why this approach (smallest blast radius):

1. **No new prop on Button** — every existing `<Button>` and every `<PrimaryButton>` consumer keeps working unchanged. The frost recipe just reads `var(--btn-accent, currentColor)` and inherits.
2. **CSS variable inherits naturally** through the DOM, so it covers Mandelbrot corners (which use `currentColor` through the SVG `fill="currentColor"`), the border, and any future decorations without threading props.
3. **Sensible default** — when `--btn-accent` is *not* set (Home, Footer, Protocol, any shared chrome), the border falls back to `currentColor`, which is the page text color (charcoal on cream pages, cream on dark pages). That matches the brief's "default — probably cream/foreground" call. No special-casing needed.
4. **Mandelbrot corners pick up the accent for free.** The Button's corner spans currently call `<MandelbrotIcon color="currentColor" opacity={0.2} />` … except the existing code passes `color` *implicitly* (it defaults to `currentColor`). We must make the corner spans inherit *the accent*, not the button text. Solution: wrap the four corner `<span>`s in a single `<span style={{ color: 'var(--btn-accent, currentColor)' }}>` so the MandelbrotIcon's `fill="currentColor"` resolves to the accent, not the button text color. Same trick used for the border, one extra wrapper.

### What about the in-page CornerDecorations (around the Luma embed, etc.)?

Out of scope for FRAC-52 as written ("decorative border around buttons AND the corner Mandelbrot PNGs" refers to the corners *on buttons*). `<CornerDecorations>` used around the Luma embed iframe on EventsPage / etc. already inherits `currentColor` via the same MandelbrotIcon path — if we set `--btn-accent` on `<main>` and any decorative element opts into it explicitly, that's a clean follow-up. **Not changed in this task.**

## Files to edit

1. **`src/components/ui/button.tsx`** — replace the `default` variant's surface classes with the frost recipe; wrap the four corner spans in a `--btn-accent`-colored container so Mandelbrots inherit the accent. Other variants (`outline`, `ghost`, `link`) are unchanged — they don't carry the frost chrome and don't have corner decorations.

2. **`src/components/layout/Navbar.tsx`** — *no Button used in Navbar today.* The "Book a Demo" / CTA equivalent in Renoverse maps to nothing in Fractal's current Navbar (the navbar is letter-link nav only). **Re-confirm with the user before adding a frosted-bar treatment to the Navbar's outer container itself** — see Open Questions below.

3. **House pages** — add `style={{ "--btn-accent": "<deep-accent>" } as React.CSSProperties}` to each page's `<main>` root. Concrete mappings:

   | Page | File | Accent value | Source |
   |------|------|--------------|--------|
   | Events | `src/pages/EventsPage.tsx` | `var(--color-house-events-deep)` | already wired via theme tokens |
   | Visit (Neighborhood) | `src/pages/NeighborhoodPage.tsx` | `var(--color-house-visit-deep)` | |
   | Campus | `src/pages/CampusPage.tsx` (uses `Campus` section) | `var(--color-house-campus-deep)` | applied at page root, not inside `Campus` |
   | Education (New Liberal Arts) | `src/pages/NewLiberalArtsPage.tsx` / wherever it lives — confirm path in impl | `var(--color-house-education-light)` (page bg is `deep`, accent is `light`) | |
   | Political Club | `src/pages/PoliticalClubPage.tsx` | `#C83858` (palette `light` — page bg is `deep`) | |
   | Lab (Publications) | `src/pages/LabPage.tsx` | `var(--color-house-publications-deep)` | |
   | Story | `src/pages/StoryPage.tsx` | `#D4BA58` (literal, matches navbar's Story link color) | |
   | People | `src/pages/PeoplePage.tsx` | `#C49040` (matches navbar's People link color) | |
   | Home | `src/pages/Home.tsx` (or equivalent) | **unset** — falls back to `currentColor` (charcoal) | sensible cream default |
   | Protocol | TBD path | **unset** unless it has a paired accent | |
   | Footer | `src/components/layout/Footer.tsx` | **unset** — currently has `text-background` (cream) so border becomes cream stroke on the black band, matching the white Mandelbrot watermark | |

4. **`src/components/sections/Campus.tsx`** — `PrimaryButton` (lines 131–168) currently overrides the Button's `default` surface with `bg-foreground/20 hover:bg-foreground/30` to darken the translucent black against the green Campus background. With the new frost recipe, the cream-tinted glass already reads cleanly against green, so **delete that override** and let Campus inherit the sitewide frost. If the cream tint doesn't read well enough against the green during impl spot-check, fall back to keeping the darker `bg-foreground/20` override locally on Campus only.

5. **`src/components/sections/LiberalArts.tsx`** — same Button usage pattern, no override; should pick up frost automatically once the parent page sets `--btn-accent`.

6. **`src/__tests__/buttons.test.tsx`** — update the two assertions that hard-check the old surface classes:
   - `expect(link!.className).toContain("border-foreground/20")` → drop or update to assert the new `[border-color:var(--btn-accent,currentColor)]` token.
   - `expect(link!.className).toContain("bg-foreground/[0.03]")` → drop or update to assert the cream tint.
   - Add one positive assertion that `--btn-accent` propagates: render `<main style={{ "--btn-accent": "#FF0000" }}><Button>…</Button></main>` and check the rendered border color (or just that the variable resolves through getComputedStyle in jsdom — jsdom doesn't compute backdrop-filter, so verify the *class* contains the var reference).

## Pages to spot-check (manual or screenshot validation in impl)

- **Story** — cream bg, charcoal text. Buttons: cream-tinted glass + gold accent border + charcoal text.
- **Education (NLA)** — deep red bg `#5C1010`, white/cream text. Buttons: cream glass + brighter red `#C41E20` accent + cream text. Highest contrast risk.
- **Political Club** — deep burgundy `#6E1830` bg, white text. Buttons: cream glass + pink-red `#C83858` accent + white text.
- **Visit** — sage green `#889460` bg, charcoal text. Buttons: cream glass + deep olive accent + charcoal text.
- **Events** — terracotta `#D4857A` bg, charcoal text. Buttons: cream glass + brick `#C13B2A` accent + charcoal text.
- **Lab (Publications)** — pink `#E870A0` bg. Buttons: cream glass + deeper rose accent + charcoal text.
- **Campus** — deep green `#1A3A2E` or light green `#2E6B4A` bg, cream text. Buttons need to read on green.
- **Home** — cream bg, no accent — falls back to charcoal border, default cream glass tint.
- **Protocol** — confirm bg/text colors in impl; treat like Home if it's on cream.

## Acceptance criteria (per task description)

- [ ] Every Button (default variant) renders with the frost recipe: cream-tinted translucent fill + backdrop-blur + accent-color border.
- [ ] Mandelbrot corners inherit the same accent color as the border (not the button text).
- [ ] Button text uses `currentColor` so it matches the page's body text color on every house page.
- [ ] Buttons have legible contrast on all 9 listed pages at 375px mobile viewport.
- [ ] Existing button tests pass (after asserted-class updates in `buttons.test.tsx`).
- [ ] No regression in `asChild` behavior — Slot continues to receive both border + corner children.
- [ ] `focus-visible:ring-2` still fires (a11y unchanged).

## Risks

1. **Backdrop-blur over solid color is subtle** — Renoverse's frost lives over halftone-video heroes, where the blur sells the glass effect. Fractal's house pages have *solid* color backgrounds plus the noise SVG overlay and `FractalPattern`. Blur over a solid color is almost invisible; the *cream tint* (`rgba(242,234,216,.08)`) and *accent border* will do most of the visual work, not the blur itself. Acceptable, but the "frost" reads more like "lightly tinted bordered glass" than the floating-on-hero effect Renoverse gets. If the user wants a more pronounced glass feel, we'd need to lift the noise/pattern *over* the button or push the tint opacity up to `.16` baseline.
2. **Cream tint over the cream Story / Home / Lab pages** — `rgba(242,234,216,.08)` on a `#f8f6f0` background is invisible; the button reduces to "accent border only" on cream-bg pages. That's acceptable (the border + corners are the dominant chrome anyway) but the user should know — this is what makes the design self-consistent rather than a regression. Mitigation: if it reads thin, swap the tint to `rgba(0,0,0,.04)` on light-bg pages by gating on the page's text color, but this complicates the recipe.
3. **Campus override** — Removing the `bg-foreground/20 hover:bg-foreground/30` override might make CTAs feel weaker against the dark green Campus background. Impl-time spot-check; revert override locally if needed.
4. **`--btn-accent` plus `text-current` on the corner wrapper** — must remember to wrap the four corner spans in a single `--btn-accent`-colored span, otherwise Mandelbrots inherit button text color (charcoal/cream) instead of the accent. This is the easy thing to miss; covered by a new test.

## Open question (needs user input before impl)

**Navbar frost.** The brief says "Navbar buttons get the frost effect too." The current Fractal Navbar has *zero* `<Button>` instances — it's pure letter-link navigation. Three possible interpretations:

   1. Frost the navbar's outer container itself (mirror Renoverse's `.site-nav.is-scrolled` floating frosted bar). Adds visible chrome to the top of every page once scrolled.
   2. Frost the mobile hamburger menu overlay (currently `bg-background` solid cream).
   3. No change — there are no navbar buttons to frost; acceptance criterion (d) is satisfied by the absence.

   **Recommendation:** option (2) — frost the mobile menu overlay so the new vocabulary shows up in the navbar surface area too — and skip (1) until the user explicitly asks for a floating frosted nav bar (it's a sizable visual change). **Will default to (2) at impl time unless the user wants (1) or (3).**

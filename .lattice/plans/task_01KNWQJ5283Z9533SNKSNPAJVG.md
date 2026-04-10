# FRAC-160 — Per-word Jacquard caps in desktop NavLink

## Problem
The full-state desktop navbar currently renders "Political Club" as just **PC** (both letters in Jacquard 24), introduced by FRAC-126. The user wants the full name back, but with a per-word Jacquard cap treatment, and wants the same treatment applied to "New Liberal Arts" so that the **L** and **A** get the same Jacquard/38px styling the leading **N** already receives.

## Scope
- `src/components/layout/Navbar.tsx` — `NavLink` component only.
- `src/__tests__/navigation.test.tsx` — update the FRAC-126 comment/assertion that asserts desktop shows "PC".

Out of scope:
- Mobile condensed letter row (still `LA` / `PC` — the whole design point is a one-glyph-per-link row, so that stays).
- Mobile overlay menu letter column (still `LA` / `PC`).
- Inner page navbar (uses plain serif, not Jacquard — untouched).

## Approach
Replace the `isPoliticalClub` special case with a general split-by-space renderer:

```tsx
const words = name.split(" ");
return (
  <Link href={href} ...>
    {words.map((word, i) => (
      <Fragment key={i}>
        {i > 0 && <span className="font-serif" style={{ fontSize: "22px", ... }}>{" "}</span>}
        <span style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "38px", lineHeight: 1 }}>
          {word[0]}
        </span>
        <span className="font-serif" style={{ fontSize: "22px", ... }}>
          {word.slice(1)}
        </span>
      </Fragment>
    ))}
  </Link>
);
```

Single-word labels (Story, Campus, Neighborhood, Events, Lab, People) behave identically to before because `split(" ")` returns `[name]`.

## Test updates
- `src/__tests__/navigation.test.tsx` line ~149-158: The test currently notes that desktop NavLink also renders "PC" for Political Club per FRAC-126 and scopes its `.toContain("PC")` / `.toContain("LA")` assertions to the mobile section. After this change, desktop will render the full "Political Club" / "New Liberal Arts" text. The test's mobile-scoped assertions still hold (mobile condensed row still uses `LA` / `PC`), so only the explanatory comment needs updating to reflect that desktop no longer renders the abbreviation.

## Acceptance criteria
- Desktop full navbar on `/` shows "Political Club" with `P` and `C` in Jacquard 24 38px, rest in serif 22px.
- Desktop full navbar on `/` shows "New Liberal Arts" with `N`, `L`, `A` in Jacquard 24 38px, rest in serif 22px.
- Mobile condensed nav letter row on `/` still shows `LA` and `PC`.
- Mobile overlay menu still shows `LA` and `PC` badges next to the full names.
- `src/__tests__/navigation.test.tsx` passes.
- Type-check and build clean.

## PRD check
FRAC-22 PRD: mobile-first, decorative Jacquard branding, eight sections. This change only refines the desktop decorative rendering — zero mobile surface change, eight sections preserved. No PRD conflict.

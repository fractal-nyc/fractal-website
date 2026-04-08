# FRAC-120: Inner-page navbar: remove Campus, Neighborhood, Events, Lab links

## Scope

Remove four links — Campus, Neighborhood, Events, Lab — from the **inner-page navbar variant only**. The home/hero navbar (full and scrolled-compact variants) and the full-screen mobile menu overlay (WebGL `FractalCityScene`) keep all eight links.

## Approach

`src/components/layout/Navbar.tsx` defines a single `sectionLinks` array (lines 12-21) that is consumed by every variant in the file:

- **Full home navbar (desktop):** splits into `leftLinks` / `rightLinks` (line 82-83) — keep all 8.
- **Full home navbar (mobile):** maps `sectionLinks` for the letter row (line 176) — keep all 8.
- **Inner-page header (desktop):** maps `sectionLinks` (line 222) — **filter to remove the 4 links here.**
- **Inner-page header (mobile):** has no link list — only logo + hamburger. No change needed.
- **Compact home scrolled bar:** logo + hamburger only. No change needed.
- **Full-screen menu overlay:** uses `FractalCityScene` WebGL component, independent of `sectionLinks`. No change needed.

The cleanest fix is to introduce a derived constant inside the `Navbar` component (or at module scope) named `innerPageSectionLinks` that filters `sectionLinks` to exclude the four removed links, and use it in the desktop inner-page nav at line 222.

## Files

- `src/components/layout/Navbar.tsx` — sole edit.

## Acceptance criteria

1. On any inner page (e.g., `/story`, `/protocol`, `/people`) at desktop width (>=768px), the navbar shows only: Story, New Liberal Arts, Political Club, People. Campus, Neighborhood, Events, Lab no longer appear.
2. On the home page at all widths, all 8 section letters/links still appear in the full navbar.
3. The mobile inner-page header is unchanged (logo + hamburger only).
4. The full-screen overlay menu (hamburger) still routes to all 8 sections.
5. `npm run build` passes.
6. Mobile-first verified at 375px: inner pages show no inline nav links (mobile inner header has none anyway), hamburger overlay still gives access to all sections.

## Notes

- Removing the four houses from the inner nav is a wayfinding decision: the inner pages funnel users back via logo / overlay, not the inline nav. The home page remains the canonical full-house entry point.
- No test files reference the removed links inline; nothing to update beyond the component.

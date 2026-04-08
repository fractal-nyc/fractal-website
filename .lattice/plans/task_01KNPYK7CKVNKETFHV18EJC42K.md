# FRAC-121: Inner-page navbar — hide all section links

Trivial follow-up to FRAC-120 (#87). Add Story, New Liberal Arts, Political Club, and People to the existing `innerPageHiddenLinks` set in `src/components/layout/Navbar.tsx`. Inner page navbar will then have zero section links; home and overlay menu unchanged.

## Acceptance
- Inner section pages render with no section links in the navbar.
- Home page navbar still shows all 8 section links.
- Full-screen overlay menu still shows all 8.
- Build passes.

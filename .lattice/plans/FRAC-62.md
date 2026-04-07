# FRAC-62: UX Fixes

## 1. Scroll to top on navigation
Add a ScrollToTop component using wouter's useLocation to scroll to top on route change.

## 2. Simplify navbar
Strip desktop navbar to match mobile: "Fractal" on left, hamburger menu on right. Remove blurbs, navigation links from header bar. Keep mobile overlay menu with all section links.

## 3. Remove gray text
Replace `text-muted-foreground` and `text-foreground/XX` opacity classes on page content with `text-white` or full `text-foreground`. Only touch page-level components, not UI library components.

## 4. Fix white space at top
CampusPage and LiberalArtsPage show default bg-background in the pt-32 gap. Move background color to the main element.

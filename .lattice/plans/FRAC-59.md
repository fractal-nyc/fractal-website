# FRAC-59: Make hero search bar functional

## Approach
Replace the static `<span>` search bar in Hero.tsx with a real `<input>` that shows a dropdown of navigable pages, filters on type, and navigates on select/enter using wouter's `useLocation`.

## Pages
Story (/story), Campus (/campus), Neighborhood (/neighborhood), Events (/events), New Liberal Arts (/new-liberal-arts), Political Club (/political-club), Lab (/lab), People (/people), The Protocol (/the-protocol)

## Key decisions
- Fuzzy match = case-insensitive substring match on page name
- Dropdown appears on focus (all pages), filters on type
- Arrow keys + Enter for keyboard nav, click for mouse
- Click outside or Escape closes dropdown
- Mobile-first: works at 375px, dropdown doesn't overflow viewport

## Acceptance criteria
- Input styled to match current look (mono, small, uppercase, tracking-widest, border)
- Dropdown shows filtered pages on type
- Navigation works via click or Enter
- Build passes

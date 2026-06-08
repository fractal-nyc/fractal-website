# FRAC-33: A11y pass — hero combobox, octahedron keyboard nav, muted contrast

## Plan

### Part A — Hero search combobox semantics
src/components/sections/Hero.tsx renders the search results dropdown as `<li role="option">` items with mouse handlers. No combobox/listbox relationship to the input. Keyboard + screen-reader users don't get the same affordance as pointer users.

Fix:
1. Add unique ids: `const listboxId = useId(); const optionId = (i) => \`\${listboxId}-opt-\${i}\``
2. Input: `role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listboxId} aria-activedescendant={focusedIndex >= 0 ? optionId(focusedIndex) : undefined}`
3. `<ul role="listbox" id={listboxId}>` wrapping the results
4. Each `<li role="option" id={optionId(i)} aria-selected={i === focusedIndex}>`
5. Add `focusedIndex` state; arrow Up/Down updates it; Enter activates; Escape closes
6. Visual ring on the focused option

### Part B — Octahedron keyboard nav
src/components/three/OctahedronHero.tsx — tooltips are clickable `<div>`s; meshes are pointer-only. Hero nav not keyboard accessible.

Easier of the two options: keep the 3D as-is for pointer users, add a visually-hidden but focusable list of nav links beside the canvas. Approach:
1. After the `<Canvas>`, render a `<nav aria-label="Hero navigation" className="sr-only-focusable">` with one `<a>` per visible NAV_NODE.
2. Use a Tailwind/CSS pattern that hides from sighted users until focused, then becomes visible (`sr-only focus-within:not-sr-only` or a custom rule).
3. Each `<a>` links to the node's route. Keyboard users Tab through and Enter to navigate.

### Part C — Muted-foreground contrast
src/index.css `--muted-foreground: 0 0% 40%` (~#666) on #f8f6f0 cream = ~4.0:1 — below AA 4.5:1. The body noise SVG erodes it further. Hero search placeholder `text-foreground/40` = ~2:1, fails AA.

Fix:
1. Raise `--muted-foreground` from `0 0% 40%` to `0 0% 32%` (≈ 5.5:1 on #f8f6f0 cream — verify with a contrast tool if possible, but 32% is conservative).
2. For Hero search placeholder: use `text-foreground/60` instead of `text-foreground/40` (≈ 3.3:1, passes AA Large).
3. Don't change the heading or body styles — they use `--foreground` directly which is already AAA-passing.

## Verify
- Build passes
- Tests match baseline
- Manual: Tab through Hero page → hero search reachable + arrow keys cycle results
- Manual: Tab continues to octahedron skip-nav → links visible + Enter navigates
- Visual: muted text slightly darker but still feels editorial

## Acceptance
- Hero search has combobox role + listbox + arrow nav
- Octahedron has skip-nav fallback for keyboard
- --muted-foreground meets WCAG AA 4.5:1 on cream
- Hero search placeholder meets WCAG AA Large 3:1
- Build + tests pass

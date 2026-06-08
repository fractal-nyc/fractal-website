# FRAC-46: Normalize 4 raw #1a1a1a literals to --foreground

## Scope

Replace the four raw `#1a1a1a` charcoal literals in the codebase with token-backed references to `--foreground` (`#171717`), per DESIGN.md decision #6 ("charcoal drift note") and the FRAC-19 design-decisions doc. The visible result is imperceptible (~1% lightness shift); the value is conformance — DESIGN.md explicitly names raw `#1a1a1a` as a "Don't," and these are the four sites that still use it. The canonical charcoal is `colors.foreground = #171717`, defined as `--foreground: 0 0% 9%` in `src/index.css`.

All four sites are JS/JSX inline-style contexts (passed as string args to a function that builds `CSSProperties`, or used as `style.color`), so the replacement form is `hsl(var(--foreground))` rather than a Tailwind utility.

## Sites to edit

### 1. `src/components/three/OctahedronHero.tsx:584`
```tsx
// Before
<div style={tooltipStyle("#1a1a1a")}>The Protocol</div>
// After
<div style={tooltipStyle("hsl(var(--foreground))")}>The Protocol</div>
```

### 2. `src/components/three/OctahedronHero.tsx:801`
```tsx
// Before (inside tooltipStyle)
color: "#1a1a1a",
// After
color: "hsl(var(--foreground))",
```

### 3. `src/components/house/HouseBanner.tsx:96`
```tsx
// Before
const letterColor = pair?.letter ?? (isDark(house.color) ? "#ffffff" : "#1a1a1a");
// After
const letterColor = pair?.letter ?? (isDark(house.color) ? "#ffffff" : "hsl(var(--foreground))");
```

### 4. `src/components/house/HouseBanner.tsx:97`
```tsx
// Before
const textColor = isDark(bgColor) ? "#ffffff" : "#1a1a1a";
// After
const textColor = isDark(bgColor) ? "#ffffff" : "hsl(var(--foreground))";
```

`#1a1a1a` (luminance 0.102) and canonical `#171717` (luminance 0.090) both classify as dark via `isDark()`, so the fallback branch's behavior is unchanged.

## Out of scope

- Charcoal drift other than these 4 sites (verified: no other `#1a1a1a` in repo).
- Lab purple removal (FRAC-34).
- The `--background` cream-math precision divergence (separate ticket if desired).

## Approach

Mechanical four-spot string replacement. No new imports, no type changes. The CSS variable `--foreground: 0 0% 9%` is already defined in `src/index.css:47`; `hsl(var(--foreground))` materializes it in any CSS-color-accepting context. Edit order does not matter.

## Acceptance criteria

1. `grep -ri "#1a1a1a" src/` returns zero hits.
2. Build passes (`pnpm build` or `npm run build`).
3. Test suite passes (no new failures vs. baseline 141 pass / 4 known-fail).
4. Visual sanity check at 375px viewport: The Protocol tooltip in OctahedronHero hovers with the same charcoal border + text; HouseBanner instances render correctly per-house.
5. Git diff touches exactly 2 files and exactly 4 lines.

## Branch name

`frac-46-charcoal-normalize`

## Critical files

- `/Users/fractalos/Dev/fractal-nyc/src/components/three/OctahedronHero.tsx`
- `/Users/fractalos/Dev/fractal-nyc/src/components/house/HouseBanner.tsx`
- `/Users/fractalos/Dev/fractal-nyc/src/index.css` (reference — defines `--foreground`)
- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` (reference — decision #6)

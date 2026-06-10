# FRAC-180: Add favicon — hand-authored SVG octahedron silhouette

## Problem

`index.html` ships zero favicon markup (no `<link rel="icon">`, no apple-touch-icon, no manifest). The site has nothing in `/public/favicon.*` either, so a request for `/favicon.ico` falls through Vite's SPA fallback and returns the React `index.html` — every browser tab shows the blank/globe default. This is visible in Chrome's tab strip, in bookmarks, in iOS "Add to Home Screen", and in search results.

## Goal

Ship a hand-authored SVG octahedron silhouette that:
1. Is unmistakably the brand mark (the same shape that anchors `OctahedronHero`).
2. Uses Fractal house colors — not invented hexes.
3. Reads at 16×16 (the size browsers actually paint in the tab strip on a 1× display).
4. Has fallbacks for the (shrinking) set of clients that don't render SVG favicons.

## Visual design

### Geometry — what to draw

`OctahedronHero` sits axis-aligned at the origin: vertices at ±X, ±Y, ±Z. The auto-rotation is Y-only and the camera looks roughly down +Z, so the canonical brand silhouette is a **diamond viewed straight-on**: a square rotated 45°, with the top and bottom vertices being the +Y / -Y poles. From front-of-camera the viewer sees four triangular faces meeting at center (where the +Z vertex projects onto the center of the diamond).

Render the favicon as **the front-facing diamond split into 4 triangular faces** by drawing the two diagonals (vertical pole-to-pole + horizontal equator). This:
- Reads as an octahedron, not a plain diamond/rhombus.
- Mirrors the OctahedronHero's per-face coloring (the hero shows 8 faces with per-section colors; the favicon shows 4 front-facing ones).
- Is the simplest construction that still reads as 3D at 16×16.

### Color mapping

The hero's 4 front-facing faces (viewer's perspective) map to four house keys. Pick a deterministic 4-color set from the canonical house palettes in `src/data/houses.ts`:

| Face position | House (id) | Hex |
|---|---|---|
| Top-left | `events` (deep) | `#C13B2A` (warm red — anchor) |
| Top-right | `school` (light) | `#C41E20` (education red — sits well next to events) |
| Bottom-left | `campus` (light) | `#2E6B4A` (campus green — contrast) |
| Bottom-right | `lab` (light) | `#E870A0` (publications pink — highlight) |

Rationale: these four hexes span the full brand range (warm reds + green + pink), all are saturated enough to be distinguishable at small sizes, and all three reds-and-pink read warm to balance the single green. Skip `neighborhood` (`#889460` — too desaturated, will mud out at 16×16), `forum` (`#C83858` — already represented by similar reds/pinks), and `Story` (`#D4BA58` — yellow goes muddy at small sizes against a cream background).

### Stroke

Draw thin charcoal outlines (`#171717`, `--foreground`) on the diamond perimeter and the two interior diagonals. Stroke width: `~1.5` in a 32-unit viewBox so it survives downscaling without becoming a hairline. This:
- Defines the silhouette against light AND dark browser chrome (Safari can dark-mode the tab strip).
- Matches the editorial / hand-drawn feel of DESIGN.md (charcoal-on-cream is the project's foundation).
- Makes the 4-color split legible — without the diagonals the four colored triangles blur into one polygon at 16×16.

### Background

The SVG should be transparent (no rect fill). The diamond does not fill the full viewBox — leave ~2 units of padding on all sides of a 32-unit viewBox so the points don't get clipped by browsers that crop favicons to a rounded square (Safari pinned tabs, iOS).

## Files to create

All paths under `/public/` (Vite copies `public/*` verbatim to the site root):

1. **`public/favicon.svg`** — primary, hand-authored. ~32×32 viewBox. Modern Chrome / Firefox / Edge / Safari use this.
2. **`public/favicon.ico`** — legacy fallback for the literal `/favicon.ico` request that some clients still make without consulting `<link rel="icon">`. Multi-resolution ICO containing 16×16 + 32×32 + 48×48.
3. **`public/apple-touch-icon.png`** — 180×180 PNG. iOS uses this when the user adds the site to their home screen. Without it iOS screenshots the page and rasterizes — looks terrible.
4. **`public/favicon-32.png`** + **`public/favicon-16.png`** — explicit PNG fallbacks referenced from `<link>` tags, for older browsers that ignore SVG favicons.

**Skip the web app manifest.** This task is favicon-only; a `site.webmanifest` belongs to a separate PWA-icon task if/when one exists.

## How to author each asset

### `favicon.svg` (hand-author)

Write the SVG directly — no build pipeline, no rasterization, no asset pipeline. Structure:

```
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- 4 triangle faces of the front-facing diamond -->
  <polygon points="16,3  16,16  3,16"  fill="#C13B2A"/>  <!-- top-left, events deep -->
  <polygon points="16,3  29,16  16,16" fill="#C41E20"/>  <!-- top-right, school light -->
  <polygon points="3,16  16,16  16,29" fill="#2E6B4A"/>  <!-- bottom-left, campus light -->
  <polygon points="16,16 29,16  16,29" fill="#E870A0"/>  <!-- bottom-right, lab light -->
  <!-- charcoal outline: diamond perimeter + 2 diagonals -->
  <path d="M16 3 L29 16 L16 29 L3 16 Z M3 16 L29 16 M16 3 L16 29"
        stroke="#171717" stroke-width="1.5"
        stroke-linejoin="round" stroke-linecap="round"
        fill="none"/>
</svg>
```

Point coordinates use integer steps inside a 32-unit viewBox so the diagonals are pixel-aligned at 32×32 and crisp at 16×16. The four polygons sum exactly to the diamond — no gaps, no overlap. The single `<path>` for the outline avoids 5 separate `<line>` elements.

### `favicon.ico` + the two `favicon-*.png` files

Rasterize the SVG with a one-off Node script that uses `sharp` (already a transitive dep candidate but currently NOT in `package.json` — confirmed). The implementer will:

1. `pnpm add -D sharp png-to-ico` (devDeps only — never shipped to the browser).
2. Author a tiny script (e.g. `scripts/build-favicon.mjs`) that:
   - Reads `public/favicon.svg`.
   - Uses `sharp(svgBuffer).resize(N).png().toBuffer()` for N ∈ {16, 32, 48, 180}.
   - Writes `public/favicon-16.png`, `public/favicon-32.png`, `public/apple-touch-icon.png` (the 180).
   - Uses `png-to-ico` to pack [16, 32, 48] PNGs into `public/favicon.ico`.
3. Runs the script ONCE locally (`node scripts/build-favicon.mjs`) and commits the resulting binaries. Do NOT wire it into `pnpm build` — the SVG is the source of truth, rasters are committed artifacts. A script in `package.json` like `"build:favicon": "node scripts/build-favicon.mjs"` is fine for future re-runs but should not run on every CI build.

Why commit the rasters: they change ~never (only when the SVG changes), and committing them means the production build has zero new build-time deps and zero new failure modes.

### Alternative if `sharp` install fails on the implementer's platform

Skip the PNG/ICO generation entirely; ship SVG-only. Caniuse coverage for `<link rel="icon" href="*.svg">` is >97% (all modern Chrome / Firefox / Safari / Edge). The only real losses are:
- IE11 and very old Android browsers — not in the target audience.
- The bare `/favicon.ico` legacy request from a few RSS readers and old crawlers — they'll see a 404 (not a SPA HTML response — see note below), which is benign.

Decision: ship PNG/ICO fallbacks if `sharp` installs cleanly; if it doesn't, ship SVG-only and document the choice in the PR. Don't block the task on tooling.

### Stop the SPA-HTML-on-/favicon.ico bug regardless

Currently `GET /favicon.ico` returns `text/html` (the SPA fallback). This is wrong even if we ship SVG-only — clients that auto-request `/favicon.ico` get HTML, log a console warning, and may cache it. The implementer must confirm one of:
- Shipping `public/favicon.ico` makes the request return the real ICO (Vite serves `public/` before SPA fallback — verified by reading the existing `public/opengraph.jpg` works at `/opengraph.jpg`).
- If only SVG ships, the implementer must verify Vite returns a true 404 (not the SPA HTML) for the missing `/favicon.ico`. If it returns HTML, ship a 1-byte placeholder ICO or configure the dev server to 404 it.

## `index.html` changes

Insert these four `<link>` tags inside the existing `<head>`, immediately after the `<title>Fractal NYC</title>` line and before the Google Fonts preconnect:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

Order matters: browsers pick the FIRST `<link rel="icon">` they understand. SVG first → modern browsers stop there. PNG fallbacks → older browsers walk down. The legacy `/favicon.ico` request needs no tag — browsers fetch it implicitly from the site root.

If shipping SVG-only (sharp didn't install): include only the `image/svg+xml` line. Drop the PNG and apple-touch-icon lines.

## Acceptance criteria

1. **Tab strip rendering**: `pnpm dev`, open in Chrome / Safari / Firefox. The Fractal octahedron diamond appears in the tab strip. Re-check at the browser's actual rendered size (typically 16×16 on a 1× display, 32×32 on Retina) — the 4-color split and the charcoal outlines must be visible, the silhouette must read as a diamond not a smear.
2. **`/favicon.ico` no longer returns SPA HTML**: `curl -sI http://localhost:5173/favicon.ico` returns `Content-Type: image/x-icon` (or `image/vnd.microsoft.icon`) and a 200, OR a 404 — but NOT `text/html`.
3. **`/favicon.svg` serves**: `curl http://localhost:5173/favicon.svg` returns the SVG body with `Content-Type: image/svg+xml`.
4. **Apple touch icon when shipped**: On an iOS device or iOS simulator, "Add to Home Screen" produces a 180×180 icon showing the octahedron — not a screenshot of the page.
5. **Recognizability at 16×16**: zoom the favicon to 16×16 in a browser tab and confirm the octahedron silhouette is identifiable. If the 4 colors mud out, fall back to a single-color silhouette: drop the 4 polygons, use a single `<polygon>` filled with `#171717` (charcoal) for the diamond + a single light-color stroke for the diagonals. The implementer should make the call after eyeballing both renders.
6. **No regression**: `pnpm typecheck` and `pnpm test` still pass. `pnpm build` succeeds and `dist/favicon.svg` exists in the build output.

## Out of scope

- Redesigning the OctahedronHero or any change to the hero scene.
- Brand-palette changes (use the existing hexes verbatim from `src/data/houses.ts`).
- A web app manifest / PWA install prompt / installable site — separate task.
- Animating the favicon, tab-attention pulses, unread-count badges — separate task.
- Updating `public/opengraph.jpg` — separate concern (social previews ≠ favicon).
- Dark-mode-aware favicon via `prefers-color-scheme` media query inside the SVG — possible (Safari supports it), but the project has no dark mode (DESIGN.md), so the SVG can assume light browser chrome.

## Critical files

- `/Users/fractalos/Dev/fractal-nyc/public/favicon.svg` — NEW, hand-authored.
- `/Users/fractalos/Dev/fractal-nyc/public/favicon.ico` — NEW, generated from SVG.
- `/Users/fractalos/Dev/fractal-nyc/public/apple-touch-icon.png` — NEW, generated from SVG.
- `/Users/fractalos/Dev/fractal-nyc/index.html` — add 4 `<link>` tags.
- `/Users/fractalos/Dev/fractal-nyc/src/data/houses.ts` — read-only reference for the canonical house palette hexes used in the SVG.

## Branch / PR

- Branch: `frac-180-favicon-octahedron`
- PR title: "FRAC-180: ship octahedron favicon (SVG + raster fallbacks)"

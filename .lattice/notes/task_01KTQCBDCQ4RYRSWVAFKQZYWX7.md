# FRAC-178 — Working notes

## Baseline (from user screenshot, iPhone viewport 375px, 3G throttle, DPR 3)

- 29 requests, 3.4 MB transferred, 5.5 MB resources
- **DOMContentLoaded: 13.30 s**
- **Load: 1.2 min**

## Worst offenders (ranked by impact)

| Resource | Size | Load time | Notes |
|---|---|---|---|
| `skyline4.png` | **1,404 kB** | **~60 s** | Single largest asset. Background skyline silhouette. Almost certainly compressible to <200 KB as WebP/AVIF. |
| `three-vendor-*.js` | 233 kB | 36.3 s | Three.js ships in critical path. Lazy-load → defer until after first paint. |
| `index-*.js` | 138 kB | 9.3 s | App bundle. Includes OctahedronHero (900 LOC). |
| 8 banner JPEGs | ~1.0 MB combined | 20–38 s each | story, campus, neighborhood, events, new-liberal-arts, political-club, lab, people. All loaded eagerly by `three-vendor` (octahedron face textures). |
| Fraunces font weights (5 files) | 246 kB combined | 3–23 s each | Multiple weights, italics. Audit which are actually used above-the-fold. |
| `react-vendor-*.js` | 59 kB | 18.9 s | Acceptable. |

## Observations

- **`hero-poster.jpg` returns text/html, 200, 0.9 kB** → file does not exist; SPA fallback returning index.html. Either we wired a placeholder src that doesn't exist, or removed the asset. Need to investigate.
- **`favicon.ico` returns text/html, 200, 1.4 kB** → confirms FRAC-180 (no favicon).
- The 8 banner JPEGs are loaded by `three-vendor` (the WebGL bundle), confirming they are the octahedron face textures from FRAC-117.

## Reshaped scope for FRAC-178

The original framing ("lazy-load WebGL") was too narrow. The screenshot proves the real wins are:

1. **Compress `skyline4.png` aggressively** (1.4 MB → ~150 KB target via AVIF/WebP + responsive sizes). Single biggest win — saves 1.25 MB and ~58 s on 3G. Likely worth its own task.
2. **Lazy-load three + OctahedronHero** behind a lightweight placeholder. Saves 233 kB + 8 face textures (~1 MB) from critical path.
3. **Audit Fraunces weights** — drop unused weights/italics.
4. **Resolve `hero-poster.jpg` 404** — it's referenced somewhere but doesn't exist.
5. **Generate responsive image variants** for face textures (mobile doesn't need full-size).

## Suggested split

This is bigger than one task. Recommend:
- FRAC-178 stays as the WebGL lazy-load.
- **NEW**: "Compress skyline4.png + hero background to mobile-appropriate sizes."
- **NEW**: "Resolve hero-poster.jpg 404."
- **NEW**: "Audit & trim Fraunces font weights loaded on home."
- FRAC-179 (new octahedron photos) should include responsive variants from the start.

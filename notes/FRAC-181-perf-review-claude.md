# Home-Page Performance Audit — fractal-nyc

**Author:** Staff engineer (brought in to fix first-paint)
**Date:** 2026-06-09
**Method:** Read of the full home load path + a clean `pnpm run build` on `master` (commit `0bb3ddb`). All byte/gzip numbers below are from that build's Rollup output and `dist/`. Network waterfall numbers are reasoned estimates (the audit sandbox has no egress); they're flagged as estimates where used.

---

## TL;DR for the founders

The FRAC-178 "lazy-load the WebGL hero" change **did not actually remove the 3D engine from the first-paint download.** It deferred *execution* but a sibling optimization (FRAC-146/147) still **preloads the entire 902 KB three.js bundle at high priority on the very first paint.** So every phone visitor downloads **~242 KB gzip of three.js before the hero text or fonts can win bandwidth** — exactly the "huge loading time" the user reports. Two prior tasks are fighting each other and the user is feeling the loser.

On top of that, the entry chunk is **440 KB / 144 KB gzip** because *every page on the site* is statically imported into the home bundle, and the Google Fonts request is the **largest possible Fraunces payload, loaded through a render-blocking `@import` chain.**

Total JS forced onto the first paint today: **~449 KB gzip** (entry + react-vendor + three-vendor + helpers), plus ~22 KB CSS, plus the full variable-font set, plus images. The achievable number for the above-the-fold home view is closer to **~110–130 KB gzip JS.**

### Build output (evidence baseline)

| Chunk | Raw | Gzip | Preloaded on first paint? |
|---|---:|---:|---|
| `index` (entry) | 440.6 KB | **144.2 KB** | yes (entry script) |
| `three-vendor` | 902.5 KB | **242.5 KB** | **yes — modulepreload + `_headers` Link** |
| `react-vendor` | 191.4 KB | 60.7 KB | yes |
| `FractalCityScene` | 1.6 KB | 0.9 KB | yes (modulepreload + Link) |
| `vite-preload-helper` | 1.1 KB | 0.7 KB | yes |
| `index.css` | 139.6 KB | 22.2 KB | yes (render-blocking) |

Rollup itself printed: *"Some chunks are larger than 500 kB after minification."*

---

## Quick wins (< 30 min each, each > 200 ms on a mid-tier phone)

1. **Stop preloading `three-vendor` + `FractalCityScene`.** (Finding C1) Delete the scene chunk from the modulepreload/`_headers` walk, or downgrade to `rel=prefetch`. Removes **242 KB gzip** from first-paint network contention. *Single biggest win in this report.*
2. **Delete the dead `hero-poster.jpg` preload.** (H1) `dist/_headers` ships `Link: </images/hero-poster.jpg>; rel=preload; as=image` — that file no longer exists (404). One wasted request + RTT + a Lighthouse penalty, on every visit.
3. **Move the font `@import` out of `index.css` into a `<link>` in `index.html`.** (H2) Removes a request *chain* (CSS-download → CSS-parse → discover-font-CSS → font-download). Saves an estimated 200–500 ms to first text paint by itself.
4. **Trim the Fraunces axes.** (H2) You currently ship the full variable font on *two* axes (italic + roman) across `opsz 9..144, wght 100..900` — the heaviest Fraunces configuration Google serves.

A bigger, ~1–2 hr win that doesn't fit "quick" but dwarfs the rest: **lazy-load the routes** (C2) — drops the entry chunk from 144 KB → an estimated ~60–80 KB gzip.

---

## CRITICAL

### C1 — The 3D engine is still fully downloaded on first paint; the lazy-load is cosmetic

**Severity:** critical
**Where:** `vite.config.ts:39–186` (the `injectModulePreload` plugin), output proof in `dist/index.html` and `dist/_headers`; `src/components/sections/Hero.tsx:11–15,152–154`.

**Evidence.** `lazy(() => import("FractalCityScene"))` defers *when React executes* the scene — it does **not** defer the network fetch, because the `injectModulePreload` plugin deliberately walks the `FractalCityScene` dynamic chunk and its transitive `three-vendor` dep and emits preload hints for both. The built artifacts confirm it:

```
# dist/index.html
<link rel="modulepreload" crossorigin href="/assets/FractalCityScene-TY3pDMTb.js">
<link rel="modulepreload" crossorigin href="/assets/three-vendor-BxKCJI7m.js">   ← 902 KB / 242 KB gzip

# dist/_headers
Link: </assets/three-vendor-BxKCJI7m.js>; rel=preload; as=script; crossorigin     ← High priority
Link: </assets/FractalCityScene-TY3pDMTb.js>; rel=preload; as=script; crossorigin
```

`modulepreload` and `rel=preload; as=script` both fetch at **High** priority — they compete directly with the entry JS, the CSS, the fonts, and the hero image for the phone's first few hundred KB of bandwidth. The git history makes the conflict explicit:

- `5a148cd FRAC-146` / FRAC-147 *added* the preload of the scene + three-vendor "so the browser starts fetching chunks during HTML parse."
- `62c9b9c FRAC-178: lazy-load WebGL — drop three-vendor … from the critical path` *intended the opposite.*

FRAC-178's commit message says three-vendor was dropped from the critical path. **The build proves it wasn't.** FRAC-146 still wins at the network layer. This is the root cause of the reported "huge loading time": ~242 KB gzip of three.js, plus the work of decompressing/parsing ~900 KB of JS, lands in the critical window even though nothing on the first screen needs it.

**Recommendation.** Decide what the hero canvas is: it is **below the fold of attention** (a decorative, interactive octahedron) and should not block or compete with first paint.

1. Remove the scene + three-vendor from the eager preload. In `vite.config.ts`, stop seeding the walk from the `FractalCityScene` dynamic entry (delete the `sceneKey` block, `vite.config.ts:80–85`) so only the genuine entry-static graph is preloaded.
2. If you want a warm cache without first-paint contention, emit those two as `rel=prefetch` (Lowest priority, idle-time) instead of `preload`/`modulepreload` — change the `_headers` emit at `vite.config.ts:167–168` to `rel=prefetch` for the scene/three files and drop them from the HTML modulepreload injection.
3. Then actually defer the mount: wrap the `<Suspense><FractalCityScene/></Suspense>` so it mounts on `requestIdleCallback` (or an `IntersectionObserver` on the hero) *after* FCP, rather than synchronously on Hero mount (`Hero.tsx:152`). The lazy import will fetch on demand at that point.

**Estimated win.** Removes **242 KB gzip** (≈900 KB transfer-decompress-parse) from the first-paint contention window. On a mid-tier Android over real-world 4G (~4–6 Mbps effective, one slow RTT), expect **~0.6–1.5 s** earlier FCP/LCP and a large drop in main-thread blocking during load. This alone likely resolves the user's complaint.

---

### C2 — Every route is statically imported into the home entry chunk

**Severity:** critical
**Where:** `src/App.tsx:6–18` (twelve eager `import` statements), `src/main.tsx:1–5`.

**Evidence.** `App.tsx` imports `Home, ProtocolPage, NeighborhoodPage, EventsPage, CampusPage, LiberalArtsPage, PoliticalClubPage, LabPage, StoryPage, PeoplePage, BadgePlayground, NotFound` at module scope. None are `React.lazy`. So the home entry chunk contains the code and content for the entire site. Grepping the built entry chunk confirms non-home code is present:

```
$ grep -oE "the-protocol|new-liberal-arts|Merlin|scenius" dist/assets/index-DxuSIhum.js | sort | uniq -c
   4 the-protocol      ← ProtocolPage route
  11 new-liberal-arts  ← LiberalArtsPage
   6 Merlin            ← Campus.tsx (745 lines) content
   3 scenius           ← Home copy (legit)
```

Pulled needlessly into the home download: `Campus.tsx` (745 lines), `LabPage` + `lab-documents.ts` (601 lines of document data), `StoryPage`, `PeoplePage`, `ProtocolPage`, `BadgePlayground`, plus their transitive libs. The global-search hook compounds this: `src/hooks/use-global-search.ts:1–4` eagerly imports `LAB_DOCUMENTS` (601 lines) and `HOUSES`/`PEOPLE` to build a search index **on the home hero**, so that dataset is in the entry whether or not the user ever searches.

**Recommendation.** Convert every non-home route to `React.lazy` + a `<Suspense>` boundary in `Router()`:

```tsx
const ProtocolPage = lazy(() => import("@/pages/ProtocolPage").then(m => ({default: m.ProtocolPage})));
// …same for the other 9 pages; keep Home eager.
```

Wrap `<Switch>` in `<Suspense fallback={null}>`. Optionally lazy-import `LAB_DOCUMENTS` inside `use-global-search` on first keystroke rather than at module load.

**Estimated win.** The entry chunk should fall from **144 KB → ~60–80 KB gzip** (home-only code + wouter + the small shared shell). Net **~65–85 KB gzip** off the critical path, ~**300–600 ms** less download+parse on a phone. Route navigations then pay their own (cached, parallel-preloadable) cost.

---

## HIGH

### H1 — `_headers` preloads a hero poster that no longer exists; the *real* hero image isn't preloaded

**Severity:** high
**Where:** `vite.config.ts:170–179` → emitted to `dist/_headers`; `src/components/sections/Hero.tsx:299–333`.

**Evidence.** The plugin hardcodes:

```
Link: </images/hero-poster.jpg>; rel=preload; as=image
```

`hero-poster.jpg` is gone from `public/images/` (FRAC-122 removed the poster JPEG, FRAC-178 removed the `<img>`); it survives only in stale agent worktrees. So this preload **404s on every page load** — a wasted connection + RTT, and Lighthouse will flag "preloaded resource was not used."

Meanwhile the actual above-the-fold hero is a responsive `<picture>` (`Hero.tsx:301–333`) pointing at `images/hero/fractal-background-*.avif|webp`, and **none of those are preloaded.** (It renders at `opacity: 0.15`, so it's likely *not* the LCP element — the LCP is probably hero text or the cream background — which is the one saving grace, but the dead preload is pure waste regardless.)

**Recommendation.** Delete the `imageLink` line (`vite.config.ts:178`) and its concatenation at `:179`. Do **not** blindly re-point it at the AVIF: because the image is decorative (15% opacity) and behind a `<picture>` with `srcset`, a static preload would likely fetch the wrong width and isn't worth it. If profiling later shows the background *is* the LCP, add a correctly-`imagesrcset`'d preload instead.

**Estimated win.** Eliminates one wasted request + RTT (~50–150 ms of a connection slot on a phone) and removes a Lighthouse penalty. Zero risk.

---

### H2 — Fonts: maximal Fraunces payload, loaded through a render-blocking `@import` chain

**Severity:** high
**Where:** `src/index.css:1` (the `@import url(...)`), `index.html:11–12` (preconnects).

**Evidence.** The single font request is:

```
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600;700&family=Jacquard+24&family=JetBrains+Mono:wght@100;200;300;400;500;600;700&display=swap');
```

Two compounding problems:

1. **It's an `@import` inside the bundled CSS, not a `<link>`.** The browser must (a) download `index.css` (22 KB gzip), (b) parse it, (c) *then* discover the font CSS URL, (d) fetch the font CSS, (e) *then* fetch the woff2s. That's a serialized 3-hop chain on the critical path. The `<link rel="preconnect">` in `index.html` warms the TLS connection but cannot un-serialize the discovery — the font CSS isn't referenced until the main CSS is parsed.
2. **Fraunces is requested in its heaviest possible form:** *both* `ital` and roman (`0,…;1,…`), full optical-size axis `9..144`, full weight axis `100..900`. Google serves italic and roman as separate variable woff2 files, each spanning the whole weight+opsz range — this is the largest Fraunces download configuration that exists. Add Inter (5 weights), JetBrains Mono (**7** weights), and Jacquard 24, and the font set is a major share of first-paint bytes. `display=swap` is correctly set (good — avoids FOIT), so this is a *bandwidth/contention* problem, not a blocking-paint one.

**Jacquard 24** (the decorative blackletter): it *is* used — `Navbar.tsx` (drop-caps), `Footer.tsx:68`, `SectorHeader.tsx`, `HouseBanner.tsx`. But on the **home** screen it's only needed for the Navbar word-caps, which are below the immediate hero focal point. It is **not** base64-inlined anywhere (checked) — good. It should still be deferred, not raced against the hero.

**Recommendation.**
1. Move the font load to a `<link rel="stylesheet">` (or split into a preloaded font-CSS + `<link>`) in `index.html`'s `<head>`, removing it from `index.css:1`. Kills the chain.
2. Cut Fraunces to what's actually rendered. The type scale (`index.css:186–235`) uses Fraunces at weights ~300/350/400 in normal + italic. Drop the optical-size range to a pinned value or a narrow band, and cap weights (e.g. `wght@300..500` instead of `100..900`). Keep italic only if `.text-title` (italic) is above the fold — it is used on inner pages, so request italic but narrow its weight band too.
3. Trim **JetBrains Mono** from 7 weights to the used set: `text-control` 400, chrome tier 500, `text-body-display` 100, tooltips 300 → request `100;300;400;500`, drop 200/600/700 unless grep proves otherwise.
4. **Strongly consider self-hosting** subset woff2s (`@font-face` with `font-display: swap`, served from your own immutable-cached origin). That removes the third-party `fonts.gstatic.com` connection entirely and lets the `_headers` immutable caching (below) apply to fonts too.

**Estimated win.** Removing the `@import` chain alone: **~200–500 ms** to first styled text on a phone. Trimming axes/weights: hundreds of KB of font transfer avoided on cold cache. Self-hosting: one fewer cross-origin handshake (~1 RTT, ~100–300 ms on mobile).

---

## MEDIUM

### M3 — `framer-motion` is on the home critical path for two trivial fades

**Severity:** medium
**Where:** `src/components/ui/FadeIn.tsx:1`, `src/components/layout/Navbar.tsx:2`; consumed on home via `Home.tsx` (2× `FadeIn`) and `Navbar` (`useScroll`).

**Evidence.** `framer-motion@12.35.1` (5.4 MB installed) is imported eagerly by `FadeIn` and `Navbar`, both rendered on the home page, so it lands in the entry chunk (`whileInView` appears 6× in the built entry). The home page uses it for: two scroll-triggered opacity/translate fades in the "Golden Age Protocol" section, and a navbar scroll listener. That is a sledgehammer dependency for an effect a few lines of `IntersectionObserver` + a CSS transition would cover.

**Recommendation.** Replace `FadeIn` with a ~15-line `IntersectionObserver` hook toggling a CSS `opacity`/`transform` transition (you already gate on `usePrefersReducedMotion`, so the JS is minimal). Replace `Navbar`'s `useScroll`/`useMotionValueEvent` with a passive `scroll` listener. Then `framer-motion` leaves the home (and likely whole-site) critical path. If other pages genuinely need it, it'll lazy-split with them once C2 lands.

**Estimated win.** Tens of KB gzip out of the entry chunk (framer-motion's core is ~30–40 KB gzip), and it removes a dependency that otherwise re-enters via every animated page.

### M4 — 16 MB of unoptimized PNGs in `public/images`; one is on a one-click-away route

**Severity:** medium
**Where:** `public/images/*.png`; `src/pages/ProtocolPage.tsx:13` (`hero-bg.png`), `src/components/sections/Projects.tsx:8–20`, `Vision.tsx:9`.

**Evidence.**
```
fractal-tech-hub.png  7.1 MB     merlins-place.png    3.5 MB
merlins-coworking.png 2.2 MB     hero-bg.png          1.4 MB
skyline.png           1.4 MB     texture.png          1.15 MB
```
These aren't on the home *first paint*, so this is medium, not critical. But `ProtocolPage` (the center-octahedron's primary tap target, `→ /the-protocol`) loads `hero-bg.png` at **1.4 MB raw PNG** — the very next click after the hero. FRAC-177 already built a clean responsive AVIF/WebP pipeline for the hero background (`scripts/build-hero-bg.mjs`, `public/images/hero/`); these other heroes never got the same treatment.

**Recommendation.** Run the same `sharp`-based responsive AVIF/WebP pipeline over `hero-bg.png`, `fractal-tech-hub.png`, `merlins-place.png`, `merlins-coworking.png`, `skyline.png`, and convert their `<img>` sites to `<picture>` with `srcset` + `loading="lazy"` + `decoding="async"`. Delete `texture.png` if unused above the fold (it's a `Vision.tsx` decorative overlay — verify). A 7 MB → ~150 KB AVIF conversion is routine here.

**Estimated win.** ~15 MB → ~1 MB across the gallery/Projects/Protocol routes; the Protocol tap (one click from hero) goes from a 1.4 MB stall to ~100 KB.

### M5 — `feTurbulence` noise filter painted on `<body>` site-wide

**Severity:** medium
**Where:** `src/index.css:110` (inline SVG `data:` background on `body`).

**Evidence.** `body` carries a `background-image` of an inline SVG running `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3">`. `feTurbulence` is among the most CPU-expensive SVG filter primitives; the browser must run it to rasterize the body background. On low-end phones this adds measurable main-thread paint/raster cost during the first paint and on every resize/repaint of the body box.

**Recommendation.** Pre-rasterize the noise **once** at build time into a small (~4–8 KB) tiling PNG/WebP and reference that as a `repeat` background, instead of asking every client device to compute `feTurbulence` live. Visually identical; near-zero runtime cost.

**Estimated win.** Removes a synchronous filter raster from the first paint — typically tens of ms on mid/low-tier phones, more on the cheapest devices.

### M6 — Octahedron face textures fetched as 8 separate `TextureLoader` requests

**Severity:** medium
**Where:** `src/components/three/OctahedronHero.tsx:379–388, 502–538`.

**Evidence.** When the scene mounts, `usePerFaceMaterials` fires 8 independent `THREE.TextureLoader.loadAsync()` calls for `/images/banners/*.webp`. This is *correctly* decoupled from Suspense (FRAC-127 — good; the canvas paints placeholder colors in frame 0), and it's behind the lazy scene, so it's not first-paint. But once C1 defers the scene to idle, these 8 requests should ride that deferral too (they will, since they mount with the scene). Worth confirming the banner webps are small (they live in `public/images/banners/`, 8 files) and ideally a sprite/atlas or a single KTX2 basis-compressed texture array rather than 8 round-trips.

**Recommendation.** Keep the non-suspending load. As a follow-up, consider a texture atlas (one image, 8 UV regions) or KTX2/Basis compression to cut 8 requests → 1 and shrink GPU upload. Low urgency once C1 lands.

---

## LOW / notes

- **L1 — `maximum-scale=1`** (`index.html:5`) disables pinch-zoom. Accessibility regression, not perf — flagging because a "pristine" mobile site shouldn't trap zoom. Recommend removing `maximum-scale=1`.
- **L2 — No sourcemaps in prod.** Confirmed `dist/` has zero `.map` files. Good — nothing to fix.
- **L3 — CSS is fine.** `index.css` is 139 KB raw / **22 KB gzip**; Tailwind v4 JIT is purging correctly (no evidence of full-utility bloat). Not a priority. It *is* render-blocking by nature; once the above-the-fold view is stable you could inline critical CSS and defer the rest, but the 22 KB gzip cost is not where the pain is.
- **L4 — Preconnects are correct** (`index.html:11–12`): `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin). Keep them; they become moot if you self-host fonts (H2).
- **L5 — No analytics/third-party scripts** on the page. Clean. Nothing to defer there.
- **L6 — No service worker.** Nothing over-eager caching. Fine.

---

## Recommended order of execution (effort → impact)

| # | Finding | Effort | First-paint win (est.) |
|---|---|---|---|
| 1 | C1 — un-preload three-vendor/scene, defer mount to idle | 30–45 min | **242 KB gzip off contention; 0.6–1.5 s** |
| 2 | H1 — delete dead `hero-poster.jpg` preload | 5 min | 1 RTT + Lighthouse fix |
| 3 | H2a — `@import` → `<link>` in head | 15 min | 200–500 ms |
| 4 | H2b — trim Fraunces/JetBrains axes (+ self-host) | 1–3 hr | hundreds of KB font transfer |
| 5 | C2 — lazy-load all non-home routes | 1–2 hr | ~65–85 KB gzip; 300–600 ms |
| 6 | M3 — drop framer-motion from home | 1–2 hr | 30–40 KB gzip |
| 7 | M5 — pre-rasterize noise | 30 min | tens of ms paint |
| 8 | M4 — AVIF the remaining PNGs | 1–2 hr | ~15 MB across next-click routes |

**The first two items are the headline.** They are <1 hr combined and directly answer "why is the home page still slow after FRAC-178": because FRAC-178's own goal was silently reverted by the preload plugin, and a dead-file preload is burning a request on top of it. Do C1 + H1 first, re-measure on a throttled phone profile, then proceed down the list.

---

### One process note for the founders

C1 exists because **two tasks optimized in opposite directions and nobody re-measured the build output.** FRAC-146/147 preloads the scene; FRAC-178 tried to make it lazy; the commit message asserts a win the artifact doesn't deliver. The cheap insurance against repeats: a CI check that fails the build if `three-vendor` appears in `dist/index.html`'s modulepreload tags or in `dist/_headers` as `rel=preload`. Twelve lines of script; it would have caught this the day it shipped.

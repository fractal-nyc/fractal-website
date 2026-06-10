# FRAC-178: Lazy-load WebGL octahedron hero — finish what FRAC-146/147 started, plus fix collateral perf bugs

## TL;DR

The home page is **already** wired to lazy-load `FractalCityScene` via `React.lazy`
(`src/components/sections/Hero.tsx:11`), and `vite.config.ts` already splits
`three`/`@react-three/*` into a `three-vendor` chunk. **So why is `three-vendor`
on the critical path with 36 s load time on 3G?**

Because the FRAC-146/147 `injectModulePreload` plugin in `vite.config.ts`
**deliberately preloads** the dynamic `FractalCityScene` chunk *and* its
transitive `three-vendor` import — both as `<link rel="modulepreload">` tags
injected into `dist/index.html` AND as `Link: rel=preload; as=script` entries in
`dist/_headers`. That preload was intentional: it was a "TTI-vs-LCP" trade aimed
at *eagerly* fetching three so the WebGL would hydrate sooner. On 3G mobile, it
backfires — three is in the critical path, blocking DOMContentLoaded and pinning
network bandwidth that the first paint needs.

This task **reverses** that trade for mobile. The scene stays lazy at the
JS level (it already is), but we stop yanking it onto the critical path via
preload hints. We also fix the three collateral perf bugs the same screenshot
exposed.

## Scope split (from notes)

**In scope for FRAC-178:**
1. Stop preloading `three-vendor` + `FractalCityScene` chunks on home-page first paint (this is the actual WebGL-deferral win the task title promised).
2. Render a real placeholder while the Suspense fallback is mounted, so the hero doesn't look empty during the deferred load.
3. Resolve the `hero-poster.jpg` 404 (root-caused: a hard-coded `Link:` header in `vite.config.ts:178` for a file that does not exist in `public/`).
4. Audit Fraunces font loading (`src/index.css:1`) — currently imports the **entire** variable axis 100–900 plus italics; we only use a handful of weights above-the-fold.
5. Decide whether to re-add a *narrower* `prefetch` (not `preload`) for the scene chunk so it hydrates after first paint without competing for critical bandwidth.

**Out of scope (sibling tasks):**
- FRAC-177: skyline4.png + hero-bg.png compression to mobile sizes.
- FRAC-179: octahedron face-texture compression / responsive variants.
- FRAC-180: favicon.

## Diagnostics that justify each step

| Symptom (from screenshot) | Root cause | Fix |
|---|---|---|
| `three-vendor-*.js` 233 kB, 36 s load, in critical path | `injectModulePreload` plugin walks FractalCityScene's static imports and writes `<link rel=modulepreload>` for `three-vendor` into `dist/index.html` *and* emits the same as `Link: as=script` headers — browser fetches it during HTML parse | Stop preloading FractalCityScene + three-vendor; keep the React.lazy boundary; optionally swap to `rel=prefetch` |
| `hero-poster.jpg` returns text/html 200 (SPA fallback) | `vite.config.ts:178` hard-codes `Link: </images/hero-poster.jpg>; rel=preload; as=image` but `public/images/hero-poster.jpg` does not exist; nothing in `src/` references it either | Remove that line. The image was speculative scaffold from FRAC-145 that never landed. |
| Empty hero during deferred WebGL load | `Hero.tsx:152` Suspense fallback is `{null}` — nothing renders until the scene resolves | Replace with a static placeholder (see "Placeholder strategy" below) |
| Fraunces font: 5 weight files, 246 kB combined, 3–23 s each | `src/index.css:1` imports `Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900` — full variable axis both italic and roman | Narrow to the weights we actually use (300, 350 italic, ~400 italic) at the optical-size range we render |

## Approach detail

### 1. Stop preloading the WebGL chunks (the actual WebGL-deferral win)

**File:** `vite.config.ts` (lines 39–185, the `injectModulePreload` plugin)

Two surgical edits inside `closeBundle()`:

a) Stop seeding the walk from the FractalCityScene dynamic entry. Today:

```ts
const sceneKey = Object.keys(manifest).find(
  (k) => manifest[k].isDynamicEntry && k.includes("FractalCityScene"),
);
if (sceneKey) visit(sceneKey);
```

Remove that block (or guard it behind an env flag for desktop-only — see below).
This keeps the entry-chunk preload walk intact (react-vendor, the vite-preload-
helper, the actual app entry's static imports) but stops dragging the
FractalCityScene chunk and three-vendor onto the critical path.

b) `dist/_headers` is generated from the same `preloadFiles` set, so removing
the scene seed also drops three-vendor from the HTTP `Link` headers
automatically. The image-preload line (`hero-poster.jpg`) is removed
independently — see step 3.

**Optional follow-up inside the same plugin (recommended, low risk):** after
removing the eager `modulepreload`, optionally emit `<link rel="prefetch">` for
the scene chunk + three-vendor in a *separate* HTML insertion. `prefetch` is a
low-priority hint — browsers fetch it during idle time after the page is
interactive. This gives us "WebGL hydrates shortly after first paint" without
the bandwidth competition during paint. Acceptable to defer this to a follow-up
task if it complicates the diff.

### 2. Real Suspense placeholder

**File:** `src/components/sections/Hero.tsx` (line 152)

Today:
```tsx
<Suspense fallback={null}>
  <FractalCityScene onNavigate={handleNavigate} />
</Suspense>
```

Replace `null` with a `<HeroPlaceholder />` component. Recommendation:

- **Inline SVG placeholder** of the octahedron silhouette (a 6-vertex wireframe in #c4a265 stroke on transparent bg). SVG inlines into the JS bundle, costs ~1 KB, and renders synchronously in the same frame as the rest of the hero. No new HTTP request, no race with the rest of the page.
- Positioned absolutely with the same dimensions and centering as the canvas's hit-target box (`width: min(90vmin, 550px); aspect-ratio: 3/4`, see `FractalCityScene.tsx:88`).
- `aria-hidden="true"` — the keyboard skip-nav already provides nav semantics; the placeholder is decorative.
- Apply a low opacity (e.g. 0.4) so the placeholder feels like a sketch the
  WebGL fills in, rather than a substitute the WebGL replaces.

**Swap behavior:** the placeholder *unmounts* the instant Suspense resolves
(React.lazy semantics — fallback is replaced by children atomically when the
chunk arrives). That is the correct behavior here:
- We do **not** want to keep the placeholder visible until WebGL has fully
  initialized GL context + loaded all 8 face textures (that's seconds extra of
  "stale" UI). React's Suspense boundary resolves on chunk arrival; the canvas
  then mounts and starts its own progressive load (already correct via
  `usePerFaceMaterials` in `OctahedronHero.tsx:502` — each face individually
  swaps from solid-color to texture as it loads). The user sees:
  1. SVG silhouette (immediate, t≈0)
  2. WebGL canvas with solid-color faces (t≈chunk-arrival)
  3. Textured faces fade in independently (t≈each texture's load)
- This is also better for LCP — the placeholder is a defined visual element that LCP can latch onto early instead of waiting on the WebGL frame.

### 3. Resolve `hero-poster.jpg` 404

**File:** `vite.config.ts` line 178:
```ts
const imageLink = `  Link: </images/hero-poster.jpg>; rel=preload; as=image`;
```

Delete the line and the surrounding comment block (lines 169–179) that
references the poster. Update the `headersBody` template to drop the
`${imageLink}` interpolation.

**Why not create the file instead?** The poster was a FRAC-145-era scaffold for
a different design that has been superseded — the skyline `<img>` is now the
hero background (`Hero.tsx:299–312`), there is no need for a separate poster.
Adding a real file would just be another 100–300 KB on the critical path of
the page we're trying to shrink. Removing the dangling preload is the right call.

### 4. Audit Fraunces font weights

**File:** `src/index.css:1`

Today:
```
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Inter:wght@300;400;500;600;700&family=Jacquard+24&family=JetBrains+Mono:wght@100;200;300;400;500;600;700&display=swap');
```

Fraunces is used at these weights (grepped above):
- `.text-display`: weight 300, roman (`src/index.css:189–194`)
- `.text-title`: weight 350, italic (`src/index.css:197–202`)
- `.text-subtitle`: weight 300, roman (`src/index.css:205–210`)
- `.display-roman`: weight 300, roman (`src/index.css:171–175`)
- `h1–h6` global: italic, weight "normal" (≈400)  (`src/index.css:119–122`)
- A handful of ad-hoc `font-serif`/`font-medium` call sites at ~500

Drop the wider axes:
```
family=Fraunces:ital,opsz,wght@0,9..144,300..500;1,9..144,300..500
```

This narrows weight from 100–900 → 300–500 while keeping the optical-size
animation (9..144) Fraunces uses to look correct at every display size. Italic
and roman are both kept (heading italic + display roman).

**Also audit Inter and JetBrains Mono weights** — Inter currently requests
300/400/500/600/700, JetBrains Mono requests 100/200/300/400/500/600/700.
Quick grep of usage:
- Inter: 300 (`.text-body-lead`), 400 (`.text-body`, `.text-aside`), 500 (occasional `font-medium`). Drop 600, 700.
- JetBrains Mono: 100 (`.text-body-display`), 400 (`.text-control`), 500 (`.text-eyebrow/.text-label/.text-meta`). Drop 200, 300, 600, 700.

Trimmed import:
```
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..500;1,9..144,300..500&family=Inter:wght@300;400;500&family=Jacquard+24&family=JetBrains+Mono:wght@100;400;500&display=swap');
```

Expected saving: from 246 KB combined Fraunces files (per the screenshot note) down to ~80–100 KB once we shed the heavy weights and the italic-extreme weights. Confirmation with `lattice comment` post-implementation by re-checking Network tab.

**Risk note:** If any non-home page uses weights outside 300–500, those pages will fall back to the nearest weight (browser interpolation across the variable axis handles this). Spot-check the per-house pages and the lab/publications pages before finalizing.

### 5. Should we add `<link rel="preload">` for the lazy chunk?

**Recommendation: NO `preload`, OPTIONAL `prefetch`.**

- `preload` (high priority) is exactly what we're removing — it competes with the critical paint for bandwidth on 3G.
- `prefetch` (low priority, idle) is the right tool: it tells the browser "fetch this when nothing more important is happening." For desktop / fast networks this approximates the previous behavior; for 3G it correctly defers until after first paint completes.

If we implement prefetch, do it in the same `injectModulePreload` plugin as a second pass — emit `<link rel="prefetch">` for the scene + three-vendor chunks at the end of `<body>` (not `<head>`) so they aren't promoted to "early discovery" priority by HTML preload-scanner. Keep this OPTIONAL — defer to a follow-up if it complicates the FRAC-178 diff. The bigger wins are 1–4.

## Acceptance criteria (mobile-first, the bar that matters)

Open Chrome DevTools with `iPhone 12 Pro` viewport, `Fast 3G` throttle, hard reload of `/` (cache disabled). Expectations:

- [ ] `three-vendor-*.js` is **NOT** in the initial waterfall (it should appear only after `DOMContentLoaded` fires, or never if user navigates away first).
- [ ] No `<link rel="modulepreload">` for FractalCityScene or three-vendor in the rendered `dist/index.html`.
- [ ] `dist/_headers` contains NO `Link:` entry for FractalCityScene, three-vendor, or `hero-poster.jpg`.
- [ ] No 404 (HTML-fallback or otherwise) for `hero-poster.jpg` in the Network tab.
- [ ] **DOMContentLoaded < 3 s** on Fast 3G (was 13.3 s).
- [ ] **Load < 15 s** on Fast 3G (was 72 s). Note: this depends on FRAC-177 (skyline) and FRAC-179 (face textures) for the full win; this task alone gets us to roughly Load < 25–30 s by removing 233 kB of JS preload + ~150 kB of font weight from the critical path.
- [ ] Hero shows the SVG silhouette placeholder within ~1 s, not a blank cream rectangle.
- [ ] Fraunces files in waterfall: 2–3 (down from 5), combined < 120 KB.
- [ ] Visual regression: hero still renders the same after WebGL hydrates (the only difference users see is faster initial paint).

Vitest coverage:
- [ ] Existing `src/__tests__/hero-scroll.test.tsx` (uses real OctahedronHero exports) still passes.
- [ ] Existing tests that `vi.mock("@/components/three/FractalCityScene", ...)` (navigation, neighborhood, scroll-to-top, pages) still pass — they're already mocking the chunk and don't touch the Suspense fallback rendering. The new HeroPlaceholder component does not need its own test (decorative SVG); a single snapshot or assertion in an existing Hero test is enough.

## Implementation sequence

1. **vite.config.ts** edits (steps 1 + 3):
   - Remove the FractalCityScene seed from the manifest walk.
   - Remove the hero-poster.jpg `Link:` line from `_headers`.
   - Add an inline comment pointing back to FRAC-178 explaining why we *don't* preload three-vendor anymore (the previous comment block in lines 139–164 explained why we *did* — we want the inverse rationale documented so the next agent doesn't "fix" us back).
2. **src/index.css** edit (step 4):
   - Narrow the Google Fonts `@import` URL to the trimmed axis spec.
3. **src/components/sections/Hero.tsx** edits (step 2):
   - Define a `HeroPlaceholder` component (can be inline at the top of the file or a sibling file under `src/components/three/HeroPlaceholder.tsx` — sibling file is cleaner since the SVG is non-trivial).
   - Replace `<Suspense fallback={null}>` with `<Suspense fallback={<HeroPlaceholder />}>`.
4. **(Optional, step 5)** Add the `rel=prefetch` emission. Skip if it complicates the diff; capture as follow-up.
5. Run the test suite. Run `pnpm build` to confirm the manifest walk still finds the entry chunk and emits sensible `dist/_headers`. Open `dist/index.html` and grep for `modulepreload` to confirm three-vendor is gone.
6. Manual mobile check (3G throttle, iPhone viewport, cache disabled) and screenshot the new waterfall for the review agent.

## Risks / things to watch

- **Removing the FractalCityScene preload may regress desktop TTI slightly** (the WebGL will start hydrating ~200–400 ms later because the browser has to wait for the entry chunk to parse and execute the `import()`). Acceptable trade — the user is on mobile, and the desktop regression is invisible. If desktop perf is a concern, add the `rel=prefetch` follow-up (step 5).
- **Font-weight narrowing can subtly change rendered headings** if any obscure call site relies on weight 600/700/800. The browser will fall back to the nearest available weight on the axis, but designers may notice. Mitigation: grep for `font-bold`, `font-semibold`, `font-extrabold` paired with `font-serif`, and either keep those weights in the import or rewrite the call site to weight 500.
- **`hero-poster.jpg` removal**: confirm one more time that no `<img>` tag anywhere in `src/` references it (grep returned zero hits in non-worktree paths — should be safe). The only references are the four lines in `vite.config.ts` that we're removing.
- **Multi-agent collision**: FRAC-177 (skyline compression) may touch `Hero.tsx` (the skyline `<img>`). Coordinate via the implementer agent — if FRAC-177 is already in `in_progress`, rebase carefully. FRAC-178 only touches the Suspense fallback area of Hero.tsx; merge conflicts should be minimal.

## Critical files for implementation

- `/Users/fractalos/Dev/fractal-nyc/vite.config.ts`
- `/Users/fractalos/Dev/fractal-nyc/src/components/sections/Hero.tsx`
- `/Users/fractalos/Dev/fractal-nyc/src/index.css`
- `/Users/fractalos/Dev/fractal-nyc/src/components/three/FractalCityScene.tsx` (reference only — for placeholder dimensions)
- `/Users/fractalos/Dev/fractal-nyc/index.html` (verify no inline preload hints to update)

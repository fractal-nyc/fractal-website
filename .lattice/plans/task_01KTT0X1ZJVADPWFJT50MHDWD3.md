# FRAC-192 — Eliminate octahedron face-texture "flash" on initial home render

## Scope

On first load of the Fractal NYC home page, the center octahedron renders with 8
solid-color placeholder faces, then each face hard-cuts to its banner photo as the
texture finishes downloading — a visible flash. Two root causes:

1. The 8 banner textures don't begin downloading until the lazy `FractalCityScene`
   chunk (which statically pulls the ~242 KB-gzip `three-vendor` chunk) parses and
   the `<Canvas>` mounts, *then* `usePerFaceMaterials`'s `useEffect` fires and starts
   `TextureLoader.loadAsync`. That is very late in the waterfall.
2. The placeholder→texture transition is an instant material swap (solid-color
   `MeshBasicMaterial` → textured `MeshBasicMaterial`) with no opacity fade.

This task makes four changes, in priority order:

1. Preload the 8 banner webp textures from `index.html <head>` so the bytes are in
   flight during HTML parse, long before the Canvas mounts.
2. Fade each face in (opacity 0→1) on texture arrival instead of a hard color→photo cut.
3. Downscale the oversized 1024×1024 banner webps to 512×512 via a sharp pipeline.
4. Preload the LCP hero background image (AVIF) from `index.html <head>`.

Constraints to preserve:
- FRAC-35: `tex.colorSpace = THREE.SRGBColorSpace` on every loaded banner texture.
- FRAC-41: plain texture rendering — no overlay/tint material.
- FRAC-28 reduced-motion: the fade must collapse to an instant show (no animation)
  when `prefers-reduced-motion: reduce`.
- FRAC-181: do NOT re-introduce any eager preload of the `three-vendor` / scene chunk.
  These banner/background preloads are plain `as="image"` hints and are unrelated to
  the JS chunk graph, so they do not violate FRAC-181.
- Failed texture loads must remain in their solid-color placeholder state (graceful
  degradation), never a transparent/invisible face.

## Verified facts

- `vite.config.ts` sets **no `base`** → Vite `base` defaults to `/` →
  `import.meta.env.BASE_URL === "/"`. Therefore a static `index.html` preload href of
  `/images/banners/story.webp` resolves to exactly the same URL
  `THREE.TextureLoader.loadAsync("/images/banners/story.webp")` requests in
  `usePerFaceMaterials`. The preload→TextureLoader URL match holds **as long as base
  stays `/`** (see Risks).
- All 8 banner webps are **1024×1024**, 32–75 KB each (~470 KB total), under
  `public/images/banners/`: `story.webp`, `campus.webp`, `neighborhood.webp`,
  `events.webp`, `new-liberal-arts.webp`, `political-club.webp`, `lab.webp`,
  `people.webp`. Note: `FACE_BANNER_IMAGES` key `school` → file `new-liberal-arts.webp`
  and key `forum` → file `political-club.webp` (filenames differ from keys).
- Rendered size: camera fov 50 at distance ~8 world units; the whole octahedron
  occupies ~321 px tall on mobile (375×667 @ DPR 2) and ~520 px on desktop
  (@ DPR 2). A single triangular face is a fraction of that — comfortably under
  512 px even at 2× DPR. So 1024² textures are ~2–4× oversized; **512² is the right
  target** (change #3 is warranted, not skipped).
- `Hero.tsx` background `<picture>` already has AVIF + WebP responsive srcset with
  `loading="eager" fetchPriority="high"`; AVIF widths are 640/1280/1920/2560 under
  `${BASE_URL}images/hero/fractal-background-{w}.avif`, `sizes="100vw"`. No
  `<link rel="preload">` exists for it yet.
- `index.html <head>` currently has favicons + font preconnect/stylesheet only — no
  image preloads.
- `usePerFaceMaterials` (OctahedronHero.tsx ~486–550): `useEffect` loads all 8 via
  `loader.loadAsync(path)`, stores resolved `THREE.Texture` in a
  `useState<Record<string,THREE.Texture>>`, and a `useMemo` keyed on `textures`
  rebuilds the 8-element materials array each time the map changes. Materials are
  recreated wholesale on every texture arrival (no per-material mutation today).
- `CenterOctahedron` renders `<mesh geometry={geometry} material={materials}>`; the
  geometry has 8 per-face material groups (`usePerFaceOctahedronGeometry`).

---

## Approach

### Change 1 — Preload the 8 banner textures (index.html)

**File:** `index.html` (inside `<head>`, after the favicon links, before the font
stylesheet is fine; order among preloads is not critical).

Add 8 tags:

```html
<!-- FRAC-192: preload octahedron banner textures so the bytes are fetched during
     HTML parse, well before the lazy three-vendor chunk + Canvas mount fire
     TextureLoader. Hrefs MUST stay in sync with FACE_BANNER_IMAGES in
     src/components/three/OctahedronHero.tsx and with public/images/banners/.
     These are image preloads only — unrelated to the FRAC-181 three-vendor
     chunk and do NOT reintroduce an eager scene preload. -->
<link rel="preload" as="image" type="image/webp" href="/images/banners/story.webp">
<link rel="preload" as="image" type="image/webp" href="/images/banners/campus.webp">
<link rel="preload" as="image" type="image/webp" href="/images/banners/neighborhood.webp">
<link rel="preload" as="image" type="image/webp" href="/images/banners/events.webp">
<link rel="preload" as="image" type="image/webp" href="/images/banners/new-liberal-arts.webp">
<link rel="preload" as="image" type="image/webp" href="/images/banners/political-club.webp">
<link rel="preload" as="image" type="image/webp" href="/images/banners/lab.webp">
<link rel="preload" as="image" type="image/webp" href="/images/banners/people.webp">
```

Notes for the implementer:
- Use the literal filenames in `public/images/banners/` (`new-liberal-arts.webp` and
  `political-club.webp`), NOT the section keys `school`/`forum`.
- Leading `/` is correct because Vite `base` is `/`. The browser preloads against the
  document origin; `TextureLoader` requests the same root-relative URL. They match and
  the texture load is a warm-cache hit (no second network request).
- Do NOT add `crossorigin` — `TextureLoader` defaults to an anonymous, non-CORS
  same-origin fetch for same-origin assets. Adding `crossorigin` to the preload would
  put it in the CORS cache partition and risk a preload/loader cache miss + console
  "preloaded but not used" warning. Same-origin, no crossorigin on either side.
- These are static URLs in a static `index.html`. The background-preload change (#4)
  has a BASE_URL caveat that does not apply here as long as base stays `/`.

**Sync risk:** `FACE_BANNER_IMAGES` (OctahedronHero.tsx ~363) and this `index.html`
list must stay aligned. Add the comment above; optionally note the pairing in a
one-line comment over `FACE_BANNER_IMAGES` too (read-only here — implementer's call).

### Change 2 — Fade each face in on texture arrival (OctahedronHero.tsx)

Target: `usePerFaceMaterials` (~486–550) and `CenterOctahedron` (~552–617).

Design goals: keep solid-color placeholder visible at full opacity from frame 0;
when a face's texture arrives, cross from placeholder to a textured material that
ramps opacity 0→1 over a short tween (~250–350 ms), so the photo dissolves in rather
than snapping. Preserve sRGB + plain-texture handling; keep failed faces solid.

Recommended implementation (per-face opacity ref + useFrame lerp, reduced-motion aware):

1. **Keep textured materials `transparent`.** When building a textured face material,
   set `transparent: true`, `opacity: 0` initially (start fully transparent so the
   placeholder underneath shows through during the dissolve). Keep
   `side: THREE.FrontSide`, keep `map: tex`, keep `tex.colorSpace = SRGBColorSpace`
   set at load time (already done in the loader `.then`). Do NOT add any tint/overlay
   (FRAC-41).

2. **Render BOTH a placeholder layer and a textured layer per face so the fade
   cross-dissolves cleanly.** Two viable structures — pick (A), it's simpler and keeps
   the existing single-mesh + material-array shape:

   - **(A) Single textured/placeholder material per group, fade the textured one in
     over an always-opaque solid backdrop.** The existing `<mesh material={materials}>`
     already draws one material per face group. To get a true cross-dissolve you need
     the solid color *behind* the fading photo. Add a second, slightly smaller-radius
     (e.g. radius 0.999) solid-color octahedron mesh rendered just inside the textured
     one, OR render the solid color as the face material and overlay a second textured
     mesh. The cleanest minimal version: render the **solid-color octahedron mesh**
     (opaque, all 8 faces, current `FACE_SECTION_COLORS`) and, concentric with it, a
     **second textured octahedron mesh** whose 8 face materials are `transparent` and
     fade 0→1. When all textures are in and fully opaque, the textured mesh fully
     occludes the solid one. Failed faces simply never get a textured material (leave
     that group's textured material at opacity 0 / or omit map and keep it
     transparent), so the solid backdrop shows through permanently.

   - **(B) Per-face opacity on a single material set, no backdrop** — simpler but the
     face briefly shows *background* (transparent) instead of the placeholder color
     during the ramp, which trades one artifact (color→photo cut) for another
     (color→see-through→photo). Avoid unless (A) proves too heavy.

   Go with **(A)**. It preserves "placeholder color is always visible until the photo
   has fully arrived," which is the intended graceful state.

3. **Drive the opacity ramp.** Store per-face animation state OUTSIDE the `useMemo`
   so it survives material recreation:
   - A `useRef<Record<string, { mat: THREE.MeshBasicMaterial; target: number }>>` or,
     simpler, a `useRef<Map<string, THREE.MeshBasicMaterial>>` holding the live
     textured material per section key, plus a `useRef<Record<string, number>>` of
     current opacities.
   - When a texture resolves (in the loader `.then`, after setting colorSpace), create
     the textured material once, set `transparent=true, opacity=0`, stash it in the
     ref map, and trigger a state update so the textured mesh's material array
     includes it.
   - In a `useFrame((_, delta) => {...})` (add one inside the component that owns the
     textured mesh — `CenterOctahedron` or a small dedicated child), lerp each stashed
     material's `opacity` toward 1: `mat.opacity += (1 - mat.opacity) * min(1, delta*k)`
     with k≈8–10 for a ~300 ms feel; clamp/settle to exactly 1 and optionally set
     `transparent=false` once it reaches ~0.999 to drop the alpha-blend cost.

4. **Reduced motion (FRAC-28):** read `usePrefersReducedMotion()`. When true, skip the
   lerp and set newly-arrived textured materials to `opacity=1` (and `transparent=false`)
   immediately on arrival — instant show, no animation. This matches the file's pattern
   of consulting the hook at every motion site.

5. **Memoization caveat:** the current `useMemo` rebuilds *all 8* materials on every
   texture arrival, which would reset any opacity already in progress on the others.
   Move to a model where each textured material is created exactly once (in the loader
   callback, stored in the ref map) and the `useMemo`/render only assembles the array
   from those stable instances + the per-section solid placeholders. This avoids
   recreating an in-flight fading material mid-tween. Dispose textured materials and
   textures on unmount (extend the existing `cancelled` cleanup to also dispose stored
   materials).

6. **Disposal:** the existing effect disposes textures on cancel. Ensure any
   MeshBasicMaterials created for textured faces are disposed on unmount too, to avoid
   GPU leaks across route changes (Hero unmounts on navigation).

Acceptance for this change: on a throttled reload, faces appear as solid color first,
then each photo dissolves in smoothly; no hard cut; reduced-motion shows photos
instantly with no dissolve; a (simulated) failed load stays solid color.

### Change 3 — Downscale banner textures to 512×512 (sharp pipeline)

The banners are 1024×1024 but a single face renders well under 512 px even at 2× DPR.
Downscale to 512×512 to cut ~470 KB of preloaded bytes roughly in half and shrink GPU
texture memory 4×.

Do this via a **scripted sharp pipeline**, not hand-edits, mirroring
`scripts/build-hero-bg.mjs`:

- Add a new script (e.g. `scripts/build-banners.mjs`) that reads the source banner
  webps (or, preferably, the original high-res PNG masters that already live in
  `public/images/banners/*.png` — e.g. `campus_brand_photo.png`,
  `education NLA brand photo.png`, etc.) and emits 512×512 webps to
  `public/images/banners/<key>.webp`.
- Match the existing script conventions: `sharp(SOURCE).resize({ width: 512, height: 512,
  fit: "cover" }).webp({ quality: 70, effort: 6 }).toFile(...)`, a per-file byte budget
  with non-zero exit on overflow, and a console table report.
- Wire a `pnpm build:banners` script in `package.json` (read-only here — implementer
  adds it), parallel to `build:hero-bg`.
- Decide source-of-truth: there is a 1:1-ish set of `*brand photo*.png` masters in the
  banners dir. Map each `FACE_BANNER_IMAGES` key to its master PNG explicitly in the
  script (the filenames are irregular — e.g. `education NLA brand photo.png` →
  `new-liberal-arts.webp`, `political club brand photo.png` → `political-club.webp`).
- Re-run the script to regenerate the 8 webps in place; the `index.html` preload hrefs
  and `FACE_BANNER_IMAGES` paths are unchanged (same filenames), so changes 1/2 are
  unaffected.

If, on measurement during implementation, 512² looks soft on a large desktop at DPR 2
(face approaching ~364 px → a 512 texture still has headroom), keep 512. Do not go to
768/1024 unless a visible quality regression is confirmed at the largest target.

### Change 4 — Preload the LCP background image (index.html)

**File:** `index.html <head>`.

Add one responsive image preload matching Hero.tsx's AVIF `<source>` exactly:

```html
<!-- FRAC-192: preload the LCP hero background (AVIF). imagesrcset/imagesizes must
     mirror the AVIF <source> in src/components/sections/Hero.tsx so the preload and
     the <picture> pick the same candidate (no double download). -->
<link rel="preload" as="image" type="image/avif"
      imagesrcset="/images/hero/fractal-background-640.avif 640w, /images/hero/fractal-background-1280.avif 1280w, /images/hero/fractal-background-1920.avif 1920w, /images/hero/fractal-background-2560.avif 2560w"
      imagesizes="100vw">
```

Notes:
- `imagesrcset` + `imagesizes` (responsive preload) let the browser pick the same
  width the `<picture>` will, so there is exactly one fetch and it starts during HTML
  parse — improving LCP.
- Type is `image/avif` to mirror the first `<source>`. Browsers without AVIF ignore the
  `type`-mismatched preload and fall back to the WebP `<source>` (no preload for that
  path; acceptable — AVIF support is broad). Do not add a second WebP preload; a
  non-matching browser would download both.
- No `crossorigin` (same-origin image, `<img>` has no crossorigin attr).
- BASE_URL caveat: these hrefs hard-code a leading `/`. Hero.tsx builds its URLs from
  `import.meta.env.BASE_URL`. As long as Vite `base` stays `/` they match. If base ever
  changes to a sub-path, BOTH this and the change-1 banner preloads silently point at
  the wrong origin path → preloaded-but-unused warnings and a missed cache. See Risks.

---

## Key Files

- `index.html` — add 8 banner image preloads (change 1) + 1 AVIF background preload
  (change 4). Currently has only favicons + font links in `<head>`.
- `src/components/three/OctahedronHero.tsx` — `usePerFaceMaterials` (~486–550) and
  `CenterOctahedron` (~552–617): implement the opacity fade-in, per-face material refs
  outside the memo, useFrame lerp, reduced-motion branch, disposal. Preserve FRAC-35
  sRGB and FRAC-41 plain-texture handling. `FACE_BANNER_IMAGES` (~363) is the
  authoritative path list that index.html must mirror.
- `scripts/build-banners.mjs` — NEW sharp downscale script (change 3), modeled on
  `scripts/build-hero-bg.mjs`. Emits 512×512 webps from the PNG masters.
- `package.json` — add `build:banners` script (change 3).
- `src/components/sections/Hero.tsx` (~303–338) — reference only; the AVIF srcset here
  is the contract the change-4 preload must mirror exactly. No edit expected unless the
  srcset is changed.
- `vite.config.ts` — reference only; confirms `base` is `/`. No edit.

## Risks / Gotchas

1. **FACE_BANNER_IMAGES ↔ index.html drift.** Two hand-maintained lists of the same 8
   paths. Mitigation: cross-referencing comments in both files. A future refactor could
   generate the preload tags from the map at build time (out of scope here).
2. **BASE_URL / Vite `base`.** All new preload hrefs are static `/...`. They only match
   TextureLoader / `<picture>` while `base === "/"` (true today, no `base` key). If base
   ever becomes a sub-path, every preload misses. Mitigation: comment the assumption in
   index.html; if base changes, the preloads must be injected by a Vite HTML transform
   (the project already has the `injectModulePreload` plugin pattern to copy).
3. **`crossorigin` cache partition.** Adding `crossorigin` to an image preload while the
   consumer fetch is non-CORS (or vice-versa) causes a cache miss + a "resource was
   preloaded but not used" console warning and a *double* download. Keep BOTH sides
   non-CORS same-origin (no `crossorigin` on the preloads).
4. **Responsive-preload candidate mismatch (change 4).** If `imagesrcset`/`imagesizes`
   don't byte-for-byte mirror Hero.tsx's AVIF `<source>` (same widths, same
   `sizes="100vw"`), the browser may pick a different width for preload vs. render →
   two downloads. Keep them identical; if Hero.tsx's srcset changes, update the preload.
5. **Texture appears before Canvas (preload only warms cache).** Preloading does not
   render the photo — the Canvas still must mount and TextureLoader still runs; the win
   is that the bytes are already cached so the load resolves near-instantly once the
   scene mounts. Combined with the fade (change 2), the result is a quick smooth
   dissolve rather than a late hard cut. The fade is what removes the "flash"; the
   preload removes the *delay*. Both are needed.
6. **Memo recreating in-flight materials.** As noted in change 2.5 — if textured
   materials keep being recreated in the `useMemo` on each arrival, an opacity tween on
   an earlier face restarts. Create each textured material once and store it in a ref.
7. **Transparent face draw order / z-fighting (change 2 option A).** A textured shell
   concentric with a solid shell can z-fight. Mitigate by giving the textured shell a
   marginally larger radius (e.g. 1.001) or `polygonOffset`, and/or `depthWrite=false`
   on the transparent textured material during the fade. Validate no shimmer on faces
   that point away from camera.
8. **GPU memory / disposal on route change.** Hero unmounts on navigation; ensure new
   textured materials AND textures are disposed (extend existing cleanup) to avoid leaks
   when users bounce between home and section pages.
9. **forum/school filename irregularity.** `school` → `new-liberal-arts.webp`,
   `forum` → `political-club.webp`. Easy to mis-type in both the preload list and the
   downscale script's master mapping. Double-check against `public/images/banners/`.

## Acceptance Criteria

Validate under DevTools throttling: **"Fast 4G" (or custom ~1.6 Mbps) + 4× CPU
slowdown**, hard reload (disable cache), mobile-first at **375×667** and a desktop
width (e.g. 1440):

1. **No hard flash:** banner photos *dissolve* in (opacity 0→1) over the solid-color
   placeholder; no instant color→photo cut on any of the 8 faces.
2. **Textures + background in the initial waterfall:** in the Network panel, all 8
   `/images/banners/*.webp` and the chosen `fractal-background-*.avif` are requested
   *during HTML parse* (Initiator = the preload `<link>`, not the JS chunk / Canvas),
   each requested exactly once (no double download from preload vs. consumer).
3. **No color/sRGB regression:** photos render at the same brightness/color as before
   (FRAC-35 sRGB preserved, FRAC-41 plain texture preserved — no tint/overlay).
4. **Reduced motion:** with `prefers-reduced-motion: reduce`, photos appear instantly
   (no dissolve animation); no other motion regressions.
5. **Graceful failure:** a face whose texture fails to load (simulate via blocked URL)
   stays in its solid placeholder color — never transparent/invisible.
6. **Smaller payload:** banner webps are 512×512 and the total preloaded banner bytes
   are meaningfully reduced vs. the 1024² originals (roughly halved), with no visible
   softness on the largest target.
7. **No FRAC-181 regression:** the `three-vendor` / FractalCityScene chunk is NOT
   preloaded; only `as="image"` hints were added. Confirm the scene still lazy-loads
   after interactive.
8. **No leaks:** navigating home → section → home repeatedly does not accumulate GPU
   textures/materials (materials and textures disposed on unmount).

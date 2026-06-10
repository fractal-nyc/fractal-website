# FRAC-179: Replace octahedron face textures with new brand photos

## Goal
Swap the 8 octahedron face textures in `OctahedronHero.tsx` for the new brand PNGs the user dropped in `/public/images/banners/`. Ship them as compressed WebP (with AVIF as optional progressive enhancement) so the combined banner payload drops from ~1 MB JPEG to **<500 KB combined** (and ideally <80 KB per face at 1024x1024).

Out of scope (handled by sibling tasks): WebGL lazy-load (FRAC-178), skyline/background photo compression (FRAC-177), favicon (FRAC-180).

## Source files (current state in `/public/images/banners/`)
8 new PNGs at 1.5-2.2 MB each, with human-friendly names containing spaces/underscores:

| Internal face key | New source PNG (current name) | Old JPEG to replace |
|---|---|---|
| `story` | `story brand photo.png` | `story.jpeg` |
| `campus` | `campus_brand_photo.png` | `campus.jpeg` |
| `neighborhood` | `visit neighborhood brand photo.png` | `neighborhood.jpeg` |
| `events` | `events brand photo.png` | `events.jpeg` |
| `school` | `education NLA brand photo.png` | `new-liberal-arts.jpeg` |
| `forum` | `political club brand photo.png` | `political-club.jpeg` |
| `lab` | `publications lab brand photo.png` | `lab.jpeg` |
| `people` | `people brand photo.png` | `people.jpeg` |

Mapping verified against `src/components/three/OctahedronHero.tsx` lines 380-387 (`FACE_BANNER_IMAGES`).

## Filename convention (decided)
Kebab-case matching the **internal face key** (not display name) — keeps the JS map readable and avoids URL-encoding spaces. Final shipped names:

```
story.webp
campus.webp
neighborhood.webp
events.webp
new-liberal-arts.webp   # face key is `school`, but file keeps existing kebab name for continuity with `new-liberal-arts.jpeg`
political-club.webp     # face key is `forum`, same continuity logic
lab.webp
people.webp
```

Two of the eight (`new-liberal-arts`, `political-club`) intentionally keep their existing kebab filenames rather than match the internal key, because (a) the old JPEGs already used those names and (b) the kebab name reads as the public-facing house name. This matches the existing pattern — do NOT rename to `school.webp` / `forum.webp`.

## Compression strategy

### Tool
Use `sharp` (already widely installed; not currently in this project's `package.json`). Install as a dev dependency:
```
pnpm add -D sharp
```

### Pipeline
Write a one-shot Node script at `scripts/compress-banners.mjs` (new `scripts/` dir) that:

1. Reads each source PNG from `public/images/banners/<source-name>.png`.
2. Resizes to **1024x1024 max** (`fit: "cover"`, `position: "centre"`). The face UVs map the photo onto a triangle with the pole at (0.5, 1.0) and equator at (0,0)/(1,0) — so the top-center of the photo is the most visible region. `cover` + center is correct.
3. Emits **WebP** at `quality: 78, effort: 6` — target <80 KB per file.
4. Emits **AVIF** at `quality: 55, effort: 6` as a progressive enhancement (optional second output). Target <60 KB. Skip if it pushes payload over time budget — WebP alone meets the goal.
5. Writes outputs to `public/images/banners/<kebab-name>.webp` (and `.avif` if enabled).
6. Logs final byte counts so we can verify the <80 KB / <500 KB total budgets.

Script is run **once locally**, not at build time. Commit the resulting `.webp` files; do not wire sharp into the Vite pipeline.

### Why WebP (not just JPEG re-compressed)
- ~30% smaller than JPEG at equivalent perceived quality.
- Three.js `TextureLoader` uses the browser's image decoder, which supports WebP in all evergreen browsers (Chrome 32+, Firefox 65+, Safari 14+, Edge 18+). No code-side decoder needed.
- AVIF is a further ~20% win but decoder support in Safari is 16+; treat as optional.

### Why not AVIF-only
`TextureLoader` would silently fail on older Safari/legacy WebView. WebP is the safe baseline.

## Source PNG handling

**Decision: keep source PNGs out of git.**

Add to `.gitignore`:
```
# Source brand photos — compressed WebP is committed; raw PNGs are not
public/images/banners/*.png
public/images/banners/* brand photo.*
public/images/banners/*_brand_photo.*
```

Rationale: the raw PNGs are 1.5-2.2 MB each (~15 MB total) and exist only as compression inputs. The shipped `.webp` files (committed) are the artifact that matters. If we ever need to re-compress (different quality, different size), the user can re-drop the PNGs locally and re-run the script. Note this clearly in `scripts/compress-banners.mjs` header.

## Old JPEG handling

**Decision: delete the 8 old `.jpeg` files from `public/images/banners/` in the same commit.** They are no longer referenced anywhere and would otherwise be dead weight in git history. No callers other than `OctahedronHero.tsx` and `HouseBanner.tsx` (see below) reference them.

## Wiring changes (code)

### 1. `src/components/three/OctahedronHero.tsx` lines 380-387
Update `FACE_BANNER_IMAGES` to point at the new WebP paths:

```ts
const FACE_BANNER_IMAGES: Record<string, string> = {
  story:        "/images/banners/story.webp",
  campus:       "/images/banners/campus.webp",
  neighborhood: "/images/banners/neighborhood.webp",
  events:       "/images/banners/events.webp",
  school:       "/images/banners/new-liberal-arts.webp",
  forum:        "/images/banners/political-club.webp",
  lab:          "/images/banners/lab.webp",
  people:       "/images/banners/people.webp",
};
```

The surrounding `usePerFaceMaterials()` hook already calls `THREE.TextureLoader.loadAsync(path)` and tags the result `SRGBColorSpace` — no changes needed there. WebP decode is transparent to TextureLoader.

### 2. `src/components/house/HouseBanner.tsx` lines 29-36
**Also update `BANNER_IMAGES` in HouseBanner.tsx** — it references 6 of the same 8 JPEGs (lab, forum, neighborhood, school, campus, events). If we delete the JPEGs without updating this file, the `/house/:slug` pages break.

```ts
const BANNER_IMAGES: Record<string, string> = {
  lab:          "/images/banners/lab.webp",
  forum:        "/images/banners/political-club.webp",
  neighborhood: "/images/banners/neighborhood.webp",
  school:       "/images/banners/new-liberal-arts.webp",
  campus:       "/images/banners/campus.webp",
  events:       "/images/banners/events.webp",
};
```

This was discovered via grep — not in the original task scope but a hard dependency. Implementation must update both files in the same commit.

### 3. `.gitignore`
Append the rules under "Source brand photos" above.

### 4. `scripts/compress-banners.mjs` (new)
The one-shot compression script. Header comment must document:
- How to run (`node scripts/compress-banners.mjs`).
- Why PNGs aren't committed.
- The face-key -> source-filename -> output-filename mapping (with the messy human names hard-coded so the user can re-drop PNGs without renaming them).

### 5. `package.json`
Add `sharp` to `devDependencies` and optionally a `compress:banners` script alias.

## Three.js / TextureLoader considerations

- **WebP support:** `THREE.TextureLoader` delegates to `Image`/`createImageBitmap`, which honors browser-native WebP decode. All evergreen browsers support this. No polyfill, no loader swap needed.
- **Color space tagging:** existing code already sets `tex.colorSpace = THREE.SRGBColorSpace` (line 524) — unchanged. WebP carries sRGB by default from sharp's output.
- **Texture size:** 1024x1024 is well within WebGL's 2K-minimum guaranteed `MAX_TEXTURE_SIZE`. Power-of-two means three.js can build mipmaps efficiently.
- **No anisotropic filtering tweaks needed** — faces are small on screen; default linear filtering is fine.

## Acceptance criteria

1. **Visual check (manual):** Open `/` on the local dev server. The center octahedron renders all 8 faces with the new brand photos. The top-center of each photo (where the pole UV is) shows the intended subject. No washed-out colors (confirms sRGB is honored). No broken/missing texture (no solid-color fallback faces persisting).
2. **Payload budget:** `ls -la public/images/banners/*.webp` shows each file <80 KB; total of 8 sums to <500 KB.
3. **No regressions on `/house/:slug` pages:** Visit `/house/lab`, `/house/forum`, `/house/neighborhood`, `/house/school`, `/house/campus`, `/house/events` — banner images load from the new `.webp` paths.
4. **No dangling references:** `grep -rn "\.jpeg" src/` returns 0 results in the banner mapping area (or only legitimate ones unrelated to these 8 files).
5. **Build green:** `pnpm typecheck && pnpm build && pnpm test` all pass.
6. **Git hygiene:** raw PNGs are gitignored (`git status` should not show them after the commit). The 8 `.webp` files are tracked. The 8 old `.jpeg` files are deleted.

## Implementation sequence

1. `pnpm add -D sharp`.
2. Create `scripts/compress-banners.mjs` with the hard-coded source-to-output mapping.
3. Run `node scripts/compress-banners.mjs`. Verify per-file and total sizes.
4. Update `.gitignore` to exclude source PNGs / `*brand*photo*` patterns.
5. Update `FACE_BANNER_IMAGES` in `OctahedronHero.tsx`.
6. Update `BANNER_IMAGES` in `HouseBanner.tsx`.
7. `git rm` the 8 old `.jpeg` files.
8. `pnpm typecheck && pnpm build && pnpm test`.
9. Manual visual check on `pnpm dev` — home page octahedron + a couple of `/house/:slug` pages.
10. Commit with FRAC-179 tag. Branch: `frac-179-octahedron-photos`.

## Risks / open questions

- **Sharp install on Apple Silicon** sometimes pulls a darwin-arm64 prebuilt; should be transparent. If it fails, fall back to `@squoosh/cli` or the user can run `sips` (macOS built-in).
- **Photo aspect ratio:** the new PNGs may not be square. `cover` + `centre` will crop. If the user wants different cropping per photo (e.g., subject not in center), they'll need to either pre-crop the PNGs or we add a per-file crop offset table to the script. Flag this if first visual check shows bad cropping; do not pre-emptively over-engineer.
- **AVIF skipped if WebP alone hits budget** — keeps the change minimal.

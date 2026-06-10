# FRAC-177: Replace hero background photo with higher-quality version

## Context

User dropped `public/images/fractal background.png` (52 MB, 11648x6528) to replace the existing hero background `public/images/skyline4.png` (1.4 MB). The current file is the single largest network request on the home page and consumes ~60 s of the 1.2 min 3G load time (see `.lattice/notes/task_01KTQCBDCQ4RYRSWVAFKQZYWX7.md`). We cannot ship 52 MB; we cannot ship 1.4 MB. We need responsive, compressed variants that respect the mobile-first mandate.

## Source asset handling

- **Rename** `public/images/fractal background.png` → `assets-src/hero/fractal-background-source.png` (URL-safe; moved out of `public/` so Vite never serves it).
- **Gitignore** `assets-src/`. The 52 MB master stays on the user's machine; only generated variants are committed.
- Add `assets-src/README.md` (created by impl agent) explaining: source images live here, run `pnpm build:hero-bg` to regenerate `public/images/hero/*`.

## Compression strategy

Generate two formats × four widths via a one-shot Node script using `sharp`:

| width | use case | avif target | webp target |
|---|---|---|---|
| 640w  | mobile (375px viewport, DPR 1-2) | <80 KB  | <120 KB |
| 1280w | mobile DPR 3 / small desktop      | <150 KB | <220 KB |
| 1920w | standard desktop                   | <280 KB | <400 KB |
| 2560w | large/retina desktop               | <400 KB | <550 KB |

Plus one PNG fallback at 1280w (~200 KB after `sharp` optimization). Hero image is at `opacity: 0.15` with `scale(1.35)` — visual quality requirements are low, which lets us push AVIF q≈45 and WebP q≈70.

Output path: `public/images/hero/fractal-background-{640,1280,1920,2560}.{avif,webp}` plus `public/images/hero/fractal-background-fallback.png`.

## Tooling

Add `sharp` as a devDependency (note: FRAC-180 also adds it on its own branch — coordinate at merge time). Add a build script `scripts/build-hero-bg.mjs` that:

1. Reads `assets-src/hero/fractal-background-source.png`.
2. For each width in [640, 1280, 1920, 2560]:
   - Emits `.avif` with `{ quality: 45, effort: 6 }`.
   - Emits `.webp` with `{ quality: 70, effort: 6 }`.
3. Emits a single 1280w PNG fallback with `{ compressionLevel: 9, palette: true }`.
4. Logs final sizes; fails non-zero if any variant exceeds its target.

Add `package.json` script: `"build:hero-bg": "node scripts/build-hero-bg.mjs"`. Run manually now; not wired into `pnpm build`.

## What to do with skyline4.png

**Delete** in the same commit. It's referenced exactly once (`Hero.tsx:304`) and that reference is being replaced. Keeping it as fallback would leave a 1.4 MB orphan in `dist/`. Leave `public/images/hero-bg.png` alone — used by ProtocolPage, separate concern.

## Wiring changes (Hero.tsx)

Replace lines 299–312 of `src/components/sections/Hero.tsx`:

```tsx
{/* Hero background — responsive variants from FRAC-177 */}
<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
  <picture>
    <source
      type="image/avif"
      srcSet={`
        ${import.meta.env.BASE_URL}images/hero/fractal-background-640.avif 640w,
        ${import.meta.env.BASE_URL}images/hero/fractal-background-1280.avif 1280w,
        ${import.meta.env.BASE_URL}images/hero/fractal-background-1920.avif 1920w,
        ${import.meta.env.BASE_URL}images/hero/fractal-background-2560.avif 2560w
      `}
      sizes="100vw"
    />
    <source
      type="image/webp"
      srcSet={`
        ${import.meta.env.BASE_URL}images/hero/fractal-background-640.webp 640w,
        ${import.meta.env.BASE_URL}images/hero/fractal-background-1280.webp 1280w,
        ${import.meta.env.BASE_URL}images/hero/fractal-background-1920.webp 1920w,
        ${import.meta.env.BASE_URL}images/hero/fractal-background-2560.webp 2560w
      `}
      sizes="100vw"
    />
    <img
      src={`${import.meta.env.BASE_URL}images/hero/fractal-background-fallback.png`}
      alt="NYC skyline backdrop"
      className="w-full h-full object-cover object-bottom"
      style={{
        opacity: 0.15,
        transform: "translate(2.75%, -8%) scale(1.35)",
      }}
      loading="eager"
      fetchPriority="high"
    />
  </picture>
</div>
```

Preserves existing transform/opacity. `loading="eager" fetchPriority="high"` because this IS the hero.

## Implementation steps

1. `pnpm add -D sharp`.
2. `mkdir -p assets-src/hero && mv "public/images/fractal background.png" assets-src/hero/fractal-background-source.png` (note: source file lives in MAIN repo, not the worktree — impl agent needs to do this in main repo or copy the source in first).
3. Append `assets-src/` to `.gitignore`.
4. Write `scripts/build-hero-bg.mjs` per spec.
5. Add `"build:hero-bg"` script to `package.json`.
6. Run `pnpm build:hero-bg`. Verify 9 output files under `public/images/hero/` within budget. If over: drop AVIF q→40, WebP q→65.
7. Edit `src/components/sections/Hero.tsx` per snippet.
8. `rm public/images/skyline4.png`.
9. `pnpm typecheck && pnpm test && pnpm build`. Confirm `dist/images/hero/` has variants; no `skyline4.png` in `dist/`.
10. Manual: `pnpm serve`, open at 375px (Chrome DevTools mobile), Network filter "Img", confirm only the 640w AVIF loads <150 KB.

## Acceptance criteria

- [ ] Mobile (375px, DPR 2–3): hero image network transfer <150 KB, format AVIF.
- [ ] Desktop (1920px): hero image network transfer <400 KB, format AVIF.
- [ ] Visual fidelity: same opacity/transform/position; new photo visible at 15% opacity.
- [ ] No `skyline4.png` in `dist/` after build.
- [ ] No `fractal background.png` (with space) anywhere in repo or `dist/`.
- [ ] `assets-src/` git-ignored; 52 MB master not committed.
- [ ] `pnpm build:hero-bg` idempotent, fails loudly on over-budget output.
- [ ] No TS errors; tests pass.

## Out of scope

- WebGL lazy-load (FRAC-178, done).
- Octahedron face photos (FRAC-179).
- Favicon (FRAC-180, done).
- Compressing `hero-bg.png` used by ProtocolPage (not on home critical path).
- Wiring `build:hero-bg` into CI.

## Risk notes

- `sharp` ships native binaries; pnpm resolves the right platform binary. FRAC-180 successfully installed it.
- PNG fallback at ~200 KB is larger than 640w AVIF; browsers hitting fallback (very few in 2026) pay that cost — acceptable.
- `<picture>` changes DOM shape inside background div. Grep for `.absolute.inset-0 > img` came up empty.
- **FRAC-178 (now done) also edits Hero.tsx** — but only the Suspense fallback area (line ~152), not the background `<img>` area (lines 299–312). When this branch is merged after FRAC-178, conflicts should be minimal but check.

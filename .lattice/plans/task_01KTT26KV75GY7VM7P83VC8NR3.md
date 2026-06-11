# FRAC-193 — Fix banner-texture double-fetch (preload crossorigin mismatch)

## Problem
Validation of FRAC-192 (PR #229) on 3G showed all 8 banner webps fetched TWICE in
one page load: once by the `<link rel="preload" as="image">` tags (Initiator
`index.html`) and again by `THREE.TextureLoader` (Initiator `three-vendor.js`).

## Root cause
`new THREE.TextureLoader()` inherits `THREE.Loader`'s default
`crossOrigin = "anonymous"`, so it requests each banner in CORS mode. The FRAC-192
preload `<link>` tags had NO `crossorigin` attribute (no-CORS mode). Browser keys
no-CORS and CORS requests separately → preload never consumed → second fetch.
The original FRAC-192 comment's "no crossorigin avoids double-fetch" reasoning was
backwards.

## Fix
Add `crossorigin="anonymous"` to the 8 webp banner preload `<link>` tags in
`index.html` so they match three's CORS-mode request and are consumed (single
fetch). Same-origin CORS-mode requests need no ACAO header → safe. The AVIF
background preload stays WITHOUT crossorigin (consumed by a plain `<img>`, no-CORS
— adding crossorigin there would BREAK that match). Update the misleading comment.

## Acceptance criteria
- Each banner webp appears exactly ONCE in the network panel (8 webp requests, not 16).
- The request's initiator/consumer chain shows the preload being reused by TextureLoader.
- `pnpm typecheck` + `pnpm build` pass; dist/index.html shows crossorigin on the 8 webp preloads, NOT on the AVIF preload.
- No visual regression; textures still render + fade in.

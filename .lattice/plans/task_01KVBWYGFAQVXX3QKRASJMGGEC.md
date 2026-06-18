# FRAC-223 — DESIGN.md: reconcile blessed exceptions

**Complexity:** medium (doc-only; five independent BLESS+DOCUMENT items, careful prose).
**Source:** `/design-audit` 2026-06-17 (notes/design-audit-20260617.md), the BLESS+DOCUMENT bucket.
**Files:** `DESIGN.md` ONLY. No `src/` changes. No YAML token additions (none of these are tokens).

## Governing principle
DESIGN.md is the source of design *intent*. The audit found five real, deliberate patterns in the
code that the doc does not record — descriptive gaps. This task writes them down so doc and code are
in a true, deliberate relationship. Match DESIGN.md's existing voice (terse, editorial, evidence-led,
cites file/token names). Do NOT touch the YAML front-matter — every item below is prose, because none
of these values are design tokens.

## The five items

### D1 — 3D-scene material palette (Color)
The 3D scenes use raw WebGL material/light colors that are **not** CSS tokens (Three.js materials
can't read CSS vars) and are intentionally outside the 2D token system. They're already grandfathered
in `scripts/design-conformance.baseline.json`; this records the *intent* half the governance loop
requires. Add a short subsection (under §Colors, or §Elevation near the OctahedronHero mention)
titled e.g. "3D-scene palette (out-of-token)" listing them and stating they're deliberately off the
token system:
- `OctahedronHero.tsx`: `#e8e0d0 #e0c880 #ddb866 #cc9955 #c4a265 #bb8844 #8a7a6a` (octahedron gold/sand face tints)
- `FractalCityScene.tsx`: `#ffaa66 #ffcc88 #f5f0ea #aabbcc #ffffff` (scene lights + materials; `#aabbcc` is the cool fill `directionalLight`)
- `heroNavNodes.ts`: `#c4a265`
State: these are WebGL colors set in JS/material props, cannot use CSS tokens, and are sanctioned
exceptions tracked by the conformance baseline.

### D2 — `px-[22%]` centered-content gutter (Spacing/Layout)
§Layout → "Horizontal padding" currently lists only `px-6` and `px-[4.5%]`. Add `md:px-[22%]` as the
**centered narrow-content desktop gutter** — the deliberate, repeated pattern that centers a single
column of editorial content on wide viewports (mobile stays `px-6`). Used at:
`EventsPage.tsx:36`, `LabPage.tsx:38`, `NeighborhoodPage.tsx:34`, `LiberalArts.tsx:8`.

### D3 — Navbar bespoke inline typography (Typography/Components)
The doc says only the Navbar *wordmark* is inline-styled (§Typography Jacquard bullet; §Components
"Navbar wordmark"). Reality: the **entire Navbar mega-menu** is a bespoke, inline-`style`d display
surface — `fontSize`/`fontWeight` set directly across the expanded menu (e.g. `Navbar.tsx` lines
~78, 100, 186, 218, 225, 273, 285, 318, 347), mixing Jacquard 24 caps with mono weight-100 remainders
and clamp() sizing, all outside the semantic type scale. Update the wordmark references to state that
the Navbar as a whole is a deliberate bespoke display surface whose typography intentionally sits
outside the `.text-*` scale (low consistency-expectation signature chrome) — not just the wordmark.

### D4 — FractalPattern color-prop convention (Components)
Add to §Components: `FractalPattern` takes a `color` prop injected into SVG `stroke`/`fill`
**presentation attributes**, where `var()` does not resolve — so the color must be a literal hex
**sourced from the data model** (`HOUSES[...].palette.{light|deep}` / `SECTIONS.*`), never a hardcoded
literal. Cite FRAC-206 (established the convention) and FRAC-219 (applied it to the remaining 5 house
pages). This is the rule that keeps the next page from reaching for a bare hex.

### D5 — Body-emphasis weight (Typography)
The type scale documents no body-bold weight, yet inline `<strong>` emphasis in body copy renders at
`font-semibold` (weight 600) — used in `Campus.tsx` (lines 333, 340, 354, 358, 572, 714) and nowhere
else. **Decision: BLESS it.** `<strong>` semantically needs visual weight, and 600 over the Inter-400
body is a reasonable editorial emphasis. Add a one-line note to §Typography (Body tier) sanctioning
`font-semibold` as the inline body-emphasis weight for `<strong>`. (If the implementer judges 600 too
heavy against the editorial key, the alternative is to flag for normalization — but default to bless.)

## Acceptance criteria
- All five items are reflected in `DESIGN.md`, in the right sections, in the doc's existing voice.
- No contradiction introduced with the code (each claim matches the cited file:lines).
- YAML front-matter unchanged; no `src/` changes.
- The doc still reads coherently (no dangling references, correct section cross-links).

## Verify
- Re-read each new/edited passage against its cited file:line evidence.
- `rg -n "px-\[22%\]|FractalPattern|font-semibold" DESIGN.md` shows the new mentions.
- `pnpm conformance` still green (sanity — doc change shouldn't affect it).
- Optional: `pnpm test` (no test asserts on DESIGN.md prose, but confirms nothing else moved).

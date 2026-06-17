# Design-System Coherence Audit — 2026-06-17

Read-only per-dimension sweep of `DESIGN.md` (intent) vs `src/` (reality). Evidence-cited.
Source of truth for color is `src/index.css` `@theme` + `src/data/houses.ts`; conformance gate is
`scripts/design-conformance.mjs` (currently green: 28 used values / 35-entry baseline / 19 tokens).

## Per-dimension findings

| Dim | Item | Used (where) | Declared? | Verdict | Direction | Evidence |
|---|---|---|---|---|---|---|
| Color | `FractalPattern` literal house hex instead of data-model ref | 5 pages | values ARE tokens, but literal hex duplicates the SoT; FRAC-206 set the data-model convention | **CONSOLIDATE** | fix code | `CampusPage.tsx:14` `#1A3A2E`, `NeighborhoodPage.tsx:17` `#4A5A30`, `LabPage.tsx:20` `#C44878`, `EventsPage.tsx:20` `#C13B2A`, `LiberalArtsPage.tsx:14` `#C41E20`. Model fix: `PoliticalClubPage.tsx:12`, `PeoplePage.tsx:12`, `StoryPage.tsx:22` |
| Color | `TagFilter` focus ring uses raw hex = `house-publications-deep` | 1 | token exists (`house-publications-deep` `#C44878`) | **CONSOLIDATE** | fix code | `TagFilter.tsx:53` `focus:ring-[#C44878]/40` → `focus:ring-house-publications-deep/40` (doc already cites the token form for the lab `focus:border-house-publications-deep/60`) |
| Color | 3D-scene material palette (golds + light fill) | ~13 values | **NOT documented** anywhere in DESIGN.md | **BLESS + DOCUMENT** | fix doc | `OctahedronHero.tsx` `#e8e0d0 #e0c880 #ddb866 #cc9955 #c4a265 #bb8844 #8a7a6a`; `FractalCityScene.tsx` `#ffaa66 #ffcc88 #f5f0ea #aabbcc #ffffff`; `heroNavNodes.ts` `#c4a265`. These are WebGL material/light colors — cannot use CSS tokens; all grandfathered in baseline |
| Color | `Navbar` JS color fallback `"#000"` | 1 | not a token (charcoal voice is `#171717`) | **FLAG** | human | `Navbar.tsx:17` `palette ? palette[prefer] : "#000"` — fallback rarely (never?) hit; `#171717`/`foreground` would be on-voice |
| Color | Stale baseline entries no longer used in `src/` | 7 values | grandfathered but dead | **CONSOLIDATE** (prune) | fix code/tooling | `#3d4654 #4e5869 #5a6577 #6b7585 #7a8494 #d8dce2 #dde0e5` — run `--update-baseline` to burn them down (DESIGN.md §governance explicitly calls for this) |
| Typo | Hand-rolled `.text-display` clone | 1 | `.text-display` exists; ~95% identical | **CONSOLIDATE** | fix code | `LiberalArts.tsx:11` `font-serif not-italic font-light text-3xl md:text-7xl tracking-[0.04em] uppercase leading-[1.1]` — near-miss drift (only diff: `text-3xl` mobile vs the utility's `text-4xl`). Replace with `.text-display` (+ `text-3xl` override if the smaller mobile size is intended) |
| Typo | `font-semibold` (weight 600) inline body emphasis on `<strong>` | 6, all in `Campus.tsx` | off-scale — no utility/intent documents a body-bold weight | **BLESS + DOCUMENT** (lean) | fix doc | `Campus.tsx:333,340,354,358,572,714`. `<strong>` is used nowhere else. Decide: sanction a body-emphasis weight in the doc, or normalize |
| Typo | Bespoke inline `fontSize`/`fontWeight` across the Navbar mega-menu (non-Jacquard) | ~15 sites | doc documents only the **wordmark** as inline-styled | **BLESS + DOCUMENT** | fix doc | `Navbar.tsx:78,100,186,218,225,273,285,318,347,...` — deliberate signature nav; record that the whole Navbar is a bespoke display surface outside the semantic scale |
| Spacing | `md:px-[22%]` centered-content desktop gutter | 4 sites | doc's Horizontal padding lists only `px-6` + `px-[4.5%]` | **BLESS + DOCUMENT** | fix doc | `EventsPage.tsx:36`, `LabPage.tsx:38`, `NeighborhoodPage.tsx:34`, `LiberalArts.tsx:8` — consistent, deliberate; add to Layout §Horizontal padding |
| Spacing | `px-[4.5%]` full-bleed gutter | many | documented | OK | — | — |
| Shape | `rounded-sm/md/lg/full` | all uses | each maps to a documented role | OK (clean) | — | no arbitrary radii, no stray `clip-path` |
| Comp | Button family (`default/outline/ghost/link`) | — | matches YAML + prose | OK | — | — |
| Comp | `FractalPattern` `color`-prop convention (source from data model, not literal) | — | not in §Components | **BLESS + DOCUMENT** | fix doc | covered by FRAC-206 commit msg; record the convention so the next page doesn't reach for a literal again |

## Three buckets

**CONSOLIDATE (drift → pull back onto the system; code tasks)**
1. FractalPattern literal hex → data-model ref on the 5 remaining pages (Campus, Neighborhood, Lab, Events, LiberalArts).
2. TagFilter `ring-[#C44878]/40` → `ring-house-publications-deep/40`.
3. LiberalArts.tsx:11 hand-rolled display heading → `.text-display`.
4. Prune 7 stale baseline color entries (`--update-baseline`).

**BLESS + DOCUMENT (intentional specials → reconcile into DESIGN.md; doc task)**
5. 3D-scene material palette (OctahedronHero / FractalCityScene / heroNavNodes).
6. `md:px-[22%]` centered-content gutter (Layout §Horizontal padding).
7. Navbar bespoke inline typography (signature display surface, beyond the wordmark).
8. `FractalPattern` color-prop convention (data-model sourcing; §Components).
9. `font-semibold` body emphasis on `<strong>` — sanction or normalize.

**FLAG (human, never auto-act)**
10. Navbar `"#000"` fallback — likely should be `#171717`/`foreground`; confirm it's reachable before touching.

## Bidirectional drift summary

**Doc claims now false / incomplete (code → doc gaps):**
- §Layout claims only `px-6` + `px-[4.5%]`; code also uses `md:px-[22%]` in 4 places.
- §Typography/§Components claim only the Navbar *wordmark* is inline-styled; the entire mega-menu is.
- No section documents the 3D-scene color palette, the FractalPattern data-model convention, or a body-emphasis weight.

**Code vocab not on the system (drift → conform):**
- 5 literal house-hex props that should source from `houses.ts`/`SECTIONS`.
- 1 raw-hex focus ring with an existing token.
- 1 hand-rolled heading that should be `.text-display`.
- 7 dead baseline entries inflating the grandfather list.

---

## Remediation handoff (Lattice — each task = own branch, full lifecycle, cold review gate)

The blocks below ARE the plan-file content for each task. Doc tasks all edit `DESIGN.md` so they
do **not** parallelize — fold into a single doc task. Code tasks touch disjoint files → Wave 1 is
parallel-safe in isolated worktrees.

### Wave 1 — code (pairwise-disjoint files, parallel-safe)

```
lattice create "FractalPattern: literal house-hex → data-model ref on 5 pages" --actor agent:design-audit
lattice create "TagFilter: focus ring raw hex → house-publications-deep token" --actor agent:design-audit
lattice create "LiberalArts heading: replace hand-rolled .text-display clone with the utility" --actor agent:design-audit
lattice create "design-conformance: prune 7 stale grandfathered baseline colors" --actor agent:design-audit
```

- **T1 — FractalPattern data-model ref.** files: `src/pages/{Campus,Neighborhood,Lab,Events,LiberalArts}Page.tsx`. steps: mirror `PoliticalClubPage.tsx:12` — import `HOUSES`/`SECTIONS`, add a `const X_COLOR = HOUSES.find(h => h.id === "<id>")!.palette.<light|deep>`, pass to `<FractalPattern color={X_COLOR}/>`. Match each page's `--accent` (Campus→campus.deep, Neighborhood→visit.deep, Lab→publications.deep, Events→events.deep, LiberalArts→education.light per the invert rule). acceptance: no literal hex in these 5 files; `pnpm conformance` green; pages render unchanged. verify: `pnpm test && pnpm conformance && pnpm typecheck`. confidence: high. size: M.
- **T2 — TagFilter ring token.** files: `src/components/lab/TagFilter.tsx`. steps: `ring-[#C44878]/40` → `ring-house-publications-deep/40`. acceptance: no raw hex in file; focus ring visually identical. verify: `pnpm test && pnpm conformance`. confidence: high. size: XS.
- **T3 — LiberalArts display heading.** files: `src/components/sections/LiberalArts.tsx`. steps: replace the line-11 class soup with `.text-display` (add `text-3xl` to override mobile size only if the smaller size is intended — confirm against `.text-display`'s `text-4xl`). acceptance: heading uses the utility; visual diff is intentional/none. verify: `pnpm test`. confidence: med (mobile-size intent). size: XS.
- **T4 — Prune stale baseline.** files: `scripts/design-conformance.baseline.json`. steps: `node scripts/design-conformance.mjs --update-baseline`; confirm the 7 dead values drop and only-used values remain. acceptance: baseline length == distinct-used; gate green. verify: `node scripts/design-conformance.mjs`. confidence: high. size: XS.

### Wave 2 — doc (single task; all edits land in DESIGN.md — NOT parallel)

```
lattice create "DESIGN.md: reconcile blessed exceptions (3D palette, px-[22%], Navbar type, FractalPattern convention, body emphasis)" --actor agent:design-audit
```

- **D1 — DESIGN.md reconciliation.** files: `DESIGN.md`. steps: (a) add a "3D scene palette" note under §Elevation/§Components listing the OctahedronHero/FractalCityScene/heroNavNodes colors as out-of-token WebGL materials; (b) add `px-[22%]` to §Layout→Horizontal padding as the centered-content desktop gutter; (c) extend §Typography/§Components to state the whole Navbar is a bespoke inline-styled display surface (not just the wordmark); (d) document the FractalPattern color-prop data-model convention in §Components (cite the SVG-presentation-attr reason from FRAC-206); (e) resolve `font-semibold` body emphasis — either sanction a body-emphasis weight or note it for normalization. acceptance: every BLESS item above is reflected; no contradiction with code. verify: re-read against the cited file:lines. confidence: high. size: M. depends_on: none (independent of Wave 1).

### Out of band — FLAG (do not auto-act)

- Navbar `"#000"` fallback (`Navbar.tsx:17`): raise with human — likely `#171717`/`foreground`, but confirm reachability first. Create at `needs_human` if pursued.

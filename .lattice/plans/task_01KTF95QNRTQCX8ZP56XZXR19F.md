# FRAC-48 — DESIGN.md cleanup: drop closed Accepted divergences + refresh line refs

**Complexity:** low
**Branch:** `frac-48-design-md-cleanup`

## Scope

Update `DESIGN.md` (only) to reflect that four divergences it described as open/accepted have closed today (FRAC-46, FRAC-34, FRAC-44, FRAC-47), and refresh `file:line` references that drifted as a result. Preserve all general policy ("canonical charcoal is `#171717`; raw `#1a1a1a` is drift; don't reintroduce") — only the **"snapshot of current shipped state"** prose changes.

Verified current state of every referenced code site (master post-PR #169):

| Reference | DESIGN.md says | Actual at HEAD |
|---|---|---|
| `OctahedronHero.tsx:404-413` face order | 404-413 | **410-419** (FRAC-47 +6 drift) |
| `OctahedronHero.tsx:584,801` `#1a1a1a` | "still use" | **gone** (now `hsl(var(--foreground))` at 590 / 807) |
| `HouseBanner.tsx:96-97` `#1a1a1a` | "still use" | **gone** (FRAC-46) |
| `src/components/lab/*` `#6B4C9A` | "still appears" | **gone** (FRAC-34) |
| `houses.ts:319 color: "#6B4C9A"` | "@deprecated, slated for removal" | **still present** (intentionally deferred) |
| `--font-sans` value | "JetBrains Mono (artifact)" | **Inter** (FRAC-44) |
| Inter Google Font import | "cleanup task will add" | **already imported** at `src/index.css:1` |
| Octahedron vertex 4 | "Political Club Coming Soon placeholder" (mentioned twice) | **Story node** (FRAC-47) |

`#1a1a1a` is fully gone from `src/`; `#6B4C9A` exists only at `houses.ts:319`. Confirmed by grep.

## Files to edit

**Only `DESIGN.md`.** Confirmed no other `*.md` files have stale references (planning/notes/PRD docs are intentional point-in-time records and stay untouched).

## Section-by-section edits

### Edit 1 — Overview line ~108 (vertex 4 prose stale)

Replace the prose claiming Political Club is "visible in OctahedronHero (as a Coming Soon placeholder) but hidden from Navbar/banner-grid" with: Political Club hidden from OctahedronHero too; vertex 4 is now the Story nav node per FRAC-47.

### Edit 2 — Colors ~178-180 (Lab purple)

Rewrite the prose under the "Lab uses palette pinks; old `#6B4C9A` is dead" heading. Old wording said "still appears as raw literal" + "rewritten FRAC-34 scope"; new wording says the literal was removed from `src/components/lab/*` in FRAC-34 and only the deferred `color` field at `houses.ts:319` remains, slated for the broader legacy-`color`-field sweep. Keep the "no third color is canonical / don't declare `house-publications-accent`" rule.

### Edit 3 — Colors ~184 (Charcoal drift snapshot)

Drop "Four sites still use `#1a1a1a` …" snapshot. Keep the rule: "canonical charcoal is `#171717`; raw `#1a1a1a` is drift; do not reintroduce; do not declare a `charcoal-deep` token." Note in passing that FRAC-46 normalized the previously-known sites.

### Edit 4 — Typography ~194 (Inter swap done)

Drop the "(not yet implemented)" parenthetical and the "current `--font-sans = 'JetBrains Mono'`" snapshot. Replace with: Inter is imported at `src/index.css:1` and assigned to `--font-sans` at `src/index.css:6` (FRAC-44). New designs that reach for `font-sans` get Inter at runtime.

### Edit 5 — Do's and Don'ts ~307 ("until then JetBrains Mono is both")

Drop "until then, JetBrains Mono is both `font-sans` and `font-mono`." Replace with: Fraunces for headings, JetBrains Mono (`font-mono`) for labels/chrome, Inter (`font-sans`) for body sans copy.

### Edit 6 — Shapes ~277 (line range drift)

`OctahedronHero.tsx:404-413` → `OctahedronHero.tsx:410-419`.

### Edit 7 — Components ~300 (OctahedronHero prose)

Drop "Political Club node sits at vertex 4 as a Coming Soon placeholder (locked decision #5)" snapshot. Replace with: vertex 4 is the Story nav node (FRAC-47, replaces FRAC-36 placeholder); Political Club hidden from Navbar and banner grid; reachable only by direct route.

### Edit 8 — Linting Notes / Accepted divergences ~345-350

Drop items 2 (Inter), 3 (#1a1a1a), and 4 (lab purple consumers) — all closed today. Keep item 1 (cream-math `#f8f6f0` precision divergence — still open). Add a NEW item documenting the `houses.ts:319 color` field deferral (FRAC-34 closed the consumers in `src/components/lab/*` but the field itself stays until the broader legacy-`color` sweep).

Final list under "Accepted divergences": **2 items** (cream-math + houses.ts deferred field).

## Items deliberately NOT changed

- YAML front matter (tokens, components, spacing).
- The "No dark mode" claim.
- The "primary is charcoal" rule.
- "Don't use raw `#1a1a1a`" / "Don't use raw `#6B4C9A`" — these are forward-looking rules, not snapshots.
- The cream-math precision note (still open).
- The lint-output snapshot (`0 errors, 27 warnings, 1 info` — verified unchanged).
- The contrast / orphaned-tokens warning enumeration.
- All `src/index.css` / `HouseBanner.tsx` / `button.tsx` line references — verified still correct.

## Out of scope

- No new tokens.
- No policy rewrites.
- No structural reorganization.
- No edits to CLAUDE.md, PRD, decision notes, plans, or `src/`.
- No bump of pinned `@google/design.md@0.2.0`.

## Approach

1. Branch from latest master: `git checkout -b frac-48-design-md-cleanup`.
2. Make the 8 prose edits in DESIGN.md.
3. Run lint: `npx --no-install @google/design.md@0.2.0 lint DESIGN.md`. Expect `0 errors`; warnings should not climb above 27.
4. Verify with grep (acceptance criteria below).
5. Commit, push, open PR.

## Acceptance criteria

1. `npx --no-install @google/design.md@0.2.0 lint DESIGN.md` → `0 errors`; warning count ≤ 27.
2. `grep -n "OctahedronHero.tsx" DESIGN.md` shows no `:404-413` — replaced by `:410-419`.
3. `grep -n "1a1a1a" DESIGN.md` shows no claim that any site "still uses" raw `#1a1a1a`. The Don't-rule stays.
4. `grep -ni "font-sans.*jetbrains\|jetbrains.*font-sans" DESIGN.md` shows no claim that JetBrains Mono is the current sans.
5. `grep -n "6B4C9A" DESIGN.md` matches only the Don't-rule + the deferred `houses.ts:319` field note — no "still in `src/components/lab/*`" claim.
6. `grep -ni "vertex 4" DESIGN.md` reflects Story node, not Political Club Coming Soon.
7. Accepted divergences list has exactly **2 items**.
8. `git diff DESIGN.md` shows only the documented edits; no YAML front-matter changes.

## Critical files

- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` — the only file edited.
- `/Users/fractalos/Dev/fractal-nyc/src/components/three/OctahedronHero.tsx` — read-only verification (line 410-419 face order; line 129 Story node).
- `/Users/fractalos/Dev/fractal-nyc/src/index.css` — read-only verification (Inter at line 1; `--font-sans` at line 6).
- `/Users/fractalos/Dev/fractal-nyc/src/components/house/HouseBanner.tsx` — read-only verification (no more `#1a1a1a`).
- `/Users/fractalos/Dev/fractal-nyc/src/data/houses.ts` — read-only verification (line 319 still has the deferred `color: "#6B4C9A"`).

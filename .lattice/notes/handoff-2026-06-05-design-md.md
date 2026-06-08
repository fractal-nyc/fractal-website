# Session Handoff — 2026-06-05 → DESIGN.md authoring

## What this session accomplished

The goal: implement the @google/design.md strategy on `fractal-nyc` to give every coding agent a single normative reference for the visual system.

Instead of jumping to DESIGN.md authoring, the session restructured the work into a proper sequence (audit → gap analysis → authoring) and then did the heavy cleanup that was needed before any spec would mean anything.

### 6-agent visual layer audit (FRAC-21)
Ran `team_three_review`-style audit with Claude × 2 + Codex × 2 (Gemini × 2 rate-limited out). Synthesis at `.lattice/notes/FRAC-21-team-review-20260605-1551.md`. Surfaced 5 critical structural problems and many smaller findings.

### 10 cleanup tasks landed on master
All shipped as separate PRs with the 3-sub-agent lifecycle (plan → impl → review):

| Task | PR | What changed |
|---|---|---|
| FRAC-25 | #144 | Deleted dead `FractalObject.tsx` |
| FRAC-26 | #145 | Cream surface normalized to canonical `#f8f6f0` |
| FRAC-29 | #146 | Navbar Jacquard fixed-px → `clamp()` |
| FRAC-30 | #147 | Removed unwired `.dark` token block |
| FRAC-31 | #148 | `.display-roman` utility (~12 inline triplets extracted) |
| FRAC-32 | #149 | Hidden-route data → single SoT in `houses.ts` |
| FRAC-24 | #150 | **House palette → canonical `{ light, deep }` pairs** |
| FRAC-28 | #151 | `prefers-reduced-motion` coverage extended sitewide |
| FRAC-27 | #152 | New minimal Button + 8 raw-`<a>` CTAs migrated |
| FRAC-33 | #153 | A11y pass — hero combobox, octahedron skip-nav, AA contrast |

### Octahedron iteration (10 more PRs)
After cleanups, addressed the user-flagged hero issues:
- FRAC-20 (#154): restored Political Club photo + removed FRAC-17 tint
- FRAC-35 (#155): added `tex.colorSpace = SRGBColorSpace` (correct gamma)
- FRAC-36 (#156): Political Club "Coming Soon" placeholder node at vertex 4
- FRAC-37 (#157): label simplified to "Coming Soon" only; dark-photo concern resolved → user accepted current rendering
- FRAC-38 (#158): reordered `FACE_SECTION_MAP` to spread greens
- FRAC-39/40 (#159/#160): tried palette overlay shader (deep, then light) — **reverted**
- FRAC-41 (#161): reverted overlay shader back to plain texture
- FRAC-42 (#162): swapped people ↔ school
- FRAC-43 (#163): swapped story ↔ people (final order: campus, events, lab, school, neighborhood, people, forum, story)

## Decisions locked in this session (DO NOT re-debate)

1. **Canonical cream:** `#f8f6f0` (the systemic `--background` value). `#faf8f5` was a stray; `#f7f6f2` was a stale comment.
2. **House palette source of truth:** `HOUSES[id].palette: { light, deep }` in `src/data/houses.ts`. Old "Fractal Bright" hexes (`#8B7355` etc.) retired. Page bg literals (`Campus.tsx:8` etc.) ARE the canonical source — left alone.
3. **Dark mode:** not planned. `.dark` token block deleted. DESIGN.md must NOT declare dark tokens.
4. **Button:** new minimal `Button` matching shipped reality. Default variant has Mandelbrot corners. Real CTAs migrated; inline text-flow links stay raw.
5. **Octahedron Political Club:** visible as "Coming Soon" placeholder node at vertex 4. Navbar still hides Political Club.
6. **Octahedron face order:** `campus, events, lab, school, neighborhood, people, forum, story` — greens at faces 0 and 4. Not gospel; cheap to tweak if needed.
7. **Octahedron photo rendering:** plain `MeshBasicMaterial` + `tex.colorSpace = SRGBColorSpace`. No shader overlay. Photos render at "correct" sRGB tone (user explored brighter and ultimately accepted current).
8. **Mobile-first 375px baseline:** non-negotiable per PRD.
9. **Motion:** `prefers-reduced-motion` is honored sitewide via `src/hooks/usePrefersReducedMotion.ts`.
10. **`--font-sans` and `--font-mono` still both = JetBrains Mono.** Not resolved this session — DESIGN.md author should decide whether to collapse them or rename `--font-sans` to a real sans.

## Where the v0 DESIGN.md draft lives

There's a draft from earlier in this session on branch `frac-19-design-md` (worktree at `.claude/worktrees/agent-a3a9810eccf8190d6`, two commits: `78c2b3d` impl + `405229a` review fixes). It was authored WITHOUT the audit and gap analysis as inputs. **Treat as reference only.** The decisions above supersede whatever's in that draft.

## What's still open

| Task | Status | Note |
|---|---|---|
| **FRAC-23** | backlog | Gap analysis: current state vs design.md spec |
| **FRAC-19** | backlog | Author DESIGN.md (depends on FRAC-23) |
| **FRAC-34** | backlog | Lab folder `#6B4C9A` purple migration (cosmetic, non-blocking) |

## Suggested next-session flow

1. **Spawn planning sub-agent for FRAC-23** with fresh context — read the audit synthesis, read `houses.ts` / `index.css` / new Button / new motion hook, then produce gap analysis at `.lattice/notes/<task_id>-gap-analysis.md`.
2. **Review the v0 DESIGN.md draft** as one input — decide what to keep vs rewrite based on FRAC-23 findings.
3. **Spawn impl sub-agent for FRAC-19** — author the DESIGN.md on a fresh branch from master. Validate with `npx @google/design.md@0.2.0 lint DESIGN.md`. Zero errors required; orphaned-token + contrast warnings acceptable if justified.
4. **PR + merge.** DESIGN.md ships at repo root.

## Known Lattice noise (don't fight it)

- **Short-ID collisions:** Several new tasks (FRAC-22, FRAC-29, FRAC-30, FRAC-38, FRAC-41, FRAC-42, FRAC-43) collide with stale `short_id` fields on old completed tasks. The live ids.json map is correct; the noise is in old JSONs that still claim their original short_id. Use full UUIDs (`task_01KTC...`) when in doubt.
- **The PRD plan file is at `.lattice/plans/FRAC-22.md`** (CLAUDE.md references this path). The PRD task itself has UUID `task_01KN2805JH23P36QDSQH4EJ538` and a stale `short_id: "FRAC-22"` that no longer matches the live mapping. The file path stays valid even though the short ID assignment moved.

## Master state at handoff

- Latest commit: `c07192f` (FRAC-43 merge)
- Branch in main repo working tree: `frac-17-18-color-tweaks` (11+ commits behind master, with an uncommitted FRAC-17-style ShaderMaterial experiment that is irrelevant — discard or stash before pulling master).
- Build: passes. Tests: 141 pass / 4 pre-existing fails (footer × 2, navigation, neighborhood — unrelated to anything this session touched).

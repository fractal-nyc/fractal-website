# Session Handoff — 2026-06-06 → post-DESIGN.md workstream

## TL;DR

The DESIGN.md workstream is **done and on master.** `DESIGN.md` now exists at the repo root as the normative source of truth for tokens (colors, typography, radii, spacing, components). 4 follow-up tasks were spun to bring shipped code into alignment with DESIGN.md (`FRAC-44`–`46` + revised `FRAC-34`). A 5th task (`FRAC-47`) was added to convert the octahedron "Coming Soon" placeholder node into a real Story node.

Master HEAD at handoff: `05ca351` (PR #165 merge). Build passes; tests at the same 141 pass / 4 pre-existing fails as before.

## What this session accomplished

### Gap analysis (FRAC-23, PR #164 → merged `9650d41`)
- 6-agent visual-layer audit findings (FRAC-21 synthesis) mapped against the `@google/design.md` v0.2.0 spec.
- 8-section deliverable at `.lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md`.
- Caught 2 stale audit findings already resolved on master (C5 muted-foreground contrast, C7 octahedron shader overlay).
- Surfaced 8 open questions for human decision.
- Full 3-sub-agent lifecycle (plan → impl → review), review verdict PASS.

### Open-questions resolution (human-decided, durable note)
- All 8 answers captured at `.lattice/notes/FRAC-19-design-decisions-20260605.md`.
- The 8 answers in one line each:
  1. `font-sans` = **Inter** (new font, source change required); `font-mono` = JetBrains Mono.
  2. `primary` = **charcoal `#171717`**; accept `missing-primary` lint warning.
  3. Spacing: **inventory now, simplify later**.
  4. Components: **Button (4 variants) + HouseBanner** modeled in YAML; AvatarBadge / Navbar / Hero / OctahedronHero are prose-only.
  5. House tokens use **displayName slugs** (`house-political-club-deep`, `house-publications-light`, etc.), not internal IDs.
  6. Canonical charcoal = **`#171717`**; `#1a1a1a` (4 sites) is drift.
  7. Lab purple **`#6B4C9A` is dead** — no new token. Replace 8 sites with Lab palette pinks.
  8. Pin **`@google/design.md@0.2.0`**.

### DESIGN.md authored (FRAC-19, PR #165 → merged `05ca351`)
- `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` at repo root.
- 31 color tokens (19 surface + 12 house), 2 typography tokens, 4 rounded, 19 spacing, 5 component entries.
- 8 prose sections in canonical order (Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts) + closing Linting Notes appendix.
- Lint: `npx @google/design.md@0.2.0 lint DESIGN.md` → **0 errors, 27 warnings, 1 info**. All warnings documented as accepted (`contrast-ratio` on two intentional pairs; `orphaned-tokens` on runtime-swapped house tokens + surface tokens consumed by Tailwind utilities).
- Surprise during impl: `missing-primary` lint does NOT actually fire — it validates *presence* of `primary`, not its hue. DESIGN.md's Linting Notes states this divergence from expectation explicitly.
- Full 3-sub-agent lifecycle, review verdict PASS.

### Mid-merge conflict resolution
- After PR #164 merged, PR #165 hit a `.lattice/ids.json` conflict (both PRs added their own short-ID entry to the same `"map"` object).
- Resolved by including both entries; JSON validated; pushed; Netlify went CLEAN; merged.

## Decisions locked this session (DO NOT re-debate)

The 10 locked decisions from the prior session's handoff (`handoff-2026-06-05-design-md.md`) still apply. **In addition**, the 8 decisions in `.lattice/notes/FRAC-19-design-decisions-20260605.md` are now locked. Specifically:

1. **Cream `#f8f6f0` stays canonical** despite HSL `40 25% 96%` math producing `#f7f6f2`. The tightening of `--background` HSL → `#f8f6f0` math is a follow-up (no FRAC ticket yet — see Open work below if you want one).
2. **House palette `{ light, deep }` SoT is `src/data/houses.ts`.** Page-bg literals (`Campus.tsx:8` etc.) are canonical.
3. **No dark mode.** No `.dark` tokens. No `colors.brand`. No `colors.text-default`.
4. **Mobile-first 375px baseline.**
5. **Octahedron face order:** campus, events, lab, school, neighborhood, people, forum, story. Cheap to tweak but currently locked.
6. **Octahedron photo rendering:** plain `MeshBasicMaterial` + `tex.colorSpace = SRGBColorSpace`. No shader overlay.
7. **All `prefers-reduced-motion` gating is sitewide** via `src/hooks/usePrefersReducedMotion.ts`.
8. **House tokens are keyed by displayName slug.** `house-political-club-*` not `house-forum-*`; `house-publications-*` not `house-lab-*`; etc. **Watch this** — code still uses internal IDs (`HOUSES.lab`, `HOUSES.forum`, etc.); DESIGN.md tokens speak the displayName language.

## Where things live now

- **DESIGN.md** at `/Users/fractalos/Dev/fractal-nyc/DESIGN.md` (master). Single source of truth for tokens.
- **FRAC-21 audit synthesis** at `.lattice/notes/FRAC-21-team-review-20260605-1551.md` (master, via PR #164).
- **FRAC-23 gap analysis** at `.lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md` (master, via PR #164).
- **FRAC-19 design decisions** at `.lattice/notes/FRAC-19-design-decisions-20260605.md` (master, via PR #165).
- **PRD** at `.lattice/plans/FRAC-22.md` (unchanged — still the historical filename).
- **Prior session handoff** at `.lattice/notes/handoff-2026-06-05-design-md.md` (still applies for context on the 10 prior locked decisions).
- **This handoff** at `.lattice/notes/handoff-2026-06-06-post-design-md.md`.

## Open work — backlog tasks ready to pick up

| Task | Title | Notes |
|---|---|---|
| **FRAC-34** | (revised) Remove `#6B4C9A` purple, replace 8 sites with Lab palette pinks | Lab palette pinks live in `houses.ts` at `HOUSES.lab.palette = { light: "#E870A0", deep: "#C44878" }`. Drop the legacy `color: "#6B4C9A"` field too. Trivial; ~30 min. |
| **FRAC-44** | Add Inter font + update `--font-sans` token | DESIGN.md declares Inter as canonical for body, but `src/index.css:6` still says JetBrains Mono. Add the Google Font import + swap. ~5–10 LOC. |
| **FRAC-45** | Collapse ad-hoc spacing into canonical scale | DESIGN.md has the inventory (19 distinct values); this task picks canonical breakpoints and migrates. Medium-large; touches every page's vertical-rhythm classes. |
| **FRAC-46** | Normalize 4 raw `#1a1a1a` → `--foreground` | Trivial. 4 edits in 2 files (`OctahedronHero.tsx:584,801`, `HouseBanner.tsx:96-97`). ~15 min. |
| **FRAC-47** | Convert octahedron "Coming Soon" placeholder to Story node | Depends on FRAC-20 (done) + FRAC-36 (done — placeholder already exists). Restore tap navigation, swap color to Story brand `#D4BA58` (verify against `houses.ts` HEAD), drop inactive treatment. Does NOT un-hide Political Club from navbar (locked). |

Plus other open items from the gap analysis worth potentially ticketing (NOT spun this session):
- **Tighten `--background` HSL** so the math produces canonical `#f8f6f0` instead of `#f7f6f2`.
- **Consolidate container `max-w-*` scale** (11 distinct values + arbitrary `[800px]` / `[420px]`).
- **Remove legacy `houses.ts.color` field** once `AvatarBadge` and `HouseBanner` fallback paths are refactored to read `palette` instead.

## Worktrees to clean up

Two worktrees from this session are now stale (their branches were merged):

```
.claude/worktrees/frac-23-gap-analysis     [branch: frac-23-gap-analysis — merged via #164]
.claude/worktrees/frac-19-design-md-v2     [branch: frac-19-design-md-v2 — merged via #165]
```

The orchestrator did NOT remove them in this session in case follow-up tweaks land before someone garbage-collects. Safe to remove now:
```
git worktree remove .claude/worktrees/frac-23-gap-analysis
git worktree remove .claude/worktrees/frac-19-design-md-v2
git branch -D frac-23-gap-analysis frac-19-design-md-v2  # optional
git push origin --delete frac-23-gap-analysis frac-19-design-md-v2  # optional
```

The v0 worktree at `.claude/worktrees/agent-a3a9810eccf8190d6` (branch `frac-19-design-md`) is the abandoned earlier attempt — also safe to remove if confirmed unused.

## Known lingering noise (don't fight it)

- The main worktree at `/Users/fractalos/Dev/fractal-nyc` is still on branch `frac-17-18-color-tweaks` with many `.lattice/events/*` modifications + untracked task JSONs from prior sessions. These are sibling-agent state that hasn't been committed to master yet (a project-wide pattern — see prior session's handoff "Known Lattice noise"). Leave alone.
- `.lattice/ids.json` on master now has 19, 23 in the map but next_seqs is still 17 (not bumped). The next `lattice create` on a fresh worktree off master would assign FRAC-17 — but with FRAC-17 already in the prior session's uncommitted ids.json, this is harmless. Lattice's behavior under this drift hasn't bitten us yet.
- New task FRAC-47 was created from the main worktree; its task JSON and event log are uncommitted in that worktree (along with FRAC-44/45/46). These need a "lattice state catch-up" commit at some point, but not blocking.

## Suggested next-session flow

The user said "continue onto our plan" — interpret as: keep moving on Fractal NYC's roadmap. Concrete starting points (in roughly increasing complexity):

1. **Trivial cleanup pass** — FRAC-46 (4 charcoal sites) + FRAC-34 (8 Lab purple sites). Both are mechanical. ~45 min combined. Can run in parallel with isolated worktrees per the project's `feedback_parallel_impl_isolated_worktrees` memory.
2. **FRAC-44 (Inter font)** — small but visible. Brings DESIGN.md and shipped code into alignment on typography. Run the full 3-sub-agent lifecycle.
3. **FRAC-47 (Story node)** — small visual change. Verify Story is the intended color and that locked decision #5 (Political Club stays hidden from navbar) is honored.
4. **FRAC-45 (spacing migration)** — substantial design judgment + broad code change. Probably wants dialogue-driven planning before spawning a sub-agent.

If the human wants to address something off this list (new feature, new page, etc.), the DESIGN.md tokens should now be the first reach: declare new tokens there, then implement code that consumes them.

## Picking up where we left off (paste this into the next session)

```
We're picking up Fractal NYC after the DESIGN.md workstream landed. Repo at
/Users/fractalos/Dev/fractal-nyc, master HEAD 05ca351 (PR #165 merge).

Full session handoff at: .lattice/notes/handoff-2026-06-06-post-design-md.md
— read this in full before doing anything.

Prior session handoff at: .lattice/notes/handoff-2026-06-05-design-md.md
(still applies for the 10 earlier locked decisions).

Authoritative docs:
- DESIGN.md (repo root) — source of truth for tokens
- .lattice/notes/FRAC-19-design-decisions-20260605.md — 8 design decisions
- .lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md — gap analysis
- .lattice/notes/FRAC-21-team-review-20260605-1551.md — audit synthesis
- .lattice/plans/FRAC-22.md — PRD

Open tasks ready to pick up: FRAC-34, FRAC-44, FRAC-45, FRAC-46, FRAC-47.
See § Open work in the handoff for scoping notes.

Locked decisions you must respect (do not re-debate):
- The 8 from FRAC-19-design-decisions-20260605.md
- The 10 from handoff-2026-06-05-design-md.md
- DESIGN.md itself (now normative)
- Mobile-first 375px baseline
- No dark mode

Project conventions: see CLAUDE.md (Lattice mandatory, 3-sub-agent lifecycle
per task, mobile-first non-negotiable). Use the Lattice short codes when
possible; full UUIDs for the new tasks (FRAC-44 through FRAC-47) are
resolvable via lattice show.

Tell me which task you want to pick up, or ask if you want to start fresh.
```

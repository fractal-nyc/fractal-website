# FRAC-41: Add mono input typography tier to DESIGN.md + migrate ArchiveSearch input

Dialogue-driven (2026-06-08 session with Julianna, during FRAC-21 PR review). Bundled into the FRAC-21 branch + PR rather than its own branch, because the user surfaced the ArchiveSearch input issue mid-review and asked to fix it before merge.

## Scope

1. **DESIGN.md** — add a new "Control tier" section to the Typography utilities table documenting `.text-control` (mono, weight 400, normal-case, normal tracking, text-base). Explain that name `.text-control` is chosen (not `.text-input`) to avoid the Tailwind v4 auto-generated `text-input` color utility collision (codebase declares `--color-input` as a theme token).
2. **src/index.css** — add `.text-control` rule under the chrome tier block.
3. **src/components/lab/ArchiveSearch.tsx** — replace `text-base font-light` on the input className (line ~41) with `text-control`. No other changes to that file.

## Why this design (decisions baked into the plan via dialogue)

- **Mono family**: user wanted the input to feel editorial / on-pattern with the chrome tier (eyebrow/label/meta), but the chrome tier's `uppercase + text-sm` breaks typed-text UX.
- **Weight 400**: weight 300 initially shipped but read too wispy at lowercase; bumped to 400 during dialogue. If still too thin in practice, 500 is the next move.
- **text-base (16px)**: iOS no-zoom threshold. Non-negotiable for mobile-first.
- **Normal case / normal tracking**: typed text must render in whatever case the user types; tracking 0.1em is too wide for sustained reading of typed input.
- **Name `.text-control` not `.text-input`**: avoids name collision with Tailwind v4's auto-generated color utility from the `--color-input` theme token (this gotcha bit us during dialogue — `.text-input` was rendering typed text in the pale input-border color because Tailwind's utility was winning the cascade).

## Acceptance criteria

- `.text-control` rule lands in `src/index.css` with the explanatory comment about the name collision.
- DESIGN.md has the new Control tier table row + explanation.
- `ArchiveSearch.tsx` input uses `text-control`, not `text-base font-light`.
- Typed text renders dark (`text-foreground`), placeholder renders muted (`text-muted-foreground`), at 16px, JBM, weight 400, normal-case.
- No iOS zoom-on-focus regression.
- `pnpm typecheck` clean. No new test failures.

## Out of scope

- Other input controls across the codebase (HeroSearch, etc.). They'll migrate as their pages' Apply tasks land.
- The `.text-input` name collision fix at the system level (e.g., renaming the theme color token from `--color-input`) — leave the theme token name as shadcn provides it.

## Verification

User-driven visual walkthrough at 375px during dialogue. Orchestrator records `--role review` comment attributing verification to the human-in-loop walkthrough (since FRAC-41 was dialogue-driven and bundled into FRAC-21, no separate sub-agent review cycle).

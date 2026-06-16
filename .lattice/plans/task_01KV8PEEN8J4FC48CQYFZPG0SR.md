# FRAC-202: Design-conformance PR gate (net-new off-vocabulary colors)

## Goal
Preventive half of the design-governance loop: catch **new** color drift at PR time so it's
either conformed to a token or deliberately documented — never merged silently. Companion to
the periodic `/design-audit` sweep.

## Design
A Node script reports color values used in `src/` that are **off-vocabulary** and **not
grandfathered**, exiting non-zero if any are net-new.

- **Sanctioned set** = tokens parsed live from `src/index.css` `@theme` (`--color-*` names →
  `foreground`, `background`, `foreground-muted`, `foreground-faint`, `house-*`). Reading the
  same source means a token rename never breaks the gate.
- **Baseline allowlist** (`scripts/design-conformance.baseline.json`) = the currently-existing
  off-token values (raw hex in `[#...]` arbitrary classes + inline `style` hexes), captured
  once so today's drift (house-hex hardcodes, page-identity colors like `#C49040`/`#DFCA7A`,
  debug colors) does NOT fail CI. Only values beyond the baseline fail.
- **Resolution message** on failure: for each net-new value, print `file:line` and: "Use a
  design token, OR bless it — add to scripts/design-conformance.baseline.json AND document the
  intent in DESIGN.md."

## What counts as a color usage (scan `src/**/*.{tsx,ts,css}`)
1. Arbitrary color classes: `(bg|text|border|ring|from|to|via|fill|stroke|outline|divide)-\[#hex\]`.
2. Inline style hexes: `#[0-9a-fA-F]{3,8}` in `.tsx`/`.ts` (style objects / data).
3. (Token utilities are inherently fine — skip.)
Normalize hex to lowercase 6-digit for comparison. Ignore: SVG `feColorMatrix`/noise data URIs,
`data-*`, comments where feasible (best-effort; false positives go in the baseline).

## Files
- `scripts/design-conformance.mjs` — the check (color dimension; structured so typography/spacing
  can be added as more "dimensions" later).
- `scripts/design-conformance.baseline.json` — generated grandfather list (also re-generatable
  via `node scripts/design-conformance.mjs --update-baseline`).
- `package.json` — add `"conformance": "node scripts/design-conformance.mjs"`.
- `.github/workflows/conformance.yml` — run `pnpm conformance` on pull_request (repo has no GHA
  yet; pnpm via corepack, mirroring netlify.toml).
- `DESIGN.md` — short "Design conformance" note: what the gate enforces + how to bless a value.

## Acceptance criteria
- `pnpm conformance` exits 0 on the current tree (baseline grandfathers all existing off-token
  values).
- Introducing a NEW off-token hex (e.g. `bg-[#123456]`) makes it exit non-zero and name the
  `file:line`; removing it returns to 0. (Demonstrate in the review.)
- `--update-baseline` regenerates the baseline deterministically (sorted, stable).
- Token rename safety: the allowed-token set is derived from `index.css`, not hardcoded.
- `pnpm build` + `pnpm typecheck` + `pnpm test` still pass (the script is dev-only; no app impact).
- GHA workflow is valid YAML and runs the script on PRs.

## Out of scope (future)
- Typography/spacing dimensions (extend the same script).
- Auto-burndown of the baseline (that's the `/design-audit` consolidate tasks).
- Blocking on Netlify (GHA is the gate surface).

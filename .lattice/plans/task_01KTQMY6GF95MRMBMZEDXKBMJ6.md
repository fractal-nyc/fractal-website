# FRAC-181 — Home page loading optimization (senior-eng pass)

## Goal
First-paint on cellular phones must be pristine, above industry standard, before the business launch. FRAC-178 shipped (lazy-load WebGL, dropped poster preload, narrowed Google Fonts axes) and the home page is still slow on first open per the user.

## Approach

1. **Multi-model senior-engineer review.** Prompt at `/tmp/perf-review-prompt.md` frames the model as a senior staff engineer doing a full waterfall audit (bundle, fonts, images, render-blocking CSS, third-party scripts, hydration, WebGL timing, preload/prefetch, cache headers, edge config). Reports go to:
   - `/tmp/perf-review-claude.md` (Claude)
   - `/tmp/perf-review-gemini.md` (Gemini)
   - `/tmp/perf-review-codex.md` — **skipped: Codex CLI rejected by the user's ChatGPT account on every model tried (gpt-5-codex / gpt-5 / default). Proceeding dual-force (Claude + Gemini) and noting the gap.**

2. **Consolidate findings.** Cross-reference the two reports — agreements get priority, single-model findings are kept if specific and load-bearing. Re-derive severity from observed evidence (file paths, byte sizes, render-blocking proof).

3. **Triage into a punch list.** Write the consolidated punch list back into this plan file under "## Findings — consolidated". Order by impact-per-effort. Quick wins (< 30 min, > 200 ms) go first.

4. **Implement.** Execute the punch list on branch `frac-181-perf-launch`. Validate each fix against the prediction (DOMContentLoaded, total transfer, lighthouse mobile score). Stop when the page is pristine, not when the list is exhausted.

5. **Verify on Netlify preview** with Chrome DevTools, iPhone viewport, Fast 3G throttle, hard reload. Capture before/after waterfall + timings.

## Acceptance criteria
- [ ] Both review reports complete and consolidated into this plan.
- [ ] Every "critical" and "high" finding either fixed or explicitly deferred with rationale.
- [ ] DOMContentLoaded < 2 s on iPhone / Fast 3G hard reload (target: 1 s).
- [ ] Lighthouse mobile Performance ≥ 90.
- [ ] No regression in WebGL hero, fonts, or visual fidelity.

## Branch
`frac-181-perf-launch`

## Findings — consolidated
*(filled in after both reviews complete)*

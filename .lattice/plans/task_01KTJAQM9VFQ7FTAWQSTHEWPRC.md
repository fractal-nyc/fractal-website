# FRAC-56 Plan: Body Cleanup — Redundant `normal-case` Removal + Home TODO Resolution

## Summary

FRAC-51 flipped global body to `normal-case` and shipped `.text-body` / `.text-body-lead` utilities. The audit's "37 redundant `normal-case`" estimate was pre-FRAC-55. After FRAC-55 absorbed the heading editorial cases (proper-noun, sentence, question h2/h3 sites), only **4 body-tier `normal-case` instances remain redundant** — all in Campus.tsx. This PR removes those 4, deletes the FRAC-56 TODO comment from Home.tsx (the mono block flagged is intentional chrome, not body), and defers `.text-body` / `.text-body-lead` adoption pending a separate design decision on Campus body weight.

## PRD alignment

FRAC-22 doesn't constrain body voice. The typography spec is the active source of truth and says: "Body case = `normal-case` by default." This PR is pure cleanup — no PRD conflict.

## `normal-case` audit (27 hits total)

**REDUNDANT (drop) — 4 sites, all Campus:**

| file:line | Current className (compressed) | Why redundant |
|---|---|---|
| `src/components/sections/Campus.tsx:176` | `text-xs md:text-sm text-white/70 font-light leading-relaxed normal-case` | Plain `<p>` body, no `.font-serif`/chrome ancestor |
| `Campus.tsx:218` | `text-xs md:text-sm text-white/70 italic normal-case text-center` | Italic only, not `.font-serif`; no uppercase ancestor |
| `Campus.tsx:503` | `mt-3 text-sm text-white/70 normal-case` (`<footer>`) | Plain `<footer>` element, no font-serif ancestor |
| `Campus.tsx:532` | `text-sm text-white/70 italic normal-case` | Plain italic role line, not `.font-serif` |

**INTENTIONAL (keep) — 23 sites:**
- `.font-serif` opt-outs (~10 sites): HouseBanner.tsx:139, Campus.tsx:200/230/500/529, Events.tsx:10, Projects.tsx:31, Vision.tsx:29, LabPage.tsx:53, NeighborhoodCampusDiagram.tsx:109
- `.text-title` / `.text-subtitle` opt-outs (~10 sites): DocumentBadge.tsx:94, Campus.tsx:256/299/321/351/400/465/482/496/580, Directory.tsx:48, LiberalArts.tsx:28, NeighborhoodCampusDiagram.tsx:77, Projects.tsx:49, Vision.tsx:17, StoryPage.tsx:169
- `<span>` opt-outs inside uppercase ancestors (3 sites): Events.tsx:11, Projects.tsx:32, Vision.tsx:18

Plus 1 comment in `src/index.css` (not a class).

## `.text-body` / `.text-body-lead` adoption: NONE in this PR

Many candidate paragraphs in Campus use `font-light` (weight 300) at `text-sm md:text-base`, which doesn't match either utility (`.text-body` is weight 400 at `text-base`; `.text-body-lead` is weight 300 at `text-lg`). Migrating would visually shift design-tuned weight on dark-background sections.

Defer until a design decision lands on whether Campus body weight should be 300 or 400. Document this in PR description as future follow-up.

## Home.tsx TODO resolution

The block at `src/pages/Home.tsx` flagged by FRAC-54 is the "Golden Age Protocol" essay — mono uppercase thin, paired with the `.text-display` "A Golden Age Protocol" heading. This is **chrome voice**, not body:
- Explicit `font-mono`, `uppercase`, `font-thin`, inline `fontStyle: "normal"`
- Multi-paragraph essay rendered in mono as the editorial signature
- `.text-body` (Inter, normal-case, weight 400) would obliterate design intent
- Not eyebrow/label/meta either (those are short chrome labels, not essays)
- A legitimate one-off voice; spec allows ad-hoc utility combinations

**Action:** delete the `{/* TODO FRAC-56: mono uppercase body block — flag for body-cleanup task */}` comment. Leave className untouched.

## Sites OUT of scope

- All Campus dark-background body paragraphs using `text-sm md:text-base text-white/90 font-light leading-relaxed` — design-tuned weight 300; migrating would silently shift visual weight. Defer pending design call.
- `Vision.tsx:23` `<p className="text-xl md:text-3xl font-light text-foreground/80 leading-relaxed text-balance">` — display-tier lead, not body.
- `Projects.tsx:50` single project description — close to `.text-body-lead` but with `text-foreground/70`; defer (not a repeated pattern).
- `DocumentGrid.tsx:26` empty-state `<p>` — short label.
- All other utility-owned sites (buttons, headings, eyebrow/label/meta).

## Open questions / resolutions

1. **Should Campus dark-background body adopt `.text-body`?** No in this PR. Design call required (weight shift 300 → 400). Note in PR as future follow-up.
2. **Is Home mono block chrome or body?** Chrome. Mono uppercase thin is semantically distinct from body. Documented.
3. **Does dropping `normal-case` on the 4 Campus sites change rendering?** No. None are inside `.font-serif` or `.text-title` ancestors and the global body default is now `normal-case`. Visual diff zero.

## Acceptance criteria

- 4 `normal-case` removals on `Campus.tsx` lines 176, 218, 503, 532 (only the class token, surrounding utilities preserved).
- 23 `normal-case` sites preserved (per audit table).
- `Home.tsx` TODO comment `{/* TODO FRAC-56: ... */}` deleted; className unchanged.
- `rg "normal-case" src/` shows exactly 23 hits across `.tsx` files plus the 1 CSS comment in `index.css` (24 total).
- `rg "TODO FRAC-56" src/` returns zero results.
- All existing tests pass (4 pre-existing failures baseline).
- `pnpm build` + `pnpm typecheck` clean.
- Mobile-first spot check (375px) on Home + Campus — no visual regression.

## Branch & PR plan

- **Branch:** `frac-56-body-cleanup` (impl creates from master).
- **PR title:** `FRAC-56: body cleanup — 4 redundant normal-case removals + Home TODO resolution`
- **PR body:** Call out:
  - "37 redundant" spec estimate was pre-FRAC-55; FRAC-55 absorbed the heading editorial cases, leaving 4 true body-tier redundants.
  - Home.tsx mono block kept as-is (chrome voice, not body); TODO comment cleared.
  - No `.text-body` / `.text-body-lead` adoption in this PR — Campus body weight (300) deferred as design call.
- Link to typography spec and PRD.

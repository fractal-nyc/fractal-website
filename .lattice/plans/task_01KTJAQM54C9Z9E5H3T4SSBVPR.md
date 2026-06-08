# FRAC-54 Plan: Eyebrow + label + meta normalization

## Summary

FRAC-51 shipped `.text-eyebrow`, `.text-label`, and `.text-meta` (rendering identically: `font-mono text-sm font-medium uppercase letter-spacing:0.1em`). FRAC-54 sweeps the codebase to retire ad-hoc `text-xs/text-sm + uppercase + tracking-* + font-semibold/thin/medium` combinations and replace them with the correct semantic utility. Goal: collapse 15 drifted sites into 3 canonical names. One test assertion update required (`neighborhood.test.tsx`).

## PRD alignment

FRAC-22 explicitly calls out "labels/nav" as the JetBrains Mono voice and mandates mobile-first. FRAC-54 is a pure refactor — no copy/layout/dependency changes. Strengthens consistency between houses (Lab badge labels, Campus "Photo" placeholders, Footer credits, Story TalkCard categories) which directly serves wayfinding. No PRD constraint blocks.

## Site inventory (15 sites)

Canonical target: `font-mono text-sm font-medium uppercase letter-spacing:0.1em`.

| File:line | Current className (chrome bits) | Text snippet | Classify | Replacement |
|---|---|---|---|---|
| `src/components/sections/Events.tsx:9` | `text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4` | "Events" | **eyebrow** | `text-eyebrow text-muted-foreground mb-4` |
| `src/components/sections/Projects.tsx:30` | same pattern | "Incubations" | **eyebrow** | `text-eyebrow text-muted-foreground mb-4` |
| `src/components/layout/SectorHeader.tsx:19` | `text-sm font-semibold tracking-widest uppercase` + inline `color` | House name under monogram | **eyebrow** | `text-eyebrow` (keep inline `color` style) |
| `src/components/lab/DocumentBadge.tsx:79` | `text-xs font-semibold tracking-wider uppercase` + inline `color` | Document category | **eyebrow** | `text-eyebrow` (keep inline `color`) |
| `src/pages/StoryPage.tsx:155` | `text-xs font-semibold tracking-wider uppercase` + inline `color` | Talk category | **eyebrow** | `text-eyebrow` (keep inline `color`) |
| `src/pages/NeighborhoodPage.tsx:29` | `text-xs font-semibold uppercase tracking-wider text-white mb-2 md:mb-3` | "Note" | **eyebrow** | `text-eyebrow text-white mb-2 md:mb-3` |
| `src/components/sections/Campus.tsx:161` | `text-xs tracking-widest uppercase text-white/40` | "Photo" placeholder | **label** | `text-label text-white/40` |
| `src/components/sections/Hero.tsx:114` | `font-mono text-sm tracking-widest uppercase text-foreground/60 …` | Search input | **label** | `text-label text-foreground/60 …` (preserve border/bg/focus) |
| `src/components/sections/Hero.tsx:125` | `text-sm text-foreground/40 font-mono tracking-wider uppercase text-center` | "No results" | **meta** | `text-meta text-foreground/40 text-center` (preserve padding) |
| `src/components/sections/Hero.tsx:152` | `font-mono text-sm tracking-wider uppercase` | Search result row | **label** | `text-label` (preserve `truncate flex items-center gap-1`) |
| `src/components/sections/Hero.tsx:168` | `text-[10px] font-mono tracking-[0.2em] uppercase text-foreground/30` | Group label in dropdown | **eyebrow** | `text-eyebrow text-[10px] text-foreground/30` (intentional density override) |
| `src/components/layout/Footer.tsx:35` | `text-xs md:text-sm tracking-[0.2em] uppercase font-medium` | "New York City" | **meta** | `text-meta` |
| `src/components/layout/Footer.tsx:80` | `text-background/50 text-xs md:text-sm tracking-[0.25em] uppercase text-center` + inline `fontFamily` Mono | "New York City Collective" | **meta** | `text-meta text-background/50 text-center` (drop inline `fontFamily`) |
| `src/components/layout/Navbar.tsx:387` | `font-mono uppercase tracking-wider text-foreground` + inline `fontSize:14px, letterSpacing:0.08em` | Mobile menu section links | **label** | `text-label text-foreground` (drop redundant `font-mono`, inline `fontSize`, inline `letterSpacing`) |
| `src/pages/LabPage.tsx:49` | `flex items-center gap-2 text-sm font-thin not-italic tracking-widest font-mono text-white mb-3` | "Research + Writing" | **eyebrow** | `text-eyebrow flex items-center gap-2 text-white mb-3` (**visual change: thin→medium accepted**) |

## Sites OUT of scope (verified excluded)

| Pattern | Why excluded |
|---|---|
| shadcn `ui/*` keyboard shortcuts (`command.tsx`, `dropdown-menu.tsx`, etc.) — `text-xs tracking-widest text-muted-foreground` without `uppercase` | shadcn primitives, not editorial chrome |
| Fake-button CTAs in `LiberalArts/Campus/EventsPage/PoliticalClubPage/PeoplePage/NeighborhoodPage` | Button territory (FRAC-53) |
| `EventsPage.tsx:43` "Open calendar in new tab" anchor | Button-adjacent (FRAC-53) |
| `Navbar.tsx:150,181,212` — uppercase on `<JustifiedParagraph>` blurbs | Body prose with Knuth-Plass typesetting, not labels |
| `Home.tsx:36` `font-mono text-sm/base uppercase font-thin` body block | Body voice, not eyebrow — flag for FRAC-56 with `// TODO FRAC-56` |
| HouseBannerGrid / PretextLabel / FractalObject / OctahedronHero / JustifiedParagraph inline `textTransform:"uppercase"` | Wordmark/monogram chrome + Pretext renderers — spec preserves as "Special (unchanged)" |
| `BadgePlayground.tsx` — inline 11px / weight 600 / letter-spacing 2 | Dev playground page, not production route |

## Drift counts

- Size: 8 sites (5× `text-xs`, 1× `[10px]`, 1× inline 14px, 1 site responsive `xs→sm`)
- Weight: 9 sites (6× `font-semibold`, 1× `font-thin`, 2× unlabeled)
- Tracking: 8 sites (4× `tracking-wider`, 2× `[0.2em]`, 1× `[0.25em]`, 1× inline `0.08em`)
- Family: 5 sites missing explicit `font-mono` (currently relies on `--font-sans` token chain)

## Open questions / resolutions

1. **`LabPage.tsx:49` font-thin → font-medium** — Visual delta accepted per spec ("the kind of drift to fix"). Escalate before implementing only if Jules objects to the test of changes. Going ahead with normalization.
2. **`Hero.tsx:168` `text-[10px]` density override** — Keep as explicit override on top of `.text-eyebrow`. Document with comment that this is an intentional dropdown density tweak.
3. **`Home.tsx:36` mono body block** — Out of FRAC-54 scope; leave `// TODO FRAC-56` comment.
4. **`Hero.tsx:114` search input** — `.text-label` fits ("UI control label").
5. **`Footer.tsx:80` inline `fontFamily`** — Drop. Utility provides Mono via `@apply font-mono`. Spec mandates utility-as-source-of-truth.

## Acceptance criteria

1. All 15 in-scope sites use `.text-eyebrow`, `.text-label`, or `.text-meta` as the chrome-typography source.
2. No remaining occurrence of legacy combo `text-xs|text-sm + uppercase + (tracking-wider|tracking-widest|tracking-[0.2em]|tracking-[0.25em]) + (font-semibold|font-thin)` in the 11 modified files (excluding documented out-of-scope sites).
3. Unrelated modifiers preserved verbatim (colors, opacity, margins, padding, inline `color`, hover/focus border/bg).
4. `src/components/sections/Hero.tsx:168` retains `text-[10px]` override on top of `.text-eyebrow` with comment.
5. `src/components/layout/Footer.tsx:80` no longer has inline `fontFamily`.
6. `src/components/layout/Navbar.tsx:387` no longer has redundant inline `fontSize` / `letterSpacing`.
7. `pnpm build` + `pnpm typecheck` pass.
8. `pnpm test` — `neighborhood.test.tsx` assertion on `className.includes("tracking-widest")` will break; updated to assert `className.includes("text-eyebrow")` (one-line fix).
9. Mobile 375px spot-check on Home, Lab, Story, Campus, Neighborhood, Events, Footer — render parity within noise. Accepted deltas: LabPage Research+Writing weight thin→medium; DocumentBadge / StoryPage / NeighborhoodPage Note labels size xs→sm + tracking wider→widest.
10. Diff: ~15 line changes in `.tsx` files + 1 line in `neighborhood.test.tsx`. No `index.css`, `DESIGN.md`, or `button.tsx` edits.

## Branch & PR plan

- **Branch:** `frac-54-eyebrow-normalization` (impl agent creates from master).
- **PR title:** `FRAC-54: eyebrow/label/meta normalization — 15 chrome sites → semantic utilities`
- **PR body:** site list above; visual-deltas-accepted callout; depends on FRAC-51.
- **Followup:** `// TODO FRAC-56` comment at `Home.tsx:36` for future body-cleanup.

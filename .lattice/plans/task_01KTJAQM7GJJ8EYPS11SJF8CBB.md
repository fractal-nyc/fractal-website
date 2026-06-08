# FRAC-55 Plan: Heading Normalization (`.text-title` / `.text-subtitle`)

## Summary

31 `<h1>`-`<h6>` sites in `src/` have heading sizes ranging from `text-2xl` (Campus subsections) through `text-7xl` (Vision) for equivalent semantic levels. FRAC-51 shipped `.text-title` (`text-3xl md:text-5xl` Fraunces italic uppercase) and `.text-subtitle` (`text-xl md:text-2xl` Fraunces italic uppercase weight 300). This plan migrates 22 in-scope sites; 7 are out-of-scope (alert primitive, HouseBannerGrid display tier, BadgePlayground dev page, 3 already-migrated eyebrow h2s, AvatarBadge intentional label-tier h3).

## PRD alignment

`.lattice/plans/FRAC-22.md` calls for "bold type" and mobile-first. PRD doesn't legislate sizes, but the wayfinding goal (semantically identical sections look semantically identical) is exactly what this migration enables. The Campus subsection h2s currently render at `text-2xl md:text-3xl` while other section h2s reach `text-4xl md:text-6xl` — that drift is the fix. No PRD conflict.

## Heading inventory

### Group A: Section titles → `.text-title` (text-3xl md:text-5xl)

| File:Line | Tag | Current className | Text | New className | normal-case decision |
|---|---|---|---|---|---|
| `Vision.tsx:17` | h2 | `font-serif text-4xl md:text-6xl lg:text-7xl leading-tight text-foreground normal-case` | "Is there a vision?" | `text-title text-foreground normal-case leading-tight` | **keep** (sentence + question) |
| `Campus.tsx:256` | h2 | `text-2xl md:text-3xl font-serif mb-8 normal-case` | "Fractal Campus serves four audiences" | `text-title mb-8 normal-case` | **keep** (sentence) |
| `Campus.tsx:299` | h2 | same pattern | "A place to get shit done…" | `text-title mb-6 normal-case` | **keep** |
| `Campus.tsx:321` | h2 | same | "…and have a good time doing it." | `text-title mb-6 normal-case` | **keep** |
| `Campus.tsx:351` | h2 | same | "More than a WeWork…" | `text-title mb-6 normal-case` | **keep** (sentence + brand) |
| `Campus.tsx:383` | h2 | same | "Meet the Space" | `text-title mb-6` | **drop** (title-case label) |
| `Campus.tsx:400` | h2 | same | "What's it like to be here?" | `text-title mb-6 normal-case` | **keep** |
| `Campus.tsx:435` | h2 | same | "Events" | `text-title mb-6` | **drop** (single word) |
| `Campus.tsx:465` | h2 | same | "Merlin's Place" | `text-title mb-6 normal-case` | **keep** (proper noun) |
| `Campus.tsx:482` | h2 | same | "Our little corner in Williamsburg" | `text-title mb-6 normal-case` | **keep** (sentence) |
| `Campus.tsx:496` | h2 | same | "…and a short walk to McCarren Park" | `text-title mb-6 normal-case` | **keep** (sentence + proper noun) |
| `Campus.tsx:518` | h2 | same | "Build with us." | `text-title mb-6` | **drop** (short CTA, brutalist uppercase fits) |
| `Campus.tsx:580` | h2 | same | "…by the way, what's Fractal?" | `text-title mb-6 normal-case` | **keep** (sentence + question) |
| `PeopleDirectory.tsx:24` | h2 | `text-4xl md:text-6xl font-serif` | "People" | `text-title` | n/a (already uppercase) |
| `Directory.tsx:24` | h2 | `text-4xl md:text-6xl font-serif normal-case` | "Directory" | `text-title` | **drop** (single word) |
| `Projects.tsx:49` | h3 | `text-3xl md:text-4xl font-serif normal-case` | project titles ("Merlin's Place" etc.) | `text-title normal-case` | **keep** (proper nouns; treat as feature-row title) |

### Group B: Subsection / card titles → `.text-subtitle` (text-xl md:text-2xl)

| File:Line | Tag | Current className | Text | New className | normal-case decision |
|---|---|---|---|---|---|
| `Directory.tsx:48` | h3 | `text-xl md:text-2xl font-serif font-medium tracking-tight pr-4 normal-case` | item titles | `text-subtitle pr-4 normal-case` | **keep** (drop redundant `font-medium`, `tracking-tight` — utility owns) |
| `LiberalArts.tsx:28` | h3 | `text-2xl md:text-3xl font-serif mb-6 normal-case` | "Fractal U" | `text-subtitle mb-6 normal-case` | **keep** (proper noun) |
| `NeighborhoodCampusDiagram.tsx:77` | h3 | `font-serif text-base md:text-lg leading-tight normal-case tracking-tight` | pillar titles | `text-subtitle leading-tight normal-case` | **keep** (drop `tracking-tight`; visual-check the diagram fit) |
| `DocumentBadge.tsx:94` | h3 | conditional: `text-xl md:text-2xl` (featured) / `text-lg md:text-xl` (non-featured) | document titles | `text-subtitle leading-snug normal-case` (collapse conditional; density differentiation stays via padding) | **keep** |
| `StoryPage.tsx:169` | h3 | `font-serif text-lg md:text-xl leading-snug tracking-tight normal-case` | talk titles | `text-subtitle leading-snug normal-case` | **keep** |

### Group C: Special

| File:Line | Tag | Current | Action | Rationale |
|---|---|---|---|---|
| `not-found.tsx:7` | h1 | `text-8xl font-serif mb-4` | Migrate to `text-display mb-4` | 404 deserves visual impact; `.text-display` is `text-5xl md:text-7xl` — shrinks mobile (good for 375px), small md shrink |
| `AvatarBadge.tsx:184` | h3 | `font-serif text-sm sm:text-base font-medium leading-tight text-white drop-shadow-sm` | **Leave as-is + add comment** | `text-sm` overlay caption on photo. `.text-subtitle` would visually destroy. Functionally a label despite h3 tag. Future ticket may retag as `<p className="text-label">`. |

### Sites OUT of scope

- `src/components/ui/alert.tsx:39` — shadcn primitive, vendored
- `src/components/house/HouseBannerGrid.tsx:21` — `.display-roman` display tier (FRAC-51/52)
- `src/pages/BadgePlayground.tsx:81, 198` — dev playground
- `src/components/sections/Projects.tsx:30`, `Events.tsx:9`, `LabPage.tsx:49` — already migrated to `.text-eyebrow` (FRAC-54)

## Size delta summary

24 in-scope migrations. Rendered size effect:
- **Shrinks** (5 sites): Vision (`text-4xl/7xl → text-3xl/5xl`), PeopleDirectory (`text-4xl/6xl → text-3xl/5xl`), Directory h2 (same), LiberalArts h3 (`text-2xl/3xl → text-xl/2xl`)
- **Grows** (~14 sites): Campus.tsx h2s × 11 (`text-2xl/3xl → text-3xl/5xl` — **the audit drift fix**), DocumentBadge non-featured (`text-lg/xl → text-xl/2xl`), StoryPage h3 (`text-lg/xl → text-xl/2xl`), NeighborhoodCampusDiagram (`text-base/lg → text-xl/2xl` — visual check)
- **Stays same**: Directory h3 (already at subtitle size), DocumentBadge featured (already at subtitle size)
- **404 special**: `text-8xl → text-display` substantial mobile shrink (good)

## `normal-case` decisions

15 keep (sentence/question/proper-noun headings), 5 drop (single-word / title-case / short CTA labels). See per-site tables above.

## Open questions / resolutions

1. **Vision.tsx h2 lg:text-7xl** — drops to `.text-title` ceiling `text-5xl`. Accept consistency over centerpiece sizing. If design lead wants size preserved, follow-up could either bump `.text-title` (FRAC-51 territory) or document as one-off.
2. **404 page** → `.text-display` (mobile improves).
3. **AvatarBadge** → leave alone, add inline comment.
4. **DocumentBadge conditional** → collapse to `.text-subtitle`; padding differentiation stays.
5. **NeighborhoodCampusDiagram growth** → migrate; visual-check during impl; fall back to one-off if it breaks diagram fit.
6. **Projects.tsx h3** → treat as title (feature-row title beside numeral); `.text-title`.

## Acceptance criteria

1. Every `<h1>`-`<h6>` in `src/` uses `.text-title`, `.text-subtitle`, `.text-display`/`.display-roman`, `.text-eyebrow`, OR is documented as a special case in code comments.
2. No heading retains an ad-hoc `font-serif text-Nxl md:text-Mxl` combo for h1/h2/h3 semantic use.
3. `normal-case` preserved on 15 sites, dropped on 5 (per table).
4. Campus subsection h2s render with visibly larger, consistent sizing (audit drift fix).
5. Mobile (375px) — no horizontal scroll introduced.
6. `pnpm build` + `pnpm typecheck` clean.
7. Tests pass (4 pre-existing baseline; verify no new failures).
8. 404 page renders `.text-display` "404" centered.
9. No regressions on /campus, /lab, /story, /people, / (Home), /neighborhood, /new-liberal-arts.

## Branch & PR plan

- **Branch:** `frac-55-heading-normalization` (impl creates from master).
- **PR title:** `FRAC-55: heading normalization — adopt .text-title / .text-subtitle across 22 sites`
- **PR body:** Summarize the Campus drift fix (11 subsection h2s); list `normal-case` keep/drop; call out 4 specials (AvatarBadge documented, alert untouched, BadgePlayground untouched, 404→display).

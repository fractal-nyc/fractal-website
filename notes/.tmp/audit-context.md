# Fractal NYC — Visual Layer Audit Context

**Audit type:** Whole-state audit (NOT a branch-diff review)
**Repo:** `/Users/fractalos/Dev/fractal-nyc`
**Branch:** `frac-17-18-color-tweaks` (HEAD)
**Lattice task:** FRAC-21

## Project context

Fractal NYC is a mobile-first website for a Brooklyn-based community of six "houses" sharing physical space. Primary user: someone warm-intro'd to Fractal who needs wayfinding. Mobile baseline is **375px — non-negotiable per the PRD** (`.lattice/plans/FRAC-22.md`).

The site uses an editorial "Asimov Collective" aesthetic: warm off-white background (`#f8f6f0`), deep charcoal foreground, Fraunces serif (auto-uppercase + italic for all headings), JetBrains Mono body, occasional Jacquard 24 display.

The project has a `CLAUDE.md` at the repo root with strict conventions (Lattice task tracking, mobile-first, branch-per-task). The visual layer is fragmented across:
- `src/index.css` — Tailwind v4 `@theme inline` + `:root` HSL custom properties
- `src/data/houses.ts` — per-house hex accents
- `src/components/three/OctahedronHero.tsx` — 3D nav node colors
- `src/components/three/FractalObject.tsx` — possibly dead, carries old "Fractal Bright" palette
- Hardcoded `bg-[#...]` literals scattered across `src/pages/**` and `src/components/**`

A draft `DESIGN.md` was authored on branch `frac-19-design-md` (worktree at `.claude/worktrees/agent-a3a9810eccf8190d6/DESIGN.md`) WITHOUT this audit as input. It's reference-only; the audit's job is to surface what that draft might have missed.

## Audit scope — 7 areas

Each agent must report findings in ALL seven areas. Use the categories as the top-level structure of your review file.

### 1. Design style overall
Editorial conventions, aesthetic coherence, mobile-first conformance against 375px. Are any pages or components breaking the "Asimov Collective" aesthetic? Where is the visual language inconsistent?

### 2. Color palette in actual use
Inventory **every** hex/HSL value across:
- `src/index.css` (both `:root` light tokens and `.dark` tokens)
- `src/data/houses.ts` (per-house `color:` fields)
- `src/components/three/OctahedronHero.tsx` (NAV_NODES colors, face tints)
- `src/components/three/FractalObject.tsx` (palette inside this file)
- Hardcoded `bg-[#...]`, `text-[#...]`, `border-[#...]` literals in `src/pages/**` and `src/components/**`

Flag:
- Duplicates and near-duplicates (e.g., `#f8f6f0` vs `#faf8f5` vs the stale `#f7f6f2` comment in `src/index.css:46`)
- Tokens defined but never referenced
- Hardcoded literals that should be tokens
- Color values that don't fit the established palette
- HSL-vs-hex inconsistencies
- The `.dark` block tokens — is dark mode actually wired anywhere?
- The recent FRAC-17 octahedron face-tint colors (`#889460`, `#D4857A`, `#2B5A48`, `#C41E20`, `#E870A0`) — note that user has flagged these as WRONG (FRAC-20 at needs_human); do not endorse them

### 3. Layout strategy
- Grid and container patterns. Where is `max-w-*` used? Are containers consistent?
- Breakpoints. Mobile-first? Or desktop-first leak?
- Horizontal padding conventions: `px-[4.5%]` vs `px-6` vs `px-8`. When is each used?
- Vertical rhythm: `py-40`, `py-60`, `py-20`. Is there a coherent spacing scale?
- The PRD mandates 375px mobile baseline — find pages/components that break this (overflow, untouched desktop assumptions, fixed widths)
- Section structures. Are similar sections built consistently across pages?

### 4. Fonts and how they are used
Three families: Fraunces (serif), Jacquard 24 (display), JetBrains Mono (mono).

- The global `h1..h6` rule in `src/index.css` auto-applies `font-serif font-normal italic` + uppercase + `letter-spacing: 0.04em`. The `.font-serif` utility also auto-uppercase + italic.
- Inline overrides for Jacquard via `[style*="Jacquard"]` reset uppercase + italic.
- `font-mono` and `font-sans` resolve to the SAME family (JetBrains Mono). Both are declared in `@theme inline`. Is this intentional or vestigial?
- Find: places using inline `style={{ fontStyle: "normal" }}` or `style={{ textTransform: "none" }}` to escape the global rules. These are the de-facto exceptions.
- Are the Google Fonts weight axes actually used? (Fraunces has 100..900 + opsz)

### 5. Buttons / interactive primitives
- shadcn defaults from `components.json` — variants in `src/components/ui/button.tsx` (or wherever): default / outline / secondary / ghost / link
- Any custom CTA patterns not using the Button component (e.g., the `cta-outline-link` inline pattern)
- The `link-underline` utility in `src/index.css` (cubic-bezier hover transition)
- Inconsistencies in size, padding, hover, focus states
- Missing focus-visible indicators for keyboard a11y
- Where does the user need to interact? Are all interactive elements actually buttons / links / accessible?

### 6. Shaders, textures, effects, motion
- Body noise SVG `background-image` (`src/index.css`)
- `.hero-text-shadow` utility (translucent cream text-shadow for hero overlays)
- `.link-underline` cubic-bezier hover animation
- `@keyframes blink` and `.animate-blink`
- R3F (react-three-fiber) octahedron in `src/components/three/OctahedronHero.tsx` — geometry, materials, scrolling text textures, edge tubes, nav node spheres, pulse animations
- `src/components/three/FractalObject.tsx` — if used anywhere
- Mandelbrot stamps (search for "Mandelbrot")
- `src/components/ui/FadeIn.tsx` — Framer Motion variants
- Banner clip-paths (`src/components/house/HouseBanner.tsx`)
- `prefers-reduced-motion` handling — is it respected everywhere?

### 7. General code health (secondary)
- Dead code candidates (e.g., `FractalObject.tsx` — is it imported anywhere live? `FractalCityScene.tsx` reportedly imports `FractalObject` re-exported from `OctahedronHero.tsx`, not from the standalone file — verify)
- Unused exports, unused CSS classes
- A11y: contrast ratios (especially the noise-textured cream surface), focus indicators, semantic HTML, keyboard nav
- Bundle bloat from unused fonts (Jacquard 24 — is it actually used? Where?)
- `CLAUDE.md` adherence (mobile-first, etc.)

## Out of scope (DO NOT flag these)
- Test coverage gaps
- Build / typecheck / lint output (handled separately)
- Refactoring suggestions unrelated to design system
- Generic security concerns
- Spelling / comma nitpicks
- Anything in `notes/`, `.lattice/`, `dist/`, `node_modules/`, or `research/`
- The octahedron face-tint colors specifically — user has already flagged via FRAC-20

## Deliverable per agent

Each agent writes ONE file named:
`notes/CR-FRAC-21-{Model}-{Standard|Critical}-{timestamp}.md`

where `{Model}` is one of `Claude`, `Codex`, `Gemini`, and `{timestamp}` is `YYYYMMDD-HHMM`.

The file must use exactly this structure:

```markdown
# Visual Layer Audit — FRAC-21 — {Model} {Standard|Critical}

**Auditor:** {Model} ({Standard|Critical})
**Timestamp:** {YYYYMMDD-HHMM}
**Files reviewed:** {short list of file globs you actually opened}

## 1. Design style overall
{findings}

## 2. Color palette in actual use
{findings — inventory + flags}

## 3. Layout strategy
{findings}

## 4. Fonts and how they are used
{findings}

## 5. Buttons / interactive primitives
{findings}

## 6. Shaders / textures / effects / motion
{findings}

## 7. General code health
{findings}

## Top 5 highest-confidence issues
1. {one-line summary} — `file:line` — severity: {critical|warning|info}
2. ...
3. ...
4. ...
5. ...
```

Each finding under sections 1–7 MUST cite `file:line` for specificity. A finding without a file:line cite is not actionable.

## Standard vs Critical posture

**Standard** review: charitable. Surface real issues, skip nitpicks, assume good intent in design choices unless something is clearly inconsistent.

**Critical** review: adversarial. Assume the visual layer is fragile. Hunt for inconsistencies, accessibility failures, unrooted decisions, dead code, naming conflicts. Surface what a strict senior designer / design engineer would catch.

Both must obey "out of scope" rules above.

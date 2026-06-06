# FRAC-23: Gap analysis: current state vs @google/design.md spec — identify problems and missing definitions

## Goal

Produce a structured markdown gap analysis at `.lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md` that maps Fractal NYC's current visual system (post-cleanup master at `c07192f`) against the `@google/design.md` v0.2.0 format spec. The deliverable is a decision-support document for FRAC-19 (DESIGN.md authoring): it must clearly state what translates 1:1, what needs translation, what the format cannot represent (which must therefore live in prose or stay code-side), what tokens we are missing relative to the spec's expectations, what gaps the spec itself has relative to our needs, and what naming reconciliations and open questions remain. It must NOT author DESIGN.md and must NOT modify any source files.

## Inputs the impl agent will read

**Required reads in this order:**

1. `/Users/fractalos/Dev/fractal-nyc/.lattice/notes/handoff-2026-06-05-design-md.md` — the 10 locked decisions and v0 draft pointer (NOT in the worktree's `.lattice/notes/`; only in the main `.lattice/`).
2. `/Users/fractalos/Dev/fractal-nyc/.claude/worktrees/frac-23-gap-analysis/.lattice/notes/FRAC-21-team-review-20260605-1551.md` — primary input. The H1–H5 / S1–S6 / C1–C10 findings are the catalogue the gap analysis must align against. Reference findings by their codes (H1, C5, etc.).
3. `/Users/fractalos/Dev/fractal-nyc/.claude/worktrees/frac-23-gap-analysis/.lattice/plans/FRAC-22.md` — PRD. Pull mobile-first 375px baseline (constraint), the brand palette declaration in "Look & Feel" (cream `#fdf0d5` is what the PRD says — note: now superseded by `#f8f6f0`), and the Pretext-first text rendering decision.
4. **design.md spec at `https://github.com/google-labs-code/design.md`** — fetch the README. The spec confirms:
   - **Top-level YAML keys:** `name` (required), `version`, `description`, `colors`, `typography`, `rounded`, `spacing`, `components`.
   - **Closed-set component properties:** `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. Nothing else.
   - **Token formats:** colors (hex / `rgb()` / `oklch()` / named), dimensions (number + unit), token refs (`{path.to.token}`), typography objects (`fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFeature`, `fontVariation`).
   - **Prose section canonical order:** Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts.
   - **9 lint rules:** `broken-ref` (error), `missing-primary`, `contrast-ratio`, `orphaned-tokens`, `missing-typography`, `section-order`, `unknown-key` (warnings), `token-summary`, `missing-sections` (info).
   - **Explicit non-coverage:** motion/animation, gradients.

**Source files to extract token data from (do NOT modify):**

- `src/index.css` — HSL token block at `:root` (lines 44–75). All surface tokens are HSL triplets wrapped through `@theme inline` (lines 5–42). Radii at lines 38–41. Fonts at lines 6–8 — note `--font-sans` and `--font-mono` both point to `'JetBrains Mono', monospace`. No `.dark` block (was deleted in FRAC-30). Surviving utilities: `.display-roman`, `.link-underline` (dead per FRAC-21 C9), `.hero-text-shadow`, `.animate-blink`, `.border-grid`, `.sr-only-focusable`. Noise SVG inlined at line 86.
- `src/data/houses.ts` — canonical house palette source of truth. Each house has `palette: { light, deep }`. The legacy `color` field is `@deprecated FRAC-24` but still read by `AvatarBadge` (line 26) and `BadgePlayground` (line 15) — flag this as live drift. House display names live in `displayName` (e.g. Lab → "Publications", Liberal Arts → "Education", Forum → "Political Club"). Hidden-route flags: `hideFromNavbar`, `hideFromBanners`.
- `src/components/ui/button.tsx` — the new minimal Button (FRAC-27). Four variants (`default`, `outline`, `ghost`, `link`) × four sizes (`default`, `sm`, `lg`, `icon`). Uses `font-mono uppercase tracking-widest`, `focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2`. Default variant has Mandelbrot corners (`MandelbrotIcon` at 20px, opacity 0.2, placed 4px in from each corner). Padding scale: `px-8 py-5` / `px-4 py-2` / `px-10 py-6` / `h-9 w-9`. Border style: `border border-foreground/20 bg-foreground/[0.03]`.
- `src/hooks/usePrefersReducedMotion.ts` — the OS-level reduced-motion subscription used sitewide (FRAC-28). 25 lines; SSR-safe.
- `src/components/layout/Navbar.tsx` — Jacquard 24 sizing (now `clamp(42px, 8vw, 82px)` etc. after FRAC-29; per-token wordmark composition starting line 64). Confirms Jacquard is used as a display family inline-styled, not a CSS class.
- `src/components/three/OctahedronHero.tsx` — `#1a1a1a` charcoal duplicate at lines 584 and 801 (the `--foreground` is `#171717`); FRAC-20-disputed `tintMix: 0.55` shader constant is GONE (FRAC-41 reverted to plain texture per handoff decision #7). Don't re-flag C7 as live if the overlay shader is no longer in the file — verify before including.
- `src/components/lab/{TagFilter,DocumentBadge,ArchiveSearch,ArchiveToolbar}.tsx` — Lab purple `#6B4C9A` as raw literals (`LAB_COLOR` const + inline `border-[#6B4C9A]` etc.). Confirms FRAC-21 C6 is still live; FRAC-34 is the planned cleanup but not landed.
- `src/components/sections/SkylineSilhouette.tsx:12` — cream gradient stop at `#f8f6f0` (canonical, matches `--background`). Good signal that the canonical cream is now consistently applied.
- `src/components/three/FractalCityScene.tsx:13` — ambient light `#f5f0ea` (separate from cream surface; this is a lighting color, not a surface token — note in "what design.md cannot model").
- `src/components/house/HouseBanner.tsx` — letter color logic; references both `palette` and legacy `house.color` as fallback (lines 96–97). Confirms the two-way binding the gap analysis must reconcile.

**Reference only (do NOT adopt structure):**

- `/Users/fractalos/Dev/fractal-nyc/.claude/worktrees/agent-a3a9810eccf8190d6/DESIGN.md` — v0 draft. Note as evidence of "what an author can do without the audit" and contrast with the locked decisions (e.g., the v0 has `house-people` and `house-story` tokens that do NOT correspond to live houses in `houses.ts`; `muted-foreground: "#666666"` is the pre-FRAC-33 value (~4.0:1) — current canonical is `0 0% 32%` lightness for AA conformance). Don't reproduce the v0's typography spec verbatim.

## Output structure (8 required sections)

The impl agent writes `.lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md` with these sections, in this order. Each section has scope notes.

### 1. What maps cleanly
Tokens that translate 1:1 to design.md with no semantic change. Expected to include: `background` → `#f8f6f0`, `foreground` → `#171717`, the four radius levels (`0.25rem` / `0.5rem` / `0.75rem` / `1rem`), and the three font families (`Fraunces`, `JetBrains Mono`, `Jacquard 24`). Convert HSL to hex inline so the impl agent doesn't re-derive later. **Do not include** house palette pairs here — they need translation discussion (section 2).

### 2. What needs translation
- HSL triplet → hex/oklch (all `--*` tokens in `:root`). Show one worked conversion.
- CSS-var indirection (`--color-primary: hsl(var(--primary))`) flattening to design.md's direct hex token model.
- `--primary: 0 0% 9%` = charcoal (the foreground), NOT a brand-color "primary." Design.md's `missing-primary` lint expects `primary` to denote a brand color. Decision needed: rename to `brand`, or accept lint warning, or assign a brand color (the PRD says red `#cc2936` / blue `#1d3557` are brand; the audit shows the live system uses charcoal as "primary"). Recommend leaving the decision to FRAC-19 author but call out the trade-off explicitly.
- House palette `{ light, deep }` pairs → flat keys. Discuss `house-{id}-light` / `house-{id}-deep` (granular, 12 tokens for 6 houses) vs `house-{id}-bg` / `house-{id}-accent` (semantic, but lies for forum/school which invert per `houses.ts:42-51` comment) vs picking one canonical value per house. Recommend `house-{id}-light` + `house-{id}-deep` as it preserves the data model and lets prose explain the inversion.
- Font tokens: `--font-sans` and `--font-mono` both resolve to JetBrains Mono. Decision pending (handoff decision #10).
- Typography object construction: codebase uses `font-mono uppercase tracking-widest` Tailwind classes; design.md wants explicit `fontFamily`/`fontSize`/`fontWeight`/`lineHeight`/`letterSpacing`. The impl agent must enumerate the *real* sizes/weights/leadings used in shipped components (Hero, HouseBanner, Navbar) — not invent a scale.

### 3. What design.md cannot model
Live in prose only or stay code-side. Mandatory list:
- **Motion / transitions:** Framer Motion in `FadeIn`, octahedron auto-rotation/scale-pulse, Navbar overlay motion, SierpinskiCarpet RAF, `@keyframes blink`. Plus `usePrefersReducedMotion` gating.
- **Shaders & R3F:** OctahedronHero `MeshBasicMaterial` + `tex.colorSpace = SRGBColorSpace` (handoff decision #7), `FractalCityScene` ambient `#f5f0ea`.
- **Noise textures:** the `data:image/svg+xml,...` feTurbulence on body (index.css line 86).
- **Gradients:** `SkylineSilhouette` SVG stop-opacity gradient.
- **Decorative chrome:** Mandelbrot corner motif on Button default variant — describable in `components.button-default` only by inventing a non-spec property; must live in prose.
- **Per-house page-bg inversion** (forum/school use `deep` as page bg) — not a token, it's a rule.
- **Hidden-route logic** (`hideFromNavbar`/`hideFromBanners`) — data model, not design.

Keep this list honest. Don't try to force these into tokens.

### 4. What's missing from current code
Tokens design.md expects but the codebase doesn't have:
- **Spacing scale.** Audit S6 confirms `py-{40,60,48,32,24,20,16,14,12,10}` are ad-hoc. Tailwind defaults exist but there's no project-canonical scale. Either (a) declare a scale and migrate, or (b) ship without `spacing:` (the key is optional). Recommend explicit declaration of the *actually used* set with the warning that mid-values exist.
- **Container `max-w-*` scale** — 11 distinct values (audit S5). Doesn't map to design.md's spacing scale but should be noted in prose.
- **Typography scale beyond `font-*` families** — no codified `text-*` size scale. Hero, banners, paragraphs each set sizes ad-hoc. Either enumerate the real-world sizes (mobile baseline 375px first) or declare a small scale and migrate.
- **Component-level tokens.** Current code has Button via cva variants but no canonical "destructive button," "house CTA," etc. Decide what subset to declare under `components:`.
- **Charcoal duplication.** `#1a1a1a` (OctahedronHero, Banner fallback) ≠ `#171717` (`--foreground`). One should win; the other should be normalized.
- **Lab `#6B4C9A` literal** (11 sites). Either add a `color: house-lab-accent` token or wait for FRAC-34 — note as carry-forward.

### 5. What's missing from the design.md spec relative to our needs
Spec gaps that affect us:
- **No per-house theming construct.** We have 6 houses × {light, deep} = 12 logical tokens; the spec has no native namespacing — we use a flat `house-*` convention.
- **No motion tokens.** Means reduced-motion behavior, durations, easings are out of band.
- **No elevation / shadow tokens** (though "Elevation & Depth" prose section exists). Project has `hover-elevate` Replit utility removed, so this may not matter — but call it out.
- **Closed component property set excludes border.** Button uses `border border-foreground/20`. There's no way to express that as a component token cleanly. Document as a known shortfall.
- **Alpha-stage `version: "alpha"` semantics.** The format is moving. Pinning to `0.2.0` is project's choice; flag in open questions if the human wants to track upstream.
- **No `fontStyle: italic` field documented in typography object.** Our heading style is uppercase italic by default. Either model italic via `fontVariation` / `fontFeature`, or accept that italics are described in prose (and `display-roman` is the upright counter-token).
- **No way to encode `uppercase` text-transform.** Our entire body sets uppercase via CSS. Must live in prose.

### 6. Naming conflicts and reconciliations
Decisions to make before authoring:
- **Cream:** canonical `#f8f6f0` (locked decision #1). Reconcile: stale `#faf8f5` literals are gone post-FRAC-26 — verify by grep before claiming clean.
- **House token keying.** Use internal IDs (`neighborhood`, `events`, `campus`, `school`, `forum`, `lab`) — NOT display names (`Visit`, `Education`, `Political Club`, `Publications`). Reason: data model uses IDs; display names drift.
- **`primary` semantic** — charcoal vs brand color (see section 2). Recommend "charcoal is canonical primary; accept `missing-primary` lint if it fires" or rename to `brand` if FRAC-19 decides.
- **Font-sans vs font-mono** — handoff decision #10 leaves this open. Recommend one path with rationale (likely: collapse `--font-sans` to alias `--font-mono` in DESIGN.md and silently drop the duplicate token, OR rename to `font-body` and `font-display-mono` if the FRAC-19 author wants to signal intent).
- **Charcoal duplication.** Pick one: either `#171717` (current `--foreground`, design.md authoritative) and treat all `#1a1a1a` as drift, OR shift `--foreground` to `#1a1a1a`. Recommend keep `#171717`.

### 7. Octahedron / FRAC-20 caveat
- The hero's photo-rendering decision is **locked** (handoff #7): plain `MeshBasicMaterial` + `SRGBColorSpace`, no overlay shader. FRAC-20 is closed in spirit even if its ticket isn't marked done.
- The face order (campus, events, lab, school, neighborhood, people, forum, story) is **locked but cheap to tweak** (handoff #6). DESIGN.md should NOT encode face order as a token.
- The "Coming Soon" Political Club node at vertex 4 is in-place (handoff #5). DESIGN.md should not codify it; it lives in code.
- `tintMix: 0.55` is gone — do not re-flag C7 unless you confirm it's still in `OctahedronHero.tsx`.
- The 3-letter takeaway: DO NOT canonicalize anything 3D-shader-y or per-face into DESIGN.md tokens. Hero photos and gamma decisions stay in code and prose only.

### 8. Open questions for human
Anything needing user input before DESIGN.md can be authored cleanly. Candidates:
1. **`--font-sans` collapse** (handoff #10 unresolved) — keep two tokens both = JetBrains Mono, or collapse, or rename one to a real sans family (and add to font imports)?
2. **`primary` semantic** — accept charcoal-as-primary and live with `missing-primary` lint warning, or assign a brand color from the PRD's red/blue?
3. **Spacing scale** — declare a project scale and migrate the ad-hoc values, or omit `spacing:` from DESIGN.md and let prose explain the ad-hoc reality?
4. **Should DESIGN.md include components beyond Button?** (HouseBanner, AvatarBadge, Navbar wordmark, Hero search.)
5. **House token key style** — confirm `house-{id}` (internal id) over `house-{displayname}`.
6. **`#1a1a1a` vs `#171717`** — pick canonical charcoal.
7. **Lab `#6B4C9A` carry-forward** — wait for FRAC-34, or pre-tokenize.
8. **Pinned spec version** — keep `npx @google/design.md@0.2.0`, or track latest?

## Locked decisions the impl agent must respect (DO NOT re-debate)

1. Cream is `#f8f6f0`. `#faf8f5` was a stray; `#f7f6f2` was a stale comment.
2. House palette source of truth is `HOUSES[id].palette: { light, deep }` in `src/data/houses.ts`. Old "Fractal Bright" hexes retired. Page-bg literals (e.g. `Campus.tsx:8`) ARE canonical for their surface — do not flag.
3. No dark mode. `.dark` block deleted. DESIGN.md must NOT declare dark tokens.
4. Button is the new minimal `Button` (FRAC-27) matching shipped reality; default variant has Mandelbrot corners; real CTAs migrated; inline text-flow links stay raw.
5. Octahedron Political Club is a "Coming Soon" placeholder node; Navbar still hides Political Club.
6. Octahedron face order: campus, events, lab, school, neighborhood, people, forum, story.
7. Octahedron photo: plain `MeshBasicMaterial` + `SRGBColorSpace`. No overlay shader.
8. Mobile-first 375px baseline is non-negotiable (PRD).
9. `prefers-reduced-motion` honored sitewide via `usePrefersReducedMotion`.
10. `--font-sans` ≡ `--font-mono` ≡ JetBrains Mono — explicitly unresolved (raise in open questions, do not silently pick).

## Acceptance criteria

- [ ] Deliverable file exists at `.lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md`.
- [ ] All 8 required sections present in the order specified by the FRAC-23 task description.
- [ ] No source files in `src/` modified. No new files outside `.lattice/notes/`. No DESIGN.md authored.
- [ ] FRAC-21 audit findings referenced by code (H1–H5, S1–S6, C1–C10) when relevant; reviewer can trace claims back.
- [ ] HSL → hex conversions shown for at least the surface tokens (`background`, `foreground`, `border`, `muted`, `muted-foreground`).
- [ ] House palette section uses internal IDs (`neighborhood`, `events`, `campus`, `school`, `forum`, `lab`) and reflects the `{ light, deep }` pair structure from `houses.ts`.
- [ ] The 10 locked decisions are quoted/acknowledged, not re-debated.
- [ ] "What design.md cannot model" section explicitly lists motion, shaders, noise, gradients, decorative chrome (Mandelbrot corners), per-house bg inversion, hidden-route logic.
- [ ] At least 3 distinct open questions in section 8, each requiring a yes/no or A/B human decision (no vague "consider").
- [ ] Doc is 1–3 pages of markdown, not a 10-page sprawl.
- [ ] No code changes in commits attributable to this task.

## Out of scope

- Authoring DESIGN.md (that's FRAC-19).
- Modifying any source files in `src/`, `public/`, or config.
- Resolving FRAC-20 (Octahedron photo rendering — already locked).
- Resolving FRAC-34 (Lab purple migration — separate cleanup).
- Editing the v0 DESIGN.md draft at `.claude/worktrees/agent-a3a9810eccf8190d6/DESIGN.md` (reference only).
- Running `npx @google/design.md lint` against anything (no DESIGN.md exists yet to lint).
- Re-running `/code_review`. Use FRAC-21 output.
- Picking final values for any open questions (those are FRAC-19's call or the human's).

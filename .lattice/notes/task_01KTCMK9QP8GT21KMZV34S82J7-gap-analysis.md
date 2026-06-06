---
title: FRAC-23 — Gap analysis: current state vs @google/design.md spec
task: FRAC-23 (task_01KTCMK9QP8GT21KMZV34S82J7)
master_commit: c07192f (post-FRAC-43 merge)
inputs:
  - .lattice/notes/handoff-2026-06-05-design-md.md (10 locked decisions, v0 draft pointer)
  - .lattice/notes/FRAC-21-team-review-20260605-1551.md (H1–H5, S1–S6, C1–C10)
  - .lattice/plans/FRAC-22.md (PRD — mobile-first 375px, Pretext-first)
  - https://github.com/google-labs-code/design.md (spec v0.2.0)
  - src/index.css, src/data/houses.ts, src/components/ui/button.tsx, src/components/three/OctahedronHero.tsx, src/components/lab/* (read-only)
date: 2026-06-05
audience: FRAC-19 author + human decision-maker
---

# FRAC-23 — Gap Analysis: Current State vs `@google/design.md` Spec

Decision-support document for FRAC-19 (DESIGN.md authoring). Maps the post-cleanup
visual system on master (`c07192f`) to the design.md v0.2.0 format. **Not a
DESIGN.md draft.** Not a re-debate of the 10 locked decisions (handoff §
"Decisions locked in this session").

**Pre-flight: audit findings already resolved on master `c07192f`** — checked by
re-reading current source rather than trusting the audit verbatim:

- **C5 (muted-foreground contrast):** `--muted-foreground` is **`0 0% 32%`** at
  `src/index.css:64` (FRAC-33 lift, comment confirms ~5.5:1 against cream). The
  audit's "≈ `#666` / 4.0:1" is stale. **Resolved.**
- **C7 (`tintMix: 0.55` shader constant):** No `ShaderMaterial` and no `tintMix`
  remain in `OctahedronHero.tsx`. Texture path is plain `MeshBasicMaterial` +
  `tex.colorSpace = THREE.SRGBColorSpace` (lines 503, 522, 531, 539). FRAC-41
  revert confirmed. **Resolved.**
- **H5 / locked decision #1 (stale cream literals):** `grep -rn "#faf8f5\|#f7f6f2" src/`
  returns zero hits. **Resolved (FRAC-26).**

Audit findings **still live** that this analysis must reflect:

- **C6 — Lab `#6B4C9A` as raw literal:** 8 sites across `src/components/lab/{DocumentBadge,ArchiveSearch,TagFilter,ArchiveToolbar}.tsx` + the legacy `color` field on `houses.ts:319`. FRAC-34 is planned-but-unlanded. Carry-forward.
- **C6 — Charcoal duplication:** `#1a1a1a` at `OctahedronHero.tsx:584` (tooltip), `:801` (default node tooltip), and `HouseBanner.tsx:96-97` (banner letter/text fallback). `--foreground` is `#171717`. Two charcoals, one role.
- **H1 — House palette flat key namespacing:** Mostly resolved (FRAC-24 single SoT in `houses.ts.palette`), but `houses.ts.color` legacy field is **still read** by `AvatarBadge` and `HouseBanner` fallback path (`HouseBanner.tsx:96` uses `house.color` to drive `isDark()`). Two-way binding to reconcile in DESIGN.md.

---

## 1. What maps cleanly

**One-line conclusion:** A small set of surface tokens, the four radii, and the three font families translate 1:1 to design.md with no semantic change.

| Token (CSS var) | HSL (raw) | Hex (computed) | design.md slot |
|---|---|---|---|
| `--background` | `40 25% 96%` | computes to `#f7f6f2` — **canonical written value is `#f8f6f0`** (see § 6) | `colors.background` |
| `--foreground` | `0 0% 9%` | `#171717` | `colors.foreground` |
| `--muted-foreground` | `0 0% 32%` | `#525252` | `colors.muted-foreground` |
| `--muted` | `40 10% 90%` | `#e8e6e3` | `colors.muted` |
| `--border` | `40 10% 85%` | `#dddad5` | `colors.border` |
| `--card` | `40 25% 98%` | `#fbfaf9` | `colors.card` |

**Worked conversion (`--muted: 40 10% 90%`):** `C = (1 − |2·0.90 − 1|) · 0.10 = (1 − 0.80) · 0.10 = 0.02`. H′ = 40/60 = 0.667 → sector 0, so (R′,G′,B′) = (C, X, 0) where `X = C·(1 − |0.667 − 1|) = 0.02 · 0.667 = 0.01333`. `m = L − C/2 = 0.90 − 0.01 = 0.89`. RGB = (0.91, 0.9033, 0.89) × 255 ≈ (232, 230, 227) → `#e8e6e3`.

**Achromatic shortcut (`--muted-foreground: 0 0% 32%`):** S=0 → R=G=B = `round(0.32 × 255) = 82` → `#525252`.

**Radii** (already canonical units, drop straight into `rounded:`):

| Token | Value |
|---|---|
| `--radius-sm` | `0.25rem` |
| `--radius-md` | `0.5rem` |
| `--radius-lg` | `0.75rem` |
| `--radius-xl` | `1rem` |

**Fonts** (drop into `typography:` as `fontFamily` strings):

| Family | Stack |
|---|---|
| Body / mono | `'JetBrains Mono', monospace` (both `--font-sans` and `--font-mono` resolve here — see § 6) |
| Display serif | `'Fraunces', serif` |
| Display script | `'Jacquard 24'` (inline-styled in Navbar wordmark, not a CSS class — see § 3) |

House palette pairs are deferred to § 2 — they need translation, not a 1:1 map.

---

## 2. What needs translation

**One-line conclusion:** Most semantic tokens, every `--*` variable, and the house palette structure all require shape changes before they fit design.md's flat-key model.

**HSL triplet → hex.** Every `--*` token in `:root` is an HSL triplet wrapped through `hsl(var(--…))` indirection in `@theme inline`. design.md wants direct color literals. Flatten by replacing each `hsl(var(--x))` chain with the computed hex from § 1.

**CSS-var indirection → flat hex.** `--color-primary: hsl(var(--primary))` is a two-hop dereference. design.md's `colors.primary` resolves to a hex literal (or token ref `{colors.foreground}`). Choose: emit hex, or emit `{colors.foreground}` ref to encode the "primary === foreground" identity intentionally.

**`--primary` semantic conflict.** `--primary: 0 0% 9%` is the charcoal foreground — **not a brand color**. The design.md `missing-primary` lint expects `colors.primary` to denote a brand color. PRD's "Look & Feel" declares brand colors as red `#cc2936` and blue `#1d3557` (which appear in the codebase only as `houses.ts.color` legacy values on `forum` and `school`). Three options for FRAC-19 author — flagged as open question § 8.2.

**House palette `{ light, deep }` → flat keys.** The data model in `houses.ts` is a pair per house. design.md has no namespacing. Three encoding options:

| Option | Tokens | Pros | Cons |
|---|---|---|---|
| `house-{id}-light` / `house-{id}-deep` | 12 (6 houses × 2) | Preserves SoT shape; semantically neutral; forum/school inversion can live in prose | Two tokens per house feels verbose |
| `house-{id}-bg` / `house-{id}-accent` | 12 | Reads semantically | **Lies for `forum` and `school`** (their bg is `deep`, not `light` — see `houses.ts:42-51` comment) |
| `house-{id}` (single canonical) | 6 | Compact | Loses the pair; prose can't fully recover it |

**Recommended for FRAC-19:** `house-{id}-light` + `house-{id}-deep`, preserves data model, prose explains the forum/school inversion. House IDs are the internal slugs from `houses.ts` (see § 4 for enumeration). Use IDs, not displayNames (see § 6 reconciliation).

**Font tokens.** `--font-sans` and `--font-mono` both resolve to `'JetBrains Mono', monospace` (`index.css:6,8`). One token is vestigial. Handoff decision #10 leaves this **explicitly unresolved** for the DESIGN.md author. § 8.1.

**Typography object construction.** Codebase uses `font-mono uppercase tracking-widest` Tailwind utility classes — design.md typography objects want explicit `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, optional `fontFeature` / `fontVariation`. The FRAC-19 author must enumerate the *actual sizes/weights/leading* used in shipped components (Hero, HouseBanner, Navbar wordmark, Button), not invent a scale. **The audit (S1, S6) confirms there is no codified scale yet** — this is partly an audit finding and partly a translation task.

---

## 3. What design.md cannot model

**One-line conclusion:** Motion, shaders, gradients, decorative chrome, and per-route logic are out of band — they must live in prose or stay code-side.

- **Motion / transitions.** Framer Motion in `FadeIn`, octahedron auto-rotation (`OctahedronHero.tsx:796-800`), scrolling edge-text textures (`:249-253`), center scale-breathing (`:561-567`), node scale-pulse (`:656-663`), Navbar overlay motion (`Navbar.tsx:128,345`), `SierpinskiCarpet` RAF loops, `@keyframes blink` (`index.css:174-181`). Plus `usePrefersReducedMotion` gating (FRAC-28). Spec **explicitly excludes** motion (per design.md README "Explicit non-coverage").
- **Shaders & R3F.** `MeshBasicMaterial` + `tex.colorSpace = THREE.SRGBColorSpace` (locked decision #7). `FractalCityScene` ambient light at `#f5f0ea` is a *lighting* color, not a surface — should not be tokenized.
- **Noise textures.** Inline `data:image/svg+xml,…` feTurbulence on `body` (`index.css:86`). Not a token.
- **Gradients.** `SkylineSilhouette` SVG `stop-opacity` gradient (`SkylineSilhouette.tsx:12` cream stop at `#f8f6f0` — canonical). Spec **explicitly excludes** gradients.
- **Decorative chrome — Mandelbrot corner motif on Button default variant.** `button.tsx:99-147` places four 20px Mandelbrot icons at 4px from each corner with 0.2 opacity, rotated to face center. design.md component property set is closed (`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`) — there is **no slot** for "decorative corner glyph." Must live in prose.
- **Per-house page-bg inversion.** Forum (`/political-club`) and School (`/new-liberal-arts`) use `palette.deep` as page background; the other four use `palette.light`. This is a rule, not a token.
- **Hidden-route logic.** `hideFromNavbar` / `hideFromBanners` (FRAC-32) is a data-model concern, not a design token.
- **Text transforms.** Global `text-transform: uppercase` on `body` and `font-style: italic` on headings (`index.css:84-94`). design.md typography objects have **no `textTransform` field** and italic is only expressible via `fontVariation` / `fontFeature`. Prose-only.

---

## 4. What's missing from current code

**One-line conclusion:** The spec assumes a scale-first system; the codebase ships ad-hoc values. Either declare scales now and migrate, or omit the optional spec sections and explain in prose.

- **Spacing scale.** Audit **S6** confirms `py-{40,60,48,32,24,20,16,14,12,10}` are ad-hoc. No project-canonical scale exists. Options: (a) declare a scale matching the actually-used set, (b) omit the optional `spacing:` key. Recommend (a) with prose noting "mid-values are used ad-hoc and have not been migrated." Tied to § 8.3.
- **Container `max-w-*` scale.** Audit **S5** counted 11 distinct values (`max-w-{xs,sm,md,lg,xl,2xl,3xl,4xl,5xl,6xl,7xl}` + arbitrary). Doesn't map to design.md's spacing scale. Prose-only.
- **Typography scale beyond `font-*` families.** Audit **S1** found ~60 inline-uppercase overrides; no codified `text-*` size scale beyond Tailwind defaults. The Hero, HouseBanner, Navbar wordmark, and Button each set sizes independently. Must enumerate the *real* sizes at 375px baseline (mobile-first per PRD) before declaring a `typography:` scale.
- **Component-level tokens.** Current code has Button via cva variants but no canonical "destructive button," "house CTA," etc. Decide what subset to declare under `components:`. § 8.4.
- **Charcoal duplication.** `#1a1a1a` appears at `OctahedronHero.tsx:584`, `:801`, `HouseBanner.tsx:96-97` (audit **C6**). `--foreground` is `#171717`. One value should win. § 8.6.
- **Lab `#6B4C9A` literal.** 8 sites across `src/components/lab/*` + the deprecated `color` field on `houses.ts:319`. FRAC-34 is the planned cleanup, not landed. Either pre-tokenize as `house-lab-accent` in DESIGN.md, or wait. § 8.7.
- **House palette `accent` for AvatarBadge.** `houses.ts.color` is `@deprecated FRAC-24` but `AvatarBadge` still reads it (per audit H1 reconciliation; per `HouseBanner.tsx:96` fallback). DESIGN.md should canonicalize on `palette.{light,deep}` and the rendering surfaces should follow — but this is a code change, not a DESIGN.md change. Note as carry-forward.

**Six active houses, enumerated** (use these IDs as DESIGN.md token keys per § 6):

| ID | `displayName` | `palette.light` | `palette.deep` | Page-bg member |
|---|---|---|---|---|
| `neighborhood` | Visit | `#889460` | `#4A5A30` | light |
| `events` | Events | `#D4857A` | `#C13B2A` | light |
| `campus` | Campus | `#2E6B4A` | `#1A3A2E` | light |
| `school` | Education | `#B52828` | `#5C1010` | **deep** (inverted) |
| `forum` | Political Club | `#C83858` | `#6E1830` | **deep** (inverted) |
| `lab` | Publications | `#E870A0` | `#C44878` | light |

---

## 5. What's missing from the design.md spec relative to our needs

**One-line conclusion:** The spec is intentionally narrow — it has no construct for per-namespace theming, motion, italic text, or decorative properties, so several of our system concepts must live as prose or stay code-side.

- **No per-house theming namespace.** 6 houses × {light, deep} = 12 logical tokens. Spec has no native namespace — we collapse to flat `house-*-{light,deep}` keys. Acceptable cost, but means the spec lints don't enforce "every house has both members."
- **No motion tokens.** Reduced-motion behavior, durations, easings are entirely out of band. Has the practical consequence that DESIGN.md cannot document the `usePrefersReducedMotion` hook contract.
- **No elevation / shadow tokens.** The prose **"Elevation & Depth"** section is allowed but there is no token slot. The codebase no longer has shadow utilities (Replit `hover-elevate` removed pre-FRAC-27); the system doesn't currently use depth-as-token. Note as "intentionally empty" if FRAC-19 chooses to include the prose section.
- **Closed component property set excludes `border`.** Button uses `border border-foreground/20`. There is **no `border` slot** in design.md's component property set (`backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`). The Button's border has to be described in prose — known spec shortfall.
- **No `fontStyle: italic` field.** Our `h1–h6` default to italic Fraunces (`index.css:91`) and `.font-serif` is italic by rule. Either model via `fontFeature` / `fontVariation` (semantically off — those describe OpenType features, not basic italic), or accept "headings are italic" lives in prose. `.display-roman` is the upright counter-token (`index.css:143-147`).
- **No `textTransform: uppercase` field.** Our entire body is uppercase via CSS. Spec has no slot. Prose-only. Same for the global Fraunces uppercase rule.
- **Alpha-stage `version: "alpha"` semantics.** Format moves. Pinning to `0.2.0` is the project's call. Flagged as § 8.8.
- **No `font-feature-settings` first-class field beyond `fontFeature`.** Our Jacquard wordmark in Navbar is plain — not currently affected. Note only.

---

## 6. Naming conflicts and reconciliations

**One-line conclusion:** Six reconciliations to lock before authoring; § 8 routes the open ones up to the human.

- **Cream — canonical value vs computed HSL.** Locked decision #1 says **`#f8f6f0`** is canonical. But `--background: 40 25% 96%` computes to **`#f7f6f2`** (and the audit reported `~#f8f6f1`). The hex written in the `index.css:46` comment is `#f8f6f0`, the HSL math doesn't quite produce it. Three near-equal values: the canonical written hex (`#f8f6f0`), the HSL-math result (`#f7f6f2`), and the `SkylineSilhouette.tsx:12` literal (`#f8f6f0`, matches canonical). Recommend: **DESIGN.md emits `#f8f6f0`** (the human-chosen canonical) and the index.css HSL should be tightened to produce that hex in a follow-up cleanup. Do **not** flag this as a real conflict — the human decision wins; the math is being asked to follow.
- **House token keying.** Use internal IDs (`neighborhood`, `events`, `campus`, `school`, `forum`, `lab`) — NOT display names (`Visit`, `Events`, `Campus`, `Education`, `Political Club`, `Publications`). Reason: data model uses IDs; display names drift (the Liberal Arts → Education rename and Lab → Publications rename are recent and likely to re-rename). § 8.5.
- **`primary` semantic.** Charcoal-as-primary (current) vs brand color (PRD's red `#cc2936` / blue `#1d3557`). Three sub-options spelled out in § 8.2.
- **`--font-sans` vs `--font-mono`.** Both = JetBrains Mono. Handoff decision #10 leaves this open. Recommend collapse to one token or rename one to signal intent (`font-body` vs `font-display-mono`?). § 8.1.
- **Charcoal duplication.** `#171717` (`--foreground`) vs `#1a1a1a` (`OctahedronHero` tooltips, `HouseBanner` letter/text fallback). Recommend `#171717` wins; `#1a1a1a` is drift. § 8.6.
- **House palette `color` (legacy) vs `palette` (canonical).** `houses.ts.color` is `@deprecated FRAC-24` but still read by `AvatarBadge` and `HouseBanner` fallback (`HouseBanner.tsx:96`). DESIGN.md should canonicalize on `palette.{light,deep}`. The `color` field's death is a code-side follow-up.

---

## 7. Octahedron / FRAC-20 caveat

**One-line conclusion:** Nothing about the 3D hero — face order, photos, materials, the "Coming Soon" placeholder — should be encoded as DESIGN.md tokens. It is shipped, locked, and lives in code.

- **Photo rendering is locked** (handoff #7): plain `MeshBasicMaterial` + `tex.colorSpace = THREE.SRGBColorSpace`. No overlay shader. Verified — confirmed live at `OctahedronHero.tsx:503, 522, 531, 539`. FRAC-20 is closed in spirit even if its ticket isn't marked done.
- **Face order is locked but cheap to tweak** (handoff #6): `campus, events, lab, school, neighborhood, people, forum, story`. DESIGN.md should **not** encode face order — it is presentation logic, not a token.
- **"Coming Soon" Political Club node at vertex 4** is in place (handoff #5). DESIGN.md should not codify it.
- **`tintMix: 0.55` is gone** — do **not** re-flag C7 as live. Verified.
- **`#1a1a1a` octahedron tooltip backgrounds** are charcoal drift (see § 4 / § 6 / § 8.6) — that part stays in scope for DESIGN.md, but only as a token-value decision, not as 3D-hero territory.
- **Takeaway:** DO NOT canonicalize anything 3D-shader-y, per-face, or sequence-y into DESIGN.md tokens. Photos, gamma decisions, face order, RAF loops stay in code (and prose).

---

## 8. Open questions for human

**One-line conclusion:** Eight A/B (or A/B/C) decisions that need human input before DESIGN.md can be authored cleanly. None are "consider" — they are commitments.

1. **`--font-sans` collapse (handoff #10 unresolved).** Pick one:
   (A) Keep two tokens, both `'JetBrains Mono', monospace`, document the duplication in prose.
   (B) Collapse to a single `font-body` token, drop `--font-sans` from the system.
   (C) Rename `--font-sans` to a real sans family (e.g. Inter / system-ui) and add to `@import url(...)`.
   **Decision needed: A, B, or C?**

2. **`primary` semantic.** The codebase uses charcoal (`#171717`) as `--primary`. design.md's `missing-primary` lint expects a brand color. Pick one:
   (A) Accept charcoal-as-primary; live with `missing-primary` lint warning.
   (B) Assign a brand color from the PRD (red `#cc2936` or blue `#1d3557`); rename charcoal slot to `colors.foreground` only.
   (C) Introduce a new `colors.brand` token (red OR blue), leave `primary` aliased to `foreground`.
   **Decision needed: A, B, or C?**

3. **Spacing scale.** No codified vertical-rhythm scale exists today (S6).
   (A) Declare a scale, omit ad-hoc values, accept some prose explanation.
   (B) Omit `spacing:` entirely from DESIGN.md; explain ad-hoc reality in prose.
   **Decision needed: A or B?**

4. **DESIGN.md component coverage beyond Button.** Codebase has Button (FRAC-27), HouseBanner, AvatarBadge, Navbar wordmark, Hero search.
   (A) Button only — keep DESIGN.md minimal; everything else lives in code.
   (B) Button + HouseBanner — these are the load-bearing surfaces.
   (C) All five — fully codify; accept the documentation burden.
   **Decision needed: A, B, or C?**

5. **House token key style.** Confirm: `house-{id}` (internal id, e.g. `house-forum-deep`) over `house-{displayName}` (e.g. `house-political-club-deep`).
   **Decision needed: yes (use IDs) or no (use display names)?**

6. **Canonical charcoal.** `#171717` (current `--foreground`) vs `#1a1a1a` (tooltips, banner fallbacks).
   (A) `#171717` wins; treat `#1a1a1a` as drift to migrate in a follow-up cleanup.
   (B) Shift `--foreground` to `#1a1a1a`; treat `#171717` as drift.
   **Decision needed: A or B?**

7. **Lab `#6B4C9A` carry-forward.** FRAC-34 (Lab purple migration) is not landed.
   (A) Pre-tokenize `house-lab-accent: #6B4C9A` in DESIGN.md now; FRAC-34 follows.
   (B) Omit from DESIGN.md until FRAC-34 lands; accept temporary token gap.
   **Decision needed: A or B?**

8. **Pinned spec version.** Currently planning against `@google/design.md@0.2.0` (alpha).
   (A) Pin to `0.2.0` in lint script.
   (B) Track latest (`@google/design.md@latest`) and accept future re-author work when spec moves.
   **Decision needed: A or B?**

---

## Done-criteria self-check (impl agent)

- [x] Deliverable file at `.lattice/notes/task_01KTCMK9QP8GT21KMZV34S82J7-gap-analysis.md`.
- [x] All 8 required sections present in spec order.
- [x] No source files in `src/` modified. No DESIGN.md authored.
- [x] FRAC-21 audit findings referenced by code (H1, H5, S1, S5, S6, C5, C6, C7 explicitly).
- [x] HSL → hex conversions shown for `background`, `foreground`, `border`, `muted`, `muted-foreground` (with worked example for `muted`).
- [x] House palette uses internal IDs and `{ light, deep }` pair structure.
- [x] 10 locked decisions acknowledged, not re-debated (§ 6, § 7).
- [x] "What design.md cannot model" lists motion, shaders, noise, gradients, Mandelbrot corners, per-house bg inversion, hidden-route logic (§ 3).
- [x] 8 open questions, each A/B or A/B/C.
- [x] Length: ~3 pages of dense markdown, not a sprawl.

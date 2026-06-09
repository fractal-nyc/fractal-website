# Home page — typography + color audit

**Page slug:** home
**Source files:** src/pages/Home.tsx, src/components/sections/Hero.tsx
**Audit date:** 2026-06-08
**Spec snapshot:** .lattice/notes/audit-prompt.md (FRAC-19 author date 2026-06-08, tightened by FRAC-20 PR)
**Mobile viewport baseline:** 375px
**Branch:** frac-22-audit-home

## Scope

### In scope

- `src/pages/Home.tsx` — the page entry. Owns the `<main>` (L19) and the
  inline "Golden Age Protocol" `<section>` (L25). Renders `<Navbar />`,
  `<Hero />`, `<Footer />` (audited as shared chrome elsewhere if at all).
- `src/components/sections/Hero.tsx` — Home's hero. Renders the keyboard
  skip-nav (`<nav>` + `<ul>` at L129–150), the lazy-loaded
  `FractalCityScene`, the search combobox/listbox UI (L157–299), and the
  NYC skyline background image (L302–314).

### Out of scope (with rationale, per the plan)

- `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`,
  `src/components/ui/FadeIn.tsx`, `MandelbrotIcon`, `MandelbrotCorners`,
  `FractalPattern.tsx` — shared chrome rendered on every page. Audited
  elsewhere if at all. Same exclusion rationale as FRAC-20 (Lab).
- `src/components/three/FractalCityScene.tsx` — the R3F canvas wrapper.
  No text/color content in JSX classNames (its `bg-transparent` canvas
  style is a scene-canvas concern, not a Tailwind surface declaration).
  The `<div className="absolute inset-0 z-[1]">` and
  `<div className="pointer-events-auto">` wrappers carry no typography or
  color tokens. Excluded entirely.
- `src/components/three/OctahedronHero.tsx` — the 3D scene rendered into
  the R3F canvas. Excluded. The vast majority of its color is THREE.js
  material color (R3F props `color`, `emissive`, `material.color`), which
  DESIGN.md → Components explicitly classifies as "code, not tokens"
  ("Motion, shaders, materials, and the face order are not tokens"). Its
  text content (EDGE_TEXT "THE PROTOCOL", nav-node labels) is canvas-
  baked into textures (`ctx.font = "bold 28px 'JetBrains Mono'…"`,
  L238) or rendered via `<Html>` overlays with inline CSS strings in
  `tooltipStyle()` (L783–798). These do not consume Tailwind utilities
  and sit outside the audit-prompt's scope (section 9 non-goal: "audit
  declared CSS/Tailwind values only"). The `tooltipStyle()` does
  reference `hsl(var(--foreground))` at L795 — canonical-token
  consumption — but the file as a whole is excluded as a 3D scene
  artifact per DESIGN.md → Components, by analogy to audit-prompt
  section 9's exclusion of motion/shader/gradient internals.
- `src/components/three/Skyline.tsx` — not imported by Hero (orphan). Not
  in render graph; out of scope.
- `src/components/three/FractalObject.tsx` — dead-code path per FRAC-21
  team review; the live `FractalObject` export comes from
  `OctahedronHero`. Not in scope either way.
- `src/hooks/use-global-search.ts`, `src/hooks/usePrefersReducedMotion.ts`,
  Wouter's `useLocation` — data/hook layer, no UI.
- `OUTER_NAV_NODES` const import — pure data (route + label + color
  strings consumed by 3D nodes). The skip-nav UI in `Hero.tsx:129–150`
  IS in scope and uses Tailwind utilities; the data import itself is
  not.
- The `<img src="…/skyline4.png" />` raster at `Hero.tsx:305` — per
  audit-prompt section 9, "Image colors, photographs, gradients in
  raster assets" are out of scope. The inline `style={{ opacity: 0.15, … }}`
  is layout, not typography or color.
- Tests, configs, package files.

### House identity

Home is the entry page — it is not a single house's page. Per DESIGN.md
→ Text foregrounds: "house colors do not cross page boundaries." But
Home shows references to every house (the skip-nav lists every route,
the 3D scene shows house-colored nav nodes via `housePalette()`).

**Lock:** every house pair is permitted as a text/color highlight WITHIN
its own banner or 3D node on Home (the OctahedronHero face/node treatment
is scene code, out of scope anyway). For Tailwind-utility text on Home
chrome (the skip-nav `<a>` labels, the protocol-section `<p>` paragraphs,
the search combobox), the page-level rule applies: text is
`text-foreground` (charcoal) or `text-background` (cream) only. No house
color is permitted as Home page chrome text.

A walk of `Home.tsx` and `Hero.tsx` confirms: no `text-house-*` or
`bg-house-*` utility appears on any Home chrome element today. The rule
is a guard against future drift.

## Typography audit

```
Element: src/pages/Home.tsx:28 — <h2 className="text-display">A Golden<br />Age Protocol</h2>
Current: family=Fraunces, weight=300, style=normal, transform=uppercase, size=text-5xl (mobile), text-7xl (md+), tracking=0.04em
Nearest canonical utility: .text-display
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-display; no rendering change. Migration is a no-op (utility already canonical). h2 wrapper's global italic+uppercase rule is overridden by .text-display's font-style:normal — net rendering matches the spec.
```

```
Element: src/pages/Home.tsx:35 — <div className="font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin" style={{ fontStyle: "normal" }}> (renders three <p> children at lines 36/76/90)
Current: family=JetBrains Mono, weight=100 (font-thin), style=normal (inline override), transform=uppercase, size=text-sm (mobile), text-base (md+), tracking=default, leading=relaxed
Nearest canonical utility: .text-eyebrow
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Chrome-tier rendering (JBM uppercase) but at body-passage length and md:text-base sizing. .text-eyebrow / .text-label / .text-meta are all single-size text-sm at weight 500 with tracking 0.1em — wrong weight (100 vs 500), wrong responsive size (text-sm→text-base vs flat text-sm), missing tracking, but matches family (JBM) and transform (uppercase) and serves the role of body prose in chrome key. No canonical body utility uses mono uppercase at weight 100. This is the closest equivalent to Lab's PretextParagraph GAP — Home's protocol paragraphs are body text rendered with chrome-tier vibe at a weight (100) the canonical scale does not declare. Logging.
```

```
Element: src/components/sections/Hero.tsx:133 — <ul className="flex flex-col gap-1 bg-background border border-foreground p-3 font-mono text-xs uppercase tracking-wider">
Current: family=JetBrains Mono, weight=400 (default), style=normal, transform=uppercase, size=text-xs, tracking=wider
Nearest canonical utility: .text-eyebrow
Match quality: NEAR
Action: MIGRATE
Rationale: .text-eyebrow is JBM weight 500 uppercase tracking 0.1em text-sm. Drift on weight (400 vs 500), size (text-xs vs text-sm), tracking (wider≈0.05em vs 0.1em). Family and transform match. Skip-nav label list — semantic role (visually hidden chrome label set, popped on focus) is .text-eyebrow's "overline label" intent. Apply task migrates to .text-eyebrow on the <ul> (children inherit) or on each <a>. Color row covers bg-background/border-foreground separately.
```

```
Element: src/components/sections/Hero.tsx:194 — <input … placeholder="Explore Fractal..." className="… text-label text-foreground/60 …">
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-control
Match quality: NEAR
Action: MIGRATE
Rationale: The input currently uses .text-label, which the FRAC-51 typography spec explicitly calls out as a UX trap on typeable controls (uppercase forces typed text uppercase; text-sm = 14px triggers iOS zoom-on-focus). DESIGN.md → typography → Control tier introduced .text-control specifically for inputs: JBM weight 400 normal-case text-base. Migrate text-label → text-control. Drift between current and target is intentional (case + size correction). Color row covers text-foreground/60 + placeholder:text-foreground/60 separately. Mirror span at Hero:202 also carries text-label — same migration applies so the caret-width measurement stays accurate.
```

```
Element: src/components/sections/Hero.tsx:243 — <div className="text-meta text-foreground/60 text-center px-3 py-3">No results</div>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-meta
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-meta; typography is canonical. "No results" is inline metadata in the listbox empty state — .text-meta's semantic role matches. Color row covers text-foreground/60 separately.
```

```
Element: src/pages/Home.tsx:38,47,56,65,78 — <a className="underline underline-offset-2 hover:text-foreground transition-colors"> inline links inside the protocol paragraphs (five sites: Founding Fathers, Bell Labs, YCombinator, Renaissance Florence, scenius)
Current: family=JetBrains Mono (inherited from L35 wrapper), weight=100 (inherited), style=normal (inherited inline override), transform=uppercase (inherited), size=text-sm (mobile, inherited), text-base (md+, inherited), tracking=default (inherited)
Nearest canonical utility: .text-eyebrow
Match quality: GAP
Action: GAP-LOG-AND-MIGRATE
Rationale: Anchors inherit typography from the L35 wrapper, so they share the same GAP profile (JBM uppercase weight 100, no canonical fit). They add only color/underline state and do not re-declare family/weight/size/transform. Same GAP as the wrapper above; no separate gap entry needed — the wrapper's gap entry covers them. Listed here so the Apply task knows to verify each anchor stays visually consistent after the wrapper migrates. Color row covers hover:text-foreground separately. The <em>scenius</em> at L84 is inside the YCombinator-style anchor at L78 and italicizes via the <em> tag's user-agent default — flag in Rationale only; not a separate row because no Tailwind utility is applied.
```

```
Element: src/components/sections/Hero.tsx:143 — <a className="block px-2 py-1 hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">{node.label}</a>
Current: family=JetBrains Mono (inherited from L133 <ul>), weight=400 (inherited), style=normal, transform=uppercase (inherited), size=text-xs (inherited), tracking=wider (inherited)
Nearest canonical utility: .text-eyebrow
Match quality: NEAR
Action: MIGRATE
Rationale: Anchor inherits typography from the L133 <ul>. Same NEAR profile (JBM uppercase, weight 400 vs spec 500, text-xs vs spec text-sm, tracking wider vs spec 0.1em). Apply task: when migrating the <ul> to .text-eyebrow, this anchor inherits the corrected rendering automatically — no per-anchor className change needed. Listed here so the audit doc enumerates every text-bearing node in the skip-nav. Color row covers hover:bg-foreground/10 + focus-visible:bg-foreground/10 + focus-visible:ring-foreground separately.
```

```
Element: src/components/sections/Hero.tsx:199 — <span ref={mirrorRef} aria-hidden="true" className="text-label" style={{ position: "absolute", visibility: "hidden", whiteSpace: "pre", pointerEvents: "none", top: 0, left: 0 }}>{query || "Explore Fractal..."}</span>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-control
Match quality: NEAR
Action: MIGRATE
Rationale: Hidden mirror span whose offsetWidth drives the FRAC-43 caret overlay's left offset. MUST use the same typography utility as the L194 input so the measured width matches the rendered width. Currently .text-label; when the input migrates to .text-control, this span must migrate in lockstep. Same NEAR profile (case + size delta from .text-label to .text-control) as the input. Element is visually hidden — no contrast/legibility concern — but the typography utility must stay paired. Color: irrelevant (visibility:hidden, no color contribution).
```

```
Element: src/components/sections/Hero.tsx:272 — <div className="text-label truncate flex items-center gap-1">{result.title}…</div>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-sm, tracking=0.1em
Nearest canonical utility: .text-label
Match quality: EXACT
Action: MIGRATE
Rationale: Already on .text-label; typography is canonical. Search result title in the dropdown — .text-label's "form/UI label" semantic role fits an actionable result row. Color inherited from the parent <li> at L259–263 (text-foreground when focused, text-foreground/60 otherwise) — covered in color rows.
```

```
Element: src/components/sections/Hero.tsx:278 — <div className="text-xs text-foreground/60 truncate mt-0.5">{result.subtitle}</div>
Current: family=JetBrains Mono (inherited via font-mono cascade — actually inherits Inter body default; see Rationale), weight=400, style=normal, transform=none, size=text-xs, tracking=default
Nearest canonical utility: .text-meta
Match quality: NEAR
Action: MIGRATE
Rationale: Search result subtitle in the dropdown. .text-meta is JBM weight 500 uppercase tracking 0.1em text-sm. Drift: family (Inter body default vs JBM), weight (400 vs 500), transform (none vs uppercase), tracking (default vs 0.1em), size (text-xs vs text-sm). Semantic role (inline secondary metadata under a label) maps to .text-meta. text-xs is a deliberate density choice for the compact dropdown (the L289 group label also uses text-[10px] for the same reason); Apply task should either size up to text-sm or keep the density override and document it. Color row covers text-foreground/60 separately.
```

```
Element: src/components/sections/Hero.tsx:289 — <div className="text-eyebrow text-[10px] text-foreground/40 px-3 pt-2 pb-1">{group.label}</div>
Current: family=JetBrains Mono, weight=500, style=normal, transform=uppercase, size=text-[10px] (override of .text-eyebrow's text-sm), tracking=0.1em
Nearest canonical utility: .text-eyebrow
Match quality: NEAR
Action: MIGRATE
Rationale: .text-eyebrow is JBM weight 500 uppercase tracking 0.1em text-sm. Drift: size text-[10px] vs spec text-sm — explicit density override on this site (call-site comment: "text-[10px] density override for compact search dropdown"). Family, weight, transform, tracking all match. Apply task: keep the utility and the text-[10px] override side by side (the override is intentional and call-site-scoped); leave a comment so the override is preserved. Color row covers text-foreground/40 separately.
```

## Color audit

```
Element: src/pages/Home.tsx:19 — <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
Current: bg-background (#f8f6f0), text-foreground (#171717), selection:bg-foreground, selection:text-background
Role: background + text (page default) + selection-background + selection-text
Nearest canonical token: background / foreground
Match quality: EXACT
Action: MIGRATE
Rationale: All four utilities already on canonical tokens. Surface foreground pairing satisfied (bg-background + text-foreground on the same node, FRAC-42 rule). Selection chrome is paired-inverse and exempt from the pairing rule per audit-prompt section 5. No-op migration. Multiple roles collapse into one row by (file + token) grouping.
```

```
Element: src/pages/Home.tsx:25 — <section className="bg-background px-[4.5%] py-40 md:py-60">
Current: bg-background (#f8f6f0)
Role: background
Nearest canonical token: background (paired with text-foreground, currently absent on this node)
Match quality: NEAR
Action: MIGRATE
Rationale: Surface declaration bg-background is canonical. Per DESIGN.md → Surface foreground pairing (FRAC-42), every bg-* must carry its paired text-* foreground on the same node. This section declares bg-background but inherits text-foreground from <main> at line 19 via the cascade. Apply task: add text-foreground to the className. Rendering unchanged today; the rule is for compositional safety against future nested surfaces. Same NEAR-pairing pattern appears at Hero.tsx:120 (hero section), Hero.tsx:133 (skip-nav ul), Hero.tsx:240 (listbox container) — those are separate rows per (file + token) grouping.
```

```
Element: src/pages/Home.tsx:35,42,51,60,80 — text-foreground/80 on the protocol paragraphs wrapper (line 35) and hover:text-foreground on the inline link <a> elements (lines 42, 51, 60, 69, 80)
Current: text-foreground/80 (Tailwind alpha-modified canonical token), text-foreground (hover state)
Role: text (default) + text (hover)
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: All sites on the canonical foreground token with Tailwind alpha modifier on the default state and full opacity on hover. Per project-wide text-color rule (DESIGN.md → Text foregrounds): text is foreground or background; alpha-modified is presentation, not a different value. Five sites collapse to one row by (file + token) grouping; Role line lists default + hover.
```

```
Element: src/components/sections/Hero.tsx:120 — <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-background">
Current: bg-background (#f8f6f0)
Role: background
Nearest canonical token: background (paired with text-foreground, currently absent on this node)
Match quality: NEAR
Action: MIGRATE
Rationale: Same FRAC-42 pairing finding as Home.tsx:25 — bg-background without text-foreground on the same node. Apply task adds text-foreground. Hero is the page's first viewport; the cascade does carry text-foreground from Home.tsx:19's <main>, so rendering is correct today. Migration is for compositional safety.
```

```
Element: src/components/sections/Hero.tsx:143,163,194,221,243,259,261,262,272,278,289 — text-foreground variations (text-foreground/40, /60, /70, /80, plain text-foreground) across the skip-nav link, search icon, input, caret overlay, no-results message, listbox options, eyebrow group label, etc.
Current: text-foreground with Tailwind alpha modifiers (text-foreground/40, /60, /70, /80) and plain text-foreground
Role: text + icon-stroke + caret-fill + option-state + label
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Every site already on the canonical foreground token. Alpha modifiers are presentation, not a different value. Many sites collapse to one row by (file + token) grouping; Role line lists every role this token serves in Hero. No raw text-white, text-black, or text-gray-* anywhere in Hero.
```

```
Element: src/components/sections/Hero.tsx:133 — <ul className="flex flex-col gap-1 bg-background border border-foreground p-3 …">
Current: bg-background (#f8f6f0), border-foreground (#171717)
Role: background + border
Nearest canonical token: background (paired with text-foreground, currently absent on this node) / foreground
Match quality: NEAR (pairing) / EXACT (border)
Action: MIGRATE
Rationale: bg-background declared without text-foreground on the same node — FRAC-42 pairing finding. The skip-nav <a> children at Hero:143 inherit color from the page cascade. NEAR → MIGRATE: add text-foreground to the <ul>. border-foreground is already on the canonical token (EXACT) and stays as-is — the skip-nav is Home page chrome, not a house surface, so charcoal border is correct (house-identity decision: no house borders on Home chrome). Two roles collapse into one row by (file + token) grouping.
```

```
Element: src/components/sections/Hero.tsx:143 — <a className="… hover:bg-foreground/10 focus-visible:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground">
Current: bg-foreground/10 (hover + focus-visible), ring-foreground (focus-visible)
Role: background (hover + focus-visible state) + ring (focus-visible)
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: All three utilities on the canonical foreground token. Alpha-modified background and full-opacity ring — alpha is presentation. State-only surface declarations (hover/focus-visible) are not standing surfaces — the FRAC-42 pairing rule applies to declared base surfaces; transient state backgrounds inherit the page text cascade and do not need re-asserted text-* foregrounds. Three sites collapse to one row by (file + token) grouping.
```

```
Element: src/components/sections/Hero.tsx:194 — <input … className="w-full text-label text-foreground/60 border border-foreground/20 rounded-md bg-background/90 backdrop-blur-sm placeholder:text-foreground/60 outline-none transition-all duration-200 focus:border-foreground/40 focus:text-foreground/80 h-[30px] pl-8 pr-3">
Current: text-foreground/60 (default), placeholder:text-foreground/60, focus:text-foreground/80, border-foreground/20, focus:border-foreground/40, bg-background/90
Role: text (default + focus + placeholder) + border (default + focus) + background
Nearest canonical token: foreground / background
Match quality: EXACT
Action: MIGRATE
Rationale: Every token reference is on canonical foreground or background with Tailwind alpha modifiers. Alpha is presentation, not a different value. Surface foreground pairing rule satisfied: bg-background/90 and text-foreground/60 are co-declared on the same node (the input itself), so the pair is present — classify EXACT for the pairing. The backdrop-blur-sm is an effect, not a color. Many sites collapse to one row by (file + token) grouping.
```

```
Element: src/components/sections/Hero.tsx:221 — <span aria-hidden="true" className="absolute inline-block w-[9px] h-[18px] bg-foreground/70 animate-blink pointer-events-none">
Current: bg-foreground/70
Role: background (decorative caret fill)
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: FRAC-43 thick blinking cursor overlay. The element is purely decorative (aria-hidden, 9px × 18px charcoal block at end-of-text). Surface foreground pairing rule N/A — there is no text content on this node, so no foreground to pair with. The "surface" here is a single-color fill block, not a container. bg-foreground/70 is on the canonical foreground token; alpha is presentation. No-op migration.
```

```
Element: src/components/sections/Hero.tsx:240 — <div id={listboxId} role="listbox" aria-label="Search results" className="absolute bottom-full left-0 mb-1 w-full bg-background/95 backdrop-blur-sm border border-foreground/20 rounded-md overflow-hidden shadow-lg max-h-[60vh] overflow-y-auto">
Current: bg-background/95 (#f8f6f0 with /95 alpha), border-foreground/20
Role: background + border
Nearest canonical token: background (paired with text-foreground, currently absent on this node) / foreground
Match quality: NEAR (pairing) / EXACT (border)
Action: MIGRATE
Rationale: bg-background/95 declared without text-foreground on the same node — FRAC-42 pairing finding. The descendant options at Hero:259–263 each re-declare text-foreground/60 or text-foreground per state, and the L243 "No results" div re-declares text-foreground/60, so rendering is correct today. NEAR → MIGRATE: add text-foreground to the listbox container for compositional safety. border-foreground/20 is on the canonical foreground token (EXACT) — alpha is presentation. Two roles collapse into one row by (file + token) grouping.
```

```
Element: src/components/sections/Hero.tsx:259–263 — <li className={`flex items-start gap-2.5 cursor-pointer px-3 py-2 transition-colors ${isFocused ? "bg-foreground/10 text-foreground" : "text-foreground/60 hover:bg-foreground/5"}`}>
Current: bg-foreground/10 + text-foreground (focused state), text-foreground/60 + hover:bg-foreground/5 (default + hover state)
Role: background (focused + hover states) + text (focused + default states)
Nearest canonical token: foreground
Match quality: EXACT
Action: MIGRATE
Rationale: Every utility on the canonical foreground token. The focused branch co-declares bg-foreground/10 with text-foreground on the same node — pairing satisfied for that state. The default branch declares only text-foreground/60 (no surface) — no pairing required because there is no surface. Hover branch is a transient state surface — same rule as Hero:143 (state surfaces inherit cascade, no re-asserted foreground needed). Alpha modifiers are presentation. Many roles collapse into one row by (file + token) grouping.
```

```
Element: src/components/sections/Hero.tsx:270,275 — <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" /> and <ArrowUpRight className="h-3 w-3 opacity-40 shrink-0" />
Current: opacity-60 / opacity-40 (no text-* declared; icon strokes inherit currentColor from parent <li>)
Role: stroke (icon, via currentColor inheritance from parent text-foreground/* utility)
Nearest canonical token: foreground (inherited)
Match quality: EXACT
Action: MIGRATE
Rationale: lucide-react icons render via currentColor by default. With no explicit text-* on these <Icon /> elements, they inherit the parent <li>'s text-foreground/text-foreground/60 — already canonical. The opacity-60 / opacity-40 are layout/effect utilities, not color tokens — out of scope per the audit-prompt's "audit declared CSS/Tailwind values only" rule for typography/color. Two sites collapse to one row by (file + token) grouping. Listed here so the Apply task does not get confused by the missing explicit text-* (it is intentional — currentColor inheritance is the canonical pattern).
```

## Forward observations (not GAPs under current rules)

- **Surface foreground pairing on transient state surfaces.** Five sites
  declare `bg-foreground/*` only on hover or focus state
  (`Hero.tsx:143` hover + focus-visible, `Hero.tsx:259–263` focused +
  hover variants). The FRAC-42 pairing rule is most readable when
  applied to standing surfaces; state-only surfaces inherit the page
  text cascade and never establish a long-lived nested surface, so
  re-asserting a paired `text-*` on every hover/focus state would clutter
  call sites without changing rendering. This audit classifies them
  EXACT (the alpha-modified utilities are canonical) and does not flag
  them as pairing NEAR. Worth recording for the next audit-prompt
  iteration: should the pairing rule explicitly exempt state-only
  surfaces, or should we declare a paired-state utility convention?
  Not a GAP today — the current rule plus the (state surface vs.
  standing surface) read cleanly resolves these sites.

- **Compact-dropdown density overrides.** The search dropdown uses
  `text-xs` for the result subtitle (`Hero.tsx:278`) and `text-[10px]`
  for the group label (`Hero.tsx:289`), both deliberate density choices
  for the compact dropdown chrome. The canonical `.text-meta` and
  `.text-eyebrow` utilities ship at `text-sm`. Apply task will either
  size up to `text-sm` (losing the compact-dropdown density) or keep
  the override side by side with the utility (the L289 site already does
  this with `text-eyebrow text-[10px]`). Worth considering a
  container-scoped chrome utility (e.g., `.text-meta-compact` at
  `text-xs` or `text-[10px]`) so density variants are explicit. Not a
  GAP today — `.text-eyebrow` / `.text-meta` plus a per-call-site
  size override cleanly resolves these rows.

- **Inline `<em>` inside the YCombinator-style anchor.** `Home.tsx:84`
  wraps "scenius" in `<em>scenius</em>` inside an `<a>` that itself
  inherits the JBM uppercase weight-100 wrapper at L35. The `<em>` tag
  italicizes via the user-agent default — no Tailwind utility is
  applied, so the audit does not produce a row. The italic-on-mono-
  uppercase rendering is intentional editorial emphasis ("Brian Eno
  calls these flowerings of collective genius a name: scenius") and
  ships as-is. Worth recording so the Apply task does not "fix" the
  italic when migrating the wrapper.

## Gap appendix

```
- src/pages/Home.tsx:35 — <div className="font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin" style={{ fontStyle: "normal" }}> the "Golden Age Protocol" prose wrapper rendering three <p> children with five inline <a> links (JBM uppercase, weight 100, responsive text-sm → text-base)
  Nearest-fit chosen: .text-eyebrow
  Why it didn't fit: Chrome-tier rendering (JBM uppercase) at body-passage length and responsive sizing. .text-eyebrow / .text-label / .text-meta are all single-size text-sm at weight 500 with tracking 0.1em — wrong weight (100 vs 500), wrong responsive size (text-sm→text-base vs flat text-sm), missing tracking. No canonical body utility uses mono uppercase at weight 100.
  Proposed system change: add a body-mono-uppercase utility tier (e.g., .text-body-mono-uppercase or a thin variant of .text-body-lead with the JBM family + uppercase transform + responsive text-sm md:text-base + weight 100), OR revisit whether the Golden Age Protocol prose should drop the mono/uppercase treatment in favor of a canonical body utility (e.g., .text-body-lead) — this is an editorial-voice decision the audit cannot make alone.
  Page: home
  Date: 2026-06-08
```

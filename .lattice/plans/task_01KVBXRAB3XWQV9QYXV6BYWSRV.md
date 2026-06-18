# FRAC-224 — DESIGN.md: simplify prose

**Complexity:** medium (editorial; doc-only; reframes core concepts + trims history).
**Files:** `DESIGN.md` ONLY. No `src/` changes. YAML front-matter unchanged (token values/structure stay).
**Source:** direct editorial direction from Julianna (2026-06-17, the site owner).
**Base branch:** built on `frac-223-design-md-reconcile` so it edits the up-to-date doc (FRAC-223's
blessed-exception additions are KEPT — they're forward-looking intent, not history).

## Governing principle
The doc has no human editor and is read cold by new people and agents. **Keep forward-looking design
intent; cut migration archaeology.** The test for a sentence: does it tell the reader *what the system
is and how to use it* (keep), or *what it used to be / how we got here / which ticket changed it*
(cut)? Tighten wording throughout; don't lose any live design rule.

## The four directed changes

### 1. Reframe the core foundation (Overview)
The current 2nd foundation — "**Charcoal is the voice** … editorial charcoal" — is the WRONG framing.
Replace with: the base is deliberately **neutral and simple** so the accent **house colors** carry the
brand and strongly signal Fractal's different sectors. Because the houses throw so many pops of color,
the base (cream surface, charcoal text) is kept quiet so those accents read. Frame it as
*neutral base → loud house accents*, not *charcoal as an editorial voice*. (Keep the mobile-first
foundation as-is.) Use the owner's framing: "a neutral base for accent 'house' colors that strongly
represent the various sectors of Fractal and its brand; because there are so many pops of color from
the houses, the base is left simple."

### 2. Introduce houses early (Overview)
Houses are referenced everywhere but introduced abruptly. In the Overview, up front, briefly explain
the house concept: Fractal is organized into themed **houses**, one per sector of the org, and each
house owns an accent color pair that themes its own pages. This should land before the doc starts
leaning on "house" terminology. (The detailed house table stays later in §Colors.)

### 3. Delete the shadcn-scaffold history (Colors)
DELETE outright (owner-flagged as pure distraction): "*The original shadcn scaffold's unused neutrals
(`card`, `popover`, … and their `-foreground` pairs) were removed in FRAC-201 … renamed from the
scaffold's `muted-foreground` / `border` into this ladder.*" The 3-weight charcoal ladder stands on its
own; no one needs the migration story.

### 4. Trim the Story history (Non-house section colors)
The Story paragraph carries a long backstory — "*Story previously carried three golds (a pale
`#DFCA7A` …, a deep `#8A7A20` …, and `#D4BA58`); those collapsed to this one. The pale page gold was
the reason a third color had been bolted on — it was illegible on the cream navbar — so `#D4BA58` …
became the single identity color.*" CUT the history. Keep only the live facts: Story is a cream
non-house section; cream background + charcoal text + a single gold identity accent (`section-story`
`#D4BA58`); gold appears only as decoration (gold-on-cream fails WCAG for body text, so body stays
`text-foreground`); sourced from `SECTIONS.story.accent`.

## General sweep (apply the same test everywhere)
Trim other purely-historical asides and parenthetical ticket-archaeology where they don't carry a live
rule. Examples to tighten (judgment, don't over-cut): "(FRAC-NN)" citations embedded mid-sentence that
add no instruction; "previously / was renamed / used to / the last consumer was swept" clauses. KEEP a
ticket ref only where it points to a still-relevant decision a reader might need. Don't touch: the
mobile-first rule, surface/house/section token tables and their roles, the type scale, borders/shape
rules, components, the conformance-loop section, and FRAC-223's five blessed-exception additions.

## Acceptance criteria
- Foundation #2 reframed to neutral-base/house-accents (no "charcoal is the voice" framing).
- Houses introduced early in the Overview.
- The shadcn-scaffold sentence is gone; the Story history is gone (live facts retained).
- Doc reads cleanly cold; every LIVE design rule preserved; no broken cross-links/anchors.
- YAML front-matter unchanged; no `src/` changes; `pnpm conformance` still green.

## Verify
- `rg -n "shadcn|previously carried three golds|Charcoal is the voice" DESIGN.md` → no matches.
- `rg -n "house|House" DESIGN.md | head` shows the early houses intro in the Overview.
- Re-read Overview + Colors + Story end-to-end for coherence.
- `node scripts/design-conformance.mjs` green.

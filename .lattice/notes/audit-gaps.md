# Sitewide audit gaps register

Append-only register of typography and color elements that did not fit any
canonical utility/token during per-page audits under FRAC-18. Each entry
represents a system-gap surfaced by an Audit sub-agent and migrated to a
nearest-fit utility/token in the corresponding Apply PR.

This register exists so the gaps accumulate sitewide and can be reviewed in
one batch by a human. Do NOT edit existing entries. Do NOT invent tiers or
tokens here. The register is a human-decision queue, not a system change.

## Entry format

<!--
- file:line — <element description>
  Nearest-fit chosen: <utility or token>
  Why it didn't fit: <one line>
  Proposed system change: <one line>
  Page: <page slug>
  Date: YYYY-MM-DD
-->

## Gaps

<!-- entries appended here by per-page audit sub-agents, in chronological order -->

- src/pages/LabPage.tsx:58 — <PretextParagraph size={TEXT_SIZES.base}> rendered as inline-styled <p>/<div> (JBM 13px weight 300)
  Nearest-fit chosen: .text-body-lead
  Why it didn't fit: No canonical body utility uses mono. .text-body-lead is Inter text-lg weight 300; .text-body is Inter text-base weight 400. Pretext always renders via FONTS.body (JetBrains Mono) at inline px sizes from TEXT_SIZES, which sits outside the Inter-only body tier and outside the Tailwind size scale.
  Proposed system change: add a body-mono utility tier (e.g., .text-body-mono / .text-body-mono-lead) sized to the TEXT_SIZES bridge (sm=12px, base=13px, lg=15px), OR re-author Pretext to consume Tailwind body utilities instead of TEXT_SIZES px constants.
  Page: lab
  Date: 2026-06-08

- src/pages/Home.tsx:35 — <div className="font-mono text-sm md:text-base leading-relaxed text-foreground/80 space-y-6 uppercase font-thin" style={{ fontStyle: "normal" }}> the "Golden Age Protocol" prose wrapper rendering three <p> children with five inline <a> links (JBM uppercase, weight 100, responsive text-sm → text-base)
  Nearest-fit chosen: .text-eyebrow
  Why it didn't fit: Chrome-tier rendering (JBM uppercase) at body-passage length and responsive sizing. .text-eyebrow / .text-label / .text-meta are all single-size text-sm at weight 500 with tracking 0.1em — wrong weight (100 vs 500), wrong responsive size (text-sm→text-base vs flat text-sm), missing tracking. No canonical body utility uses mono uppercase at weight 100.
  Proposed system change: add a body-mono-uppercase utility tier (e.g., .text-body-mono-uppercase or a thin variant of .text-body-lead with the JBM family + uppercase transform + responsive text-sm md:text-base + weight 100), OR revisit whether the Golden Age Protocol prose should drop the mono/uppercase treatment in favor of a canonical body utility (e.g., .text-body-lead) — this is an editorial-voice decision the audit cannot make alone. Resolved by FRAC-45 (added .text-body-display tier; migrated Home.tsx:35 to use it).
  Page: home
  Date: 2026-06-08

- src/components/sections/Campus.tsx:218 — <p className="text-xs md:text-sm text-white/70 italic text-center">Want a reduced rate? Let us know.</p> (italic-aside cluster: lines 218, 367, 419, 453, 532, 570 — small italic Inter body text serving editorial-aside / byline / sub-CTA roles on the Campus page)
  Nearest-fit chosen: .text-body
  Why it didn't fit: Italic Inter body at sub-base sizing (text-xs/text-sm at line 218; text-base at the bylines and prose asides). No canonical body utility is italic. .text-body and .text-body-lead are both upright; the display tier (.text-title, .text-subtitle) is italic but at display sizes (text-3xl+, text-xl+), too large for these inline asides.
  Proposed system change: add a body-aside italic tier (e.g., .text-body-aside or .text-body-note) sized to the existing body scale (text-sm or text-base) at Inter italic weight 400, with optional text-center variant. Alternative: codify the .font-serif italic rule as a body utility for short prose asides — though this would conflict with the existing Fraunces-implies-italic rule on .font-serif, so a dedicated italic-aside utility is cleaner. Resolved by FRAC-47 (added .text-aside tier; migrated all 7+ italic-aside sites + applied quote rule to Campus passages).
  Page: campus
  Date: 2026-06-08

- src/pages/StoryPage.tsx:18,137,146,151,156,189,201,209 + src/components/sections/NeighborhoodCampusDiagram.tsx:57,58,165,168 — the Story palette cluster (#D4BA58 STORY_COLOR + concatenated alpha variants ${STORY_COLOR}66 / ${STORY_COLOR}20 ; #8A7A20 RING_COLOR + #8A7A2033 RING_SOFT ; inline-style page bg on <main>; SectorHeader letter+eyebrow prop; SVG ring stroke ; PillarCard border) — Story is a non-house page with its own golden accent pair that does NOT appear in DESIGN.md's 31-token palette
  Nearest-fit chosen: (no canonical token — closest semantic match is the house display/highlight chrome role, but Story has no house pair)
  Why it didn't fit: Story is not a house page, so the 12 house tokens (`house-{visit,events,campus,education,political-club,publications}-{light,deep}`) do not apply per DESIGN.md → Text foregrounds ("house colors do not cross page boundaries"). The 19 surface tokens are neutrals (cream, putty, charcoal, muted-foreground, destructive-red, border) — none match Story's golden palette. The page consistently uses #D4BA58 (golden light) as its surface and #8A7A20 (golden deep) as its display accent, mirroring the house-{light}/{deep} convention — but the values are not in the system.
  Proposed system change: One of three options for the human queue: (a) Declare a `--color-story-light: #D4BA58` and `--color-story-deep: #8A7A20` pair in `@theme inline` (and DESIGN.md tokens block) as a non-house accent pair, matching the house-token mechanism but without forcing a `houses.ts` data-model entry. The Story Apply task then migrates raw hex → token-driven utilities, mirroring the Campus FRAC-25 pattern. (b) Leave the raw hex values in place with an explicit DESIGN.md "non-system accents permitted on non-house pages" carve-out — record the policy and document each non-house page's accent in prose so future audits can verify intent. (c) Migrate the page palette to an existing house pair (e.g., reuse Visit's olive `#889460` / `#4A5A30`) — would lose the Story-specific golden voice. Note: Protocol page (not yet audited) is likely to have a similar non-house-accent pattern, so the human decision should consider the sitewide question. Option (a) scales best if Protocol also needs its own pair.
  Page: story
  Date: 2026-06-09

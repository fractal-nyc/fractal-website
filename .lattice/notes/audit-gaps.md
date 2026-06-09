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

- src/components/sections/Campus.tsx:218 — <p className="text-xs md:text-sm text-white/70 italic text-center">Want a reduced rate? Let us know.</p> (italic-aside cluster: lines 218, 367, 419, 453, 532, 570 — small italic Inter body text serving editorial-aside / byline / sub-CTA roles on the Campus page)
  Nearest-fit chosen: .text-body
  Why it didn't fit: Italic Inter body at sub-base sizing (text-xs/text-sm at line 218; text-base at the bylines and prose asides). No canonical body utility is italic. .text-body and .text-body-lead are both upright; the display tier (.text-title, .text-subtitle) is italic but at display sizes (text-3xl+, text-xl+), too large for these inline asides.
  Proposed system change: add a body-aside italic tier (e.g., .text-body-aside or .text-body-note) sized to the existing body scale (text-sm or text-base) at Inter italic weight 400, with optional text-center variant. Alternative: codify the .font-serif italic rule as a body utility for short prose asides — though this would conflict with the existing Fraunces-implies-italic rule on .font-serif, so a dedicated italic-aside utility is cleaner.
  Page: campus
  Date: 2026-06-08

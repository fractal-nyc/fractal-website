# FRAC-210: Remove the pretext text system

## Context
The `pretext` components run custom `@chenglou/pretext` line-layout, but:
- `PretextParagraph` is used **once** — `PeoplePage.tsx`, a single teaser sentence.
- `PretextHeading` + `PretextLabel` are **dead** (0 uses).
- `lib/pretext.ts` + `hooks/use-pretext.ts` exist only to serve those components.

It's a whole system + hook + lib serving one short line on a deferred page. Remove it and use
a normal type utility.

## IMPORTANT — what STAYS (do not touch)
`@chenglou/pretext` (the npm dep) is ALSO used by `components/typeset/JustifiedParagraph.tsx`
(rendered in `Navbar.tsx`) and `lib/typeset/knuthPlass.ts` — a **separate, live justified-text
system**. Do NOT remove the dependency, JustifiedParagraph, the `typeset/` dir, or knuthPlass.

## Scope

### Delete (the pretext system only)
- `src/components/pretext/PretextParagraph.tsx`
- `src/components/pretext/PretextHeading.tsx`
- `src/components/pretext/PretextLabel.tsx`
- `src/components/pretext/index.ts`
- `src/lib/pretext.ts`
- `src/hooks/use-pretext.ts`

First re-confirm: nothing outside `pretext/` + `PeoplePage.tsx` imports these (grep
`use-pretext`, `@/lib/pretext`, `components/pretext`). knuthPlass/JustifiedParagraph import
`@chenglou/pretext` directly, NOT via these — verify.

### Repoint `src/pages/PeoplePage.tsx`
The single usage:
```
<PretextParagraph size={TEXT_SIZES.lg} className="font-light text-white">
  {"Look forward to the Fractal Network Portal available to Fractal Members soon..."}
</PretextParagraph>
```
→ a plain paragraph:
```
<p className="text-body font-light text-white">
  Look forward to the Fractal Network Portal available to Fractal Members soon...
</p>
```
- Remove the `PretextParagraph` + `TEXT_SIZES` imports from PeoplePage.
- Keep `font-light text-white` (so it still reads on the gold `#C49040` page).
- (Acceptable: the line renders a touch smaller/heavier than the old pretext size — deferred page.)

## Acceptance criteria
- The 6 pretext files are deleted; `grep -rnE "Pretext|use-pretext|lib/pretext" src/` → no
  references (except possibly an unrelated `@chenglou/pretext` import in knuthPlass/typeset,
  which is fine and must remain).
- `@chenglou/pretext` is still in package.json; `JustifiedParagraph` + `typeset/` + `knuthPlass`
  untouched and still build.
- PeoplePage renders the teaser as a normal `<p>` (text-body, font-light, white).
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass; `pnpm test` green except the 7
  pre-existing FRAC-199 failures — no new failures. (Check for any test importing pretext; none
  expected.)

## Out of scope
- The `@chenglou/pretext` dependency, JustifiedParagraph, the Navbar's justified system.
- The People page's `text-white` (a separate pre-existing concern) — keep it as-is.
- The octahedron 3D tooltip inline style (legit overlay).

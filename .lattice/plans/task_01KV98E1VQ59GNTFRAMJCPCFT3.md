# FRAC-211: Simplify Navbar masthead; remove the canvas typeset engine + dep

## Context
The desktop navbar masthead is two 13px thin uppercase mono paragraphs (`LEFT_TEXT`,
`RIGHT_TEXT`) flanking the wordmark, **canvas-rendered** via `JustifiedParagraph` + a full
Knuth-Plass typeset engine. Canvas text isn't selectable and has a11y risk; the engine is
heavy. `JustifiedParagraph` is the SOLE consumer of the whole stack, so simplifying the
masthead lets us delete all of it + the dependency.

## Dead set (verified — JustifiedParagraph is the only consumer)
- `src/components/typeset/JustifiedParagraph.tsx`
- `src/lib/typeset/knuthPlass.ts`, `hyphenate.ts`, `render.ts`
- `src/hooks/use-fonts-ready.ts`
- `@chenglou/pretext` dependency (used only by JustifiedParagraph + knuthPlass)

## Changes
1. **Navbar**: replace the two `<JustifiedParagraph text={LEFT_TEXT/RIGHT_TEXT} … />` with plain
   paragraphs, e.g. `<p className="font-mono text-[13px] leading-[18px] font-thin uppercase text-justify">{LEFT_TEXT}</p>`. Keep `LEFT_TEXT`/`RIGHT_TEXT` constants. (Preview will tune
   align/tracking — `text-justify` is gappier than Knuth-Plass; may switch to `text-left`.)
   Remove the `JustifiedParagraph` import.
2. **Delete** the dead set above.
3. **package.json**: remove `@chenglou/pretext`; `pnpm install` to update the lockfile.
4. **test-setup.ts**: the `document.fonts` mock was for `use-fonts-ready` — remove if now unused
   (or leave if harmless; verify).

## Preview gate
Live navbar change (shows on every page). After implementing, run the dev server and have the
human view the desktop nav (>=1024px) before finalizing. Iterate on align/size/tracking.

## Acceptance
- No `JustifiedParagraph` / `typeset` / `use-fonts-ready` / `@chenglou/pretext` references in
  `src/` or `package.json`.
- Masthead renders as plain selectable HTML text in the desktop nav.
- `pnpm typecheck`, `pnpm build`, `pnpm conformance` pass; tests at FRAC-199 baseline (update/
  remove the document.fonts mock test-setup line if it referenced the deleted hook; no new
  failures).

## Out of scope
- The wordmark (Jacquard/Fraunces) and other Navbar inline styles — those are legit special cases.

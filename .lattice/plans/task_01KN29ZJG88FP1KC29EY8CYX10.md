# FRAC-23: Pretext setup + base text components with existing font styles

## Scope

Install `@chenglou/pretext`, update fonts to PRD spec, create base React components that use Pretext for text measurement/layout with DOM rendering.

## Approach

**Rendering strategy:** Use `prepareWithSegments` + `layoutWithLines` for measurement, render each line as a positioned `<span>` inside a container `<div>`. DOM-based (selectable, accessible), Pretext controls line breaks.

**Graceful fallback:** Before fonts load or if Pretext fails, render regular DOM text. Pretext is an enhancement, not a gate.

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/pretext.ts` | Font constants, Pretext wrappers |
| `src/hooks/use-pretext.ts` | React hook: manages prepare/layout lifecycle with ResizeObserver |
| `src/hooks/use-fonts-ready.ts` | React hook: tracks `document.fonts.ready` |
| `src/components/pretext/PretextHeading.tsx` | h1-h6 via Pretext |
| `src/components/pretext/PretextParagraph.tsx` | Body text via Pretext |
| `src/components/pretext/PretextLabel.tsx` | Label/nav text in Space Mono |
| `src/components/pretext/index.ts` | Barrel export |

## Files to Modify

| File | Change |
|------|--------|
| `src/index.css` | Update Google Fonts (add Space Grotesk, Space Mono; keep Instrument Serif, Jacquard 24; remove JetBrains Mono). Update `--font-sans` → Space Grotesk, `--font-mono` → Space Mono. |
| `package.json` | Add `@chenglou/pretext` |

## Key Architecture: `usePretext` hook

```
useFontsReady() → true → prepareWithSegments(text, font)
ResizeObserver on container → maxWidth → layoutWithLines(prepared, maxWidth, lineHeight) → lines[]
Component renders lines as block spans
```

Memoize `prepared` (re-prepare only when text/font change). `layout()` is ~0.09ms so resize is free.

## Acceptance Criteria

1. `@chenglou/pretext` installed and importable
2. Google Fonts loads Space Grotesk (400-700), Space Mono (400, 700), Instrument Serif, Jacquard 24
3. Tailwind `--font-sans` = Space Grotesk, `--font-mono` = Space Mono
4. Three Pretext components exist and render text
5. Components use `prepareWithSegments` + `layoutWithLines`
6. Components await `document.fonts.ready`
7. Components re-layout on resize via ResizeObserver
8. Fallback to regular DOM text when Pretext unavailable
9. Existing site not broken (no existing section components modified)
10. `pnpm typecheck` passes

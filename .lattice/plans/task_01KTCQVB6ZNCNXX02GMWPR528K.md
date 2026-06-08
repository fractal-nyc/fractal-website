# FRAC-27: Button strategy — new minimal Button + CTA migration

## Decision locked
**Option 3** — write a new minimal Button matching shipped reality. Default variant has Mandelbrot motifs in all 4 corners (preserve `MandelbrotIcon size={25} opacity={0.2}` convention from the current shadcn Button).

## Plan
1. Branch from master: `git checkout master && git pull && git checkout -b frac-27-minimal-button`
2. **Rewrite `src/components/ui/button.tsx`** as a new minimal component:
   - Remove all broken Replit references (`hover-elevate`, `active-elevate-2`, `border-primary-border`, `border-secondary-border`, `border-destructive-border`, `[border-color:var(--button-outline)]`)
   - Keep the `cva` + `Slot` + `forwardRef` shape
   - Variants reduced to what's actually needed in product: `default` (filled, charcoal bg, cream text, Mandelbrot corners), `outline` (transparent bg, current text color, 1px border, no corners), `ghost` (no bg, no border, hover underline), `link` (inline underline-on-hover styled like raw `<a>`)
   - Sizes: `default` (px-5 py-3), `sm` (px-4 py-2 text-sm), `lg` (px-8 py-4)
   - All variants get `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background` — proper accessible focus
   - Default + lg variants render Mandelbrot corners; outline/ghost/link do not
   - Use the existing JetBrains Mono + uppercase typography (matches site default)
3. **Migrate product CTAs.** Search for raw `<a>` patterns with button-like classes across pages:
   ```bash
   grep -rn 'className="[^"]*\(uppercase\|underline\)[^"]*hover:' src/pages/ src/components/sections/
   ```
   For each genuine CTA (not just an inline text link), replace `<a className="...">text</a>` with `<Button asChild variant="...">{<a href="...">text</a>}</Button>` or `<Button onClick={...}>text</Button>`.
   - Decide variant per context (default for primary actions, outline for secondary, link for inline text links)
   - Preserve any custom positioning / wrapping classes via the `className` prop
   - Keep Mandelbrot corners on PRIMARY CTAs only
4. **DO NOT migrate** every `<a>` — only those that are clearly button-like (uppercase, padding, hover-styled, isolated). Pure inline text links stay raw.
5. Run typecheck + build + tests. Tests likely pass without change since the Button API surface is preserved.

## Acceptance
- New `src/components/ui/button.tsx` with no broken Replit references
- `grep -rn 'hover-elevate\|active-elevate\|button-outline\|primary-border\|secondary-border\|destructive-border' src/` returns 0 hits
- All product page CTAs have a focus-visible state (manual: Tab through Events/Neighborhood/Lab page and verify visible focus)
- Mandelbrot corners present on default Button (smoke check)
- Build passes, tests match baseline

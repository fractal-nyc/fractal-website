# FRAC-13: Update font hierarchy

1. Update Google Fonts import in `index.css` to load Instrument Serif and JetBrains Mono
2. Set CSS variables: `--font-serif` → Instrument Serif, `--font-mono` → JetBrains Mono, body default to JetBrains Mono
3. Apply Jacquard 24 only to the "Fractal" wordmark in Hero.tsx via inline class
4. Ensure headings use Instrument Serif via the existing `font-serif` base rule

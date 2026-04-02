# Pretext — Full Research & Capabilities

*Research from deep read of chenglou/pretext source code and demos, March 2026.*

---

## What Pretext Is

A pure JavaScript/TypeScript library that measures and lays out multiline text **without DOM reflow**. It replaces expensive `getBoundingClientRect()` calls with pure arithmetic, enabling 60fps text layout.

Published as `@chenglou/pretext`. 17.4k stars, MIT licensed. Built with Bun, TypeScript, Canvas API. Zero dependencies.

---

## Core Architecture: Two-Phase Design

### Phase 1: `prepare()` (~19ms for 500 texts)

One-time analysis per text string:

1. **Normalize whitespace** — CSS `white-space: normal` behavior (collapse runs, trim edges)
2. **Segment text** — `Intl.Segmenter` with word granularity (handles CJK, Thai, Arabic, emoji)
3. **Classify segments** — 8 break types: text, space, preserved-space, tab, glue (NBSP), zero-width-break, soft-hyphen, hard-break
4. **Merge punctuation** — left-sticky (`.,:;!?`), right-sticky (opening quotes), kinsoku rules for CJK, Arabic no-space clusters
5. **Measure via Canvas** — `ctx.measureText(segment).width`, cached per font+segment
6. **Calibrate emoji** — Chrome/Firefox inflate emoji widths; auto-detected via Canvas vs DOM comparison, correction cached per font
7. **Pre-measure graphemes** — lazily, only for segments that might need word-breaking
8. **Compute bidi levels** — rich path only (`prepareWithSegments()`), metadata for custom renderers

### Phase 2: `layout()` (~0.09ms for 500 texts)

Pure arithmetic on cached widths — no DOM, no Canvas, no allocations:

- Walk segments left-to-right accumulating width
- When overflow: check pending break points, fall back to grapheme boundaries
- Returns `{ lineCount, height }`

---

## Key Source Files

| File | Purpose |
|------|---------|
| `src/layout.ts` | Public API entry point, prepare + layout orchestration |
| `src/analysis.ts` | Text normalization, segmentation, 8 break types, script-specific rules |
| `src/measurement.ts` | Canvas measurement, emoji correction, browser engine profiles |
| `src/line-break.ts` | Pure arithmetic line-breaking algorithm |
| `src/bidi.ts` | Bidirectional text metadata (forked from pdf.js) |

---

## Public API

```typescript
// Simple: get height/lineCount
const prepared = prepare('Hello world', '16px Inter')
const { height, lineCount } = layout(prepared, 320, 26)

// Rich: get individual lines for custom rendering
const rich = prepareWithSegments(text, font)
const { lines } = layoutWithLines(rich, maxWidth, lineHeight)

// Advanced: flow text around obstacles (variable width per line)
let cursor = { segmentIndex: 0, graphemeIndex: 0 }
let line = layoutNextLine(rich, cursor, currentLineWidth)

// Geometry without rendering
walkLineRanges(prepared, maxWidth, onLine)

// Utilities
clearCache()
setLocale('ja')
```

---

## Verified Capabilities (What Pretext Opens Up)

### 1. Text as Living Material
Text can reflow, resize, reshape at 60fps in response to interaction (hover, scroll, cursor). The `dynamic-layout` demo proves this: SVG obstacles rotate while text reflows around them in real-time using `layoutNextLine()`.

### 2. Variable-Width Text Flow Around Obstacles
`layoutNextLine()` accepts per-line maxWidth, enabling text that flows around arbitrary shapes — fractal geometries, interactive elements, animated crests. Code: `layout.ts` lines 681–689; implementation in `line-break.ts` lines 657–912.

### 3. Custom Rendering Pipeline
`layoutWithLines()` returns individual line data (`{ text, width, start, end }` cursors). Each line can be rendered differently — different colors, positions, opacity, transforms. Text becomes a canvas, not a text box.

### 4. Programmatic Typographic Layout
Editorial/magazine-quality layout computed in JS, not fought with CSS. The dynamic-layout demo shows justified text flowing around rotatable obstacles with binary-search font-size fitting and multi-column continuation.

### 5. Bubble Shrinkwrap
`walkLineRanges()` gives exact geometry without rendering. Binary search finds the narrowest width that preserves line count (~6 iterations × ~0.01ms). Tight-fitting bubbles, tooltips, interactive text panels without CSS max-width waste.

### 6. Streaming/Progressive Layout
`layoutNextLine()` with cursor chaining enables line-by-line rendering as text arrives. No full-text upfront requirement. Powerful for incremental layout of large documents or streaming content.

### 7. Bidi (RTL/LTR) Support
Full Unicode Bidirectional Algorithm via `prepareWithSegments()`. `bidi.ts` implements the complete algorithm (forked from pdf.js). Mixed English + Arabic/Hebrew renders correctly with bidi levels per segment stored in `segLevels: Int8Array`.

### 8. Precise Grapheme-Level Word Breaking
Pre-measured individual grapheme widths (`breakableWidths` / `breakablePrefixWidths` arrays) for exact `overflow-wrap: break-word` at grapheme boundaries. No trial-and-error. Used in `line-break.ts` lines 153–169.

### 9. Cross-Browser Calibration (Automatic)
Auto-detects engine (Safari/Chrome/Firefox/Node) and applies engine-specific tolerances. Layout is accurate across browsers without manual tuning.

| Browser | Fit Tolerance | CJK Carry | Prefix Widths | Early SHY |
|---------|--------------|-----------|---------------|-----------|
| Chrome/Firefox | 0.005 | Yes | No | No |
| Safari/WebKit | 1/64 (~0.016) | No | Yes | Yes |
| Node/SSR | 0.005 | No | No | No |

### 10. Soft Hyphen Support
Explicit `\u00AD` break points modeled as segment boundaries with width contribution. Enables: exact hyphen position, conditional line height, hanging hyphen effects. Engine-specific handling (Safari breaks earlier than Chrome).

### 11. Tab Stop Support
Pre-wrap mode with configurable tab stops (default 8 spaces). Enables monospace/code layouts with fixed tab alignment.

---

## Demo Patterns

### Variable Typographic ASCII (`pages/demos/variable-typographic-ascii.ts`)
1. **Brightness field** — 2D Float32Array, oversampled (2x), with decay
2. **Particle system** — 120 particles attracted to 2 moving attractors
3. **Field stamps** — Pre-computed radial gradient stamps splatted at particle positions
4. **Brightness → character mapping** — Sorted palette by estimated brightness, binary search for best match
5. **Dual rendering** — Monospace (simple ramp) + proportional (measured by pretext)
6. **Canvas as source** — Hidden canvas drives the brightness field, ASCII grid is the display

### Bubbles (`bubbles.ts`)
Chat shrinkwrap using `walkLineRanges()`. Binary search finds tightest width preserving line count via `findTightWrapMetrics()` (bubbles-shared.ts lines 49–77).

### Dynamic Layout (`dynamic-layout.ts`)
Editorial spread with obstacle routing via `layoutNextLine()`. SVG obstacles rotate at 60fps, text reflows around them each frame. Magazine-style justified layout.

### Accordion (`accordion.ts`)
Expandable blocks with computed heights. State-driven layout.

### Masonry (`masonry/`)
Pinterest-style columnar layout with exact height measurements from `layout()`.

---

## Building Patterns

### Key Patterns
1. **Two-phase prepare/layout split** — Expensive work once, hot path is pure math
2. **Canvas `measureText()` over DOM** — Avoids layout reflow entirely
3. **`Intl.Segmenter`** — Built-in browser API for multilingual word/grapheme segmentation
4. **Engine-specific calibration** — Detect browser, apply known tolerances
5. **Segment-based model** — Break text into atomic units with break-type metadata

### For ASCII Art
1. **Brightness estimation** — Render character to small canvas, count alpha pixels
2. **Character palette** — Sort all characters by brightness, binary search for closest match
3. **Source field** — Any 2D scalar field (particles, SDF, noise) drives character selection
4. **Oversampling** — Sample multiple field points per character cell for smoother results
5. **Animation** — `requestAnimationFrame` loop updating field → re-rendering ASCII grid

### For Custom Layout
1. Use `layoutNextLine()` for variable-width text flow (around obstacles)
2. Use `walkLineRanges()` for geometry without text materialization
3. Use `layoutWithLines()` for full line data including text content
4. Bidi levels from `prepareWithSegments()` guide RTL rendering

---

## Limitations & Constraints

### Hard Constraints

| Constraint | Detail | Workaround |
|-----------|--------|------------|
| No ligatures/OpenType features | Canvas `measureText()` ignores font feature tags | Use explicit named fonts; Canvas width is ground truth |
| `system-ui` unsafe on macOS | Canvas and DOM resolve `system-ui` to different fonts | Use named fonts (Inter, SF Pro, Helvetica) |
| No auto-hyphenation | Only explicit `\u00AD` soft hyphens recognized | Pre-hyphenate server-side or use hyphenation library |
| No `word-break: break-all` | Only grapheme-boundary breaking supported | Insert `\u200B` zero-width breaks for character-level |
| No `word-break: keep-all` (CJK) | CJK breaks at grapheme boundaries (per-character) | Use `Intl.Segmenter` word granularity + `\u200B` |
| No `text-align: justify` | Returns line widths but no space distribution | Compute justify gaps yourself from line data |
| No baseline/vertical metrics | No ascent, descent, baseline offset returned | Use Canvas `textBaseline` or CSS fallbacks |
| No vertical writing systems | Assumes horizontal LTR/RTL only | Custom implementation needed |
| No CSS letter-spacing, word-spacing, text-transform | Not parsed or applied | Pre-process text or implement custom rules |
| Emoji calibration is font+size specific | Cache keyed per full font string including size | Prepare text in chunks with consistent fonts |
| Must wait for `document.fonts.ready` | Measurement requires loaded fonts | Await fonts before first `prepare()` call |

### Edge Cases
- Narrow widths (< shortest grapheme width) can break words unexpectedly
- RTL/LTR transitions: bidi metadata computed but line-breaking is logical order; use bidi levels to reverse RTL segments during rendering
- Soft hyphens before CJK characters behave differently Safari vs Chrome (engine profiles handle this)

---

## Sweet Spot

Immersive web experiences where text is a *material* — flowing around animated elements, responding to interaction, fitting precisely into custom layouts — at 60fps with zero DOM thrashing. Not a replacement for CSS text properties; a complement for when CSS flow layout is too rigid and DOM measurement is too slow.

**Not a fit for:** Bulk paragraph text in standard web apps (CSS is simpler), email rendering (requires JS), text with complex font features you can't measure.

---

## Tech Stack

- **TypeScript** with ESM output
- **Bun** — package manager, test runner, dev server
- **Canvas API** (OffscreenCanvas) for measurement
- **Zero dependencies** — pure library

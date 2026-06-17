# FRAC-214 — Remove dead button size variants + rewrite DESIGN.md button section

**Complexity:** low. Pure dead-code removal + doc accuracy. Zero visual/runtime change (only `default` size is used in `src/`; `sm`/`lg`/`icon` have no consumers).

## Scope

1. **Code** — `src/components/ui/button.tsx`: delete the `sm`/`lg`/`icon` entries from the `size` cva group (keep only `default`), simplify `showCorners`, prune `compoundVariants`.
2. **Tests** — `src/__tests__/buttons.test.tsx`: adapt the size-iteration test and the `buttonVariants({ size: "sm" })` assertion to the single `default` size without weakening coverage.
3. **Doc** — `DESIGN.md`: rewrite the stale button prose + YAML `button-default` entry to describe the real FRAC-52 frosted default.

## Confirmation: sm/lg/icon are unused

`grep -rn 'size="sm"|size="lg"|size="icon"|size: "sm"|...' src/` returns only:
- `src/components/ui/button.tsx:82-83` — the `compoundVariants` we're removing.
- `src/__tests__/buttons.test.tsx:195` — the test we're updating.
- `src/components/ui/MandelbrotCorners.tsx` / `NeighborhoodPage.tsx` — these are the **separate** `MandelbrotCorners` component's own `size` prop (`xs/sm/md/lg`), NOT the Button. Out of scope, leave untouched.

No `<Button size=...>` usage exists anywhere in `src/` (all Button consumers — LiberalArts, Campus, PoliticalClubPage, NeighborhoodPage, PeoplePage, EventsPage, not-found — rely on the default). The vendored shadcn ui/* files import only `{ Button, buttonVariants }`, never pass `size="icon"` (verified: no `size="icon"` hits in src/). Removal is safe.

---

## Part 1 — `src/components/ui/button.tsx`

### Edit 1a — the `size` cva group (lines 70-77)

**Before:**
```ts
      size: {
        default: "px-8 py-5 text-sm font-medium",
        sm: "px-4 py-2.5 text-xs font-medium",
        lg: "px-10 py-6 text-base",
        // `icon` is required by vendored shadcn components (calendar, carousel,
        // sidebar). Square button for a single glyph.
        icon: "h-9 w-9 p-0",
      },
```

**After:**
```ts
      size: {
        default: "px-8 py-5 text-sm font-medium",
      },
```

### Edit 1b — `compoundVariants` (lines 79-84)

The `link` + `sm`/`lg` rows reference removed sizes and must go. The `link` + `default` row is the only valid one left — and since `default` is now the *only* size, the compound is redundant with a plain `{ variant: "link" }` match. Collapse to a single size-agnostic entry.

**Before:**
```ts
    compoundVariants: [
      // Link variant should have no padding regardless of size.
      { variant: "link", size: "default", class: "px-0 py-0" },
      { variant: "link", size: "sm", class: "px-0 py-0" },
      { variant: "link", size: "lg", class: "px-0 py-0" },
    ],
```

**After:**
```ts
    compoundVariants: [
      // Link variant should have no padding.
      { variant: "link", class: "px-0 py-0" },
    ],
```

### Edit 1c — `showCorners` (lines 137-140)

With only `default` left, the `size !== "sm" && size !== "icon"` guard is always true and references nonexistent sizes (also a TS type error once the sizes are gone). Reduce to the variant check.

**Before:**
```ts
    const showCorners =
      variantsWithCorners.has(variant ?? "default") &&
      size !== "sm" &&
      size !== "icon";
```

**After:**
```ts
    const showCorners = variantsWithCorners.has(variant ?? "default");
```

### Edit 1d — comment on `variantsWithCorners` (lines 112-114)

The "Small size skips them too" line is now stale. Trim it.

**Before:**
```ts
// Corners render on the default variant only. Outline / ghost / link skip them.
// Small size skips them too — they look crowded at xs padding.
const variantsWithCorners = new Set(["default"]);
```

**After:**
```ts
// Corners render on the default variant only. Outline / ghost / link skip them.
const variantsWithCorners = new Set(["default"]);
```

> Note: `size` remains a valid destructured prop / `VariantProps` key (the cva group still exists with one member), so `buttonVariants({ variant, size })` and `size` in the forwardRef signature stay as-is. No further changes needed. The header comment at lines 19-27 says "default variant" generically and needs no edit; line 27's "old button.tsx:70-73" reference is to the *prior* implementation, not current line numbers — leave it.

---

## Part 2 — `src/__tests__/buttons.test.tsx`

### Edit 2a — header comment (lines 26-27)

Stale: claims "three sizes (default, sm, lg) plus `icon`". Update to reflect the single size.

**Before:**
```ts
// The new minimal Button matches shipped CTA reality: four variants
// (default, outline, ghost, link) and three sizes (default, sm, lg) plus
// `icon` for vendored shadcn components.
```

**After:**
```ts
// The new minimal Button matches shipped CTA reality: four variants
// (default, outline, ghost, link) and a single `default` size (the only
// size any consumer uses; sm/lg/icon were dead and removed in FRAC-214).
```

### Edit 2b — the size-iteration loop (lines 40-47)

Iterating a one-element array is pointless; replace with a single focused render test for the `default` size. Keeps "renders at default size without crashing" coverage; drops the now-impossible `sm`/`lg`/`icon` cases (those sizes no longer exist, so `<Button size="sm">` would be a TS error).

**Before:**
```ts
  const sizes = ["default", "sm", "lg", "icon"] as const;

  for (const size of sizes) {
    it(`should render at size "${size}"`, () => {
      render(<Button size={size}>Btn</Button>);
      expect(screen.getByText("Btn")).toBeTruthy();
    });
  }
```

**After:**
```ts
  it('should render at the "default" size', () => {
    render(<Button size="default">Btn</Button>);
    expect(screen.getByText("Btn")).toBeTruthy();
  });
```

### Edit 2c — the `buttonVariants({ size: "sm" })` assertion (lines 194-198)

`size: "sm"` no longer exists (TS error) and the `px-4`/`py-2` expectations described the removed `sm` padding. Re-point at the `default` size and assert its real padding (`px-8 py-5`), strengthening the default-size coverage rather than dropping it.

**Before:**
```ts
  it("should produce a smaller padding string for sm size", () => {
    const classes = buttonVariants({ size: "sm" });
    expect(classes).toContain("px-4");
    expect(classes).toContain("py-2");
  });
```

**After:**
```ts
  it("should produce the default-size padding string", () => {
    const classes = buttonVariants({ size: "default" });
    expect(classes).toContain("px-8");
    expect(classes).toContain("py-5");
  });
```

### Test scope guardrail (do NOT touch)

Two assertions in this file are **pre-existing failures** unrelated to sizes — leave them exactly as-is so the FRAC-199 baseline is preserved:
- L78-82 `should mark corner decorations as aria-hidden` — expects 4, gets 5 (the grain `<span aria-hidden>`). Pre-existing.
- L139 `bg-[rgba(242,234,216,0.08)]` — stale color string vs the real `bg-[var(--btn-accent,currentColor)]`. Pre-existing.

These are NOT in FRAC-214's scope (they concern corners/grain/bg-color, not size variants). Touching them would change the baseline. Do not modify them.

---

## Part 3 — `DESIGN.md`

The doc describes a stale charcoal button (`bg-foreground/[0.03]`, `border-foreground/20`, hover `bg-foreground/10`). The real FRAC-52 default is a frosted-glass surface. Rewrite to match `button.tsx`'s actual `default` classes:
- `bg-[var(--btn-accent,currentColor)]` (house accent fill, `currentColor` fallback)
- `border` + `[border-color:var(--btn-accent,currentColor)]`
- `[backdrop-filter:blur(6px)]` (+ `-webkit-` + `[isolation:isolate]` + `[transform:translateZ(0)]`)
- `text-white`
- `shadow-[0_8px_24px_-12px_rgba(11,26,43,0.18)]`
- paper-grain overlay (`PAPER_GRAIN_BG`, tiled 320×320 SVG fractal-noise, `mixBlendMode: overlay`, opacity 0.35)
- four Mandelbrot corner glyphs, 20px, **opacity 0.8**, 4px inset, rotated to face center
- hover → cream fill (`hover:bg-[var(--btn-fill,rgba(242,234,216,0.16))]`) + accent text (`hover:text-[var(--btn-text,var(--btn-accent,currentColor))]`)
- type unchanged: mono, uppercase, `tracking-widest`, `text-sm font-medium`, `px-8 py-5`.

### Edit 3a — YAML `button-default` entry (lines 53-58)

**Before:**
```yaml
  button-default:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "1.25rem 2rem"
    typography: "{typography.font-mono}"
```

**After:**
```yaml
  button-default:
    backgroundColor: "var(--btn-accent, currentColor)"
    backdropFilter: "blur(6px)"
    textColor: "#ffffff"
    border: "var(--btn-accent, currentColor)"
    rounded: "{rounded.md}"
    padding: "1.25rem 2rem"
    typography: "{typography.font-mono}"
    hoverBackgroundColor: "var(--btn-fill, rgba(242, 234, 216, 0.16))"
    hoverTextColor: "var(--btn-text, var(--btn-accent, currentColor))"
```

(Other YAML button entries — outline/ghost/link — are accurate; leave them.)

### Edit 3b — Button typography table (lines 237-244)

Drop the `sm` row (the size no longer exists). Keep the single `default` row and rewrite the shared-base note for one size.

**Before:**
```md
**Button** (`src/components/ui/button.tsx`)

| Size | Padding | Type |
|---|---|---|
| `default` | `px-8 py-5` | `text-sm tracking-widest uppercase font-medium` |
| `sm` | `px-4 py-2.5` | `text-xs tracking-widest uppercase font-medium` |

Both sizes share the JetBrains Mono / uppercase / `tracking-widest` base.
```

**After:**
```md
**Button** (`src/components/ui/button.tsx`)

| Size | Padding | Type |
|---|---|---|
| `default` | `px-8 py-5` | `text-sm tracking-widest uppercase font-medium` |

The Button ships a single `default` size — JetBrains Mono, uppercase, `tracking-widest`, `font-medium`. (FRAC-214 removed the unused `sm` / `lg` / `icon` sizes.)
```

### Edit 3c — Mandelbrot-corners prose (line 297)

Fix the opacity (real value is 0.8, not 0.2) and drop the stale `sm`/`icon` size reference (those sizes are gone).

**Before:**
```md
The Button `default` variant places four `MandelbrotIcon` glyphs at 4px insets from each corner — 20px, opacity 0.2, rotated to face center. This is the brand shape signature for primary CTAs; outline / ghost / link variants and the `sm` / `icon` sizes render clean.
```

**After:**
```md
The Button `default` variant places four `MandelbrotIcon` glyphs at 4px insets from each corner — 20px, opacity 0.8, rotated to face center. This is the brand shape signature for primary CTAs; the outline / ghost / link variants render clean (no corners).
```

### Edit 3d — `button-default` prose (line 318)

Rewrite the stale charcoal description to the real frosted glass.

**Before:**
```md
**`button-default`** — bordered, translucent charcoal-tinted surface (`bg-foreground/[0.03]`, `border-foreground/20`) with the four Mandelbrot corners. Padding `px-8 py-5`. Hover `bg-foreground/10`; focus-visible ring in canonical charcoal.
```

**After:**
```md
**`button-default`** — the FRAC-52 frosted-glass CTA. An accent-filled surface (`bg-[var(--btn-accent,currentColor)]`) under a `backdrop-filter: blur(6px)` frost, with a matching accent border (`[border-color:var(--btn-accent,currentColor)]`), white text, a tiled paper-grain overlay (`PAPER_GRAIN_BG` — a 320×320 fractal-noise SVG at `mix-blend-mode: overlay`, opacity 0.35), and the four Mandelbrot corner glyphs. Padding `px-8 py-5`; soft drop shadow. The accent (`--btn-accent`) is set per house page on `<main>`, falling back to `currentColor`. Hover swaps to a cream fill (`hover:bg-[var(--btn-fill,rgba(242,234,216,0.16))]`) with accent-colored text. Real focus-visible ring (`focus-visible:ring-2 ring-foreground`).
```

(The line-289 `rounded-md` table row mentioning `button.tsx` is accurate — leave it. Outline/ghost/link prose at lines 320/322/324 accurate — leave.)

---

## Acceptance criteria

1. `grep -rn 'size: "sm"|size: "lg"|size: "icon"|size="sm"|size="lg"|size="icon"' src/` returns **zero Button-related hits** (only the unrelated `MandelbrotCorners` `size` prop in MandelbrotCorners.tsx / NeighborhoodPage.tsx may remain — different component).
2. `npx tsc --noEmit` (typecheck) passes — no "Type '\"sm\"' is not assignable" errors.
3. `npm run build` succeeds.
4. Conformance / lint passes (run the repo's `package.json` check scripts).
5. `npx vitest run` shows **exactly 7 failures** (the FRAC-199 baseline) with **no new failures**. The two buttons.test.tsx baseline failures (aria-hidden=5, stale 0.08 bg) remain unchanged; the adapted size tests (2b, 2c) PASS.
6. `DESIGN.md` button section + YAML `button-default` accurately describe the real frosted button (accent fill, blur(6px), paper grain, white text, Mandelbrot corners at opacity 0.8, cream-fill hover) and no longer reference `sm`/`lg`/`icon` sizes or the stale charcoal `bg-foreground/[0.03]` surface.
7. **Zero visual/behavioral change** to the shipped site (removed sizes had no consumers; `default` path is byte-identical).

## Files touched
- `src/components/ui/button.tsx` (edits 1a–1d)
- `src/__tests__/buttons.test.tsx` (edits 2a–2c)
- `DESIGN.md` (edits 3a–3d)

# FRAC-51 — Hyperlink "Fractal AI Accelerator participants" to fractalaccelerator.com

**Ships bundled with FRAC-51 + FRAC-53 + FRAC-54 in one PR** (branch: `frac-50-sweep-campus`).

## Scope

On Campus, the phrase **"Fractal AI Accelerator participants"** currently links to `ACCELERATOR_URL = "/"` (internal). Repoint it to the external Fractal Accelerator marketing site (`https://www.fractalaccelerator.com/`) and convert it to an external link that opens in a new tab.

The same `ACCELERATOR_URL` constant is also used by the inline phrase **"Fractal AI Accelerator cohorts"** in the "…and have a good time doing it." section. That second use is in scope: it's the same referent and should also become an external link.

## Approach

Two paths considered:

1. **Repoint the existing `ACCELERATOR_URL` constant** and flip both `<InlineLink ... external={false}>` call sites to use external behavior (target=_blank, rel="noopener noreferrer").
2. Introduce a new `FRACTAL_ACCELERATOR_URL` constant alongside (or replacing) `ACCELERATOR_URL`.

**Choice: option 2** — rename for clarity. The constant `ACCELERATOR_URL = "/"` is misleading (it links to root, not an accelerator). The implementer should:

- Replace `ACCELERATOR_URL` with a clearly-named `FRACTAL_ACCELERATOR_URL` set to `https://www.fractalaccelerator.com/`.
- Update both `<InlineLink>` call sites to drop `external={false}` (default is external=true, which the `InlineLink` helper already wires up with target=_blank rel=noopener noreferrer).

This matches the existing external-link convention used throughout Campus (`LUMA_URL`, `LUMA_EVENTS_URL`, `FRACTAL_U_URL`, `MERLINS_URL`, etc.).

## Files & exact edits

**`src/components/sections/Campus.tsx`**

1. **Constants block (line ~17):** Replace
   ```ts
   const ACCELERATOR_URL = "/";
   ```
   with
   ```ts
   const FRACTAL_ACCELERATOR_URL = "https://www.fractalaccelerator.com/";
   ```

2. **"Four audiences" section (inside the `<li>` containing "Fractal AI Accelerator participants"):** Replace
   ```tsx
   <InlineLink href={ACCELERATOR_URL} external={false}>
     Fractal AI Accelerator participants
   </InlineLink>
   ```
   with
   ```tsx
   <InlineLink href={FRACTAL_ACCELERATOR_URL}>
     Fractal AI Accelerator participants
   </InlineLink>
   ```

3. **"…and have a good time" section (inside the paragraph containing "Fractal AI Accelerator cohorts"):** Replace
   ```tsx
   <InlineLink href={ACCELERATOR_URL} external={false}>
     Fractal AI Accelerator cohorts
   </InlineLink>
   ```
   with
   ```tsx
   <InlineLink href={FRACTAL_ACCELERATOR_URL}>
     Fractal AI Accelerator cohorts
   </InlineLink>
   ```

Confirm exact line numbers against `git show origin/master:src/components/sections/Campus.tsx` before editing.

## Coexistence with FRAC-53 and FRAC-54

- **FRAC-53 button** (also linking to `FRACTAL_ACCELERATOR_URL`) reuses the same constant. Both edits should reference the single source of truth.
- **FRAC-54 new section** also reuses `FRACTAL_ACCELERATOR_URL` for its CTA button.
- The inline link survives even after FRAC-54's full content section exists — it's an inline reading affordance, distinct from the visible CTA button. Inline link + button is the established Campus pattern (see `LUMA_URL` / `LUMA_EVENTS_URL` usage).

## Acceptance criteria

- [ ] `ACCELERATOR_URL` constant removed; `FRACTAL_ACCELERATOR_URL = "https://www.fractalaccelerator.com/"` added.
- [ ] "Fractal AI Accelerator participants" renders as an external link to `fractalaccelerator.com`, opens in a new tab with `rel="noopener noreferrer"`.
- [ ] "Fractal AI Accelerator cohorts" inline link updated the same way.
- [ ] Link styling matches other external links on Campus (uses `<InlineLink>` → `inlineLinkClass`).
- [ ] Renders correctly at 375px mobile baseline and on desktop.
- [ ] No TypeScript errors; `tsc --noEmit` clean for Campus.tsx.

## Notes

- The `<InlineLink>` helper already handles target=_blank + rel=noopener noreferrer when `external` is true (default). No new prop or component needed.
- The FRAC-48 centered-container pattern (`<div className="max-w-3xl mx-auto">`) is unaffected by this change — we're only editing inline link targets within existing centered blocks.

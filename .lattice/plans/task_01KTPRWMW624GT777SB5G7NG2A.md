# FRAC-53 — Add "Fractal Accelerator" button in audiences section

**Ships bundled with FRAC-51 + FRAC-53 + FRAC-54 in one PR** (branch: `frac-50-sweep-campus`).

## Scope

Add a visible CTA button labelled **"Fractal Accelerator"** in the Campus "Four audiences" section, linking to `https://www.fractalaccelerator.com/` (new tab). This sits alongside the existing **"Fractal U"** button in the same flex row, so the audiences section ends with one CTA per "named program" audience.

## Placement decision

The audiences section currently ends with:
```tsx
<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
  <PrimaryButton href={FRACTAL_U_URL}>Fractal U</PrimaryButton>
</div>
```

The new button goes in this same flex row, as a **sibling** of the Fractal U button. Order: **Fractal Accelerator first, then Fractal U** — matches the order of audiences in the list above (Accelerator participants are bullet 1, Fractal U students are bullet 2).

Why not put it inside the new FRAC-54 section instead?
- FRAC-53's task description is explicit: *"in the audiences section"*. We honour the user's stated intent.
- The FRAC-54 section will get its own CTA at the bottom (see FRAC-54 plan) — that's a separate, in-context CTA. The audiences-section button is the at-a-glance entry point.
- The two CTAs serve different reader moments: scanning the audience list (audiences section) vs. finishing the program pitch (FRAC-54 section).

## Approach

Reuse the existing `PrimaryButton` helper in `Campus.tsx`. It already wraps `<Button>` from `src/components/ui/button.tsx` with the Campus-specific tint (`bg-foreground/20 hover:bg-foreground/30`) and `max-w-xs w-full` width — preserves the shipped Campus look against the green background, gets the Mandelbrot corner motifs, focus-visible ring, and FRAC-53-era text wrapping (`whitespace-normal leading-snug`).

FRAC-52 (frost effect) is deferred — current `PrimaryButton` styling is the right baseline now.

## Files & exact edits

**`src/components/sections/Campus.tsx`**

1. **Constants block:** Use `FRACTAL_ACCELERATOR_URL` (introduced by FRAC-51 in the same PR — both edits share the constant). If FRAC-51's constant rename isn't applied first, the implementer must add it:
   ```ts
   const FRACTAL_ACCELERATOR_URL = "https://www.fractalaccelerator.com/";
   ```

2. **"Four audiences" section CTA row:** Replace
   ```tsx
   <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
     <PrimaryButton href={FRACTAL_U_URL}>Fractal U</PrimaryButton>
   </div>
   ```
   with
   ```tsx
   <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
     <PrimaryButton href={FRACTAL_ACCELERATOR_URL}>Fractal Accelerator</PrimaryButton>
     <PrimaryButton href={FRACTAL_U_URL}>Fractal U</PrimaryButton>
   </div>
   ```

Confirm exact line numbers against `git show origin/master:src/components/sections/Campus.tsx` before editing.

## Coexistence with FRAC-51 and FRAC-54

- **FRAC-51's inline link** ("Fractal AI Accelerator participants") still appears in the audience list above the buttons. Inline link + button = reinforced affordance, standard Campus pattern (see `LUMA_URL` / `LUMA_EVENTS_URL`).
- **FRAC-54's section** sits immediately after this audiences section. The new section explains *what the program is*, and ends with its own "Apply to the AI Accelerator" CTA. The audiences-section button is the brief, at-a-glance CTA; the FRAC-54 CTA is the in-context one. Both reuse `FRACTAL_ACCELERATOR_URL`.

## Acceptance criteria

- [ ] New "Fractal Accelerator" button renders in the audiences section, to the left of the Fractal U button (column on mobile, row on `sm:` and up).
- [ ] Clicking opens `https://www.fractalaccelerator.com/` in a new tab with `rel="noopener noreferrer"` (handled by `PrimaryButton`'s `external` default).
- [ ] Button uses `PrimaryButton` → `Button` (`src/components/ui/button.tsx`) with default variant — gets Mandelbrot corners, uppercase mono, focus-visible ring, Campus tint.
- [ ] Renders legibly at 375px mobile baseline; tappable with no overflow (FRAC-53-era `whitespace-normal leading-snug` already in `PrimaryButton`).
- [ ] No TypeScript errors; respects FRAC-48 centered-container pattern (the audiences section is already wrapped in `<div className="max-w-3xl mx-auto">` — the new button inherits that).
- [ ] No layout regressions on the existing Fractal U button or audiences list above it.

## Notes

- The label is **"Fractal Accelerator"**, not "Fractal AI Accelerator" — chosen for brevity in the button row and to match the marketing site's own naming (`fractalaccelerator.com`).
- FRAC-52 (frost button effect) is explicitly deferred. Do not introduce frost styling here.

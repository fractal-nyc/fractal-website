# FRAC-54 — Add "⚡ AI Accelerator" content section on Campus

**Ships bundled with FRAC-51 + FRAC-53 + FRAC-54 in one PR** (branch: `frac-50-sweep-campus`).

## Scope

Add a new content section to Campus describing the AI Accelerator program, with a title, intro paragraph, a three-bullet list of what the program teaches, and a CTA button to the marketing site.

## Placement decision

**Insert immediately after the "Four audiences" section and before the "Get shit done" section.**

Rationale:
- The audiences section names "Fractal AI Accelerator participants" as audience #1. A reader who lands on that bullet (or the new FRAC-53 button) and wants to know "what is this program?" gets the answer directly below — minimal scroll, maximum cohesion.
- Placing it *before* the more general "Get shit done" / "good time doing it" copy reads as: meet the audiences → here's the flagship program → here's the daily experience. Natural narrative arc.
- Alternatives considered:
  - *Replace* the audiences section: rejected. The four-audience framing is still load-bearing for Members and Guests.
  - *After the "Build with us" section near the bottom*: rejected. Too far from the audiences mention; weakens the FRAC-53 button as an entry point.

## Section structure

Follows the standard Campus body-section pattern (matches FRAC-48 centered-container rule):

```tsx
{/* AI Accelerator */}
<div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
  <FadeIn>
    <div className="max-w-3xl mx-auto">
      <h2 className="text-title mb-6 normal-case">
        <span aria-hidden>⚡ </span>AI Accelerator
      </h2>
      <div className="space-y-6 text-body text-background/90 leading-relaxed">
        <p>
          We run an AI training program that teaches ambitious professionals to
          master AI. No prior programming experience is needed. Our program runs
          every 6 weeks, starting in summer 2026.
        </p>
        <p>Our program teaches you how to:</p>
      </div>
      <ul className="mt-6 space-y-5 text-body text-background/90 leading-relaxed">
        <li className="flex gap-3">
          <span aria-hidden className="text-background/50">—</span>
          <span>
            Ship real personal software — tools, dashboards, automations, and
            workflows — starting from nothing but a plain-language description
            of what you want
          </span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden className="text-background/50">—</span>
          <span>
            Build an AI agent that knows your work, learns your preferences,
            and takes action across your email, calendar, and the rest of your
            apps
          </span>
        </li>
        <li className="flex gap-3">
          <span aria-hidden className="text-background/50">—</span>
          <span>
            Set up a computer that keeps working when you walk away, with
            agents running in the background and reachable from your phone
          </span>
        </li>
      </ul>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
        <PrimaryButton href={FRACTAL_ACCELERATOR_URL}>
          Apply to the AI Accelerator
        </PrimaryButton>
      </div>
    </div>
  </FadeIn>
</div>
```

### Style decisions

- **Heading:** `<h2 className="text-title mb-6 normal-case">` — matches every other Campus body section (e.g., "More than a WeWork…", "Meet the Space").
- **`⚡` lightning bolt:** wrapped in `<span aria-hidden>` so screen readers skip the decoration and announce "AI Accelerator". A space follows the emoji for visual separation.
- **Bullets:** use the same `flex gap-3` + em-dash bullet pattern as the `amenities` list in the "Overview" section. Keeps the page visually coherent. (Standard `list-disc` is not used elsewhere on Campus body sections.)
- **CTA:** `PrimaryButton` reuses `FRACTAL_ACCELERATOR_URL` (introduced by FRAC-51 in the same PR). Label "Apply to the AI Accelerator" — action verb, distinct from FRAC-53's at-a-glance "Fractal Accelerator" button label.
- **Container pattern:** `max-w-7xl ... px-6 md:px-[4.5%] pb-24 md:pb-32` outer + `max-w-3xl mx-auto` inner — matches FRAC-48 centered-column rule and existing Campus sections.

## Files & exact edits

**`src/components/sections/Campus.tsx`**

1. **Constants block:** Reuse `FRACTAL_ACCELERATOR_URL` from FRAC-51 (same PR). No new constant needed.

2. **Insert new section block** between the closing of the "Four audiences" `<div>` block (the `</FadeIn></div>` that closes `{/* Four audiences */}`) and the opening of the "Get shit done" block (`{/* Get shit done */}`).

   The new block uses the JSX shown in the "Section structure" snippet above.

Confirm exact line numbers against `git show origin/master:src/components/sections/Campus.tsx` before editing.

## Coexistence with FRAC-51 and FRAC-53

- **FRAC-51 inline link** ("Fractal AI Accelerator participants" in the audiences list directly above this new section) survives — it's the inline reading affordance.
- **FRAC-53 button** ("Fractal Accelerator" in the audiences-section CTA row directly above this new section) survives — at-a-glance CTA.
- **FRAC-54 CTA** ("Apply to the AI Accelerator" at the bottom of this new section) is the in-context CTA after a reader has digested the program details.
- All three link targets resolve to the same `FRACTAL_ACCELERATOR_URL` constant.

## Acceptance criteria

- [ ] New section renders on Campus immediately after the "Four audiences" section.
- [ ] Heading "⚡ AI Accelerator" appears as `<h2 className="text-title mb-6 normal-case">`; emoji is `aria-hidden`.
- [ ] Intro paragraph + "Our program teaches you how to:" + three bullets render with the verbatim copy from the task description.
- [ ] Bullets use the em-dash flex-gap pattern (matching `amenities`).
- [ ] CTA button "Apply to the AI Accelerator" links to `https://www.fractalaccelerator.com/`, opens in a new tab.
- [ ] Section uses the FRAC-48 centered-container pattern (`max-w-7xl` outer + `max-w-3xl mx-auto` inner). Text is left-aligned within the centered column.
- [ ] Spacing matches sibling sections (`pb-24 md:pb-32`).
- [ ] Renders legibly at 375px mobile baseline; no overflow; tappable button.
- [ ] No TypeScript errors; no console warnings.

## Notes

- Copy is verbatim from the task description — do not rephrase.
- Order of FRAC-51 / FRAC-53 / FRAC-54 edits within the same PR: do FRAC-51's constant rename first (defines `FRACTAL_ACCELERATOR_URL`), then FRAC-53 button add, then FRAC-54 section add. All three use the constant.
- FRAC-52 (frost button effect) is deferred — do not apply frost styling to the CTA.
- The em-dash bullet pattern (rather than `list-disc`) is the established Campus list treatment; deviating would create a visual outlier.

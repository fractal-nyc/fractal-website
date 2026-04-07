# FRAC-52: Update Campus page

## Scope
Rename "bootcamp" to "accelerator" across the site, add a host CTA section to the Campus page, and verify JetBrains casing.

## Approach
1. Update `campusProjects` in `Campus.tsx`: rename title and description.
2. Update matching data in `Projects.tsx` and `houses.ts`.
3. Add a styled "Want to host?" CTA section below campus projects, using existing design patterns (border, font-serif headings, uppercase tracking CTA button).
4. Verify JetBrains casing across `src/` — already correct, no changes needed.

## Acceptance Criteria
- No "bootcamp" references remain in `src/`.
- Host CTA section is visible below campus projects, mobile-first.
- JetBrains is correctly cased everywhere.

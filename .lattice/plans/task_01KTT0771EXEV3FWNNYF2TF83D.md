# FRAC-191: Campus page — remove membership lead-in, fix cofounder bios margin

## Scope
Two small changes in `src/components/sections/Campus.tsx`.

### 1. Remove "We offer two kinds of membership:" (under the Andrew Rose quote)
- Rendered by `MembershipTiers`'s `showLeadIn` lead-in `<p>`, used only at the
  Andrew Rose instance (line 503: `<MembershipTiers showLeadIn />`).
- Remove the `showLeadIn` usage. Since it then has no callers, also drop the
  dead `showLeadIn` prop + conditional block from `MembershipTiers` (other 3
  call sites already pass no prop).

### 2. Cofounder bios extend past the normal text margin
- The team-bios grid (`teamBios.map`, ~line 661) is wrapped in
  `max-w-4xl mx-auto`, while the surrounding copy in the "Build with us" section
  uses `max-w-3xl mx-auto`. The wider container makes the Andrew/Jake cards
  bleed past the typical text margin.
- Change that grid container `max-w-4xl` → `max-w-3xl` to align it with the rest.

## Acceptance criteria
- The "We offer two kinds of membership:" line no longer appears.
- The Andrew/Jake bio cards align to the same left/right margin as the
  surrounding text (max-w-3xl).
- No dead `showLeadIn` prop left behind; `npm run build` succeeds.

## Complexity: low

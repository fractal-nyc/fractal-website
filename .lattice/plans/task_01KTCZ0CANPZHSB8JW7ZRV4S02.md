# Political Club nav node — Coming Soon variant

## Plan
1. Add a 6th entry to `NAV_NODES` in src/components/three/OctahedronHero.tsx at vertexIndex: 4, label: "Political Club", color from HOUSES forum palette (use the FRAC-24 `housePalette("forum", "light")` helper for consistency with how other nodes derive color), route: empty string or sentinel.
2. Extend the NavNode type with an optional `comingSoon?: boolean` flag. Set it true for Political Club.
3. In the node tooltip rendering (Html overlay), when comingSoon is true:
   - Display "Political Club" on the first line and "COMING SOON" on a second line (small, uppercase, slightly dimmed)
4. In the tap handler: when comingSoon is true, surface the tooltip but skip the navigate(route) call. The tap still de-occludes the tooltip; it just doesn't route.
5. Update the FRAC-5 / FRAC-161 comment near NAV_NODES to reflect the new state (was: "vertex 4 is unpopulated"; now: "vertex 4 has a Coming Soon placeholder for Political Club").

## Out of scope
- Do NOT change houses.ts hideFromNavbar (navbar still hides PC)
- Do NOT change houses.ts hideFromBanners
- Do NOT change FACE_BANNER_IMAGES or FACE_SECTION_MAP (PC face already shows photo per FRAC-20)
- No new pages or routes — PC's existing /political-club route is untouched

## Acceptance
- All in task description above
- pnpm build passes; tests match baseline

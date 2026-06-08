# FRAC-24: House palette → canonical light/deep pairs

## Goal
Single source of truth = the 8 pairs currently shipping on individual house pages. Retire the old "Fractal Bright" hexes and the locally-duplicated palette literals in Navbar, HouseBanner, OctahedronHero.

## Canonical pairs (verified from `src/pages/*Page.tsx`)
| id | light | deep | current treatment |
|---|---|---|---|
| campus | `#2E6B4A` | `#1A3A2E` | bg=light, pattern=deep |
| neighborhood | `#889460` | `#4A5A30` | bg=light, pattern=deep |
| events | `#D4857A` | `#C13B2A` | bg=light, pattern=deep |
| lab | `#E870A0` | `#C44878` | bg=light, pattern=deep |
| people | `#C49040` | `#B65D19` | bg=light, pattern=deep |
| story | `#D4BA58` | `#8A7A20` | bg=light, pattern=deep |
| forum (Political Club) | `#C83858` | `#6E1830` | bg=deep, pattern=light (inverted) |
| school (Liberal Arts) | `#B52828` | `#5C1010` | bg=deep, pattern=light (inverted) |

## Plan
1. Branch from master: `git checkout master && git pull && git checkout -b frac-24-house-palette-sot`
2. **Extend House interface** in `src/data/houses.ts`:
   ```ts
   palette: { light: string; deep: string };
   ```
   Add `palette` field on each of the 8 HOUSES entries with the values above. **Keep the legacy `color: string` field for now** (one consumer at a time will migrate; the cleanup will follow). Mark with a deprecation comment: `/** @deprecated use palette.light or palette.deep — kept temporarily for AvatarBadge fallback compat */`
3. **AvatarBadge.tsx** — update line ~24: `house?.color` → `house?.palette?.deep ?? "#171717"`. Replace cool-slate fallback `#6B7280` with the warm system value (`#171717` foreground charcoal).
4. **BadgePlayground.tsx** — same fix as AvatarBadge.
5. **HouseBanner.tsx ELEGANT_PAIRS** — delete the local literal map (around :20-33). Derive in the component: `const pair = HOUSES.find(h => h.id === houseId)?.palette;` then bg = `pair.light`, letter = `pair.deep`. For forum/school (inverted treatment) — these still derive from the same pair, just used differently; the per-house cohesion is preserved.
6. **Navbar.tsx sectionLinks** — delete the local `color` literals (around :7-16). Derive: for each section link, look up `HOUSES.find(...)?.palette?.deep` (or `light`, whichever the Navbar currently shows — verify visually).
7. **OctahedronHero.tsx** — `NAV_NODES` (around :110-115) and `FACE_SECTION_COLORS` (around :374-383): replace the literal hex per node/face with `HOUSES.find(h => h.id === ...).palette.deep` (or `.light`, matching current FRAC-17 saturation). **Note per FRAC-20: the face-tint VALUES are still in flux at needs_human; this task standardizes the SOURCE (single palette) and the deeper question of "what's the right hue" is separate.**
8. Verify: zero references to old Fractal Bright hexes (`#8B7355`, `#E07A5F`, `#457B9D`, `#1D3557`, `#CC2936`, `#6B4C9A`) in `src/`. Build passes. Tests match master baseline.

## Acceptance
- `HOUSES` data model has `palette: { light, deep }` for all 8 houses
- Zero references to the 6 old Fractal Bright hexes in `src/`
- Navbar / HouseBanner / OctahedronHero / AvatarBadge derive house colors from `HOUSES[id].palette`
- `house.color` field still exists but is marked `@deprecated` (cleanup follow-up)
- AvatarBadge fallback is `#171717`, not Tailwind cool slate
- Build + tests pass; no visual regression on any page

## Notes
- FRAC-32 just added `hideFromNavbar/hideFromBanners/hideFromOctahedronFaces` flags to the House interface. Preserve these.
- FRAC-29 just landed Navbar clamp() changes. Preserve those.
- FRAC-31 just landed display-roman; not relevant here.

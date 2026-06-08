# FRAC-32: Hidden-route data reconciliation

## Plan
Single source of truth = src/data/houses.ts. Extend the data model.

1. Add to House interface:
   ```ts
   hideFromNavbar?: boolean;
   hideFromBanners?: boolean;
   hideFromOctahedronFaces?: boolean;
   ```
2. Set the flags per current behavior:
   - forum (Political Club): hideFromNavbar=true (already in Navbar), hideFromBanners=true (already in HIDDEN_HOUSE_IDS), hideFromOctahedronFaces=false (still has face)
   - school/people: hideFromNavbar=true (currently in Navbar), hideFromBanners=false, hideFromOctahedronFaces=false
   - Others: all false
3. Delete the standalone HIDDEN_HOUSE_IDS export from houses.ts. Anywhere that imports it now uses the per-house flags (likely just HouseBannerGrid).
4. Refactor src/components/layout/Navbar.tsx: remove the local hidden array (lines 18-23) and derive from HOUSES.filter(h => !h.hideFromNavbar).
5. Refactor src/components/three/OctahedronHero.tsx if it references hidden status (check NAV_NODES and FACE_SECTION_COLORS — Political Club is hidden from nav nodes but kept as a face; document this in the source data).
6. Verify: visual smoke — Navbar still hides Political Club + People; HouseBannerGrid still hides forum; octahedron still has all 6 faces but Political Club nav node is empty.

## Acceptance
- Single SoT in src/data/houses.ts
- Navbar, HouseBannerGrid, OctahedronHero derive from the data model
- No visual change
- Build passes, tests match baseline

## Notes
This intersects FRAC-24 (palette SoT) — both refactor houses.ts. FRAC-24 is bigger and will land separately. If FRAC-32 lands first, FRAC-24 absorbs these flags into its new palette work. If FRAC-24 lands first, FRAC-32 adds flags on top. Either order works; merge conflict resolution will be straightforward.

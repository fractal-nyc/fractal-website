# FRAC-56: Add Julianna Roberts to people directory with photo avatar badge as test case

## Scope
Copy placeholder avatar image to public/images/, add Julianna Roberts to PEOPLE array in houses.ts. No component changes needed — AvatarBadge already supports avatar photos.

## Steps
1. Copy `/Users/jules/Documents/Artifacts/raw/2026-04-02/luna-lovegood-no-bg.png` → `public/images/julianna.png`
2. Add Person entry to PEOPLE array: id "julianna", role "Creative Director", houses ["events","lab"], socials (twitter: jannaaar, website: parallax.haus), avatar: "/images/julianna.png"

## Files
| File | Change |
|------|--------|
| `public/images/julianna.png` | New — avatar image |
| `src/data/houses.ts` | Add one PEOPLE entry |

## Acceptance Criteria
1. Julianna appears in People directory with photo (not initials fallback)
2. Social links work (X, website)
3. Mobile layout unaffected
4. TypeScript clean

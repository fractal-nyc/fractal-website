# FRAC-196: Commit unused-image deletions + drop dangling avatar reference

Three PNGs were already deleted in the working tree (pre-existing, human-confirmed
intentional): public/images/hero-abstract.png, public/images/julianna.png,
public/images/merlins.png. Reference audit: hero-abstract and merlins have zero
references (merlins-place.png used by Projects.tsx is a different, still-present
file). julianna.png is referenced only as the optional `avatar` field in
src/data/houses.ts:204; both consumers (AvatarBadge.tsx, BadgePlayground.tsx)
guard with `person.avatar ?`, so removing the field is safe.

Plan: stage the three deletions, remove the `avatar:` line from julianna's
PEOPLE entry, verify typecheck + no new test failures, commit on the current
branch. Complexity: low.

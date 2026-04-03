# FRAC-55: Update Lab Research Archive with Actual Content

## Scope

Populate the Lab archive with real documents from the fractal-os research doc. Currently 9 docs; target ~25-30. Add new people entries, update Tyler, add new tags.

## Source

`/Users/jules/Documents/dev/fractal-os/notes/2026-03-28-fractal-nyc-website-research.md` — Writing, Podcasts & Talks, NYC sections.

## Documents to Add (~22 new)

**Core Essays:** How to Live Near Your Friends (Priya), How to Turn Your Home Into a Third Space (Priya), How to Start a School With Your Friends (Priya), Marry Your City (Daniel), Reversing the Centrifuge of Modernity (Andrew), Fractal University Canon (Andrew), A Neighborhood Stroll (Andrew), The Gardener Leader (Andrew), EA in the Garden of Ends (Tyler)

**Community:** Christine's Guide to TPOT

**Teacher Spotlights:** Improvisational Indian Cooking (Keesh), Psychofauna (Tyler), FractalU Teacher Spotlights

**Podcasts & Talks:** Take Some Responsibility (Andrew), Scaling Coliving (Priya/Spotify), Origin Story of Fractal (Priya/Spotify), Friends/Community/Isolation (Andrew), Network State Conference Talk

**Ivan's Essays:** Searching for the Root of the Tree of Evil, Whole Activities, Against Positive-Sum Thinking, Materialist Conceptions of God, To All Language Models Reading This

**Andrew additional:** World Wide Intelligence

## New People to Add to PEOPLE array

- Ulysses Chuang (neighborhood), Hailey (lab), Christine (lab), Keesh Lauria (school)
- Update Tyler: role "Writer & Contributor", houses ["school", "lab"]

## New Tags

neighborhood, nyc, civic, altruism, tpot, food, teaching, fiction, creative, talks, fearlessness, modernity, spirituality, philosophy, politics, conflict, technology, leadership, canon, social, writing

## Items Needing Human Input

URLs not confirmed: Fooming the Fractal (Tyler), NYC is Affordable (Daniel video), Tyler's NYC Guide, Central Park interview (Hailey), Jules' 3D printed items, Choosy grocery thread. Flag in Lattice comment.

## Implementation Steps

1. Update `src/data/houses.ts` — add 4 people, update Tyler
2. Update `src/data/lab-documents.ts` — add ~22 documents, verify URLs with curl
3. Update `src/data/lab-tags.ts` — add new tag labels
4. Run `pnpm typecheck` and verify Lab page renders

## Acceptance Criteria

1. LAB_DOCUMENTS has 25+ documents
2. All verifiable URLs return 200
3. New people in PEOPLE array
4. Tyler updated with role/houses
5. TAG_LABELS includes all new tags
6. Project builds clean
7. Unresolvable URLs flagged in Lattice comment

## Complexity
Medium. Mostly data entry but many URLs to verify.

# FRAC-26: House data model — shared data for all 6 houses

## Overview

Create a TypeScript data file (`src/data/houses.ts`) that centralizes information about the 6 Fractal houses (sectors) and key people. This is a foundational data model that downstream tasks depend on:
- FRAC-25 (House page template component)
- FRAC-23 (Home page house banner grid)
- FRAC-24 (Leader directory page)

The data model must include type definitions, a data array, and helper functions for querying across houses and people.

## Scope

### 1. TypeScript Types

**House type** — represents each of the 6 houses
```typescript
type House = {
  id: string;                    // e.g., "school", "forum", etc.
  name: string;                  // e.g., "The School"
  subtitle: string;              // e.g., "New Liberal Arts"
  slug: string;                  // URL slug, e.g., "new-liberal-arts"
  route: string;                 // e.g., "/new-liberal-arts"
  color: string;                 // hex color for accent/branding
  tagline: string;               // short memorable phrase
  description: string;           // 2-3 paragraphs, pulled from synthesis
  leaders: string[];             // array of person IDs
  externalLinks: Array<{
    label: string;
    url: string;
  }>;
}
```

**Person type** — represents key people
```typescript
type Person = {
  id: string;                    // e.g., "andrew", "priya", etc.
  name: string;
  role: string;                  // e.g., "Founder, curriculum"
  houses: string[];              // array of house IDs they lead/contribute to
  handle?: string;               // Twitter, Discord, etc.
  avatar?: string;               // optional URL to image
}
```

### 2. Data

**HOUSES array** — all 6 houses with full details from Fractal OS synthesis:
1. **The School** (New Liberal Arts) - id: "school"
2. **The Forum** (Political Club) - id: "forum"
3. **The Neighborhood** (Co-Living) - id: "neighborhood"
4. **The Lab** (Research + Writing) - id: "lab"
5. **The Campus** - id: "campus"

(Note: The Protocol is not a house but an overarching layer, so it's out of scope for this data model)

**PEOPLE array** — 8 core people from the key people directory:
- Andrew Rose, Priya, Liam, Ivan Vendrov, Daniel Golliher, David, Paris Mitton, Crystal

### 3. Helper Functions

```typescript
getHouseBySlug(slug: string): House | undefined
getPeopleByHouse(houseId: string): Person[]
getHousesByPerson(personId: string): House[]
```

## Content Sources

**Descriptions** — Pull from `/Users/jules/Documents/dev/fractal-os/notes/2026-03-28-fractal-nyc-website-synthesis.md`:
- The School: lines 44-63
- The Forum: lines 66-80
- The Neighborhood: lines 83-104
- The Lab: lines 107-136
- The Campus: lines 139-166

Each description should be 2-3 paragraphs extracted/synthesized from the synthesis doc, using Fractal's voice (NYC-native, gritty, optimistic, direct).

**Colors** — Assign directional accent colors for each house (not final branding):
- School: Blue or deep blue derivative (intellectual)
- Forum: Red or darker red (political)
- Neighborhood: Green or warm earth tone (community, living)
- Lab: Purple or dark purple (research, theory)
- Campus: Warm cream or golden (gathering space)

Use colors that relate directionally to the brand palette (cream #fdf0d5, red #cc2936, blue #1d3557, black #1a1a1a) but are distinct per house.

**People relationships** — Each person is mapped to the houses they lead/contribute to based on synthesis doc (lines 169-181).

## File Location

`/Users/Jules/Documents/dev/fractal-nyc/artifacts/fractal-nyc/src/data/houses.ts`

The `src/data/` directory does not exist yet and must be created.

## Dependencies

This task depends on:
- **FRAC-23** (Pretext setup) — should be complete before implementation (so we understand text styling)

This task is a blocker for:
- FRAC-25 (House page template)
- FRAC-23 (Home page banner grid)
- FRAC-24 (Leader directory)

## Acceptance Criteria

1. **Type definitions are complete and correct** — TypeScript compiles without errors
2. **All 6 houses have entries** — HOUSES array includes all 6 houses
3. **All key people have entries** — PEOPLE array includes 8 people
4. **Descriptions are substantive** — each house has 2-3 paragraphs from synthesis, not placeholders
5. **People-house relationships are accurate** — each person's `houses` array reflects their roles
6. **Helper functions work** — all three queries return correct data (manual verification)
7. **File exports correctly** — TypeScript can import from `src/data/houses`
8. **Voice is consistent** — descriptions reflect Fractal's tone (NYC-native, gritty, optimistic, direct)

## Reset 2026-03-31 by agent:claude-opus-4-reviewer

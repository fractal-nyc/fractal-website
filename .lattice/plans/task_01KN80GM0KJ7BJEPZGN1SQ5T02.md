# FRAC-48: Lab Page Search Bar, Tagging System, and Archive Navigation

## Scope

Add client-side search and tag filtering to the Lab page archive (built in FRAC-47). Small dataset (9 docs, 21 tags) — all filtering in-browser with React state.

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `src/hooks/use-archive-filter.ts` | Custom hook: query state, active tags, filtered results |
| `src/components/lab/ArchiveSearch.tsx` | Search input with Search icon, clear button |
| `src/components/lab/TagFilter.tsx` | Horizontal scrollable tag chip row |
| `src/components/lab/ArchiveToolbar.tsx` | Composite: search + tags + result count + clear |
| `src/data/lab-tags.ts` | Tag display labels (ai→"AI", coliving→"Co-Living", etc.) |

### Modified Files

| File | Change |
|------|--------|
| `src/data/lab-documents.ts` | Add `getAllTags()`, `getTagCounts()` exports |
| `src/components/lab/DocumentGrid.tsx` | Accept optional `documents` prop, add empty state |
| `src/pages/LabPage.tsx` | Wire useArchiveFilter hook, place ArchiveToolbar |

## Filter Logic

1. Query: case-insensitive substring match on title, author name, description
2. Tags: OR logic (document matches if it has any active tag)
3. Compose: AND between query and tags (must pass both)
4. useMemo for computed filtered results

## Mobile-First Design

- Search: full-width, h-11 (44px touch target), text-base (prevents iOS zoom)
- Tags: horizontal scroll on mobile (overflow-x-auto, scrollbar-hide), flex-wrap on md+
- Chips: pill-shaped buttons, min-h-[36px], aria-pressed for active state
- Lab accent color (#6B4C9A) for active tags and focus ring

## Implementation Steps

1. Add data helpers to lab-documents.ts, create lab-tags.ts
2. Build use-archive-filter hook
3. Build ArchiveSearch, TagFilter, ArchiveToolbar components
4. Modify DocumentGrid to accept external docs + empty state
5. Wire in LabPage.tsx

## Acceptance Criteria

1. Search filters by title, author, description (case-insensitive)
2. Tag chips display all tags with correct labels
3. Clicking tag toggles filter, multiple tags supported (OR)
4. Search + tags compose (AND)
5. "Clear filters" resets both
6. "Showing N of M" indicator when filters active
7. Empty state when no matches
8. Mobile: horizontal scroll tags, full-width search, 44px+ touch targets
9. Keyboard navigable with ARIA attributes
10. No regressions to existing Lab page

## Complexity
Medium. New hook + 4 components + modifications to 3 existing files. Branch from frac-47-lab-archive.

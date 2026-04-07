# FRAC-61: Global Search Across People, Topics, Documents, and Concepts

## Status
Planning

## Problem
The Hero search bar currently only filters 9 hardcoded page names (Story, Campus, Neighborhood, etc.). Users can't search for actual content — people, topics, documents, or concepts like "Fractal U" or "Maximum New York".

## Goal
Transform the search bar into a real global search that indexes all site content and returns grouped, navigable results.

## Content Sources to Index

### 1. People (~17 in `src/data/houses.ts`)
- Name, role, social handles, house affiliations
- Examples: Christine, Andrew Rose, Daniel Golliher, Ivan Vendrov

### 2. Lab Documents (~50+ in `src/data/lab-documents.ts`)
- Title, author, description, tags, category
- Essays, podcasts, talks, videos, projects

### 3. Houses/Sectors (6 in `src/data/houses.ts`)
- Name, description, slug
- The Neighborhood, Events, The Campus, The School, The Forum, The Lab

### 4. Tags/Topics (34 in `src/data/lab-tags.ts`)
- AI, liberal arts, community, politics, education, etc.

### 5. Pages (9 routes)
- Keep existing page navigation as a result category

### 6. Concepts (derived from content)
- "Fractal U" / "Fractal University" → New Liberal Arts page
- "Maximum New York" → Political Club / Daniel Golliher
- "Golden Age Protocol" → The Protocol page

## Approach

### Architecture
- Build a unified search index that combines all content sources into a flat list of searchable items
- Each item has: `type`, `title`, `description`, `keywords[]`, `url`, `metadata`
- Search uses client-side fuzzy matching (all data is already local)
- Results grouped by category with keyboard navigation

### Search Algorithm
- Consider using `cmdk` (already in dependencies) for the command palette pattern
- Or enhance the existing Hero input with a richer results dropdown
- Fuzzy matching with scoring: exact match > starts-with > contains > keyword match

### UI/UX
- Grouped results: People, Documents, Topics, Pages, Concepts
- Each result shows type icon + title + brief context
- Keyboard navigable (already have arrow key support)
- Mobile-first: full-width results panel, touch-friendly hit targets

## Key Files
- `src/components/sections/Hero.tsx` — current search bar
- `src/data/houses.ts` — people + houses data
- `src/data/lab-documents.ts` — documents data  
- `src/data/lab-tags.ts` — tags data
- `src/hooks/use-archive-filter.ts` — existing search logic (Lab only)

## Acceptance Criteria
- [ ] Searching "Christine" shows Christine's person card
- [ ] Searching "Andrew" shows Andrew Rose
- [ ] Searching "liberal arts" shows the New Liberal Arts page + related documents
- [ ] Searching "Fractal U" shows Fractal University / New Liberal Arts
- [ ] Searching "Maximum New York" shows Political Club + Daniel Golliher
- [ ] Results are grouped by type (People, Documents, Pages, Topics)
- [ ] Keyboard navigation works (arrow keys, Enter to select)
- [ ] Mobile-first: works well on 375px viewport
- [ ] Existing page navigation still works

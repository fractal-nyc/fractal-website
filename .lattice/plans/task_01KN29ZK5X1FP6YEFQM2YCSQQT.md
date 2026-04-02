# FRAC-25: Navigation bar component — Plan

## Objective
Update the Navbar component to reflect the new information architecture from the PRD. Links should match the new route structure, house links should be grouped, and brand typography should use the updated fonts.

## Current State
- Navbar exists at `src/components/layout/Navbar.tsx`
- Desktop: centered logo with 4 links left / 4 links right
- Mobile: hamburger menu with full-screen overlay
- Scroll behavior: hides on scroll-down, shows on scroll-up (framer-motion)
- Current links: The Protocol, Neighborhood, New Liberal Arts, A Campus, Events, Political Club, Research + Writing, Mission

## Target State (from PRD)
**Top-level links:**
- Home (/)
- Story (/story) — *NEW, page TBD*
- Houses (grouping mechanism TBD — see below)
- The Protocol (/the-protocol)
- People (/people) — *NEW, page TBD*

**Houses (grouped section):**
- Neighborhood (/neighborhood)
- Events (/events)
- A Campus (/campus)
- New Liberal Arts (/new-liberal-arts)
- Political Club (/political-club)
- Lab (/lab) — *replaces Research + Writing at /research-writing*

**Removed:**
- Mission (/mission)

## Key Changes

### 1. Update Link Array
- Remove Mission link
- Rename "Research + Writing" to "Lab" (route `/research-writing` → `/lab`)
- Add Story and People links (routes TBD, assumed /story and /people for now)
- Organize into two categories: top-level and houses

### 2. Desktop Nav Layout Decision
**Approach:** Keep the existing centered-logo pattern with 4-left/4-right split. Group the 6 house links into a "Houses" expandable section or a sub-menu.

**Option A (simpler):** Render "Houses" as a single link that expands to show submenu on hover/click.
**Option B (flat):** Keep all links visible but style house links differently (lighter color, subtle grouping).

**Recommendation:** Option A (expandable "Houses" section) — maintains visual simplicity while logically grouping the 6 houses. Desktop will show:
- Left: Home, Story, Houses (expandable), The Protocol (4 items)
- Right: People (1 item, + 3 empty space for balance, OR restructure to 5-5)

Actually, with 7 top-level items (Home, Story, 5 top-level routes after houses, People), we need to recount:
- Home
- Story
- Houses (group)
- The Protocol
- People

That's 5 items. We can split 3-2 or make Houses the centerpiece.

### 3. Mobile Nav
- Preserve hamburger menu
- List top-level links, then house links under a "Houses" section or just flat with subtle visual grouping
- Close menu on navigation

### 4. Brand & Typography
- Logo: "Fractal" in Jacquard 24 + "Collective" in Instrument Serif italic (unchanged)
- Nav link labels: Should use Space Mono (font already changed via Tailwind theme in FRAC-23)
- Note: Current code uses `font-medium` (Tailwind sans, which is now Space Grotesk per the context). Verify font stacks and ensure consistency.

## Implementation Scope

### Files to Modify
1. **`src/components/layout/Navbar.tsx`**
   - Update `sectionLinks` array structure
   - Add "Houses" expandable section (desktop)
   - Adjust split logic (left/right nav)
   - Mobile: add houses grouping
   - Keep scroll hide/show behavior
   - Keep framer-motion animations

### Files to Create (if needed)
- None — reuse existing patterns

### Routes to Add (in `src/App.tsx`)
- `/story` → StoryPage (or placeholder)
- `/people` → PeoplePage (or placeholder)
- `/lab` → ResearchPage (route change from `/research-writing`)

## Acceptance Criteria

1. ✓ Nav links reflect new route structure
2. ✓ House links are grouped under a "Houses" section (desktop: expandable, mobile: grouped visually)
3. ✓ Story and People links are present
4. ✓ Mission link is removed
5. ✓ Lab route links to `/lab` (not `/research-writing`)
6. ✓ Scroll hide/show behavior is preserved
7. ✓ Centered logo design is unchanged
8. ✓ Mobile hamburger menu is preserved
9. ✓ Brand typography matches PRD (Jacquard 24 for "Fractal", Instrument Serif for "Collective")
10. ✓ No visual regressions — styles match current aesthetic (brutalist, warm)

## Notes
- **Houses expandable decision:** Desktop version will need a Popover or custom dropdown for the Houses group. Consider reusing existing UI primitives (check if shadcn/ui Popover or Dropdown exists).
- **New pages (Story, People):** The task is to update the navbar links only. Creating/styling the actual pages is a separate concern (may be part of other FRACs).
- **Route updates:** Will need to update App.tsx to add `/story` and `/people` routes (pointing to placeholder pages if pages don't exist yet) and change `/research-writing` to `/lab`.

## Risk Assessment
- **Low:** Link structure changes are straightforward
- **Medium:** Houses expandable/dropdown logic — need to decide approach and implement carefully to avoid breaking mobile
- **None expected for:** Scroll behavior, logo design (staying unchanged)

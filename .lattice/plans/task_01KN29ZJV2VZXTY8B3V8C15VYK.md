# FRAC-24: Route structure + page shells for all pages

## Scope
Restructure the router to match the PRD target pages and create page shells for missing pages. This is a routing+structure task—no full content implementation, just consistent shells following the existing pattern.

## Current State
- **App.tsx routes (9 total):**
  - `/` (Home)
  - `/the-protocol` (ProtocolPage)
  - `/neighborhood` (NeighborhoodPage)
  - `/new-liberal-arts` (LiberalArtsPage)
  - `/campus` (CampusPage)
  - `/events` (EventsPage)
  - `/political-club` (PoliticalClubPage)
  - `/research-writing` (ResearchPage)
  - `/mission` (MissionPage)
  - 404 fallback (NotFound)

- **Page pattern:** All pages follow: `<main>` → `<Navbar />` → `<div className="pt-32">` → content → `<Footer />`
  - Some pages have placeholder "Coming soon" text (NeighborhoodPage)
  - Some pages use section components (CampusPage → Campus section, EventsPage → Events section)

## Target State (From PRD)
- Home `/`
- Six house pages:
  - `/neighborhood` (Co-Living / The Neighborhood) ✓ exists
  - `/events` (Events) ✓ exists
  - `/campus` (Campus) ✓ exists
  - `/new-liberal-arts` (The School / New Liberal Arts) ✓ exists
  - `/political-club` (The Forum / Political Club) ✓ exists
  - `/lab` (The Lab / Research & Writing) — **route rename from `/research-writing`**
- `/the-protocol` (Protocol / Manifesto) ✓ exists
- `/story` (Story / Photo Gallery + Timeline) — **new, missing**
- `/people` (Person Directory / Leader Grid) — **new, missing**
- 404 page ✓ exists
- **Remove:** `/mission` (content is now part of Home or Protocol, not a standalone page)

## Implementation Plan

### Phase 1: Update App.tsx Router
1. Rename route `/research-writing` → `/lab`
2. Add two new routes: `/story` and `/people`
3. Remove `/mission` route and import

### Phase 2: Update ResearchPage
1. Rename file: `ResearchPage.tsx` → `LabPage.tsx`
2. Update export: `export function ResearchPage` → `export function LabPage`
3. Update navbar label text if present (should say "Lab" not "Research Writing")

### Phase 3: Remove MissionPage
1. Delete file: `MissionPage.tsx`
2. Remove import from App.tsx (already done in Phase 1)

### Phase 4: Create StoryPage
1. Create `/Users/jules/Documents/dev/fractal-nyc/artifacts/fractal-nyc/src/pages/StoryPage.tsx`
2. Shell template (using the standard pattern):
   ```tsx
   import { Navbar } from "@/components/layout/Navbar";
   import { Footer } from "@/components/layout/Footer";
   import { FadeIn } from "@/components/ui/FadeIn";

   export function StoryPage() {
     return (
       <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
         <Navbar />
         <div className="pt-32">
           <section className="py-24 md:py-40">
             <div className="max-w-7xl mx-auto px-6 md:px-12">
               <FadeIn>
                 <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">Story</h2>
                 <p className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight">
                   Coming soon.
                 </p>
               </FadeIn>
             </div>
           </section>
         </div>
         <Footer />
       </main>
     );
   }
   ```

### Phase 5: Create PeoplePage
1. Create `/Users/jules/Documents/dev/fractal-nyc/artifacts/fractal-nyc/src/pages/PeoplePage.tsx`
2. Same shell template as StoryPage but with "People" as the label

### Phase 6: Update App.tsx Imports and Route Order
1. Replace `ResearchPage` import with `LabPage` import
2. Add `StoryPage` import
3. Add `PeoplePage` import
4. Remove `MissionPage` import
5. Update route order to be logical:
   - Core: Home, Protocol
   - Houses: Neighborhood, Events, Campus, Liberal Arts, Political Club, Lab
   - Other: Story, People
   - Fallback: 404

## Key Files Affected
- `/Users/jules/Documents/dev/fractal-nyc/artifacts/fractal-nyc/src/App.tsx`
- `/Users/jules/Documents/dev/fractal-nyc/artifacts/fractal-nyc/src/pages/ResearchPage.tsx` (rename to LabPage)
- `/Users/jules/Documents/dev/fractal-nyc/artifacts/fractal-nyc/src/pages/MissionPage.tsx` (delete)
- `/Users/jules/Documents/dev/fractal-nyc/artifacts/fractal-nyc/src/pages/StoryPage.tsx` (create)
- `/Users/jules/Documents/dev/fractal-nyc/artifacts/fractal-nyc/src/pages/PeoplePage.tsx` (create)

## Acceptance Criteria
1. ✓ All 9 PRD-target routes exist and are importable
2. ✓ `/research-writing` route removed, `/lab` route added with working LabPage
3. ✓ `/story` route exists with StoryPage shell
4. ✓ `/people` route exists with PeoplePage shell
5. ✓ `/mission` route and MissionPage removed entirely
6. ✓ All pages follow the standard layout pattern (Navbar + pt-32 wrapper + content + Footer)
7. ✓ App.tsx imports are clean and accurate
8. ✓ No broken imports or console errors
9. ✓ 404 still works for undefined routes

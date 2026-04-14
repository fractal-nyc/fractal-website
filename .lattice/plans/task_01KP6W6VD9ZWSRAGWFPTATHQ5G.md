# FRAC-172 — Multi-author Writing posts + content ingestion

Plan is split into **Phase A (unblocked, ship now)** and **Phase B (blocked on Julianna)**.

## Context
Current: `LabDocument.author: string` in `src/data/lab-documents.ts`. Read sites for `.author`:
- `src/components/lab/DocumentBadge.tsx:48-49,105` (single byline)
- `src/hooks/use-archive-filter.ts:86` (filter by author)
- `src/hooks/use-global-search.ts:145,151` (author scoring + subtitle)
- `src/pages/StoryPage.tsx:175` — different `talk` model; confirm unrelated.

No per-author route exists. FRAC-169 is removing aggregate-publication surfaces. Multi-author rename is therefore safe.

## Phase A — Schema change (UNBLOCKED, ship now)

### A1. Interface change
- In `src/data/lab-documents.ts`, replace `author: string` with `authors: string[]` (non-empty by convention; `authors[0]` = primary).
- Update every `LAB_DOCUMENTS` literal from `author: "x"` → `authors: ["x"]` (~30 entries, mechanical).
- Clean cut — no deprecated alias. Compiler catches missed call sites.

### A2. Helpers (export from `lab-documents.ts`)
- `formatAuthors(ids: string[]): string` — resolves via `PEOPLE`, comma-joins (Oxford comma for 3+), falls back to raw id.
- `getDocumentsByAuthor(id: string): LabDocument[]` — `LAB_DOCUMENTS.filter(d => d.authors.includes(id))`.
- `getPrimaryAuthorId(doc): string` — `doc.authors[0]`.
- `getPublishedDocuments()` — filters `url !== ""` (Phase B placeholder rows won't leak to UI).

### A3. Call-site updates
- **`DocumentBadge.tsx`**: render `formatAuthors(document.authors)`.
- **`use-archive-filter.ts:86`**: `doc.authors.some(id => (authorNames.get(id) ?? id).includes(q))`.
- **`use-global-search.ts:145-151`**: `authorScore = Math.max(...doc.authors.map(id => matchScore(authorNameMap.get(id) ?? id, q))) * 0.5`; `authorDisplay = formatAuthors(doc.authors)`.
- **`StoryPage.tsx:175`**: confirm unrelated `talk` model — if it does resolve to LabDocument, switch to `formatAuthors`; otherwise leave.

### A4. Live multi-author regression
Set `network-state-conference` entry to `authors: ["andrew", "priya"]` (Julianna confirmed it's co-authored — item 16 in notes).

### A5. Ship 5 Teacher Spotlight entries (URLs are provided in notes)
URLs from `.lattice/notes/FRAC-172.md`:
- https://fractaluniversity.substack.com/p/teacher-spotlight-andrew-blevins
- https://fractaluniversity.substack.com/p/introducing-teachlab
- https://fractaluniversity.substack.com/p/excerpts-from-my-illustrated-journal
- https://fractaluniversity.substack.com/p/robert-hart-on-cruise-life-stage
- https://fractaluniversity.substack.com/p/david-shimel-on-edm-production

Default `authors: ["andrew"]` (Fractal U editorial byline) with TODO comments to update once subject PEOPLE entries exist. The "Why I quit tech to teach Indian" spotlight is already present as `keesh-teacher-spotlight`.

### A6. Acceptance (Phase A)
- Existing single-author posts render bylines identically.
- Filter + search still work on single-author.
- `network-state-conference` renders "Andrew Rose, Priya Rose".
- 5 new spotlight entries render with the provided URLs.
- `pnpm typecheck`/`lint`/`build` clean; all vitest green.

## Phase B — Content ingestion (BLOCKED on Julianna)

### Blocked inputs
- URLs for 16 canon posts + 4 NYC posts.
- Author of "Social Fabric NYC".
- 20+ contributor names + which posts they co-author.
- Whether Daniel's NYC video is one or two entries.

### B1. Cross-reference existing entries (map Julianna's list → current IDs)
Already in `LAB_DOCUMENTS` (verify titles match; update `authors[]` as data lands):
- How to Live Near Your Friends → `how-to-live-near-friends` (priya)
- How to Start a School With Your Friends → `how-to-start-school-friends` (priya)
- Marry Your City → `marry-your-city` (daniel)
- Reversing the Centrifuge of Modernity → `reversing-centrifuge` (andrew)
- Introducing The Fractal University Canon → `fractal-university-canon` (andrew)
- Effective altruism in the garden of ends → `ea-garden-of-ends` (tyler)
- Take Some Responsibility! → `take-some-responsibility` (andrew)
- Hundreds of neighbors share this communal living room → `merlins-place` (ulysses) — confirm title match
- Scaling Coliving and Slouching Towards Utopia → `scaling-coliving` (priya)
- Friends, Community, Isolation & Fearlessness → `friends-community-isolation` (andrew)
- The Network State Conference → `network-state-conference` (→ `["andrew","priya"]` in Phase A)
- Keesh Teacher Spotlight → `keesh-teacher-spotlight`

### B2. Missing entries (need URLs before Phase B ships)
- How to Turn Your Home Into a Third Space
- a neighborhood stroll
- The Gardener Leader
- Fooming the Fractal — Tyler Alterman, 2025
- The Origin Story of Fractal (video) — Priya Rose, 2023 (category: "video")
- All 4 NYC-themed posts (Daniel x2?, Tyler, Hailey, Social Fabric NYC)

### B3. PEOPLE expansion
When names arrive, add entries to `PEOPLE` in `src/data/houses.ts`; reference by id in `authors[]`. No UI change — `formatAuthors` handles any id.

### B4. Acceptance (Phase B)
- Every post in Julianna's list exists with non-empty `url`.
- Multi-author bylines render correctly.
- Search finds posts by any co-author's name.
- No placeholder/TODO rows leak to UI.

## Sequencing
- **PR 1 (Phase A):** schema + helpers + call sites + dual-author regression + 5 spotlight URLs + `getPublishedDocuments`. Runs to `done`.
- **PR 2 (Phase B):** remaining posts + PEOPLE expansion. Stays blocked until Julianna unblocks.

## Risks
- 30-entry mechanical rename — TypeScript compiler catches misses.
- Author display order = credit order — document `authors[0]` as primary in the interface JSDoc.

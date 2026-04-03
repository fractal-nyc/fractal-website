# FRAC-47: Lab Page — Research & Writing Archive with Document Badges

## Scope

Populate the Lab page (/lab) with a research and writing archive. Each document gets a badge component. Build data model with tags (for FRAC-48 downstream).

## Data Model

New file: `src/data/lab-documents.ts`

```typescript
export type DocumentCategory = "substack" | "essay" | "podcast" | "video" | "social" | "project";

export interface LabDocument {
  id: string;
  title: string;
  author: string;         // person ID from PEOPLE
  description: string;    // 1-2 sentence summary
  url: string;
  category: DocumentCategory;
  tags: string[];         // for FRAC-48 filtering
  featured?: boolean;
}
```

## Known Documents (from synthesis)

**Andrew Rose** (`andrew`):
- Substack: https://andrewjrose.substack.com (featured)
- Unblocked podcast: https://andrewjrose.substack.com/podcast

**Ivan Vendrov** (`ivan`):
- Nothing Human: https://nothinghuman.substack.com (featured)
- "The Tyranny of the Marginal User"
- "Metrics, Cowardice, and Mistrust"
- "Considerations on Cultural Drift"
- "Andrew Rose on building communities"

**Fractal NYC Substack** (`priya`):
- https://fractalnyc.substack.com

**Fractal University**:
- https://fractaluniversity.substack.com

**Needs Jules' confirmation:** Crystal's content links, study group representation, full document list.

## Document Badge Component

New: `src/components/lab/DocumentBadge.tsx`
- Rectangular container (NOT V-notch shape)
- Lab house color (#6B4C9A, purple) as accent
- Category icon (lucide-react) + label top-left
- Document title (serif), author name (muted), ArrowUpRight external link icon
- Entire badge is clickable `<a target="_blank">`
- Hover: `scale-[1.02]` transition
- `featured` variant: larger, spans 2 cols on desktop, includes description

## Page Layout

```
Navbar
  HouseBanner (full variant, lab house)
  Lab description (PretextParagraph)

  Section: "Research & Writing"
    Featured docs grid (1 col mobile, 2 col md+)
    All docs grid (1 col mobile, 2 col sm, 3 col lg)

  (Optional) Section: "Study Groups & Projects"
Footer
```

## Key Files

| File | Action |
|------|--------|
| `src/data/lab-documents.ts` | New — document data model + entries |
| `src/components/lab/DocumentBadge.tsx` | New — badge component |
| `src/components/lab/DocumentGrid.tsx` | New — grid layout for badges |
| `src/pages/LabPage.tsx` | Modify — replace placeholder with full layout |

## Acceptance Criteria

1. Lab page renders house banner, description, and document archive
2. Each document is a clickable badge linking to external URL
3. Featured documents are visually prominent
4. Badges show: title, author, category icon, external link indicator
5. Mobile-first: single column at 375px, grid on larger screens
6. Tags included in data model (for FRAC-48)
7. FadeIn animations applied

## Complexity
Medium. New data model + new components + page layout.

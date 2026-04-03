# FRAC-50: Add leader social links to people data

## Scope

Update PEOPLE data model with structured social links, add/remove people, render links in AvatarBadge.

## Data Model Changes (`src/data/houses.ts`)

Replace `handle?: string` with structured socials:

```typescript
export interface PersonSocials {
  twitter?: string;    // handle without @
  substack?: string;   // full URL
  website?: string;    // personal/project URL
}
```

Update `Person` interface: `socials?: PersonSocials` replaces `handle?: string`.

## People Changes

**Remove:** Paris Mitton

**Add:** Tyler Alterman (role/houses/handles TBD — use TODO markers)

**Update social links:**
- Andrew: twitter "andrewrosenyc", substack "https://andrewjrose.substack.com/"
- Priya: twitter "Prigoose", substack "https://prigoose.substack.com/"
- Liam: twitter "liamdanielduffy"
- Ivan: twitter "IvanVendrov", substack "https://nothinghuman.substack.com"
- Daniel: twitter "danielgolliher", website "https://www.maximumnewyork.com/"
- Crystal: twitter "crystalxduan"
- David: no links (leave as-is)

**Do NOT add Shanthi** — info not yet provided.

## UI Changes (`src/components/ui/AvatarBadge.tsx`)

Add small social link icons in the gradient overlay below the role text:
- Twitter → lucide `AtSign` or custom X icon (12px)
- Substack → `Newspaper` (12px)
- Website → `Globe` (12px)
- White/60 opacity, hover to full white, `target="_blank"`

## Acceptance Criteria

1. Paris removed from PEOPLE
2. Tyler added with TODO markers
3. All provided social links populated
4. Person interface uses `socials?: PersonSocials`
5. AvatarBadge renders social icons when present
6. Mobile-friendly tap targets (24px+)
7. No TypeScript errors

## Complexity
Low. Data model change + small UI enhancement.

# FRAC-50: Add styled footer CTA section

## Scope
Add a warm, inviting CTA section above the existing footer content in `Footer.tsx`. The section appears on every page since Footer is already a global layout component.

## Approach
- Add a new CTA section above the existing footer content within the same `<footer>` element
- Two paragraphs: Discord intro invite + calendar link for Ian chat
- Use FadeIn for scroll animation, staggered delays
- Serif heading, muted body text, subtle link styling with underlines
- Mobile-first: max-w-2xl centered, comfortable padding
- Visually separated with border-top

## Key Files
- `src/components/layout/Footer.tsx` — only file modified

## Acceptance Criteria
- CTA section visible above footer on all pages
- Discord link uses `#` placeholder
- Calendar link points to correct Google Calendar URL
- FadeIn animations on heading and paragraphs
- Mobile-first responsive design
- Matches site aesthetic (cream bg, serif heading, muted text)

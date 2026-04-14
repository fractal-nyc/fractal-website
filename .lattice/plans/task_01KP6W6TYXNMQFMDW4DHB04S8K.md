# FRAC-166 — Embed Luma calendar on Events page

## Context
`src/pages/EventsPage.tsx` currently shows 3 CTA buttons: Email Merlin's, "Luma Calendar" link-out (lines 31-44), and Discord. Replace the middle CTA with an embedded Luma calendar iframe.

**URL:** `https://luma.com/nyc-tech` (confirmed).
**Luma embed format:** `https://lu.ma/embed/calendar/nyc-tech/events`. If the slug-based URL doesn't work, grab the canonical embed URL from luma.com/nyc-tech > Manage > Embed (may require calendar UUID).

## Approach (single file: `src/pages/EventsPage.tsx`)

Replace lines 31-44 (the "Join Tech Events" FadeIn containing the Luma anchor) with a FadeIn block containing:
- the existing "Join Tech Events" heading (same styling as sibling headings),
- a responsive iframe wrapper:
  - `div`: `relative w-full max-w-5xl mx-auto rounded-md overflow-hidden border border-foreground/20 bg-foreground/[0.03] h-[80vh] min-h-[600px] md:h-[850px] mb-6`
  - optional inner `<CornerDecorations size="xs" />` to match sibling sections
  - `iframe src="https://lu.ma/embed/calendar/nyc-tech/events" title="Fractal Tech NYC Events Calendar" className="w-full h-full" style={{ border: 'none' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"`
- a small fallback anchor below the iframe: `<a href="https://luma.com/nyc-tech" target="_blank" rel="noopener noreferrer">Open calendar in new tab →</a>` with `text-xs tracking-widest uppercase opacity-70 hover:opacity-100`.

Leave "Email Merlin's Place" (delay 0.1) and "Join Discord" (delay 0.3) unchanged.

Do NOT touch `src/components/sections/Events.tsx` (home teaser — out of scope).

## Height strategy
`h-[80vh] min-h-[600px] md:h-[850px]` — iframe content is taller than wide on mobile and roughly square on desktop; fixed responsive height beats aspect-ratio here.

## Edge cases
- If `/embed/calendar/nyc-tech/events` returns a Luma "not embeddable" page, switch to canonical calendar-UUID URL from Luma admin. Document in a comment.
- Luma serves white bg — rounded border wrapper softens the clash against the page bg.
- Cross-origin: cannot theme the iframe.

## Acceptance
- `/events` renders the Luma calendar inline as an interactive iframe at 375px, 768px, 1280px+.
- Iframe ≥600px tall on mobile, ~850px on desktop; no horizontal scroll at 375px.
- Old "Luma Calendar" CTA button gone; small fallback "Open in new tab" link remains.
- Email + Discord CTAs unchanged.
- `pnpm typecheck`/`lint`/`build` clean, no new console errors.

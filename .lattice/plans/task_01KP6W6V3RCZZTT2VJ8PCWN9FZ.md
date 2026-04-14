# FRAC-168 — Campus page port from Fractal Tech Hub

## Goal

Replace the current Campus page with the Fractal Tech Hub website's content, reformatted to match the rest of the fractal-nyc site's style. Apply the transforms Julianna specified so the result reads as "Fractal Campus", not "Fractal Tech Hub".

## Source of truth

Final processed copy (with every transform already applied) lives in `.lattice/notes/FRAC-168.md`. Implementation agent reads that file verbatim for section copy.

## Transforms already baked into the notes copy

1. Emojis removed from section headings and CTAs.
2. "Fractal Tech Hub" / "Tech Hub" → "Fractal Campus" / "Campus" everywhere.
3. "Fractal Tech Bootcamp" / "bootcamp" → "Fractal AI Accelerator" everywhere.
4. `hello@fractaltech.xyz` removed; "Visit by joining us for an event" CTA links to Luma.
5. "Just passing through?" → "Or".
6. First paragraph edited: `for startup founders and engineers` removed, `their` → `your`.
7. "ignite a New York City tech Renaissance in the startup scene by networking exploratory technologists" edited to **"We aim to ignite a New York City Renaissance by networking"** (Julianna's exact wording — final, not truncated).
8. Three audiences → four: Fractal AI Accelerator participants, Fractal U students (linked), Members, Guests.

## Confirmed URLs

- **Luma:** `https://luma.com/nyc-tech` (same as FRAC-166).
- **Fractal U:** `https://fractaluniversity.substack.com/` — reuse the existing sitewide Fractal U Button component at `src/components/sections/LiberalArts.tsx:38` so the CTA matches the rest of the site.

## Approach

- Locate the Campus page component/route.
- Replace its content with the sections from the notes file, rendered with the same component primitives used elsewhere on fractal-nyc (section wrappers, heading scale, bullet styles, Button components, etc.).
- Keep existing imagery if already present in the repo; otherwise leave captioned placeholders with the exact captions from the notes file so Julianna can drop in photos later.
- Do NOT attempt to fetch or reuse imagery from the Tech Hub source site.
- Mobile-first (375px baseline): all sections stack cleanly, CTAs are full-width on mobile.

## Files likely touched

- Campus page component (under `src/components/sections/` or `src/app/campus/` — implementation agent to confirm).
- Possibly a new section component for the "four audiences" block.

## Acceptance criteria

- [ ] Campus page renders with all sections from `.lattice/notes/FRAC-168.md` in order.
- [ ] Every content transform from the list above is present — no stray "Tech Hub", "bootcamp", emojis in section headings, `hello@fractaltech.xyz`, or "Just passing through?".
- [ ] Luma and Fractal U CTAs link to the correct URLs; the Fractal U CTA visually matches the existing Fractal U button used elsewhere on the site.
- [ ] Mobile layout at 375px: every section readable, no horizontal scroll, CTAs tappable.
- [ ] `pnpm typecheck` / `pnpm lint` / `pnpm build` clean.

## Out of scope

- Finalizing photography / captions (Julianna will polish in-place after land).
- Any routing or nav changes (Campus page presumably already exists in nav).
- Dependent tasks: Luma embed (FRAC-166) and house renames (FRAC-163) may land independently.

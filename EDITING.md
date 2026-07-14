# Editing the Fractal NYC site

The sitemap and recipe reference for content edits. Use this when you need to find which file holds which copy.

For developers and AI agents working in the repo, see [`AGENTS.md`](./AGENTS.md) and [`DESIGN.md`](./DESIGN.md).

---

## What this doc covers

The shapes of edit this sitemap is built for:

- Replacing existing copy (a headline, paragraph, label, button text)
- Updating data (a house description, a person, a publication, a nav link, the footer email)
- Swapping an asset (a campus photo, a story photo, a banner image)
- Larger structural changes (adding a section, changing colors, reordering pages) — describe what you want in plain English and let Claude figure out the right files; the sitemap below tells you where to start looking.

---

## The general workflow

1. **Decide what you want to change.** Something concrete you can name — a specific headline, a description, a photo.
2. **Find the section in the [Sitemap](#sitemap--where-every-piece-of-copy-lives) below** and note the file it points to.
3. **Ask Claude to make the change.** Open Claude Code in the repo and describe the change, naming the file from the sitemap. (Alternative: attach the file in a [claude.ai](https://claude.ai) chat and ask there, then paste the full updated file back over the original.)
4. **Preview it.** Run `pnpm dev` from the repo root and open `http://localhost:5173`. The page updates as files are saved; hard-refresh (Cmd-Shift-R) if it looks stale.
5. **Confirm the change reads right** — on a phone-width window too. The site is mobile-first; check ~375px wide.
6. **Commit, push, and open a PR.** The site deploys from `master` via Netlify once the PR merges.

If step 5 fails, tell Claude what's wrong — one round of correction is usually enough.

## Quick Start prompt template

> I want to update the Fractal NYC site. The change I want is: **[describe the change in plain words]**.
>
> The relevant file is `[path from the sitemap]`. Make only this change — don't touch anything else.

---

## Sitemap — where every piece of copy lives

### Data files (edit these for the most common changes)

- **`src/data/houses.ts`** — the source of truth for the six houses and the people directory.
  - Each house: display name, tagline (*"Want to live here?"*, *"Want to host?"*, …), 2–3 paragraph description, color pair, leaders, external links, visibility flags.
  - `PEOPLE`: every person's name, role, houses, and social links.
- **`src/data/publications-documents.ts`** — every entry in the Publications archive (`/publications`): title, authors, description, URL, category, tags, `featured` flag.
- **`src/data/storyPhotos.ts`** — the Story page photo gallery: image paths, alt text, and gallery layout.

### Site-wide (every page)

- **Top navigation** — `src/components/layout/Navbar.tsx`
  - Wordmark: *"Fractal"*.
  - The menu rows live in the `NAV_GROUPS` array, grouped **Spaces** / **Education** / **Community**. Each row is a letter, a label, a color, and a destination (`route` for an internal page, `href` for an external link). Row colors are read from `houses.ts`, so change a house's color there and the menu follows.
  - Every row must have a destination — there are deliberately no disabled/"coming soon" rows. The member-portal row (*"Enter the Fractal"*) is commented out in `NAV_GROUPS` until the portal exists.
- **Footer** — `src/components/layout/Footer.tsx`
  - Discord CTA (*"If you're in NYC and would like to introduce yourself…"*), Discord invite URL, *"New York City"*, `hello@fractalnyc.com`, wordmark + *"New York City Collective"*, copyright line.
- **Browser tab title & head metadata** — `index.html`. Also holds the font loading and image preloads (see [Asset swaps](#pattern-e--asset-swaps)).

### Homepage (`/` — `src/pages/Home.tsx`)

- **Hero** — the 3D octahedron scene with search box.
  - Search placeholder *"Explore Fractal…"*: `src/components/sections/Hero.tsx`.
  - Octahedron face images: `public/images/banners/` (mapped in `src/components/three/OctahedronHero.tsx`).
  - Background image: `public/images/hero/` (see [Asset swaps](#pattern-e--asset-swaps)).
- **"A Golden Age Protocol"** — headline and three paragraphs (Founding Fathers… scenius…) inline in `src/pages/Home.tsx`.

### Story (`/story` — `src/pages/StoryPage.tsx`)

- Headline *"From a Single Apartment to a Neighborhood Campus"* and the talks/podcasts intro: in the page file.
- **Talk & podcast cards** — the `TALKS` array in the page file: title, author, year, description, URL.
- **Origin story copy + diagram** — `src/components/sections/OriginStory.tsx` (diagram image: `public/images/fractal-nyc-diagram.png`).
- **Photo gallery** — `src/data/storyPhotos.ts`; images in `public/images/story/`.

### Campus (`/campus` — copy in `src/components/sections/Campus.tsx`)

The longest page; everything below is in `Campus.tsx`:

- Headline *"Be Ambitious with Us"*, address link, membership tiers + pricing, *"First time here?"* contact.
- Section copy: overview + amenities, four audiences, AI Accelerator (+ apply link), *"A place to get shit done…"*, quotes from Andrew Rose and Jake Zegil, events list, Williamsburg / McCarren Park blurbs, team bios, *"…by the way, what's Fractal?"*.
- **Photo grid** — the `campusPhotos` array (src, alt, caption); images in `public/images/campus/`.

### Fractal Co-Living (`/co-living` — `src/pages/CoLivingPage.tsx`)

- Headline *"Live Near Your Friends"* and the intro paragraph, in the page file.
- **"Visiting NYC?" callout** — the copy, plus two links held as constants at the top of the page file: `HOUSING_FORM_URL` (the Airtable housing interest form) and `DISCORD_URL`. To repoint either link, edit the constant, not the JSX.
- **The map** — `src/components/sections/HousingMap.tsx` (Leaflet; house pins read their colors from `houses.ts`).
- **Photo strip** — the `PHOTOS` array in the page file; images in `public/images/story/`.

### Events (`/events` — `src/pages/EventsPage.tsx`)

- Headlines *"Join Tech Events"*, *"Host an event in our space"*, *"Stay in the Loop"*; Luma calendar embed + link; hosting instructions; `crystal@fractalnyc.com`; Discord button — all in the page file.

### Publications (`/publications` — `src/pages/PublicationsPage.tsx`)

- Headline and intro copy in the page file.
- **The archive itself** — add/edit/remove entries in `src/data/publications-documents.ts`; tag labels in `src/data/publications-tags.ts`.

### The Protocol (`/the-protocol` — `src/pages/ProtocolPage.tsx`)

- Visual-only page (animated Sierpinski carpet, `src/components/sections/SierpinskiCarpet.tsx`). No copy.

### Retired pages — Education, Political Club, People

**These three pages no longer exist. There is no copy to edit.**

| Page | Was at | Copy used to live in |
|---|---|---|
| Education | `/education` | `src/components/sections/Education.tsx` |
| Political Club | `/political-club` | `src/pages/PoliticalClubPage.tsx` |
| People | `/people` | `src/pages/PeoplePage.tsx` |

All three page components were deleted, and the URLs are **not redirected** — they simply 404. Their *colors* were deliberately kept (see `DESIGN.md` § Retired pages, retained tokens), so if you go looking you will still find `house-education-*`, `house-political-club-*` and `section-people-*` in the codebase. **A surviving color is not a surviving page.** Bringing one back means rebuilding the page and re-adding its route — a build task, not a copy edit; describe what you want and let Claude do it.

The Education *house* is still very much alive as a brand: it colors the **FractalU** navbar row and the **Community-run University** node on the homepage diagram. Its house data (tagline, description) still lives in `src/data/houses.ts` and is still worth keeping accurate.

---

## Example patterns

### Pattern A — Replace a single piece of copy

> In `src/pages/VisitPage.tsx`, change the headline "Live Near 100 Friends & Peers" to: **"[your new headline]"**. Make only this change.

**Verify:** `pnpm dev`, open `/visit` — the big display headline should read your new text.

### Pattern B — Edit house data (tagline, description, people)

House copy on banners, navigation, and house pages flows from `src/data/houses.ts`.

> In `src/data/houses.ts`, find the house with `id: "events"`. Change its `tagline` to: **"[new tagline]"** / update the second paragraph of its `description` to: **"[new paragraph]"**.

To add a person: ask Claude to add an entry to the `PEOPLE` array with name, role, house ids, and socials, following the existing entries.

### Pattern C — Add a publication to the archive

> In `src/data/publications-documents.ts`, add a new document following the existing entry shape: title **"[title]"**, authors **["person-id"]**, description **"[1–2 sentences]"**, url **"[link]"**, category **"[substack/essay/podcast/talk/video/social/project]"**, tags **["…"]**. Author ids must match `PEOPLE` ids in `src/data/houses.ts`.

**Verify:** open `/publications` and search for the new title.

### Pattern D — Site-wide copy (nav blurbs, footer)

> In `src/components/layout/Footer.tsx`, change the contact email to: **"[new email]"** everywhere it appears.

**Verify:** any page, scroll to the footer.

### Pattern E — Asset swaps

- **Campus photo:** drop the new image in `public/images/campus/`, then ask Claude to update the matching entry (src, alt, caption) in the `campusPhotos` array in `src/components/sections/Campus.tsx`.
- **Story photo:** drop the image in `public/images/story/` and ask Claude to add/update the entry in `src/data/storyPhotos.ts`.
- **Octahedron banner image:** drop the master PNG in `assets-src/banners/` **keeping the existing source filename** (listed in `scripts/compress-banners.mjs`), then run `pnpm build:banners` to regenerate the compressed `public/images/banners/*.webp` — don't hand-replace those. The output filenames are referenced in `src/components/three/OctahedronHero.tsx`, `src/components/house/HouseBanner.tsx`, *and* the preload tags in `index.html`, which must all stay in sync — tell Claude if you want a new filename so it updates all three.
- **Hero background:** replace `assets-src/hero/fractal-background-source.png`, then run `pnpm build:hero-bg` to regenerate the responsive variants in `public/images/hero/` — don't hand-replace them.

---

## Troubleshooting

**"I don't see my change in the browser."**
Make sure `pnpm dev` is running and you saved the file. Hard-refresh (Cmd-Shift-R). Confirm you're on the right route.

**"The site won't build / the dev server shows an error overlay."**
The edit likely broke TypeScript syntax (a stray quote or bracket — common in `houses.ts` descriptions). Paste the error to Claude and ask it to fix the file. `pnpm typecheck` confirms when it's clean.

**"The sitemap says I should find X but the file shows something else."**
The doc may be stale. Tell Claude: *"EDITING.md says I should find `[X]` in `[file]` but I see `[Y]`. Make the change anyway, and update EDITING.md if its entry is wrong."*

**"Claude changed something I didn't ask it to."**
Reply: *"Undo that. Make only the original change, don't modify anything else."* Uncommitted changes can always be reverted with `git checkout -- <file>`.

**"How do I check the mobile layout?"**
In the browser dev tools, toggle the device toolbar (Cmd-Opt-M in Chrome) and pick a ~375px-wide phone. The site is designed for phones first — always check this view before shipping.

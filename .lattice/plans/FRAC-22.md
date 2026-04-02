# FRAC-22: Fractal NYC Website Redesign — PRD

**Author:** Jules + Claude | **Created:** 2026-03-31 | **Status:** Draft | **Deadline:** 2026-04-04

---

## Project Brief

### Background

Fractal NYC is an open-source protocol for creating golden ages — five interconnected institutions (now organized as six "houses") sharing physical space in Williamsburg, Brooklyn. The community has ~70+ co-living members, ~48 co-working members, ~1,500 Discord members, and runs 3+ events per week.

The current website exists but fails at its most important job: helping people who've been introduced to Fractal understand what it is and how to get involved. Leaders (Andrew, Priya, and others) are constantly fielding "How do I get involved?" questions that the site should answer.

### Problem Statement

**I am** someone who just met a Fractal member at an event, co-working session, or through a friend. **I am trying to** understand what Fractal is and figure out how to get involved. **But** the current site doesn't clearly show me where I fit or what to do next **because** it lacks clear wayfinding, house structure, and leader visibility, **which makes me feel** confused and dependent on the person who introduced me to explain everything.

**I am** a Fractal leader (Andrew, Priya, house leads). **I am trying to** point new people to a resource that answers their questions. **But** the current site doesn't serve as that "second conversation" **because** it doesn't map to how Fractal actually works (six houses, leaders, Discord community), **which makes me feel** like I have to personally onboard every new person.

### Goals

| Goal | What Success Looks Like |
|------|------------------------|
| Solve wayfinding | A warm-intro'd visitor can identify the house they encountered and understand how to go deeper — without asking a leader |
| Reduce leader burden | Andrew and Priya stop getting "how do I get involved?" questions; they link people to the site instead |
| Make the houses legible | Each house has clear identity, leadership, and vibe — visitors know what they're looking at |
| Connect to community | Members feel more connected to their peers and to Fractal as a whole |
| Lay the Discord auth foundation | Scaffold the authenticated layer that will unlock events, member directories, and internal links |

### Non-Goals

- **Not a marketing site.** We are not trying to explain Fractal to cold traffic or convince strangers to care.
- **Not trying to generate interest.** The visitor is already interested — someone sent them here.
- **Not replacing Discord.** Discord remains the community hub, approval gate, and primary communication layer. The site is a front door and directory, not a replacement.
- **Not a revenue tool.** The site is not trying to make money.
- **Not defining Fractal precisely.** We're not trying to create a perfect definition for people who have no context. We're laying a foundation for people who are already curious.

---

## Hypothesis

If we build a site that clearly maps Fractal's six houses with visible leaders and distinct identities, then warm-intro'd visitors will self-navigate to the right house and join via Discord without needing a leader to personally guide them, leading to reduced onboarding burden on Andrew/Priya and higher new-member activation.

---

## Target Audience

### User Type 1: Pre-Discord Visitor (Primary)

Someone who met a Fractal member and was told "check out the site." They may have:
- Attended an event and want to find more
- Met a house leader and want to learn what they're part of
- Heard about a specific initiative (AI Accelerator, co-living, political club) and want to find it

**They need:** Orientation. Which houses exist, who leads them, what's the vibe, and how do I take the next step (join Discord).

### User Type 2: Post-Discord Member (Secondary, stretch for V1)

Already in the Fractal Discord. Uses the site as a home base.

**They need:** See who's in each house (Discord member avatars), access event details and Luma links, find internal resources. This is the authenticated layer.

### User Stories

- "As a newcomer who met someone at a Fractal event, I want to find the house that person belongs to so I can understand what I stumbled into."
- "As a newcomer who was told about Fractal, I want to see all the houses at a glance so I can figure out where I fit."
- "As a Fractal member, I want to point people to the site instead of explaining everything myself."
- "As a Discord member, I want to see who else is in my house so I feel connected to my peers." (post-auth)
- "As a Discord member, I want to see upcoming events for my houses so I know what's happening." (post-auth)

---

## Vision Narrative

**The Hogwarts Model:** Fractal is organized like Hogwarts — six houses, each with its own identity, leadership, and culture. Together they form the school (Fractal), unified by the protocol. You can be in one house or many. Some people live in the Neighborhood and do research in the Lab. Some people are in every house. The site should feel like arriving at a world with distinct territories, not a corporate org chart.

**The Experience:** You land on the site. A bold hero tells you what Fractal is in one line. Below it, six house banners — each with its own color, quote, and leaders' faces — invite you to explore. You recognize the person you met. You click in. You see the house's story, its leaders, and (if you're authenticated) the people already inside. You understand where you are. You join the Discord. You're in.

### Look & Feel

- **Aesthetic:** Brutalist, warm, NYC-native. Hard shadows, bold type, real photos. Not corporate, not startup-y.
- **Brand palette:** Cream (#fdf0d5), Red (#cc2936), Blue (#1d3557), Black (#1a1a1a) — plus per-house accent colors (TBD)
- **Fonts:** Space Grotesk (body), Space Mono (labels/nav), Instrument Serif (logo)
- **Vibe references:** Pottermore house pages, Hogwarts sorting. A world you enter, not a product you evaluate.
- **Pretext integration:** Pretext-first approach — use Pretext for **all text rendering** (headings, paragraphs, quotes, labels, banners). CSS handles structural layout only (grid, flexbox, box model, spacing). This is a deliberate challenge: treat text as material from day one rather than bolting it on later.

---

## Site Architecture

```
Home
├── Hero (what is Fractal, one line)
├── Six House Banners (color, quote, leader faces → click into house)
├── [Story link]
├── [Protocol link]
└── [Join Discord CTA]

House Page (×6)
├── Full banner (house color, branding, quote)
├── 2-3 paragraph description (pulled from Fractal OS)
├── Leader mini-banners with avatars
├── Links to house's external pages (Luma, Discord channels, etc.)
└── 🔒 Post-auth: member avatars from Discord

Story Page
├── Photo gallery — Fractal's history, spaces, people, vibes (photos exist in public/images/ + attached_assets/)
├── Inspiration/references gallery (content TBD — Jules to curate)
├── Timeline: 2021 dinners → coliving → campus → five sectors → today (narrative from synthesis doc)
└── Visual narrative of how Fractal started and what it looks like

Protocol Page
├── Manifesto-style layout of the Fractal Protocol
├── Links to Fractal OS, "how to make Fractal yourself"
└── The connective tissue that explains how the houses relate

Person Directory
├── Grid of leaders/faculty across all houses
├── House tags per person (can appear in multiple houses)
└── 🔒 Post-auth: full member directory
```

### The Six Houses

| House | Identity | External Links |
|-------|----------|---------------|
| **Co-Living** (The Neighborhood) | Network of coliving houses, weekly brunches, SideQuest | Discord channels, house listings |
| **Events** | 3+ events/week, Luma calendar, community gatherings | lu.ma/nyc-tech, event-specific Luma pages |
| **Campus** | 111 Conselyea St, co-working, physical anchor | Tour scheduling, membership info |
| **New Liberal Arts** (The School) | Cyborgism, AI Accelerator, curriculum, classes | Class pages, curriculum links |
| **Political Club** (The Forum) | Civic engagement, policy, local government | Policy resources, civic channels |
| **Lab** (Research + Writing) | Fractal Labs, population genetics, HCI, folk computing | Research outputs, study groups |

**Leaders:** Vary per house (1-3 per house). Already defined in Fractal OS — this is a real directory, not invented for the site. Exact roster to be pulled from Fractal OS.

**House colors:** Each house needs a distinct accent color within the existing brand palette. This is a V1 design decision — doesn't need to be final branding, but needs to be directionally distinct.

---

## Discord Authorization (Stretch — Scaffolded in V1)

### What it unlocks:
- Member avatars per house (mapped from Discord channels/roles)
- Event details and Luma links (based on which channels you're in)
- Internal links and resources
- Full person directory

### How it works:
- Discord OAuth flow
- Maps Discord channel membership → house membership
- Approval to join Fractal happens in Discord (not on the site)

### V1 scope:
- Scaffold the auth flow and UI states (authenticated vs. public)
- Actual Discord API integration and data mapping is stretch/post-V1

### Open questions:
- When in the user journey does the auth prompt appear?
- Which Discord channels map to which houses? (Needs explicit mapping)
- Privacy: do members opt in to being visible, or is it default?

---

## Constraints

| Constraint | Detail |
|-----------|--------|
| **Deadline** | Friday, April 4, 2026 (5 days) |
| **Team** | Jules (human) + Claude (agent) |
| **Platform** | Web (existing Vite + React setup) |
| **Mobile-first** | Primary experience is mobile. Design and build mobile-first; desktop is the progressive enhancement. All components must work well on phone screens before considering wider layouts. |
| **Content** | Pull from Fractal OS synthesis; photos TBD |
| **Dependencies** | Leader roster from Fractal OS, house photos (need sourcing), per-house color decisions |

---

## Success Metrics

| Metric | Measurement |
|--------|------------|
| **Reduced leader burden** | Andrew and Priya stop getting "how do I get involved?" — qualitative check-in |
| **Successful wayfinding** | Visitors can find the house/person they encountered without help |
| **Member connection** | Members feel more connected to peers and to Fractal; feel "in the know" |
| **Discord conversion** | Pre-Discord visitors join the Discord after visiting the site |
| **Self-service onboarding** | Leaders can link to the site as the "second conversation" and it works |

---

## Milestones

### Milestone 1: Full Skeleton (Today — March 31)
The basic building blocks of the site, clickable and populated with real text from Fractal OS:
- [ ] Hero section at top of home page
- [ ] Six house banners on home page (with house colors, quotes)
- [ ] Clicking a house banner → individual house page
- [ ] Each house page: main banner + leaders with avatars
- [ ] Person/leader directory page
- [ ] Story page with photo gallery
- [ ] Protocol page with protocol text
- [ ] Links from each house to its external pages/groups
- [ ] Navigation between all pages
- [ ] **M1 tests:** Routes render, navigation works, house banners link to correct house pages, mobile viewport renders correctly

### Milestone 2: Content & Polish (April 1-2)
- [ ] 2-3 paragraph descriptions for each house
- [ ] Leader bios and photos finalized
- [ ] House color palettes refined
- [ ] Photo gallery curated for Story page
- [ ] Protocol manifesto written/edited
- [ ] Responsive design pass
- [ ] Pretext integration in key areas (if feasible)
- [ ] **M2 tests:** House content renders from data model, leader directory populates, photo gallery loads, responsive breakpoints behave correctly on mobile/tablet/desktop

### Milestone 3: Discord Auth Scaffold (April 3-4)
- [ ] Discord OAuth flow implemented
- [ ] Authenticated vs. public UI states
- [ ] Channel → house mapping defined
- [ ] Member avatar display per house (post-auth)
- [ ] Event details behind auth gate
- [ ] **M3 tests:** Auth flow redirects correctly, public vs. authenticated UI states toggle, deployment smoke test on fractal-nyc.com (all routes load, no 404s, mobile spot-check)

---

## Testing Strategy

Tests are **not deferred** — they are written at each milestone as the work lands.

| Stage | What to test | Type |
|-------|-------------|------|
| **Per-task** | Each task's acceptance criteria before opening PR | Unit / integration |
| **M1 (Skeleton)** | Routes render, nav works, house links resolve, mobile viewport | Integration |
| **M2 (Content)** | Data-driven content renders, leader directory populates, responsive breakpoints | Integration + visual |
| **M3 (Auth + Deploy)** | Auth flow, UI state toggling, production smoke test on fractal-nyc.com | Integration + E2E |

**Mobile-first testing:** All tests should include mobile viewport assertions (375px width minimum). Desktop is the enhancement, not the baseline.

---

## Agent Workflow: PRD Check

**Before and after every PR**, the implementing agent must re-read this PRD and verify:

1. **Before PR:** Does the planned work align with the PRD's goals, constraints, and architecture? Is mobile-first being respected? Are there any PRD updates that affect this task?
2. **After PR (in review):** Does the implementation match what the PRD specified? Are acceptance criteria met? Has anything been built that contradicts the PRD?

This is a hard convention — the PRD is the source of truth for what we're building. If an agent discovers the PRD is wrong or incomplete during this check, it should flag the discrepancy rather than silently diverge.

---

## Key Tradeoffs & Decisions

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Multi-house membership | Yes — people can be in many houses | Sorting-hat single assignment | Reflects reality; people cross-pollinate |
| Discord as gate | All engagement CTAs funnel to Discord | On-site signup/application | Discord is already the community hub; don't split the funnel |
| Content from Fractal OS | Pull existing text, don't write net-new | Commission new copy | Speed; content already exists and is accurate |
| House colors in V1 | Directional, not final branding | Wait for designer | Need visual distinction now; can refine later |
| Pretext for all text | Use Pretext for all text rendering, CSS for structural layout only | CSS for everything | Challenge ourselves to go Pretext-first; CSS handles box model/grid only |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Over-designing before it works** | Site looks cool but doesn't solve wayfinding | **Function first, polish second.** Priority: links work → pages exist → find people/houses → then aesthetics |
| Content not ready (leader photos, bios) | Houses feel empty | Use placeholders; pull what exists from Fractal OS and Discord |
| House color decisions block design | Can't build house banners | Color blocking only in V1 — solid colors, no branding deep-dives |
| Discord API complexity for auth | Stretch goal slips | Scaffold UI states first; real API integration can follow |
| Photo gallery content missing | Story page is empty | 10 existing photos in `public/images/` + 11 in `attached_assets/`; curate from what exists |
| Scope creep into immersion | Text-heavy, design-heavy pages that don't solve the core problem | This is a wayfinding site, not a content site. Links to the right places > beautiful prose |
| 5-day timeline is tight | Features get cut | Milestones are prioritized; Discord auth is explicitly stretch |

---

## Open Questions

1. ~~**Pretext:**~~ Resolved — Pretext-first for all text rendering. Hero uses Sierpinski carpet photo prototype (`/Users/jules/Documents/dev/pretext/pages/demos/sierpinski-carpet-photo-responsive.html`) over NYC skyline background.
2. ~~**Story page photos:**~~ Resolved — Photos exist in `public/images/` (10) + `attached_assets/` (11) + design refs at `/Users/jules/Documents/Artifacts/raw/software/fractal-nyc-design/raw photos/` (17).
3. **Discord auth UX:** When does the login prompt appear in the user journey?
4. **Privacy:** Do Discord members opt in to being visible on house pages, or is visibility default?
5. **House color palette:** Who decides the per-house accent colors? Are there existing associations?
6. **Fractal OS link:** How prominent should the Fractal OS connection be? Just on the protocol page, or threaded throughout?

---

## Appendix: Research

- **What Fractal is:** `fractal-os/artifacts/research/2026-03-28-fractal-nyc-website-synthesis.md`
- **Pretext capabilities:** `research/01-pretext-capabilities.md`
- **Existing site source:** `artifacts/fractal-nyc/src/`
- **Brand guidelines:** `artifacts/fractal-nyc/src/blueprints/BRAND-DESIGN.md`
- **UX design lens:** `fractal-os/artifacts/research/good-design-questions.md`

### Design References

All located at `/Users/jules/Documents/Artifacts/raw/software/fractal-nyc-design/`:

| Folder | Contents | Purpose |
|--------|----------|---------|
| `midjourney/` | 10 concept art images (WEBP, JPG) | Concept art for site visual direction |
| `mood references/` | 20+ images (PNG, JPG, AVIF, WEBP) | Mood board / vibe references |
| `pottermore UX/` | 9 annotated screenshots | **UX and interface reference** — house pages, leader profiles, member sections, file archives |
| `raw photos/` | 17 photos (JPG, HEIC, WEBP, AVIF) | Real Fractal NYC photos for Story page and site imagery |

**Key Pottermore UX references:**
- `house page - quote and leader avatar banners.png` — banner layout for house pages
- `house page - fellow house members section.png` — member grid (maps to post-auth Discord members)
- `leader profile section.png` / `leader profile page and file search archive.png` — leader card design
- `ravenclaw house overview section.png` — house overview layout reference
- `fellow wizards section - "profile page".png` — member profile pattern
- `house starter pack section.png` — onboarding content per house
- `user profile page - banner section.png` — profile banner pattern

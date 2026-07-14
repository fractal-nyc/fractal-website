// ---------------------------------------------------------------------------
// Fractal NYC — House data model
// Shared types and data for all 6 houses (sectors) and key people.
// Source of truth: fractal-os/notes/2026-03-28-fractal-nyc-website-synthesis.md
// ---------------------------------------------------------------------------

interface ExternalLink {
  label: string;
  url: string;
}

interface PersonSocials {
  twitter?: string; // handle without @
  substack?: string; // full URL
  website?: string; // personal/project URL
}

export interface Person {
  id: string;
  name: string;
  role: string;
  houses: string[]; // house IDs this person leads or contributes to
  socials?: PersonSocials;
  avatar?: string; // URL — optional for now
  bio?: string;
}

interface HousePalette {
  /** Lighter color in the pair — typically the surface bg on the house page. */
  light: string;
  /** Deeper color in the pair — typically the accent / letter color. */
  deep: string;
}

export interface House {
  id: string;
  name: string;
  displayName?: string; // user-facing label when different from name
  subtitle: string; // "The Neighborhood", "The School", etc.
  slug: string; // URL slug
  route: string; // full route path
  /**
   * The slug used in this house's CSS token names
   * (`--color-house-<tokenSlug>-{light,deep}` in src/index.css).
   *
   * Declared explicitly rather than derived. It used to be computed from the
   * display name, which silently broke the moment a display name stopped
   * matching its token — "Fractal Co-Living" slugifies to `fractal-co-living`,
   * not `coliving`. The `house-tokens-sync` test reads this field, so a token
   * rename that forgets to update it fails loudly instead of quietly passing.
   */
  tokenSlug: string;
  /**
   * Canonical light/deep color pair. FRAC-24 single source of truth.
   * The pair is the unit; which member is bg vs. accent is a per-surface
   * decision. Most houses use `light` as page bg and `deep` as accent.
   * The Political Club (forum) and Liberal Arts (school) invert this:
   * their page bg is `deep` and the lighter color is the accent.
   */
  palette: HousePalette;
  tagline: string; // one-line quote/tagline
  description: string; // 2-3 paragraphs from Fractal OS synthesis
  leaders: string[]; // person IDs
  externalLinks: ExternalLink[];
  // ---------------------------------------------------------------------------
  // Per-surface visibility flags (FRAC-32 — single source of truth)
  // ---------------------------------------------------------------------------
  // Each flag hides the house from a specific visual layer without removing
  // the underlying data or route. Direct routes always remain reachable.
  // `undefined` is treated as `false` (i.e. visible) everywhere.
  hideFromNavbar?: boolean;
  hideFromBanners?: boolean;
  // The OctahedronHero treats absence-of-banner-image as the hide signal for
  // a face, so this flag is informational rather than load-bearing today.
  // Kept on the model for future use and consistency.
  hideFromOctahedronFaces?: boolean;
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export const PEOPLE: Person[] = [
  {
    id: "andrew",
    name: "Andrew Rose",
    role: "Founder",
    houses: ["neighborhood", "events", "campus", "school", "forum", "lab"],
    socials: {
      twitter: "andrewrosenyc",
      substack: "https://andrewjrose.substack.com/",
    },
  },
  {
    id: "priya",
    name: "Priya",
    role: "Co-founder",
    houses: ["neighborhood", "school"],
    socials: {
      twitter: "Prigoose",
      substack: "https://prigoose.substack.com/",
    },
  },
  {
    id: "liam",
    name: "Liam",
    role: "Engineering & Infrastructure",
    houses: ["events", "campus", "forum"],
    socials: {
      twitter: "liamdanielduffy",
    },
  },
  {
    id: "ivan",
    name: "Ivan Vendrov",
    role: "Advisor, Fractal Labs Co-founder",
    houses: ["lab"],
    socials: {
      twitter: "IvanVendrov",
      substack: "https://nothinghuman.substack.com",
    },
  },
  {
    id: "daniel",
    name: "Daniel Golliher",
    role: "Manhattan Institute Fellow",
    houses: ["forum"],
    socials: {
      twitter: "danielgolliher",
      website: "https://www.maximumnewyork.com/",
    },
  },
  {
    id: "david",
    name: "David",
    role: "Cloud & Distributed Systems",
    houses: ["school"],
  },
  {
    id: "tyler",
    name: "Tyler Alterman",
    role: "Writer & Contributor",
    houses: ["school", "lab"],
    socials: {
      twitter: "TylerAlterman",
      substack: "https://psychofauna.com/",
    },
  },
  {
    id: "crystal",
    name: "Crystal",
    role: "Content",
    houses: ["lab"],
    socials: {
      twitter: "crystalxduan",
    },
  },
  {
    id: "ulysses",
    name: "Ulysses Chuang",
    role: "Alexander Technique, Merlin's Place",
    houses: ["neighborhood"],
  },
  {
    id: "hailey",
    name: "Hailey",
    role: "Content / Interviews",
    houses: ["lab"],
  },
  {
    id: "christine",
    name: "Christine",
    role: "Community Guide",
    houses: ["lab"],
    socials: {
      twitter: "christineist",
    },
  },
  {
    id: "joce",
    name: "Joce Orante",
    role: "Writer",
    houses: ["lab"],
    socials: {
      substack: "https://joceorante.substack.com/",
    },
  },
  {
    id: "pav",
    name: "Pav",
    role: "Writer",
    houses: ["lab"],
    socials: {
      substack: "https://chaosophia.substack.com/",
    },
  },
  {
    id: "keesh",
    name: "Keesh Lauria",
    role: "Fractal University Teacher",
    houses: ["school"],
    socials: {
      substack: "https://indiancooking.substack.com/",
    },
  },
  {
    id: "julianna",
    name: "Julianna Roberts",
    role: "Creative Director",
    houses: ["events", "lab"],
    socials: {
      twitter: "jannaaar",
      website: "https://parallax.haus",
    },
  },
];

// ---------------------------------------------------------------------------
// Houses
// ---------------------------------------------------------------------------

export const HOUSES: House[] = [
  // 1. Fractal Co-Living — The Neighborhood.
  // Formerly the "Visit" house. Same neighborhood content and the same olive
  // pair, renamed to what it actually is; `deep` moved #4A5A30 → #4A5528 to
  // match the map-pin / callout border color the Co-Living page draws with.
  {
    id: "coliving",
    name: "Fractal Co-Living",
    displayName: "Fractal Co-Living",
    subtitle: "Co-Living",
    slug: "co-living",
    route: "/co-living",
     tokenSlug: "coliving",
    palette: { light: "#889460", deep: "#4A5528" },
    tagline: "Live near your friends.",
    description:
      "The original Fractal. Before the tech, before the accelerator — Fractal was a network of coliving houses in Brooklyn. That's still the bedrock. McKibbin Lofts in Bushwick is the original hub, about 70 people across multiple apartments including 1G, the communal third space. Bebop and Fractal IV sit in Fort Greene, Rectangoob holds it down in Bed-Stuy above the Bedford-Nostrand G, and The Nook rounds things out at McKibbin 4S. Andrew and Priya's place in Fort Greene is forming a pocket neighborhood with Bebop — the houses are starting to cluster.\n\nCommunity life runs on weekly Sunday brunches (potluck at the Campus), SideQuest coworking sessions every Sunday (37+ and counting), and the Co-op Crawl — Brooklyn community house tours that start right here. There's art installations, ecstatic dance, singing circles, parkour in the park, EDM production meetups, Groupmuse classical concerts. The neighborhood is the social fabric that everything else is built on.\n\nFractal Toronto appeared spontaneously. The protocol is spreading.",
    leaders: ["priya", "andrew"],
    externalLinks: [],
  },

  // 2. Events
  {
    id: "events",
    name: "Events",
    subtitle: "Events",
    slug: "events",
    route: "/events",
     tokenSlug: "events",
    palette: { light: "#D4857A", deep: "#C13B2A" },
    tagline: "Want to host?",
    description:
      "Three-plus events every week, all running out of the Campus. Wednesday AI Hacks is the weekly anchor — show up, hack on something real, ship it. Claude Code speedruns and cyborg setup sessions get people hands-on with the tools. Hackathons range from community jams to corporate builds. Demo days showcase what each accelerator cohort shipped. Lightning talks, workshop series, EDM production meetups.\n\nThe flagship is the Singularity Conference — invite-only, 30 to 50 people, the sharpest minds in the network sitting in a room together for a day. No panels, no sponsors, no fluff. Just ideas that matter, argued by people who are actually building.\n\nSideQuest coworking every Sunday. Community brunches. If you're in Brooklyn and you want to be around people who are actually doing things, check the Luma calendar and show up.",
    leaders: ["andrew", "liam"],
    externalLinks: [
      { label: "Events Calendar", url: "https://lu.ma/nyc-tech" },
    ],
  },

  // 3. Campus
  {
    id: "campus",
    name: "The Campus",
    subtitle: "Campus",
    slug: "campus",
    route: "/campus",
     tokenSlug: "campus",
    palette: { light: "#2E6B4A", deep: "#1A3A2E" },
    tagline: "Want to work together?",
    description:
      "111 Conselyea St, Floor 2, Brooklyn, NY 11211 — right at the L/G train intersection in Williamsburg. 4,200 square feet of interior space plus a 5,000-square-foot rooftop. Original factory wood, industrial character, the kind of building that still has its bones. About 48 co-working members call it home base.\n\nThe Campus is the physical anchor for everything Fractal does. Classes, hackathons, demo days, study groups, Sunday coworking, community brunches — it all happens here. Joe runs full-time ops keeping the space alive. The rooftop turns into an event venue when the weather cooperates.\n\nThis isn't a WeWork. It's a clubhouse for people building the future, and it feels like one — messy whiteboards, half-finished projects on tables, the smell of coffee at 9 AM and pizza at midnight. If you want a desk and a community, become a member.",
    leaders: ["andrew", "liam"],
    externalLinks: [
      {
        label: "Visit Us",
        url: "https://maps.google.com/?q=111+Conselyea+St+Brooklyn+NY+11211",
      },
    ],
  },

  // 4. New Liberal Arts — The School
  //
  // PAGE RETIRED: the /education page was deleted and NOT redirected — the route
  // 404s. `route` below is therefore dead as a destination, but the house, its
  // `house-education-{light,deep}` tokens, and its FractalU navbar row all stay
  // live (the Education house still colors the diagram's University node and the
  // FractalU row), so the page is launch-ready if it ever comes back.
  {
    id: "school",
    name: "Education",
    displayName: "Education",
    subtitle: "Education",
    slug: "education",
    route: "/education",
     tokenSlug: "education",
    palette: { light: "#C41E20", deep: "#5C1010" },
    tagline: "Want to learn?",
    description:
      "The new liberal arts — cyborgism, tech, entrepreneurship, rhetoric, civics. Andrew designed a year-long program that actually makes sense for right now: Phase 1 is the Finishing School, reshaping habits, reading 12 books, memorizing the Constitution, killing phone addiction. Phase 2 is government and law plus software engineering — 'You're a wizard now, Harry.' Phase 3 is launch and accelerator. The pedagogy is Montessori-derived: environments that liberate the spirit and encourage experimentation, exercise, responsibility, and real work.\n\nThe AI Accelerator is the flagship — a 3-month, $15k, 60-hours-a-week accelerator with 100% placement rate. Fractal University runs community classes: EDM production, coding, civics, LLMs, population genetics, HCI — over 1,000 students across 8 or 9 semesters and counting. There's also the Claude Code course and the Unblocked coaching series.\n\nThe teaching innovation that ties it all together: the config IS the lesson. Instead of lecturing about a concept, you package it as a downloadable skill that students install into their harness and immediately apply to their own project. The skill teaches by doing, not by explaining.",
    leaders: ["andrew", "priya", "david"],
    externalLinks: [],
  },

  // 5. Political Club — The Forum
  //
  // PAGE RETIRED: the /political-club page was deleted and NOT redirected — the
  // route 404s, so `route` below is dead as a destination. Everything else stays:
  // the house, its `house-political-club-{light,deep}` tokens, and its octahedron
  // face (a decorative face, not a nav destination). Launch-ready if it returns.
  {
    id: "forum",
    name: "The Forum",
    displayName: "Political Club",
    subtitle: "Political Club",
    slug: "political-club",
    route: "/political-club",
     tokenSlug: "political-club",
    palette: { light: "#C83858", deep: "#6E1830" },
    tagline: "Want to change things?",
    description:
      "Explicitly political. Andrew's word choice is intentional: 'You want people to know that it's explicitly political. It is actually pursuing explicit political change.' This isn't a debate club. This is a group of people who think New York City governance can be dramatically better and are doing something about it.\n\nDaniel Golliher is the anchor — Manhattan Institute fellow, founder of Maximum New York, teaches NYC government and law at the Campus. The MI Skunkworks proposal is a formal pitch for an embedded AI policy team at the Manhattan Institute: 'Think Xerox PARC. Think the Manhattan Project.' Civic hacking classes turn policy ideas into working tools. The #local-government Discord channel is where active discussion of NYC urban policy happens daily. They've been demoing Claude Code to government agencies.\n\nDaniel's intellectual frame is 'The Vertical Republic' — NYC going vertical technologically and individually. The Forum is where that vision meets action.",
    leaders: ["daniel", "andrew", "liam"],
    externalLinks: [],
    // FRAC-161: Political Club is hidden from the navbar and banner grid.
    // The /political-club route remains live, and the octahedron keeps an
    // unpopulated face vertex for `forum` (see OctahedronHero).
    hideFromNavbar: true,
    hideFromBanners: true,
  },

  // 6. Fractal Accelerator — the flagship class.
  // The 7th house and the odd one out: it does not render a themed Fractal NYC
  // page, it renders the separate Fractal Accelerator brand (burgundy / white /
  // warm cream — see fractal-os BRAND/fractalaccelerator.md). The pair below
  // still themes its nav row and octahedron face like any other house.
  {
    id: "accelerator",
    name: "Fractal Accelerator",
    displayName: "Fractal Accelerator",
    subtitle: "Accelerator",
    slug: "accelerator",
    route: "/accelerator",
     tokenSlug: "accelerator",
    palette: { light: "#8E2A1E", deep: "#641E28" },
    tagline: "Turn 6 weeks into years of acceleration.",
    description:
      "A hands-on, six-week program for ambitious professionals who want to master AI. Consultants, analysts, and engineers learn to make AI work while they sleep, build without limits, and join a community of builders. Saturdays on Campus, applied practice during the week, compounding skills each week.",
    leaders: ["andrew"],
    externalLinks: [
      { label: "Apply", url: "https://www.fractalaccelerator.com/apply" },
    ],
  },

  // 7. Library — Research + Writing (formerly "Publications")
  {
    id: "library",
    name: "Library",
    displayName: "Library",
    subtitle: "Library",
    slug: "library",
    route: "/library",
     tokenSlug: "library",
    palette: { light: "#E870A0", deep: "#C44878" },
    tagline: "Want to think, build, publish?",
    description:
      "Fractal Labs is co-founded with Ivan Vendrov — ex-DeepMind, ex-Anthropic, ex-Midjourney. The thesis: build a research institute doing 'gain of function research on the golden age virus,' studying how institutional knowledge spreads via AI agents. The target is a $10-20M lab launching May 2026. This is where Fractal's intellectual backbone gets built.\n\nThe research side runs deep: a population genetics study group reading NIH papers weekly at the Campus, an HCI club working through McLuhan and Bret Victor, the Folk Computer project exploring embodied computing, and a fast.ai deep learning study group. Ivan's contributions — the Tyranny of the Marginal User, the Cooperation Machine, Metrics as Cowardice — form the theoretical framework that Fractal builds on.\n\nThe publishing arm keeps the ideas flowing outward. Andrew's Substack (65 posts across 6 years, the founding documents), Ivan's 'Nothing Human' (the theoretical backbone), the Unblocked coaching podcast, Crystal handling tweets, video, and audio. The core belief: a group of friends can write a single markdown file and influence millions of lives overnight.",
    leaders: ["ivan", "andrew", "crystal"],
    externalLinks: [],
  },
];

// ---------------------------------------------------------------------------
// Non-house section colors (FRAC-204)
// ---------------------------------------------------------------------------
// Some section pages aren't Houses but still carry a canonical light/deep color
// pair — structurally identical to a HousePalette, just not in HOUSES. This is
// the ONE place their real hex lives (the `--color-section-*-{light,deep}`
// tokens in src/index.css mirror it; the section-tokens-sync test keeps them in
// lockstep). Like houses, both consumers that need a real hex — three.js
// (OctahedronHero) and JS string colors (Navbar) — read from here, not a CSS
// var().
//
// People: the PAGE IS RETIRED — /people was deleted and NOT redirected, so the
// route 404s. The section survives here, fully tokenized and launch-ready: its
// `section-people-{light,deep}` tokens and its decorative octahedron face both
// still read from this record.
//
// Story no longer has a page of its own — it folded into Home — but it keeps
// its identity color, which now themes the Story block ON the home page: the
// "S" sector letter, the fractal diagram, and the "Curious about Fractal?"
// callout. It is a {light, deep} GOLD PAIR, not a single accent: the light gold
// (#D4BA58) is decoration-only (it fails WCAG as small text on cream), and the
// deep gold (#a08a2e) is the one that may carry text. The Venues node on the
// home diagram and the Merlin's Place nav row both take the deep gold.
//
// When People had a page it read as a CREAM page (charcoal text) rather than a
// color flood, using `deep` as its accent. It keeps the pair regardless, so it
// can flood — or come back at all — without a token change.
export const SECTIONS = {
  people: { light: "#C49040", deep: "#B65D19" },
  story: { light: "#D4BA58", deep: "#a08a2e" },
} as const;

/**
 * "Enter the Fractal" — the member portal. It has no page, so it carries a
 * nav-only identity color rather than a section entry. Mirrors
 * `--color-nav-portal` in src/index.css.
 *
 * Its navbar row is currently HIDDEN (see the comment in NAV_GROUPS,
 * src/components/layout/Navbar.tsx) — a permanently-disabled row is worse than
 * no row. This export and the token are kept deliberately, unreferenced, so
 * restoring the row when the portal ships is a one-liner and needs no new color.
 */
export const NAV_PORTAL_COLOR = "#5B4A8A";

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Visibility filters (FRAC-32 — derived from per-house flags)
// ---------------------------------------------------------------------------
// Each visual layer derives its visible set from the per-house flags on the
// House model. To hide a house from a surface, set the corresponding flag on
// the House entry rather than maintaining a parallel list here. Direct routes
// to hidden houses remain reachable.

/** Route paths hidden from the navbar — used to filter the navbar's sectionLinks. */
export const NAVBAR_HIDDEN_ROUTES: Set<string> = new Set(
  HOUSES.filter((h) => h.hideFromNavbar).map((h) => h.route),
);

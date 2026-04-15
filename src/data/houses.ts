// ---------------------------------------------------------------------------
// Fractal NYC — House data model
// Shared types and data for all 6 houses (sectors) and key people.
// Source of truth: fractal-os/notes/2026-03-28-fractal-nyc-website-synthesis.md
// ---------------------------------------------------------------------------

export interface ExternalLink {
  label: string;
  url: string;
}

export interface PersonSocials {
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

export interface House {
  id: string;
  name: string;
  displayName?: string; // user-facing label when different from name
  subtitle: string; // "The Neighborhood", "The School", etc.
  slug: string; // URL slug
  route: string; // full route path
  color: string; // hex accent color
  tagline: string; // one-line quote/tagline
  description: string; // 2-3 paragraphs from Fractal OS synthesis
  leaders: string[]; // person IDs
  externalLinks: ExternalLink[];
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
    avatar: "/images/julianna.png",
  },
];

// ---------------------------------------------------------------------------
// Houses
// ---------------------------------------------------------------------------

export const HOUSES: House[] = [
  // 1. Co-Living — The Neighborhood
  {
    id: "neighborhood",
    name: "Visit",
    displayName: "Visit",
    subtitle: "Visit",
    slug: "neighborhood",
    route: "/neighborhood",
    color: "#8B7355",
    tagline: "Want to live here?",
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
    color: "#E07A5F",
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
    color: "#457B9D",
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
  {
    id: "school",
    name: "Education",
    displayName: "Education",
    subtitle: "Education",
    slug: "new-liberal-arts",
    route: "/new-liberal-arts",
    color: "#1D3557",
    tagline: "Want to learn?",
    description:
      "The new liberal arts — cyborgism, tech, entrepreneurship, rhetoric, civics. Andrew designed a year-long program that actually makes sense for right now: Phase 1 is the Finishing School, reshaping habits, reading 12 books, memorizing the Constitution, killing phone addiction. Phase 2 is government and law plus software engineering — 'You're a wizard now, Harry.' Phase 3 is launch and accelerator. The pedagogy is Montessori-derived: environments that liberate the spirit and encourage experimentation, exercise, responsibility, and real work.\n\nThe AI Accelerator is the flagship — a 3-month, $15k, 60-hours-a-week accelerator with 100% placement rate. Fractal University runs community classes: EDM production, coding, civics, LLMs, population genetics, HCI — over 1,000 students across 8 or 9 semesters and counting. There's also the Claude Code course and the Unblocked coaching series.\n\nThe teaching innovation that ties it all together: the config IS the lesson. Instead of lecturing about a concept, you package it as a downloadable skill that students install into their harness and immediately apply to their own project. The skill teaches by doing, not by explaining.",
    leaders: ["andrew", "priya", "david"],
    externalLinks: [],
  },

  // 5. Political Club — The Forum
  {
    id: "forum",
    name: "The Forum",
    displayName: "Political Club",
    subtitle: "Political Club",
    slug: "political-club",
    route: "/political-club",
    color: "#CC2936",
    tagline: "Want to change things?",
    description:
      "Explicitly political. Andrew's word choice is intentional: 'You want people to know that it's explicitly political. It is actually pursuing explicit political change.' This isn't a debate club. This is a group of people who think New York City governance can be dramatically better and are doing something about it.\n\nDaniel Golliher is the anchor — Manhattan Institute fellow, founder of Maximum New York, teaches NYC government and law at the Campus. The MI Skunkworks proposal is a formal pitch for an embedded AI policy team at the Manhattan Institute: 'Think Xerox PARC. Think the Manhattan Project.' Civic hacking classes turn policy ideas into working tools. The #local-government Discord channel is where active discussion of NYC urban policy happens daily. They've been demoing Claude Code to government agencies.\n\nDaniel's intellectual frame is 'The Vertical Republic' — NYC going vertical technologically and individually. The Forum is where that vision meets action.",
    leaders: ["daniel", "andrew", "liam"],
    externalLinks: [],
  },

  // 6. Lab — Research + Writing
  {
    id: "lab",
    name: "Publications",
    displayName: "Publications",
    subtitle: "Publications",
    slug: "lab",
    route: "/lab",
    color: "#6B4C9A",
    tagline: "Want to think, build, publish?",
    description:
      "Fractal Labs is co-founded with Ivan Vendrov — ex-DeepMind, ex-Anthropic, ex-Midjourney. The thesis: build a research institute doing 'gain of function research on the golden age virus,' studying how institutional knowledge spreads via AI agents. The target is a $10-20M lab launching May 2026. This is where Fractal's intellectual backbone gets built.\n\nThe research side runs deep: a population genetics study group reading NIH papers weekly at the Campus, an HCI club working through McLuhan and Bret Victor, the Folk Computer project exploring embodied computing, and a fast.ai deep learning study group. Ivan's contributions — the Tyranny of the Marginal User, the Cooperation Machine, Metrics as Cowardice — form the theoretical framework that Fractal builds on.\n\nThe publishing arm keeps the ideas flowing outward. Andrew's Substack (65 posts across 6 years, the founding documents), Ivan's 'Nothing Human' (the theoretical backbone), the Unblocked coaching podcast, Crystal handling tweets, video, and audio. The core belief: a group of friends can write a single markdown file and influence millions of lives overnight.",
    leaders: ["ivan", "andrew", "crystal"],
    externalLinks: [],
  },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Visibility filters (FRAC-161)
// ---------------------------------------------------------------------------
// The Political Club house is hidden from nav / banner grid without removing
// the underlying data entry or route. To restore, remove the id from this set.
export const HIDDEN_HOUSE_IDS = new Set<string>(["forum"]);

/** Houses visible in the nav/banner UI. Direct routes to hidden houses still work. */
export const VISIBLE_HOUSES: House[] = HOUSES.filter(
  (h) => !HIDDEN_HOUSE_IDS.has(h.id),
);

/** Look up a house by its URL slug. */
export function getHouseBySlug(slug: string): House | undefined {
  return HOUSES.find((h) => h.slug === slug);
}

/** Return every person associated with a given house. */
export function getPeopleByHouse(houseId: string): Person[] {
  return PEOPLE.filter((p) => p.houses.includes(houseId));
}

/** Return every house a given person belongs to. */
export function getHousesByPerson(personId: string): House[] {
  const person = PEOPLE.find((p) => p.id === personId);
  if (!person) return [];
  return HOUSES.filter((h) => person.houses.includes(h.id));
}

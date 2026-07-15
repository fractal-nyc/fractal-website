// ---------------------------------------------------------------------------
// Fractal NYC — Lab document data model
// Research & Writing archive for the Lab house.
// Source of truth: fractal-os/notes/2026-03-28-fractal-nyc-website-synthesis.md
// ---------------------------------------------------------------------------

import { PEOPLE } from "@/data/houses";

export type DocumentCategory =
  | "substack"
  | "essay"
  | "podcast"
  | "talk"
  | "video"
  | "social"
  | "project";

/**
 * A document in the Lab archive (essay, podcast, talk, video, etc.).
 *
 * `authors` is a non-empty list of person IDs from `PEOPLE`, used for linking /
 * global search (resolved via `formatAuthors`). The visible card byline uses the
 * verbatim `byline` display string instead, since PEOPLE names are short/partial.
 */
export interface PublicationDocument {
  id: string;
  title: string;
  /** Person IDs from PEOPLE. Non-empty; `authors[0]` is primary / credit order.
   *  Used for linking / global search — NOT for the visible byline. */
  authors: string[];
  /** Verbatim display byline as shown in the design (e.g. "Ulysses Chuang and
   *  Zu Shi"). Rendered on the card; decoupled from `authors` on purpose since
   *  PEOPLE names are short/partial and multi-author bylines don't resolve. */
  byline: string;
  description: string; // 1-2 sentence summary
  url: string;
  category: DocumentCategory;
  tags: string[]; // for FRAC-48 filtering
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const PUBLICATION_DOCUMENTS: PublicationDocument[] = [
  // ---- Featured ----
  {
    id: "how-to-live-near-friends",
    title: "How to Live Near Your Friends",
    authors: ["priya"],
    byline: "Priya Rose",
    description:
      "People tell me that their friends talk about living near each other too. And yet, almost no one I've talked to has successfully clustered their friend group. So today I'm going to show you how to.",
    url: "https://prigoose.substack.com/p/how-to-live-near-your-friends",
    category: "essay",
    tags: ["community", "coliving", "neighborhood", "social"],
    featured: true,
  },
  {
    id: "living-room-third-space",
    title: "How to Turn Your Living Room into a Third Space",
    // Byline in the design is "Ulysses Chuang and Zu Shi"; Zu Shi has no PEOPLE
    // entry, so the primary (existing) author is credited.
    authors: ["ulysses"],
    byline: "Ulysses Chuang and Zu Shi",
    description:
      "On how Merlin's Place started, and how you can turn your living room into a third space.",
    url: "https://supernuclear.substack.com/p/case-study-merlins-place",
    category: "essay",
    tags: ["neighborhood", "coliving", "community"],
    featured: true,
  },
  {
    id: "how-to-start-school-friends",
    title: "How to Start a School With Your Friends",
    authors: ["priya"],
    byline: "Priya Rose",
    description:
      "FractalU is a 'school' for adults, taught from living rooms in New York City. We've run over 100 classes and taught thousands of students. Classes meet weekly and are held on evenings and weekends, since most of our students and teachers are working professionals.",
    url: "https://prigoose.substack.com/p/how-to-start-a-university",
    category: "essay",
    tags: ["education", "community", "teaching", "university"],
    featured: true,
  },
  {
    id: "marry-your-city",
    title: "Marry Your City",
    authors: ["daniel"],
    byline: "Daniel Golliher",
    description:
      "The benefits of a good marriage cannot be overstated. Where you choose to live should be regarded similarly: you should do it deliberately, and you should commit to a place.",
    url: "https://maximumnewyork.com/p/marry-your-city",
    category: "essay",
    tags: ["nyc", "civic", "neighborhood", "community"],
    featured: true,
  },

  // ---- Regular documents ----
  {
    id: "take-some-responsibility",
    title: "Take Some Responsibility!",
    authors: ["andrew"],
    byline: "Andrew Rose",
    description:
      "Andrew on taking responsibility for the places, people, and communities around you.",
    url: "https://youtu.be/DoyJmUNWBMI?si=1J9Srbot_YgsHoGw",
    category: "podcast",
    tags: ["community", "leadership", "podcast"],
  },
  {
    id: "fooming-the-fractal",
    title: "Fooming the Fractal",
    authors: ["tyler"],
    byline: "Tyler Alterman",
    description:
      "Fractal is building a replicable microsociety: a model for vibrant, relationship-driven community life that integrates housing, education, the arts, technological innovation, and economic development. Our goal is to address modern crises of loneliness and disconnection by creating enduring ecosystems of human flourishing.",
    url: "https://youtube.com/watch?v=JWLRizY6G-0",
    category: "talk",
    tags: ["community", "microsociety", "talks"],
  },
  {
    id: "network-state-conference",
    title: "The Network State Conference Talk",
    authors: ["andrew", "priya"],
    byline: "Andrew and Priya Rose",
    description:
      "Andrew and Priya's conference talk on Fractal: what it takes to build a real community in the physical world.",
    url: "https://youtu.be/a3vhvAg-8yQ?si=BVYu1JZ0R098EtUT",
    category: "talk",
    tags: ["community", "coliving", "neighborhood", "talks"],
  },
  {
    id: "reversing-centrifuge",
    title: "Reversing the Centrifuge of Modernity",
    authors: ["andrew"],
    byline: "Andrew Rose",
    description:
      "With the right collaborators, you can do anything, and joyfully, too! The challenge is assembling a good team. Not just talents, but personalities that fit together.",
    url: "https://andrewjrose.substack.com/p/reversing-the-centrifuge-of-modernity",
    category: "essay",
    tags: ["community", "founding", "modernity", "neighborhood"],
  },
  {
    id: "nyc-is-affordable-1",
    title: "New York City is Affordable (Part 1)",
    authors: ["daniel"],
    byline: "Daniel Golliher",
    description:
      "Making the case that you can afford to live in New York — and how to think about the real numbers.",
    url: "https://youtu.be/EQyT8sNWYQ0?si=xIu-_E2ierZJhIma",
    // Design category label "Video Essay" → nearest enum value "video".
    category: "video",
    tags: ["nyc", "affordability"],
  },
  {
    id: "nyc-is-affordable-2",
    title: "New York City is Affordable (Part 2)",
    authors: ["daniel"],
    byline: "Daniel Golliher",
    description:
      "Part two: practical tactics for making the city affordable in practice.",
    url: "https://youtu.be/SnAKne5OmG8?si=u13IViKoKWSQ9bqc",
    // Design category label "Video Essay" → nearest enum value "video".
    category: "video",
    tags: ["nyc", "affordability"],
  },
  {
    id: "tylers-guide-nyc",
    title: "Tyler's Guide to Falling in Love with NYC",
    authors: ["tyler"],
    byline: "Tyler Alterman",
    description:
      "A field guide to making New York feel like home — the places, people, and practices that make the city easy to love.",
    url: "https://tyleralterman.notion.site/Tyler-s-guide-to-falling-in-love-with-NYC-dc371f0f0f284f0bab2ca74b671c80e4",
    category: "essay",
    tags: ["nyc", "community", "neighborhood"],
  },
  {
    id: "social-fabric-nyc",
    title: "Social Fabric NYC",
    authors: ["liam"],
    byline: "Liam Rosen",
    description:
      "An evolving directory of NYC's portals to connection — event hosts, third spaces, and communities sorted by interest and vibe.",
    url: "http://socialfabric.nyc",
    category: "project",
    tags: ["nyc", "directory", "community"],
  },
  {
    id: "christines-guide-tpot",
    title: "Christine's Guide to TPOT",
    authors: ["christine"],
    byline: "Christine",
    description:
      "A primer on “this part of Twitter” — how to find your people and make real friends on the internet.",
    url: "https://docs.google.com/document/d/1Bd3PfKDL9pOM7YoxGbRBwO_qOWh6B7u5170Xw8VyK6s/edit",
    category: "essay",
    tags: ["tpot", "community", "social"],
  },
  {
    id: "fractal-university-canon",
    title: "Introducing The Fractal University Canon",
    authors: ["andrew"],
    byline: "Andrew Rose",
    description:
      "The orientation guide behind FractalU: a shared etiquette and a canon of essays on science, the frontier, and the call to do great work.",
    url: "https://ajr.fyi/files/fractal-canon.pdf",
    category: "essay",
    tags: ["education", "canon", "university", "culture"],
  },
  {
    id: "gardener-leader",
    title: "The Gardener Leader",
    authors: ["pav"],
    byline: "Pavitthra Pandurangan",
    description:
      "On people around whom things bloom: cultivating communities as gardens rather than running them as factories.",
    url: "https://chaosophia.substack.com/p/the-gardener-leader",
    category: "essay",
    tags: ["leadership", "community"],
  },
  {
    id: "neighborhood-stroll",
    title: "a neighborhood stroll",
    authors: ["joce"],
    byline: "Joce Orante",
    description:
      "Seven hours of wandering between friends, family, and neighbors — a portrait of what living near your people actually feels like.",
    url: "https://joceorante.substack.com/p/a-neighborhood-stroll",
    category: "essay",
    tags: ["neighborhood", "reflection"],
  },
  {
    id: "scaling-coliving",
    title: "Scaling Coliving and Slouching Towards Utopia",
    authors: ["priya"],
    byline: "Priya Rose",
    description:
      "Priya on scaling coliving, building Fractal, and slouching towards utopia.",
    url: "https://open.spotify.com/episode/17rMg7X6JafICSrxkFaCAH",
    category: "podcast",
    tags: ["coliving", "founding", "community", "podcast"],
  },
  {
    id: "friends-community-isolation",
    title: "Friends, Community, Isolation & Fearlessness",
    authors: ["andrew"],
    byline: "Andrew Rose",
    description:
      "Andrew on friendship, community, modern isolation, and living fearlessly.",
    url: "https://podcasters.spotify.com/pod/show/a-o-o/episodes/019---Andrew-Rose-on-Friends--Community--Isolation---Fearlessness-e24vb4n",
    category: "podcast",
    tags: ["community", "fearlessness", "social", "podcast"],
  },
  {
    id: "ea-garden-of-ends",
    title: "Effective Altruism in the Garden of Ends",
    authors: ["tyler"],
    byline: "Tyler Alterman",
    description:
      "This truly isn't a new idea. Mutual dedication to one another's ends seems like a thing commonly present in religious and ethnic communities. But it seems quite uncommon to the demographic of secular idealists, like me.",
    url: "https://forum.effectivealtruism.org/posts/AjxqsDmhGiW9g8ju6/effective-altruism-in-the-garden-of-ends",
    category: "essay",
    tags: ["altruism", "philosophy", "community", "social"],
  },
  {
    id: "ebr-interview",
    title: "An Interview with Elizabeth Barlow Rogers, Founder of the Central Park Conservancy",
    authors: ["hailey"],
    byline: "Hailey Phillips",
    description:
      "A conversation with the founder of the Central Park Conservancy on stewarding one of the world's great public spaces.",
    url: "https://youtu.be/7Wyl8eUstdI?si=ltPh5BhYhMOrqJZM",
    category: "podcast",
    tags: ["nyc", "interview", "civic"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return all featured documents. */
export function getFeaturedDocuments(): PublicationDocument[] {
  return PUBLICATION_DOCUMENTS.filter((d) => d.featured);
}

/** Return all non-featured documents. */
export function getRegularDocuments(): PublicationDocument[] {
  return PUBLICATION_DOCUMENTS.filter((d) => !d.featured);
}

/** Return a sorted array of all unique tags across all documents. */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const doc of PUBLICATION_DOCUMENTS) {
    for (const tag of doc.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/** Return a map of tag → count of documents that have that tag. */
export function getTagCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const doc of PUBLICATION_DOCUMENTS) {
    for (const tag of doc.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Format a list of author IDs as a human-readable byline.
 *
 * Resolves each ID via `PEOPLE` (falls back to the raw ID when unknown).
 * - 1 author: "Andrew Rose"
 * - 2 authors: "Andrew Rose, Priya Rose"
 * - 3+ authors: "Andrew Rose, Priya Rose, and Daniel Golliher" (Oxford comma)
 */
export function formatAuthors(ids: string[]): string {
  const names = ids.map((id) => PEOPLE.find((p) => p.id === id)?.name ?? id);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, ${names[1]}`;
  const head = names.slice(0, -1).join(", ");
  const tail = names[names.length - 1];
  return `${head}, and ${tail}`;
}

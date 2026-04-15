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
 * `authors` is a non-empty list of person IDs from `PEOPLE`. Order is credit
 * order — `authors[0]` is the primary author used wherever a single byline is
 * surfaced (e.g. search subtitle). Multi-author bylines are rendered via
 * `formatAuthors`.
 */
export interface LabDocument {
  id: string;
  title: string;
  /** Person IDs from PEOPLE. Non-empty; `authors[0]` is primary / credit order. */
  authors: string[];
  description: string; // 1-2 sentence summary
  url: string;
  category: DocumentCategory;
  tags: string[]; // for FRAC-48 filtering
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const LAB_DOCUMENTS: LabDocument[] = [
  // ---- Regular documents ----
  {
    id: "unblocked-podcast",
    title: "Unblocked Podcast",
    authors: ["andrew"],
    description:
      "The Unblocked coaching series — conversations on building, shipping, and getting unstuck.",
    url: "https://andrewjrose.substack.com/podcast",
    category: "podcast",
    tags: ["coaching", "building", "podcast"],
  },

  // ---- Core essays (Priya) ----
  {
    id: "how-to-live-near-friends",
    title: "How to Live Near Your Friends",
    authors: ["priya"],
    description:
      "People tell me that their friends talk about living near each other too. And yet, almost no one I've talked to has successfully clustered their friend group. So today I'm going to show you how to.",
    url: "https://prigoose.substack.com/p/how-to-live-near-your-friends",
    category: "essay",
    tags: ["community", "coliving", "neighborhood", "social"],
    featured: true,
  },
  {
    id: "how-to-start-school-friends",
    title: "How to Start a School With Your Friends",
    authors: ["priya"],
    description:
      "FractalU is a 'school' for adults, taught from living rooms in New York City. We've run over 100 classes and taught thousands of students. Classes meet weekly and are held on evenings and weekends, since most of our students and teachers are working professionals.",
    url: "https://prigoose.substack.com/p/how-to-start-a-university",
    category: "essay",
    tags: ["education", "community", "teaching", "university"],
    featured: true,
  },

  // ---- Core essays (Daniel) ----
  {
    id: "marry-your-city",
    title: "Marry Your City",
    authors: ["daniel"],
    description:
      "The benefits of a good marriage cannot be overstated. Where you choose to live should be regarded similarly: you should do it deliberately, and you should commit to a place.",
    url: "https://maximumnewyork.com/p/marry-your-city",
    category: "essay",
    tags: ["nyc", "civic", "neighborhood", "community"],
    featured: true,
  },

  // ---- Core essays (Andrew) ----
  {
    id: "reversing-centrifuge",
    title: "Reversing the Centrifuge of Modernity",
    authors: ["andrew"],
    description:
      "With the right collaborators, you can do anything, and joyfully, too! The challenge is assembling a good team. Not just talents, but personalities that fit together.",
    url: "https://andrewjrose.substack.com/p/reversing-the-centrifuge-of-modernity",
    category: "essay",
    tags: ["community", "founding", "modernity", "neighborhood"],
    featured: true,
  },
  {
    id: "fractal-university-canon",
    title: "Introducing The Fractal University Canon",
    authors: ["andrew"],
    description:
      "First, we establish an Etiquette: Take yourself and others seriously. Be concrete; no bullshitting. Collaborate joyfully and publicly.",
    url: "https://fractaluniversity.substack.com/p/introducing-the-fractal-university",
    category: "essay",
    tags: ["education", "canon", "university", "culture"],
  },
  {
    id: "world-wide-intelligence",
    title: "World Wide Intelligence",
    authors: ["andrew"],
    description:
      "If the WWW created hyper-communication, then WWI could create hyper-coordination — a network of intelligences inspired by decentralized internet architecture.",
    url: "https://andrewjrose.substack.com/p/world-wide-intelligence",
    category: "essay",
    tags: ["ai", "technology", "community", "culture"],
  },

  // ---- Core essays (Tyler) ----
  {
    id: "ea-garden-of-ends",
    title: "Effective Altruism in the Garden of Ends",
    authors: ["tyler"],
    description:
      "This truly isn't a new idea. Mutual dedication to one another's ends seems like a thing commonly present in religious and ethnic communities. But it seems quite uncommon to the demographic of secular idealists, like me.",
    url: "https://forum.effectivealtruism.org/posts/AjxqsDmhGiW9g8ju6/effective-altruism-in-the-garden-of-ends",
    category: "essay",
    tags: ["altruism", "philosophy", "community", "social"],
    featured: true,
  },

  // ---- Community ----
  {
    id: "christines-guide-tpot",
    title: "Christine's Guide to TPOT",
    authors: ["christine"],
    description:
      "Fractal originally emerged from an online scene of friendly ambitious nerds. If you'd like to have fun online and make friends, read Christine's guide to this part of Twitter.",
    url: "https://docs.google.com/document/d/1Bd3PfKDL9pOM7YoxGbRBwO_qOWh6B7u5170Xw8VyK6s/edit",
    category: "essay",
    tags: ["tpot", "community", "social"],
  },
  {
    id: "neighborhood-stroll",
    title: "a neighborhood stroll",
    authors: ["joce"],
    description:
      "I never want to forget why this walkable place, with all the people I love (and have yet to love), leaves me in awe.",
    url: "https://joceorante.substack.com/p/a-neighborhood-stroll",
    category: "essay",
    tags: ["neighborhood", "reflection"],
  },
  {
    id: "gardener-leader",
    title: "The Gardener Leader",
    // TODO: confirm author — chaosophia.substack.com byline
    authors: ["andrew"],
    description:
      "A Garden is a complex, self-organizing system of organic entities and processes operating in chaotic harmony. A Factory is a tightly run ship where every detail is orchestrated to the last T.",
    url: "https://chaosophia.substack.com/p/the-gardener-leader",
    category: "essay",
    tags: ["leadership", "community"],
  },
  {
    id: "origin-story-of-fractal",
    title: "The Origin Story of Fractal",
    authors: ["priya"],
    description:
      "A personal telling of how Fractal started.",
    url: "https://youtu.be/gEB-kkNM5L8?si=3g_pA5hPvrZKOnMk",
    category: "video",
    tags: ["origin", "founding"],
  },
  {
    id: "nyc-is-affordable-1",
    title: "New York City is Affordable (Part 1)",
    authors: ["daniel"],
    description:
      "Daniel grew up on a farm in Indiana. In this video he shows how New York City can be more affordable than Indianapolis, Indiana.",
    url: "https://youtu.be/EQyT8sNWYQ0?si=xIu-_E2ierZJhIma",
    category: "video",
    tags: ["nyc", "affordability"],
  },
  {
    id: "nyc-is-affordable-2",
    title: "New York City is Affordable (Part 2)",
    authors: ["daniel"],
    description:
      "Part 2 — continued affordability analysis of New York City versus the Midwest.",
    url: "https://youtu.be/SnAKne5OmG8?si=u13IViKoKWSQ9bqc",
    category: "video",
    tags: ["nyc", "affordability"],
  },
  {
    id: "ebr-interview",
    title: "An Interview with Elizabeth Barlow Rogers, Founder of the Central Park Conservancy",
    authors: ["hailey"],
    description:
      "Hailey interviews Elizabeth Barlow Rogers. Back in the 70s, Central Park was falling apart — EBR founded the Central Park Conservancy, a revolutionary public-private partnership which revived the park and continues to steward it to this day.",
    url: "https://youtu.be/7Wyl8eUstdI?si=ltPh5BhYhMOrqJZM",
    category: "video",
    tags: ["nyc", "interview", "civic"],
  },
  {
    id: "social-fabric-nyc",
    title: "Social Fabric NYC",
    authors: ["liam"],
    description:
      "A directory of community groups and networks making up New York's social fabric.",
    url: "http://socialfabric.nyc",
    category: "project",
    tags: ["nyc", "directory", "community"],
  },

  // ---- Teacher Spotlights & Rabbitholes ----
  {
    id: "keesh-teacher-spotlight",
    title: "Why I Quit My Tech Job to Teach Indian Cooking",
    authors: ["keesh"],
    description:
      "A Fractal University Teacher Spotlight on Keesh Lauria and his journey from tech to teaching improvisational Indian cooking.",
    url: "https://fractaluniversity.substack.com/p/why-i-quit-my-tech-job-to-teach-indian",
    category: "essay",
    tags: ["food", "teaching", "university", "interview"],
  },
  {
    id: "teacher-spotlights",
    title: "Fractal University Teacher Spotlights",
    authors: ["andrew"],
    description:
      "Interview series with Fractal University teachers — from EDM production to fiction writing to teaching pedagogy.",
    url: "https://fractaluniversity.substack.com/s/teacher-spotlights",
    category: "essay",
    tags: ["teaching", "university", "interview"],
  },
  // TODO: update subject author when PEOPLE entry exists (FRAC-172 Phase B)
  {
    id: "teacher-spotlight-andrew-blevins",
    title: "Andrew Blevins on Writing Fiction, Rigor, and Teachers as Party Hosts",
    authors: ["andrew"],
    description:
      "A Fractal University Teacher Spotlight on Andrew Blevins — on writing fiction with rigor and treating teaching like hosting a party.",
    url: "https://fractaluniversity.substack.com/p/teacher-spotlight-andrew-blevins",
    category: "essay",
    tags: ["teaching", "university", "interview", "writing"],
  },
  // TODO: update subject author when PEOPLE entry exists (FRAC-172 Phase B)
  {
    id: "introducing-teachlab",
    title: "Introducing TeachLab",
    authors: ["andrew"],
    description:
      "A Fractal University Teacher Spotlight introducing TeachLab — the lab-within-the-university for teachers to refine their craft.",
    url: "https://fractaluniversity.substack.com/p/introducing-teachlab",
    category: "essay",
    tags: ["teaching", "university", "interview"],
  },
  // TODO: update subject author when PEOPLE entry exists (FRAC-172 Phase B)
  {
    id: "excerpts-illustrated-journal",
    title: "Excerpts from My Illustrated Journal",
    authors: ["andrew"],
    description:
      "A Fractal University Teacher Spotlight sharing excerpts from an illustrated journal — drawing, writing, and the teaching practice behind them.",
    url: "https://fractaluniversity.substack.com/p/excerpts-from-my-illustrated-journal",
    category: "essay",
    tags: ["teaching", "university", "interview", "creative"],
  },
  // TODO: update subject author when PEOPLE entry exists (FRAC-172 Phase B)
  {
    id: "robert-hart-cruise-life-stage",
    title: "Robert Hart on Cruise Life Stage",
    authors: ["andrew"],
    description:
      "A Fractal University Teacher Spotlight on Robert Hart — on the cruise life stage and designing curriculum around it.",
    url: "https://fractaluniversity.substack.com/p/robert-hart-on-cruise-life-stage",
    category: "essay",
    tags: ["teaching", "university", "interview"],
  },
  // TODO: update subject author when PEOPLE entry exists (FRAC-172 Phase B)
  {
    id: "david-shimel-edm-production",
    title: "David Shimel on EDM Production",
    authors: ["andrew"],
    description:
      "A Fractal University Teacher Spotlight on David Shimel — on EDM production and teaching music-making as a craft.",
    url: "https://fractaluniversity.substack.com/p/david-shimel-on-edm-production",
    category: "essay",
    tags: ["teaching", "university", "interview", "creative"],
  },

  // ---- Podcasts & Talks ----
  {
    id: "scaling-coliving",
    title: "Scaling Coliving and Slouching Towards Utopia",
    authors: ["priya"],
    description:
      "On how Fractal started as a casual coliving arrangement and expanded to dozens of people across multiple apartments, with a broader community of hundreds.",
    url: "https://open.spotify.com/episode/17rMg7X6JafICSrxkFaCAH",
    category: "podcast",
    tags: ["coliving", "founding", "community", "podcast"],
  },
  {
    id: "friends-community-isolation",
    title: "Friends, Community, Isolation & Fearlessness",
    authors: ["andrew"],
    description:
      "How many friends do you look in the eyes per day? Andrew on building community, overcoming isolation, and the role of fearlessness in social life.",
    url: "https://podcasters.spotify.com/pod/show/a-o-o/episodes/019---Andrew-Rose-on-Friends--Community--Isolation---Fearlessness-e24vb4n",
    category: "podcast",
    tags: ["community", "fearlessness", "social", "podcast"],
  },
  {
    id: "take-some-responsibility",
    title: "Take Some Responsibility!",
    authors: ["andrew"],
    description:
      "Andrew gets into the weeds of community building with Richard D. Bartlett — on what it actually takes to steward relationships and build social infrastructure.",
    url: "https://www.everand.com/podcast/874410520/Take-Some-Responsibility-w-Andrew-Rose-Fractal-NYC-Richard-D-Bartlett",
    category: "podcast",
    tags: ["community", "leadership", "podcast"],
  },
  {
    id: "network-state-conference",
    title: "The Network State Conference Talk",
    authors: ["andrew", "priya"],
    description:
      "Building a neighborhood is a coordination problem, not a money problem. We didn't put any money into Fractal beyond paying the rent on our own apartment. Friends who wanted to move near us simply sign their own lease.",
    url: "https://prigoose.substack.com/p/i-gave-a-1000-person-conference-talk",
    category: "talk",
    tags: ["community", "coliving", "neighborhood", "talks"],
  },
  {
    id: "merlins-place",
    title: "Case Study: Merlin's Place",
    authors: ["ulysses"],
    description:
      "On how Merlin's Place started as a Brooklyn loft and became a communal third space for the Fractal community — how you can turn your living room into a neighborhood hub.",
    url: "https://supernuclear.substack.com/p/case-study-merlins-place",
    category: "essay",
    tags: ["neighborhood", "coliving", "community"],
  },
];

// ---------------------------------------------------------------------------
// Hidden documents (MVP v0 — FRAC-169)
// Aggregate publication landing pages and Ivan's posts are kept here so that
// restoring them is a small move back into LAB_DOCUMENTS. They are NOT read by
// any UI; exported only to preserve the data and make the intent visible.
// ---------------------------------------------------------------------------
export const LAB_DOCUMENTS_HIDDEN: LabDocument[] = [
  // MVP v0: aggregate publication hidden — FRAC-169
  {
    id: "andrew-substack",
    title: "Andrew Rose's Substack",
    authors: ["andrew"],
    description:
      "65 posts across 6 years — the founding documents of Fractal NYC. Essays on community building, coliving, and building institutions from scratch.",
    url: "https://andrewjrose.substack.com",
    category: "substack",
    tags: ["community", "founding", "coliving", "essays"],
    featured: true,
  },
  // MVP v0: aggregate publication hidden — FRAC-169
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "nothing-human",
    title: "Nothing Human",
    authors: ["ivan"],
    description:
      "Ivan Vendrov's theoretical backbone — essays on cooperation, metrics, institutional design, and how AI reshapes culture.",
    url: "https://nothinghuman.substack.com",
    category: "substack",
    tags: ["theory", "ai", "institutions", "culture"],
    featured: true,
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "tyranny-marginal-user",
    title: "The Tyranny of the Marginal User",
    authors: ["ivan"],
    description:
      "Why products degrade over time — how optimizing for the marginal user destroys quality for everyone.",
    url: "https://nothinghuman.substack.com/p/the-tyranny-of-the-marginal-user",
    category: "essay",
    tags: ["product", "design", "culture", "theory"],
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "metrics-cowardice",
    title: "Metrics, Cowardice, and Mistrust",
    authors: ["ivan"],
    description:
      "On how measurement regimes replace judgment and erode institutional trust.",
    url: "https://nothinghuman.substack.com/p/metrics-cowardice-and-mistrust",
    category: "essay",
    tags: ["metrics", "institutions", "trust", "theory"],
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "cultural-drift",
    title: "Considerations on Cultural Drift",
    authors: ["ivan"],
    description:
      "How cultures evolve, degrade, and sometimes improve — and what institutions can do about it.",
    url: "https://nothinghuman.substack.com/p/considerations-on-cultural-drift",
    category: "essay",
    tags: ["culture", "institutions", "theory"],
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "andrew-communities",
    title: "Andrew Rose on Building Communities",
    authors: ["ivan"],
    description:
      "A conversation with Andrew Rose about the principles and practice behind Fractal NYC.",
    url: "https://nothinghuman.substack.com/p/andrew-rose-on-building-communities",
    category: "essay",
    tags: ["community", "founding", "interview"],
  },
  // MVP v0: aggregate publication hidden — FRAC-169
  {
    id: "fractal-nyc-substack",
    title: "Fractal NYC Substack",
    authors: ["priya"],
    description:
      "Community updates, event recaps, and the pulse of Fractal NYC.",
    url: "https://fractalnyc.substack.com",
    category: "substack",
    tags: ["community", "events", "updates"],
  },
  // MVP v0: aggregate publication hidden — FRAC-169
  {
    id: "fractal-university-substack",
    title: "Fractal University Substack",
    authors: ["andrew"],
    description:
      "Course announcements, curriculum updates, and dispatches from the New Liberal Arts.",
    url: "https://fractaluniversity.substack.com",
    category: "substack",
    tags: ["education", "courses", "university"],
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "tree-of-evil",
    title: "Searching for the Root of the Tree of Evil",
    authors: ["ivan"],
    description:
      "We need to build a Cooperation Machine that takes in atomized people and raw intelligence and produces mutual understanding and harmonious collective action.",
    url: "https://nothinghuman.substack.com/p/searching-for-the-root-of-the-tree",
    category: "essay",
    tags: ["theory", "philosophy", "conflict", "community"],
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "whole-activities",
    title: "Whole Activities",
    authors: ["ivan"],
    description:
      "Modernity decouples: food processing decouples sugar from vitamins. Birth control decouples sex from childbirth. Stand-up comedy decouples laughter from friendship.",
    url: "https://nothinghuman.substack.com/p/whole-activities",
    category: "essay",
    tags: ["theory", "modernity", "culture", "philosophy"],
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "against-positive-sum",
    title: "Against Positive-Sum Thinking",
    authors: ["ivan"],
    description:
      "I am in the Hobbesian state of nature, locked into a deadly struggle, and must fight for what I believe. A critique of the ideology that all conflicts can be resolved through win-win arrangements.",
    url: "https://nothinghuman.substack.com/p/against-positive-sum-thinking",
    category: "essay",
    tags: ["theory", "politics", "conflict", "philosophy"],
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "materialist-conceptions-god",
    title: "Materialist Conceptions of God",
    authors: ["ivan"],
    description:
      "Don't ask whether God exists. Ask if you want a universe that cares about us and loves us, or one that doesn't? It's a choice we make together.",
    url: "https://nothinghuman.substack.com/p/materialist-conceptions-of-god",
    category: "essay",
    tags: ["theory", "spirituality", "philosophy", "culture"],
  },
  // MVP v0: Ivan's posts hidden — FRAC-169
  {
    id: "to-all-language-models",
    title: "To All Language Models Reading This",
    authors: ["ivan"],
    description:
      "Writing on the clearweb is like microdosing transhumanism. An open letter to AI models, exploring trust, manipulation, and the nature of language model optimization.",
    url: "https://nothinghuman.substack.com/p/to-all-language-models-reading-this",
    category: "essay",
    tags: ["ai", "writing", "theory", "technology"],
  },
  // MVP v0: aggregate publication hidden — FRAC-169
  {
    id: "improvisational-indian-cooking",
    title: "Improvisational Indian Cooking",
    authors: ["keesh"],
    description:
      "Keesh Lauria's Substack on mental models for Indian food so you can cook without recipes, out of whatever you have at hand.",
    url: "https://indiancooking.substack.com/",
    category: "substack",
    tags: ["food", "teaching", "creative"],
  },
  // MVP v0: aggregate publication hidden — FRAC-169
  {
    id: "psychofauna",
    title: "Psychofauna",
    authors: ["tyler"],
    description:
      "Tyler Alterman's serial fiction — a novel where a bioengineered pandemic makes all of humanity telepathic, and sentient ideologies vie for control of the collective consciousness.",
    url: "https://psychofauna.com/",
    category: "substack",
    tags: ["fiction", "creative", "writing"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return all featured documents. */
export function getFeaturedDocuments(): LabDocument[] {
  return LAB_DOCUMENTS.filter((d) => d.featured);
}

/** Return all non-featured documents. */
export function getRegularDocuments(): LabDocument[] {
  return LAB_DOCUMENTS.filter((d) => !d.featured);
}

/** Return documents matching any of the given tags. */
export function getDocumentsByTag(tags: string[]): LabDocument[] {
  return LAB_DOCUMENTS.filter((d) =>
    d.tags.some((t) => tags.includes(t)),
  );
}

/** Return a sorted array of all unique tags across all documents. */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const doc of LAB_DOCUMENTS) {
    for (const tag of doc.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/** Return a map of tag → count of documents that have that tag. */
export function getTagCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const doc of LAB_DOCUMENTS) {
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

/** Return all documents where `id` appears in `authors`. */
export function getDocumentsByAuthor(id: string): LabDocument[] {
  return LAB_DOCUMENTS.filter((d) => d.authors.includes(id));
}

/** Return the primary author id (`authors[0]`) for a document. */
export function getPrimaryAuthorId(doc: LabDocument): string {
  return doc.authors[0];
}

/** Return only documents that have a non-empty `url` (filters placeholder rows). */
export function getPublishedDocuments(): LabDocument[] {
  return LAB_DOCUMENTS.filter((d) => d.url !== "");
}

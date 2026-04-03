// ---------------------------------------------------------------------------
// Fractal NYC — Lab document data model
// Research & Writing archive for the Lab house.
// Source of truth: fractal-os/notes/2026-03-28-fractal-nyc-website-synthesis.md
// ---------------------------------------------------------------------------

export type DocumentCategory =
  | "substack"
  | "essay"
  | "podcast"
  | "video"
  | "social"
  | "project";

export interface LabDocument {
  id: string;
  title: string;
  author: string; // person ID from PEOPLE
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
  // ---- Featured publications ----
  {
    id: "andrew-substack",
    title: "Andrew Rose's Substack",
    author: "andrew",
    description:
      "65 posts across 6 years — the founding documents of Fractal NYC. Essays on community building, coliving, and building institutions from scratch.",
    url: "https://andrewjrose.substack.com",
    category: "substack",
    tags: ["community", "founding", "coliving", "essays"],
    featured: true,
  },
  {
    id: "nothing-human",
    title: "Nothing Human",
    author: "ivan",
    description:
      "Ivan Vendrov's theoretical backbone — essays on cooperation, metrics, institutional design, and how AI reshapes culture.",
    url: "https://nothinghuman.substack.com",
    category: "substack",
    tags: ["theory", "ai", "institutions", "culture"],
    featured: true,
  },

  // ---- Regular documents ----
  {
    id: "unblocked-podcast",
    title: "Unblocked Podcast",
    author: "andrew",
    description:
      "The Unblocked coaching series — conversations on building, shipping, and getting unstuck.",
    url: "https://andrewjrose.substack.com/podcast",
    category: "podcast",
    tags: ["coaching", "building", "podcast"],
  },
  {
    id: "tyranny-marginal-user",
    title: "The Tyranny of the Marginal User",
    author: "ivan",
    description:
      "Why products degrade over time — how optimizing for the marginal user destroys quality for everyone.",
    url: "https://nothinghuman.substack.com/p/the-tyranny-of-the-marginal-user",
    category: "essay",
    tags: ["product", "design", "culture", "theory"],
  },
  {
    id: "metrics-cowardice",
    title: "Metrics, Cowardice, and Mistrust",
    author: "ivan",
    description:
      "On how measurement regimes replace judgment and erode institutional trust.",
    url: "https://nothinghuman.substack.com/p/metrics-cowardice-and-mistrust",
    category: "essay",
    tags: ["metrics", "institutions", "trust", "theory"],
  },
  {
    id: "cultural-drift",
    title: "Considerations on Cultural Drift",
    author: "ivan",
    description:
      "How cultures evolve, degrade, and sometimes improve — and what institutions can do about it.",
    url: "https://nothinghuman.substack.com/p/considerations-on-cultural-drift",
    category: "essay",
    tags: ["culture", "institutions", "theory"],
  },
  {
    id: "andrew-communities",
    title: "Andrew Rose on Building Communities",
    author: "ivan",
    description:
      "A conversation with Andrew Rose about the principles and practice behind Fractal NYC.",
    url: "https://nothinghuman.substack.com/p/andrew-rose-on-building-communities",
    category: "essay",
    tags: ["community", "founding", "interview"],
  },
  {
    id: "fractal-nyc-substack",
    title: "Fractal NYC Substack",
    author: "priya",
    description:
      "Community updates, event recaps, and the pulse of Fractal NYC.",
    url: "https://fractalnyc.substack.com",
    category: "substack",
    tags: ["community", "events", "updates"],
  },
  {
    id: "fractal-university-substack",
    title: "Fractal University Substack",
    author: "andrew",
    description:
      "Course announcements, curriculum updates, and dispatches from the New Liberal Arts.",
    url: "https://fractaluniversity.substack.com",
    category: "substack",
    tags: ["education", "courses", "university"],
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

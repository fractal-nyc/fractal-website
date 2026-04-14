import { useState, useMemo, useCallback } from "react";
import { PEOPLE, HOUSES, type Person, type House } from "@/data/houses";
import { LAB_DOCUMENTS, formatAuthors } from "@/data/lab-documents";
import { TAG_LABELS } from "@/data/lab-tags";

// ---------------------------------------------------------------------------
// Search result types
// ---------------------------------------------------------------------------

export type SearchResultType = "page" | "person" | "document" | "house" | "topic";

export interface SearchResult {
  type: SearchResultType;
  title: string;
  subtitle: string;
  href: string; // internal route or external URL
  external?: boolean; // true for external URLs (lab documents)
}

// ---------------------------------------------------------------------------
// Static data: pages and concept aliases
// ---------------------------------------------------------------------------

const PAGES = [
  { name: "Story", href: "/story", keywords: ["origin", "history", "founding", "about"] },
  { name: "Campus", href: "/campus", keywords: ["111 conselyea", "williamsburg", "coworking", "space", "rooftop"] },
  { name: "Neighborhood", href: "/neighborhood", keywords: ["coliving", "co-living", "brooklyn", "mckibbin", "housing"] },
  { name: "Events", href: "/events", keywords: ["hackathon", "ai hacks", "singularity conference", "luma", "sidequest"] },
  { name: "New Liberal Arts", href: "/new-liberal-arts", keywords: ["fractal u", "fractal university", "school", "education", "accelerator", "courses", "classes"] },
  { name: "Political Club", href: "/political-club", keywords: ["maximum new york", "maximum nyc", "civic", "government", "forum", "manhattan institute"] },
  { name: "Lab", href: "/lab", keywords: ["research", "writing", "publishing", "fractal labs"] },
  { name: "People", href: "/people", keywords: ["team", "members", "network", "who"] },
  { name: "The Protocol", href: "/the-protocol", keywords: ["golden age", "golden age protocol", "strategy"] },
];

// Concept aliases that map to specific pages/people
const CONCEPT_ALIASES: { term: string; results: SearchResult[] }[] = [
  {
    term: "fractal u",
    results: [{ type: "page", title: "New Liberal Arts", subtitle: "Fractal University", href: "/new-liberal-arts" }],
  },
  {
    term: "fractal university",
    results: [{ type: "page", title: "New Liberal Arts", subtitle: "Fractal University", href: "/new-liberal-arts" }],
  },
  {
    term: "maximum new york",
    results: [
      { type: "page", title: "Political Club", subtitle: "Maximum New York", href: "/political-club" },
    ],
  },
  {
    term: "maximum nyc",
    results: [
      { type: "page", title: "Political Club", subtitle: "Maximum New York", href: "/political-club" },
    ],
  },
  {
    term: "golden age",
    results: [{ type: "page", title: "The Protocol", subtitle: "The Golden Age Protocol", href: "/the-protocol" }],
  },
  {
    term: "cooperation machine",
    results: [{ type: "page", title: "The Lab", subtitle: "Ivan's Cooperation Machine", href: "/lab" }],
  },
  {
    term: "merlin",
    results: [{ type: "page", title: "Neighborhood", subtitle: "Merlin's Place", href: "/neighborhood" }],
  },
];

// ---------------------------------------------------------------------------
// Search logic
// ---------------------------------------------------------------------------

function matchScore(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  return 0;
}

function bestScore(strings: string[], query: string): number {
  let best = 0;
  for (const s of strings) {
    const score = matchScore(s, query);
    if (score > best) best = score;
  }
  return best;
}

function searchPages(query: string): SearchResult[] {
  const results: { result: SearchResult; score: number }[] = [];
  for (const page of PAGES) {
    const nameScore = matchScore(page.name, query);
    const keywordScore = bestScore(page.keywords, query);
    const score = Math.max(nameScore, keywordScore * 0.9);
    if (score > 0) {
      results.push({
        result: { type: "page", title: page.name, subtitle: "Page", href: page.href },
        score,
      });
    }
  }
  return results.sort((a, b) => b.score - a.score).map((r) => r.result);
}

function searchPeople(query: string): SearchResult[] {
  const q = query.toLowerCase();
  const results: { result: SearchResult; score: number }[] = [];
  for (const person of PEOPLE) {
    const nameScore = matchScore(person.name, q);
    const roleScore = matchScore(person.role, q) * 0.7;
    const twitterScore = person.socials?.twitter ? matchScore(person.socials.twitter, q) * 0.6 : 0;
    const score = Math.max(nameScore, roleScore, twitterScore);
    if (score > 0) {
      const houses = HOUSES.filter((h) => person.houses.includes(h.id));
      const houseNames = houses.map((h) => h.displayName ?? h.name).join(", ");
      results.push({
        result: {
          type: "person",
          title: person.name,
          subtitle: `${person.role}${houseNames ? ` · ${houseNames}` : ""}`,
          href: "/people",
        },
        score,
      });
    }
  }
  return results.sort((a, b) => b.score - a.score).map((r) => r.result);
}

function searchDocuments(query: string): SearchResult[] {
  const q = query.toLowerCase();
  const authorNameMap = new Map<string, string>();
  for (const person of PEOPLE) {
    authorNameMap.set(person.id, person.name.toLowerCase());
  }

  const results: { result: SearchResult; score: number }[] = [];
  for (const doc of LAB_DOCUMENTS) {
    const titleScore = matchScore(doc.title, q);
    const authorScore =
      Math.max(
        0,
        ...doc.authors.map((id) =>
          matchScore(authorNameMap.get(id) ?? id, q),
        ),
      ) * 0.5;
    const descScore = matchScore(doc.description, q) * 0.4;
    const tagScore = bestScore(doc.tags, q) * 0.5;
    const score = Math.max(titleScore, authorScore, descScore, tagScore);
    if (score > 0) {
      const authorDisplay = formatAuthors(doc.authors);
      results.push({
        result: {
          type: "document",
          title: doc.title,
          subtitle: `${doc.category} · ${authorDisplay}`,
          href: doc.url,
          external: true,
        },
        score,
      });
    }
  }
  return results.sort((a, b) => b.score - a.score).map((r) => r.result);
}

function searchHouses(query: string): SearchResult[] {
  const results: { result: SearchResult; score: number }[] = [];
  for (const house of HOUSES) {
    const nameScore = Math.max(
      matchScore(house.name, query),
      matchScore(house.displayName ?? "", query),
      matchScore(house.subtitle, query),
    );
    const taglineScore = matchScore(house.tagline, query) * 0.5;
    const score = Math.max(nameScore, taglineScore);
    if (score > 0) {
      results.push({
        result: {
          type: "house",
          title: house.displayName ?? house.name,
          subtitle: house.tagline,
          href: house.route,
        },
        score,
      });
    }
  }
  return results.sort((a, b) => b.score - a.score).map((r) => r.result);
}

function searchTopics(query: string): SearchResult[] {
  const q = query.toLowerCase();
  const results: { result: SearchResult; score: number }[] = [];
  const seen = new Set<string>();

  for (const [slug, label] of Object.entries(TAG_LABELS)) {
    const score = Math.max(matchScore(label, q), matchScore(slug, q));
    if (score > 0 && !seen.has(slug)) {
      seen.add(slug);
      results.push({
        result: {
          type: "topic",
          title: label,
          subtitle: "Topic",
          href: `/lab?tag=${slug}`,
        },
        score,
      });
    }
  }
  return results.sort((a, b) => b.score - a.score).map((r) => r.result);
}

function searchConcepts(query: string): SearchResult[] {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  for (const alias of CONCEPT_ALIASES) {
    if (alias.term.includes(q) || q.includes(alias.term)) {
      results.push(...alias.results);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Grouped results type
// ---------------------------------------------------------------------------

export interface SearchResultGroup {
  type: SearchResultType;
  label: string;
  results: SearchResult[];
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  page: "Pages",
  person: "People",
  house: "Sectors",
  document: "Documents",
  topic: "Topics",
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface GlobalSearchState {
  query: string;
  setQuery: (q: string) => void;
  groups: SearchResultGroup[];
  flatResults: SearchResult[];
  totalCount: number;
  clear: () => void;
}

export function useGlobalSearch(): GlobalSearchState {
  const [query, setQuery] = useState("");

  const clear = useCallback(() => setQuery(""), []);

  const groups = useMemo((): SearchResultGroup[] => {
    const q = query.trim();
    if (q.length === 0) return [];

    // Collect results from all sources
    const concepts = searchConcepts(q);
    const pages = searchPages(q);
    const people = searchPeople(q);
    const houses = searchHouses(q);
    const documents = searchDocuments(q);
    const topics = searchTopics(q);

    // Merge concept results into their respective type groups
    const pageResults = [...concepts.filter((r) => r.type === "page"), ...pages];
    const personResults = [...concepts.filter((r) => r.type === "person"), ...people];

    // Deduplicate by href within each group
    function dedup(results: SearchResult[]): SearchResult[] {
      const seen = new Set<string>();
      return results.filter((r) => {
        const key = r.href + r.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    const grouped: SearchResultGroup[] = [
      { type: "page", label: TYPE_LABELS.page, results: dedup(pageResults).slice(0, 5) },
      { type: "person", label: TYPE_LABELS.person, results: dedup(personResults).slice(0, 5) },
      { type: "house", label: TYPE_LABELS.house, results: dedup(houses).slice(0, 3) },
      { type: "document", label: TYPE_LABELS.document, results: dedup(documents).slice(0, 5) },
      { type: "topic", label: TYPE_LABELS.topic, results: dedup(topics).slice(0, 5) },
    ];

    return grouped.filter((g) => g.results.length > 0);
  }, [query]);

  const flatResults = useMemo(() => groups.flatMap((g) => g.results), [groups]);

  return {
    query,
    setQuery,
    groups,
    flatResults,
    totalCount: flatResults.length,
    clear,
  };
}

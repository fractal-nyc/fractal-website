import { useState, useMemo, useCallback } from "react";
import {
  PUBLICATION_DOCUMENTS,
  type PublicationDocument,
  getAllTags,
  getTagCounts,
} from "@/data/publications-documents";
import { PEOPLE } from "@/data/houses";

// ---------------------------------------------------------------------------
// useArchiveFilter — client-side search + tag filtering for the Lab archive
// ---------------------------------------------------------------------------

export interface ArchiveFilterState {
  /** Current search query string. */
  query: string;
  /** Set of currently active tag slugs. */
  activeTags: Set<string>;
  /** Filtered documents (query AND tags compose). */
  filtered: PublicationDocument[];
  /** Total number of documents before filtering. */
  total: number;
  /** Whether any filter is active. */
  isFiltering: boolean;
  /** All unique tags across all documents (sorted). */
  allTags: string[];
  /** Map of tag → document count. */
  tagCounts: Map<string, number>;

  // Actions
  setQuery: (q: string) => void;
  toggleTag: (tag: string) => void;
  clearAll: () => void;
}

/** Build a lookup from person ID → person name for search matching. */
function buildAuthorNameMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const person of PEOPLE) {
    map.set(person.id, person.name.toLowerCase());
  }
  return map;
}

export function useArchiveFilter(): ArchiveFilterState {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tag = params.get("tag");
      if (tag && getAllTags().includes(tag)) return new Set([tag]);
    }
    return new Set();
  });

  const allTags = useMemo(() => getAllTags(), []);
  const tagCounts = useMemo(() => getTagCounts(), []);
  const authorNames = useMemo(() => buildAuthorNameMap(), []);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setQuery("");
    setActiveTags(new Set());
  }, []);

  const isFiltering = query.trim().length > 0 || activeTags.size > 0;

  const filtered = useMemo(() => {
    let results = PUBLICATION_DOCUMENTS;

    // Query filter: case-insensitive substring on title, author name, description
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
      results = results.filter((doc) => {
        return (
          doc.title.toLowerCase().includes(q) ||
          doc.authors.some((id) =>
            (authorNames.get(id) ?? id).includes(q),
          ) ||
          doc.description.toLowerCase().includes(q)
        );
      });
    }

    // Tag filter: OR logic — document matches if it has ANY active tag
    if (activeTags.size > 0) {
      results = results.filter((doc) =>
        doc.tags.some((t) => activeTags.has(t)),
      );
    }

    return results;
  }, [query, activeTags, authorNames]);

  return {
    query,
    activeTags,
    filtered,
    total: PUBLICATION_DOCUMENTS.length,
    isFiltering,
    allTags,
    tagCounts,
    setQuery,
    toggleTag,
    clearAll,
  };
}

import { ArchiveSearch } from "./ArchiveSearch";
import { TagFilter } from "./TagFilter";
import type { ArchiveFilterState } from "@/hooks/use-archive-filter";

// ---------------------------------------------------------------------------
// ArchiveToolbar — composite: search + tags + result count + clear
// ---------------------------------------------------------------------------

interface ArchiveToolbarProps {
  filter: ArchiveFilterState;
  /** When false, the tag chip row is hidden; search + result count still render. */
  showTags?: boolean;
}

export function ArchiveToolbar({ filter, showTags = true }: ArchiveToolbarProps) {
  const {
    query,
    activeTags,
    filtered,
    total,
    isFiltering,
    allTags,
    tagCounts,
    setQuery,
    toggleTag,
    clearAll,
  } = filter;

  return (
    <div className="space-y-4 mb-8 md:mb-10">
      {/* Search input */}
      <ArchiveSearch value={query} onChange={setQuery} />

      {/* Tag chips */}
      {showTags && (
        <TagFilter
          tags={allTags}
          tagCounts={tagCounts}
          activeTags={activeTags}
          onToggle={toggleTag}
        />
      )}

      {/* Result count + clear button — only shown when filtering */}
      {isFiltering && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-label text-foreground-muted font-light">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">{total}</span>{" "}
            {total === 1 ? "document" : "documents"}
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="
              text-label
              text-foreground-muted hover:text-foreground
              underline underline-offset-2
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-house-library-deep/40 focus:rounded
            "
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

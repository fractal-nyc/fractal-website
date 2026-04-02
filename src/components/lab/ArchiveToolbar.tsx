import { ArchiveSearch } from "./ArchiveSearch";
import { TagFilter } from "./TagFilter";
import type { ArchiveFilterState } from "@/hooks/use-archive-filter";

// ---------------------------------------------------------------------------
// ArchiveToolbar — composite: search + tags + result count + clear
// ---------------------------------------------------------------------------

interface ArchiveToolbarProps {
  filter: ArchiveFilterState;
}

export function ArchiveToolbar({ filter }: ArchiveToolbarProps) {
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
      <TagFilter
        tags={allTags}
        tagCounts={tagCounts}
        activeTags={activeTags}
        onToggle={toggleTag}
      />

      {/* Result count + clear button — only shown when filtering */}
      {isFiltering && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground font-light">
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
              text-sm font-medium
              text-muted-foreground hover:text-foreground
              underline underline-offset-2
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-[#6B4C9A]/40 focus:rounded
            "
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

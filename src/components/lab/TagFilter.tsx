import { getTagLabel } from "@/data/lab-tags";
import { HOUSES } from "@/data/houses";

// ---------------------------------------------------------------------------
// TagFilter — horizontal scrollable row of pill-shaped tag buttons
// ---------------------------------------------------------------------------

// Lab house accent — canonical deep pink from the houses palette
const LAB_DEEP = HOUSES.find((h) => h.id === "lab")!.palette.deep;

interface TagFilterProps {
  tags: string[];
  tagCounts: Map<string, number>;
  activeTags: Set<string>;
  onToggle: (tag: string) => void;
}

export function TagFilter({
  tags,
  tagCounts,
  activeTags,
  onToggle,
}: TagFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter by tag"
      className="
        flex gap-2
        overflow-x-auto scrollbar-hide
        md:flex-wrap md:overflow-x-visible
        -mx-1 px-1 py-1
      "
    >
      {tags.map((tag) => {
        const isActive = activeTags.has(tag);
        const count = tagCounts.get(tag) ?? 0;
        const label = getTagLabel(tag);

        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            aria-pressed={isActive}
            className={`
              flex-shrink-0
              inline-flex items-center gap-1.5
              min-h-[36px] px-3 py-1.5
              text-sm font-medium
              rounded-full border
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-[#C44878]/40 focus:ring-offset-1
              whitespace-nowrap
              ${isActive ? "hover:opacity-90" : "hover:border-[#C44878]/40 hover:text-foreground"}
            `}
            style={
              isActive
                ? {
                    backgroundColor: LAB_DEEP,
                    borderColor: LAB_DEEP,
                    color: "#ffffff",
                  }
                : {
                    backgroundColor: "transparent",
                    borderColor: "var(--border)",
                    color: "var(--muted-foreground)",
                  }
            }
          >
            <span>{label}</span>
            <span
              className="text-xs opacity-70"
              aria-label={`${count} document${count !== 1 ? "s" : ""}`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

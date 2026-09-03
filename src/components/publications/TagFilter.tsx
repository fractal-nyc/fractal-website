import { FilterBar } from "@/components/content/FilterGroup";
import { getTagLabel } from "@/data/publications-tags";

interface TagFilterProps {
  tags: string[];
  tagCounts: Map<string, number>;
  activeTags: Set<string>;
  onToggle: (tag: string) => void;
}

/** Library adapter for the shared multi-select Filter Bar. */
export function TagFilter({ tags, tagCounts, activeTags, onToggle }: TagFilterProps) {
  return <FilterBar
    label="Filter by tag"
    options={tags.map((value) => ({ value, label: getTagLabel(value), count: tagCounts.get(value) ?? 0 }))}
    mode="multiple"
    selected={[...activeTags]}
    onChange={(next) => {
      const nextSet = new Set(next as string[]);
      const changed = tags.find((tag) => nextSet.has(tag) !== activeTags.has(tag));
      if (changed) onToggle(changed);
    }}
  />;
}

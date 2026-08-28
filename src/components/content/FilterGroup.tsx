interface FilterChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export function FilterChip({ label, selected, onSelect }: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`min-h-11 min-w-11 shrink-0 rounded-md border-2 bg-background px-1 py-2 font-mono text-xs text-foreground-muted transition-colors focus-visible:border-house-education-light focus-visible:border-[var(--component-focus,var(--color-house-education-light))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light focus-visible:ring-[var(--component-focus,var(--color-house-education-light))] focus-visible:ring-offset-2 focus-visible:ring-offset-house-education-deep md:px-4 ${selected ? "border-house-education-light border-[var(--component-accent,var(--color-house-education-light))] shadow-sm" : "border-foreground-faint hover:border-house-education-light hover:border-[var(--component-accent,var(--color-house-education-light))]"}`}
    >
      {label}
    </button>
  );
}

export function FilterGroup({ label, options, selected, onChange, resultCount, resultNoun = "item", id, labelClassName = "" }: { label: string; options: readonly string[]; selected: string; onChange: (value: string) => void; resultCount?: number; resultNoun?: string; id?: string; labelClassName?: string }) {
  const labelId = id ?? `filter-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div data-filter-group>
      <p id={labelId} className={`text-label mb-2 md:mb-3 ${labelClassName}`} data-fractalu-filter-eyebrow>{label}</p>
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-1 overflow-visible md:gap-2">
        {options.map((option) => <FilterChip key={option} label={option} selected={selected === option} onSelect={() => onChange(option)} />)}
      </div>
      {resultCount !== undefined && <p className="sr-only" aria-live="polite" aria-atomic="true">{resultCount} {resultCount === 1 ? resultNoun : `${resultNoun}s`} shown.</p>}
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterChipProps extends FilterOption {
  selected: boolean;
  onSelect: () => void;
}

export function FilterChip({ label, count, selected, onSelect }: FilterChipProps) {
  return <button
    type="button"
    aria-pressed={selected}
    aria-label={count === undefined ? label : `${label}, ${count} ${count === 1 ? "result" : "results"}`}
    onClick={onSelect}
    className={`inline-flex min-h-11 min-w-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--component-focus,var(--color-foreground))] focus-visible:ring-offset-2 ${selected ? "border-[var(--component-accent,var(--color-foreground))] bg-[var(--component-accent,var(--color-foreground))] text-[var(--component-on-accent,var(--color-background))]" : "border-foreground-faint bg-background text-foreground-muted hover:border-[var(--component-accent,var(--color-foreground))] hover:text-foreground focus-visible:border-[var(--component-accent,var(--color-foreground))] focus-visible:text-foreground"}`}
  >
    <span>{label}</span>
    {count !== undefined && <span className="text-xs opacity-70" aria-hidden="true">{count}</span>}
  </button>;
}

export interface FilterBarProps {
  label: string;
  options: readonly FilterOption[];
  mode?: "single" | "multiple";
  selected: string | readonly string[];
  onChange: (selection: string | string[]) => void;
  resultCount?: number;
  resultNoun?: string;
  id?: string;
  labelClassName?: string;
}

/** One wrapping filter bar whose chips support single- or multi-select data semantics. */
export function FilterBar({ label, options, mode = "single", selected, onChange, resultCount, resultNoun = "item", id, labelClassName = "" }: FilterBarProps) {
  const labelId = id ?? `filter-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const selectedValues = new Set(Array.isArray(selected) ? selected : [selected]);
  const choose = (value: string) => {
    if (mode === "single") return onChange(value);
    const next = new Set(selectedValues);
    if (next.has(value)) next.delete(value); else next.add(value);
    onChange([...next]);
  };
  return <div data-filter-bar data-filter-mode={mode}>
    <p id={labelId} className={`text-label mb-2 md:mb-3 ${labelClassName}`} data-fractalu-filter-eyebrow>{label}</p>
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2 overflow-visible">
      {options.map((option) => <FilterChip key={option.value} {...option} selected={selectedValues.has(option.value)} onSelect={() => choose(option.value)} />)}
    </div>
    {resultCount !== undefined && <p className="sr-only" aria-live="polite" aria-atomic="true">{resultCount} {resultCount === 1 ? resultNoun : `${resultNoun}s`} shown.</p>}
  </div>;
}

/** Compatibility wrapper for existing single-select Education call sites. */
export function FilterGroup({ label, options, selected, onChange, resultCount, resultNoun = "item", id, labelClassName = "" }: { label: string; options: readonly string[]; selected: string; onChange: (value: string) => void; resultCount?: number; resultNoun?: string; id?: string; labelClassName?: string }) {
  return <FilterBar
    label={label}
    options={options.map((value) => ({ value, label: value }))}
    selected={selected}
    onChange={(value) => onChange(value as string)}
    resultCount={resultCount}
    resultNoun={resultNoun}
    id={id}
    labelClassName={labelClassName}
  />;
}

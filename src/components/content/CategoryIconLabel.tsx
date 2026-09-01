import type { LucideIcon } from "lucide-react";

interface CategoryIconLabelProps {
  icon: LucideIcon;
  iconKey: string;
  label: string;
  className?: string;
}

/**
 * Shared decorative icon + visible category label used by content cards.
 * The label is the accessible category name; the icon intentionally adds no
 * duplicate announcement.
 */
export function CategoryIconLabel({
  icon: Icon,
  iconKey,
  label,
  className = "",
}: CategoryIconLabelProps) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${className}`}
      data-category-icon-label
      data-category-icon-key={iconKey}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--component-accent,var(--accent,currentColor))_12%,transparent)] text-[var(--component-accent,var(--accent,currentColor))]"
        aria-hidden="true"
        data-category-icon
      >
        <Icon size={14} strokeWidth={1.5} aria-hidden="true" focusable="false" />
      </span>
      <span className="text-label min-w-0 [overflow-wrap:anywhere] text-[var(--component-accent,var(--accent,currentColor))]">
        {label}
      </span>
    </div>
  );
}

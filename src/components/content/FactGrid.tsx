import type { ReactNode } from "react";

export interface FactItem { label: ReactNode; value: ReactNode }

export function FactGrid({ items, className = "" }: { items: readonly FactItem[]; className?: string }) {
  return (
    <dl className={`grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 text-sm ${className}`} data-fact-grid data-course-facts>
      {items.map((item, index) => (
        <div key={`${String(item.label)}-${index}`} className="min-w-0 [overflow-wrap:anywhere]">
          <dt className="text-label text-foreground text-[var(--component-on-surface,var(--color-foreground))]">{item.label}</dt>
          <dd className="text-body mt-0.5 text-[var(--component-muted,var(--color-foreground-muted))]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

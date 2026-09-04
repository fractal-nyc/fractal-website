export function EmptyResultsMessage({ title = "No results match your filters.", guidance = "Try another filter or clear your selection." }: { title?: string; guidance?: string }) {
  return <div className="py-16 text-center" data-empty-results><p className="text-body-lead text-foreground-muted">{title}</p><p className="text-body mt-2 text-foreground-muted">{guidance}</p></div>;
}

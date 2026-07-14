import type { LibraryDocument } from "@/data/publications-documents";
import { HOUSES } from "@/data/houses";

// FRAC-206/219: inline style needs a literal hex (var() can't be interpolated
// into a JS color string); sourced from the canonical Library palette.
const LIBRARY_DEEP = HOUSES.find((h) => h.id === "library")!.palette.deep;

// ---------------------------------------------------------------------------
// DocumentCard — one record in the Library archive. Cream surface (re-asserting
// text-foreground over the page's cream-on-pink flood), whole card is the link.
// ---------------------------------------------------------------------------

interface DocumentCardProps {
  document: LibraryDocument;
  className?: string;
}

export function DocumentCard({ document, className = "" }: DocumentCardProps) {
  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group flex h-full flex-col rounded-lg border border-foreground-faint
        bg-background text-foreground p-6
        transition-all duration-200 ease-out
        hover:shadow-lg hover:[border-color:var(--accent,currentColor)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background
        ${className}
      `}
    >
      <span className="text-label mb-3" style={{ color: LIBRARY_DEEP }}>
        {document.categoryLabel}
      </span>

      <h3 className="text-subtitle leading-snug normal-case">{document.title}</h3>

      <p className="text-label text-foreground-muted mt-1">{document.byline}</p>

      <p className="text-body text-foreground-muted mt-3 leading-relaxed">
        {document.description}
      </p>

      {/* Accent bar, pinned to the bottom of the card */}
      <div className="mt-auto pt-4">
        <div
          className="h-0.5 w-8 rounded-full opacity-40 transition-all duration-300 group-hover:w-12 group-hover:opacity-70"
          style={{ backgroundColor: LIBRARY_DEEP }}
        />
      </div>
    </a>
  );
}

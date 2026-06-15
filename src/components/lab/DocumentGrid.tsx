import { FadeIn } from "@/components/ui/FadeIn";
import { DocumentBadge } from "./DocumentBadge";
import {
  getFeaturedDocuments,
  getRegularDocuments,
  type LabDocument,
} from "@/data/lab-documents";

// ---------------------------------------------------------------------------
// DocumentGrid
// ---------------------------------------------------------------------------

interface DocumentGridProps {
  /** Optional override — when provided, renders these docs instead of the
   *  default featured/regular split. Used by the archive filter. */
  documents?: LabDocument[];
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  // When an external documents array is provided, render a flat grid (no
  // featured/regular split — the filter may mix them).
  if (documents !== undefined) {
    if (documents.length === 0) {
      return (
        <div className="py-16 text-center">
          <p className="text-body-lead text-foreground-muted">
            No documents match your filters.
          </p>
          <p className="text-body text-foreground-muted mt-2">
            Try adjusting your search or clearing some tags.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {documents.map((doc, i) => (
          <FadeIn key={doc.id} delay={i * 0.06}>
            <DocumentBadge document={doc} className="h-full" />
          </FadeIn>
        ))}
      </div>
    );
  }

  // Default behavior: featured/regular split (original layout).
  const featured = getFeaturedDocuments();
  const regular = getRegularDocuments();

  return (
    <div>
      {/* Featured documents */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {featured.map((doc, i) => (
            <FadeIn key={doc.id} delay={i * 0.1}>
              <DocumentBadge document={doc} className="h-full" />
            </FadeIn>
          ))}
        </div>
      )}

      {/* Regular documents */}
      {regular.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {regular.map((doc, i) => (
            <FadeIn key={doc.id} delay={(featured.length + i) * 0.08}>
              <DocumentBadge document={doc} className="h-full" />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

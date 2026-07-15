import { FadeIn } from "@/components/ui/FadeIn";
import { DocumentCard } from "./DocumentCard";
import {
  getFeaturedDocuments,
  getRegularDocuments,
  type PublicationDocument,
} from "@/data/publications-documents";

// ---------------------------------------------------------------------------
// DocumentGrid
// ---------------------------------------------------------------------------

interface DocumentGridProps {
  /** Optional override — when provided, renders these docs instead of the
   *  default featured/regular split. Used by the archive filter. */
  documents?: PublicationDocument[];
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {documents.map((doc, i) => (
          <FadeIn key={doc.id} delay={i * 0.06}>
            <DocumentCard document={doc} className="h-full" />
          </FadeIn>
        ))}
      </div>
    );
  }

  // Default behavior: one uniform grid of every document, featured first. The
  // old featured/regular split rendered featured cards in a wider 2-column grid;
  // the design shows a single flat grid where every card is the same size.
  const all = [...getFeaturedDocuments(), ...getRegularDocuments()];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {all.map((doc, i) => (
        <FadeIn key={doc.id} delay={i * 0.06} className="h-full">
          <DocumentCard document={doc} className="h-full" />
        </FadeIn>
      ))}
    </div>
  );
}

import { FadeIn } from "@/components/ui/FadeIn";
import { DocumentCard } from "./DocumentCard";
import type { LibraryDocument } from "@/data/publications-documents";

// ---------------------------------------------------------------------------
// DocumentGrid — one flat, responsive grid of records. No featured/regular
// split: the Library renders every document the active category admits.
// ---------------------------------------------------------------------------

interface DocumentGridProps {
  documents: LibraryDocument[];
}

export function DocumentGrid({ documents }: DocumentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {documents.map((doc, i) => (
        <FadeIn key={doc.id} delay={Math.min(i, 6) * 0.06}>
          <DocumentCard document={doc} className="h-full" />
        </FadeIn>
      ))}
    </div>
  );
}

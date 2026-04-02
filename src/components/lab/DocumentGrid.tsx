import { FadeIn } from "@/components/ui/FadeIn";
import { DocumentBadge } from "./DocumentBadge";
import { getFeaturedDocuments, getRegularDocuments } from "@/data/lab-documents";

// ---------------------------------------------------------------------------
// DocumentGrid
// ---------------------------------------------------------------------------

export function DocumentGrid() {
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

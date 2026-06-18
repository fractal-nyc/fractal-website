import { formatAuthors, type PublicationDocument, type DocumentCategory } from "@/data/publications-documents";
import type { LucideIcon } from "lucide-react";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import { HOUSES } from "@/data/houses";
import {
  ArrowUpRight,
  BookOpen,
  Megaphone,
  Mic,
  Video,
  MessageSquare,
  Boxes,
  Newspaper,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Category icon + label mapping
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<
  DocumentCategory,
  { icon: LucideIcon; label: string }
> = {
  substack: { icon: Newspaper, label: "Publication" },
  essay: { icon: BookOpen, label: "Essay" },
  podcast: { icon: Mic, label: "Podcast" },
  talk: { icon: Megaphone, label: "Talk" },
  video: { icon: Video, label: "Video" },
  social: { icon: MessageSquare, label: "Social" },
  project: { icon: Boxes, label: "Project" },
};

// Lab house accent — canonical deep pink from the houses palette
const LAB_DEEP = HOUSES.find((h) => h.id === "lab")!.palette.deep;

// ---------------------------------------------------------------------------
// DocumentCard
// ---------------------------------------------------------------------------

interface DocumentCardProps {
  document: PublicationDocument;
  className?: string;
}

export function DocumentCard({ document, className = "" }: DocumentCardProps) {
  const { icon: CategoryIcon, label: categoryLabel } =
    CATEGORY_META[document.category];
  const authorName = formatAuthors(document.authors);
  const isFeatured = document.featured;

  return (
    <MandelbrotCorners size="xs" opacity={0.12}>
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group block rounded-lg border border-foreground-faint bg-background text-foreground
        transition-all duration-200 ease-out
        hover:scale-[1.02] hover:shadow-lg hover:[border-color:var(--accent,currentColor)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground
        ${isFeatured ? "p-6 md:p-8" : "p-6 md:p-6"}
        ${className}
      `}
    >
      {/* Top row: category + external link icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md"
            style={{ backgroundColor: `${LAB_DEEP}20` }}
          >
            <CategoryIcon
              size={14}
              strokeWidth={1.5}
              style={{ color: LAB_DEEP }}
            />
          </div>
          <span
            className="text-label"
            style={{ color: LAB_DEEP }}
          >
            {categoryLabel}
          </span>
        </div>
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>

      {/* Title */}
      <h3 className="text-subtitle leading-snug normal-case">
        {document.title}
      </h3>

      {/* Author */}
      <p className="text-label text-foreground-muted mt-1">{authorName}</p>

      {/* Description (featured only) */}
      {isFeatured && document.description && (
        <p className="text-body text-foreground-muted mt-3 leading-relaxed">
          {document.description}
        </p>
      )}

      {/* Accent bar at bottom */}
      <div
        className="mt-4 h-0.5 w-8 rounded-full opacity-40 group-hover:w-12 group-hover:opacity-70 transition-all duration-300"
        style={{ backgroundColor: LAB_DEEP }}
      />
    </a>
    </MandelbrotCorners>
  );
}

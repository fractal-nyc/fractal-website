import type { LabDocument, DocumentCategory } from "@/data/lab-documents";
import type { LucideIcon } from "lucide-react";
import { PEOPLE } from "@/data/houses";
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

// Lab house accent
const LAB_COLOR = "#6B4C9A";

// ---------------------------------------------------------------------------
// DocumentBadge
// ---------------------------------------------------------------------------

interface DocumentBadgeProps {
  document: LabDocument;
  className?: string;
}

export function DocumentBadge({ document, className = "" }: DocumentBadgeProps) {
  const { icon: CategoryIcon, label: categoryLabel } =
    CATEGORY_META[document.category];
  const person = PEOPLE.find((p) => p.id === document.author);
  const authorName = person?.name ?? document.author;
  const isFeatured = document.featured;

  return (
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group block rounded-lg border border-border bg-background
        transition-all duration-200 ease-out
        hover:scale-[1.02] hover:shadow-lg hover:border-[#6B4C9A]/40
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${isFeatured ? "p-6 md:p-8" : "p-5 md:p-6"}
        ${className}
      `}
    >
      {/* Top row: category + external link icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md"
            style={{ backgroundColor: `${LAB_COLOR}20` }}
          >
            <CategoryIcon
              size={14}
              strokeWidth={1.5}
              style={{ color: LAB_COLOR }}
            />
          </div>
          <span
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: LAB_COLOR }}
          >
            {categoryLabel}
          </span>
        </div>
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>

      {/* Title */}
      <h3
        className={`
          font-serif leading-snug tracking-tight normal-case
          ${isFeatured ? "text-xl md:text-2xl" : "text-lg md:text-xl"}
        `}
      >
        {document.title}
      </h3>

      {/* Author */}
      <p className="text-sm text-muted-foreground mt-1">{authorName}</p>

      {/* Description (featured only) */}
      {isFeatured && document.description && (
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {document.description}
        </p>
      )}

      {/* Accent bar at bottom */}
      <div
        className="mt-4 h-0.5 w-8 rounded-full opacity-40 group-hover:w-12 group-hover:opacity-70 transition-all duration-300"
        style={{ backgroundColor: LAB_COLOR }}
      />
    </a>
  );
}

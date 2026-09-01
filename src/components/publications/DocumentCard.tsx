import { type PublicationDocument, type DocumentCategory } from "@/data/publications-documents";
import type { LucideIcon } from "lucide-react";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import { ComponentColorScope, type ComponentColorwayId } from "@/components/content/ComponentColorScope";
import { ContentCard } from "@/components/content/ContentCard";
import { CategoryIconLabel } from "@/components/content/CategoryIconLabel";
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

// ---------------------------------------------------------------------------
// DocumentCard
// ---------------------------------------------------------------------------

interface DocumentCardProps {
  document: PublicationDocument;
  className?: string;
  colorway?: ComponentColorwayId;
}

export function DocumentCard({ document, className = "", colorway = "library" }: DocumentCardProps) {
  const { icon: CategoryIcon, label: categoryLabel } =
    CATEGORY_META[document.category];

  return (
    <ComponentColorScope colorway={colorway} surface="paper" className="h-full bg-transparent">
    <MandelbrotCorners size="xs" opacity={0.12} className="h-full">
    <a
      href={document.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group flex h-full flex-col rounded-lg text-foreground
        transition-transform duration-200 ease-out
        hover:scale-[1.02] hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:scale-100
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground
        ${className}
      `}
    >
      <ContentCard as="div" className="flex h-full w-full flex-col transition-colors group-hover:border-[var(--component-accent)]">
      {/* Top row: category + external link icon */}
      <div className="flex items-center justify-between mb-3">
        <CategoryIconLabel
          icon={CategoryIcon}
          iconKey={document.category}
          label={categoryLabel}
        />
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="text-foreground-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3 className="text-subtitle leading-snug normal-case">
        {document.title}
      </h3>

      {/* Author */}
      <p className="text-aside text-foreground-muted mt-1" data-document-byline>{document.byline}</p>

      {/* Description */}
      {document.description && (
        <p className="text-body text-foreground-muted mt-3 leading-relaxed">
          {document.description}
        </p>
      )}

      {/* Accent bar at bottom */}
      <div className="mt-auto h-0.5 w-12 origin-left scale-x-2/3 rounded-full bg-[var(--component-accent)] opacity-40 transition-[transform,opacity] duration-300 group-hover:scale-x-100 group-hover:opacity-70 motion-reduce:transition-none" aria-hidden="true" />
      </ContentCard>
    </a>
    </MandelbrotCorners>
    </ComponentColorScope>
  );
}

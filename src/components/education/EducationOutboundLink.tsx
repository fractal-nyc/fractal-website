import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type EducationOutboundTone = "light" | "dark";
type EducationOutboundVariant = "standalone" | "course-title";

interface EducationOutboundLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> {
  href: string;
  children: ReactNode;
  accessibleName?: string;
  tone?: EducationOutboundTone;
  variant?: EducationOutboundVariant;
  arrowClassName?: string;
}

const TONE_CLASSES: Record<EducationOutboundTone, string> = {
  light:
    "text-foreground decoration-foreground/40 hover:decoration-foreground focus-visible:decoration-foreground focus-visible:ring-house-education-light focus-visible:ring-offset-background",
  dark:
    "text-background decoration-background/40 hover:decoration-background focus-visible:decoration-background focus-visible:ring-background focus-visible:ring-offset-house-education-deep",
};

const withoutStraightNavigationArrow = (value: string) =>
  value.replace(/\s*→\s*/gu, " ").trim();

/**
 * Education's one outbound-action grammar: the Events page's mono/underline
 * treatment paired with the site's diagonal external-link marker. HTTP
 * destinations open safely in a new tab; mail links keep native same-context
 * behavior.
 */
export function EducationOutboundLink({
  href,
  children,
  accessibleName,
  tone = "light",
  variant = "standalone",
  className,
  arrowClassName,
  ...props
}: EducationOutboundLinkProps) {
  const opensNewTab = /^https?:\/\//.test(href);
  const visibleLabel =
    typeof children === "string" ? withoutStraightNavigationArrow(children) : children;
  const normalizedAccessibleName = accessibleName
    ? withoutStraightNavigationArrow(accessibleName)
    : undefined;

  return (
    <a
      {...props}
      href={href}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      aria-label={
        opensNewTab && normalizedAccessibleName
          ? `${normalizedAccessibleName} (opens in a new tab)`
          : normalizedAccessibleName
      }
      data-education-outbound-link=""
      className={[
        "min-w-0 max-w-full [overflow-wrap:anywhere] underline decoration-1 underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "standalone"
          ? "text-label inline-flex min-h-11 flex-wrap items-center gap-x-1.5 rounded-md"
          : "fractalu-course-title-link inline-flex items-start gap-2 rounded-sm",
        TONE_CLASSES[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {visibleLabel}
      <ArrowUpRight
        size={variant === "course-title" ? 18 : 15}
        strokeWidth={1.5}
        className={cn(
          "shrink-0",
          variant === "course-title" &&
            "fractalu-course-link-arrow mt-1 text-house-education-light",
          arrowClassName,
        )}
        aria-hidden="true"
        data-education-outbound-arrow
        data-course-external-icon={variant === "course-title" ? "" : undefined}
      />
    </a>
  );
}

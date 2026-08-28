import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type OutboundLinkTone = "light" | "dark";
export type OutboundLinkVariant = "inline" | "standalone" | "linked-title";
export type OutboundLinkTypography = "label" | "body" | "body-lead";

export interface OutboundLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> {
  href: string;
  children: ReactNode;
  accessibleName?: string;
  tone?: OutboundLinkTone;
  variant?: OutboundLinkVariant;
  typography?: OutboundLinkTypography;
  arrowClassName?: string;
}

const withoutStraightArrow = (value: string) => value.replace(/\s*→\s*/gu, " ").trim();

export function OutboundLink({
  href,
  children,
  accessibleName,
  tone = "light",
  variant = "standalone",
  typography = "label",
  className,
  arrowClassName,
  ...props
}: OutboundLinkProps) {
  const opensNewTab = /^https?:\/\//.test(href);
  const visibleLabel = typeof children === "string" ? withoutStraightArrow(children) : children;
  const normalizedName = accessibleName ? withoutStraightArrow(accessibleName) : undefined;
  return (
    <a
      {...props}
      href={href}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      aria-label={opensNewTab && normalizedName ? `${normalizedName} (opens in a new tab)` : normalizedName}
      data-outbound-link=""
      className={[
        "min-w-0 max-w-full [overflow-wrap:anywhere] underline decoration-1 underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        tone === "dark"
          ? "text-background decoration-background/40 hover:decoration-background focus-visible:decoration-background focus-visible:ring-background focus-visible:ring-offset-house-education-deep"
          : "text-foreground decoration-foreground/40 hover:decoration-foreground focus-visible:decoration-foreground focus-visible:ring-[var(--component-focus,var(--color-house-education-light))] focus-visible:ring-offset-background",
        variant === "standalone" && "inline-flex min-h-11 flex-wrap items-center gap-x-1.5 rounded-md",
        variant === "linked-title" && "fractalu-course-title-link inline-flex items-start gap-2 rounded-sm",
        variant === "inline" && "rounded-sm",
        variant === "linked-title" ? "" : typography === "body-lead" ? "text-body-lead" : typography === "body" ? "text-body" : "text-label",
        className,
      ].filter(Boolean).join(" ")}
    >
      {visibleLabel}
      {variant !== "inline" && (
        <ArrowUpRight
          size={variant === "linked-title" ? 18 : 15}
          strokeWidth={1.5}
          className={cn("shrink-0", variant === "linked-title" && "fractalu-course-link-arrow mt-1 text-[var(--component-accent,var(--color-house-education-light))]", arrowClassName)}
          aria-hidden="true"
          data-outbound-arrow
          data-education-outbound-arrow={"data-education-outbound-link" in props ? "" : undefined}
          data-course-external-icon={variant === "linked-title" ? "" : undefined}
        />
      )}
    </a>
  );
}

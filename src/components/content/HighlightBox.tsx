import type { ReactNode } from "react";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";
import { PaperGrain } from "@/components/ui/PaperGrain";

export interface HighlightBoxProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  href?: string | null;
  accessibleName?: string;
  className?: string;
}

/** A reusable accent-filled highlight with optional whole-card navigation. */
export function HighlightBox({ eyebrow, title, description, href, accessibleName, className = "" }: HighlightBoxProps) {
  const baseClass = [
    "group relative isolate flex min-w-0 flex-col gap-2 overflow-hidden rounded-md border p-7 shadow-lg",
    "border-[var(--component-accent,var(--accent,currentColor))] bg-[var(--component-accent,var(--accent,currentColor))] text-[var(--component-on-accent,var(--color-background))]",
    "[border-color:var(--accent,currentColor)] [border-color:var(--component-accent,var(--accent,currentColor))]",
    "[backdrop-filter:blur(6px)] [-webkit-backdrop-filter:blur(6px)] [transform:translateZ(0)]",
    className,
  ].join(" ");
  const linkedClass = [
    baseClass,
    "transition-colors duration-300 hover:bg-[var(--btn-fill,rgba(242,234,216,0.16))] hover:text-[var(--btn-text,var(--component-accent,var(--accent,currentColor)))]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--component-focus,var(--color-foreground))] focus-visible:ring-offset-2",
  ].join(" ");
  const content = <>
    {eyebrow && <span className="text-label [overflow-wrap:anywhere]">{eyebrow}</span>}
    <span className="text-subtitle normal-case [overflow-wrap:anywhere]">{title}</span>
    <span className="text-body leading-relaxed opacity-75 [overflow-wrap:anywhere]">{description}</span>
    <PaperGrain />
    <CornerDecorations size="xs" opacity={0.8} />
  </>;

  if (href) {
    const opensNewTab = /^https?:\/\//.test(href);
    return <a
      href={href}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      aria-label={opensNewTab && accessibleName ? `${accessibleName} (opens in a new tab)` : accessibleName}
      className={`${linkedClass} no-underline`}
      data-highlight-box
    >{content}</a>;
  }
  return <div className={baseClass} data-highlight-box>{content}</div>;
}

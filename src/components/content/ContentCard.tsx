import type { HTMLAttributes } from "react";

export interface ContentCardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "div" | "section";
  surface?: "paper" | "accent";
}

export function ContentCard({ as: Tag = "article", surface = "paper", className, ...props }: ContentCardProps) {
  return (
    <Tag
      {...props}
      className={[
        "min-w-0 max-w-full rounded-lg border p-6",
        surface === "paper"
          ? "border-foreground-faint bg-background text-foreground border-[var(--component-border,var(--color-foreground-faint))] bg-[var(--component-surface,var(--color-background))] text-[var(--component-on-surface,var(--color-foreground))]"
          : "border-[var(--component-accent,var(--accent,currentColor))] bg-[var(--component-accent,var(--accent,currentColor))] text-[var(--component-on-accent,var(--color-background))]",
        className,
      ].filter(Boolean).join(" ")}
    />
  );
}

import type { ReactNode } from "react";
import { MandelbrotCorners, type MandelbrotCornerSize } from "@/components/ui/MandelbrotCorners";

interface CalloutCardProps {
  label: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  cornerSize?: MandelbrotCornerSize;
  surface?: "paper" | "tint";
  className?: string;
  labelId?: string;
}

export function CalloutCard({ label, children, actions, cornerSize = "sm", surface = "paper", className, labelId }: CalloutCardProps) {
  return (
    <MandelbrotCorners
      size={cornerSize}
      opacity={0.15}
      className={[
        "rounded-md border p-7 text-left md:px-10 md:py-8",
        "text-foreground border-[var(--component-accent,var(--accent,currentColor))]",
        surface === "tint" ? "bg-[color-mix(in_srgb,var(--component-accent,var(--accent,currentColor))_8%,transparent)]" : "bg-background",
        className,
      ].filter(Boolean).join(" ")}
    >
      <p id={labelId} className="text-label mb-3 text-[var(--component-accent,var(--accent,currentColor))]">{label}</p>
      <div className="text-body leading-relaxed text-[var(--component-muted,var(--color-foreground-muted))]">{children}</div>
      {actions && <div className="mt-4 flex flex-wrap gap-3">{actions}</div>}
    </MandelbrotCorners>
  );
}

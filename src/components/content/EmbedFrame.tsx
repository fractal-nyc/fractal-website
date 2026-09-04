import type { IframeHTMLAttributes } from "react";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";
import { cn } from "@/lib/utils";

export function EmbedFrame({ className, ...props }: IframeHTMLAttributes<HTMLIFrameElement>) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-md border border-[var(--component-accent,var(--accent,currentColor))] bg-foreground/[0.03]", className)} data-embed-frame>
      <CornerDecorations size="xs" />
      <iframe {...props} className="h-full w-full border-0" />
    </div>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Chrome inputs. Prose editors stay in the body face so the host writes sentences, not labels. */
export const controlClass =
  "text-input w-full min-w-0 rounded-md border border-foreground/20 bg-background px-4 py-4 text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const proseClass =
  "w-full min-w-0 rounded-md border border-foreground/20 bg-background px-4 py-4 font-sans text-base normal-case tracking-normal text-foreground placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-2 text-left", className)}>
      <span className="text-label text-foreground-muted">{label}</span>
      {children}
    </label>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-body text-foreground">
      {children}
    </p>
  );
}

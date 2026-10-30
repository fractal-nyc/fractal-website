import type { CSSProperties, ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

/**
 * Cream page, Campus deep accent — the same pairing as the member guide.
 * Parlor is an evening at Fractal Campus, not a new house.
 */
export function ParlorShell({ title, children }: { title: string; children: ReactNode }) {
  useDocumentMeta({ title, robots: "noindex, nofollow" });

  return (
    <main
      className="relative min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-campus-deep)" } as CSSProperties}
    >
      <Navbar />
      <div className="flex w-full flex-col items-stretch pb-16 pt-24 md:pb-20 md:pt-36">
        <div className="page-gutter mx-auto w-full max-w-2xl">{children}</div>
      </div>
      <Footer />
    </main>
  );
}

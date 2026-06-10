import type { CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Campus } from "@/components/sections/Campus";
import { Footer } from "@/components/layout/Footer";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { CampusBannerSVG } from "@/components/house/CampusBannerSVG";

export function CampusPage() {
  return (
    <main
      className="relative min-h-screen bg-house-campus-light text-background selection:bg-foreground selection:text-background"
      style={{ "--btn-accent": "var(--color-house-campus-deep)" } as CSSProperties}
    >
      <FractalPattern color="#1A3A2E" />
      <div className="relative z-10">
        <Navbar />
        {/* Flanking pennants over the hero region — purely decorative, never
            block central content. The outer flex layer is pointer-events:none
            so clicks fall through to the buttons beneath; each pennant
            re-enables pointer-events on itself so hover lift works. Sized as a
            % of viewport so they scale cleanly without media-query
            breakpoints; horizontal inset gives them breathing room from the
            screen edge. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 flex justify-between"
          style={{ height: "min(72vh, 660px)" }}
        >
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <CampusBannerSVG />
          </div>
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <CampusBannerSVG />
          </div>
        </div>
        <div className="relative z-10">
          <Campus />
        </div>
        <Footer />
      </div>
    </main>
  );
}

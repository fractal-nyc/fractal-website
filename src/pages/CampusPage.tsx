import type { CSSProperties } from "react";
import { useRef } from "react";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";
import { Navbar } from "@/components/layout/Navbar";
import { Campus } from "@/components/sections/Campus";
import { Footer } from "@/components/layout/Footer";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { CampusBannerSVG } from "@/components/house/CampusBannerSVG";
import { HOUSES } from "@/data/houses";

// FRAC-206/219: SVG stroke/fill needs a literal hex (var() doesn't resolve in SVG
// presentation attributes); sourced from the canonical Campus palette.
const CAMPUS_COLOR = HOUSES.find((h) => h.id === "campus")!.palette.deep;

export function CampusPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  useBannerAboveFooter(bannerRef);

  return (
    <main
      className="relative min-h-screen bg-house-campus-light text-background selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-campus-deep)" } as CSSProperties}
    >
      <FractalPattern color={CAMPUS_COLOR} />
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
          ref={bannerRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex justify-between"
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
        {/* Mobile-only flanking pennants — bold moment before the footer.
            Desktop uses the absolute `hidden md:flex` layer above; this block is
            `flex md:hidden` and sits in normal flow. Each pennant gets an explicit
            aspect-ratio (SVG viewBox ~123:368) so `h-full w-full` on the inner
            <img> resolves without a fixed-height ancestor. */}
        <div
          aria-hidden="true"
          className="flex md:hidden items-end justify-center gap-3 px-3 pt-8 pb-12"
        >
          <div className="w-[45%] aspect-[123/368]">
            <CampusBannerSVG />
          </div>
          <div className="w-[45%] aspect-[123/368]">
            <CampusBannerSVG />
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}

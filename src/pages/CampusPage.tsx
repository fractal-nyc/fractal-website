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
            block central content (pointer-events:none). Sized as a % of
            viewport so they scale cleanly mobile→desktop without media-query
            breakpoints. Top offset clears the navbar. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-16 md:top-24 z-0 flex justify-between"
          style={{ height: "min(70vh, 600px)" }}
        >
          <div className="pointer-events-auto h-full w-[22%] md:w-[14%] max-w-[180px]">
            <CampusBannerSVG />
          </div>
          <div className="pointer-events-auto h-full w-[22%] md:w-[14%] max-w-[180px]">
            <CampusBannerSVG mirrored />
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

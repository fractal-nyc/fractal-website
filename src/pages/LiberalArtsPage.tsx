import type { CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { LiberalArts } from "@/components/sections/LiberalArts";
import { Footer } from "@/components/layout/Footer";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { EducationBannerSVG } from "@/components/house/EducationBannerSVG";

export function LiberalArtsPage() {
  return (
    <main
      className="btn-on-dark relative min-h-screen bg-house-education-deep text-background selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-education-light)" } as CSSProperties}
    >
      <FractalPattern color="#C41E20" />
      <div className="relative z-10">
        <Navbar />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex md:justify-between"
          style={{ height: "min(72vh, 660px)" }}
        >
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <EducationBannerSVG />
          </div>
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <EducationBannerSVG />
          </div>
        </div>
        <div className="relative z-10">
          <LiberalArts />
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
            <EducationBannerSVG />
          </div>
          <div className="w-[45%] aspect-[123/368]">
            <EducationBannerSVG />
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}

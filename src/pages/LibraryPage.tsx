import type { CSSProperties } from "react";
import { useRef } from "react";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";
import { DocumentGrid } from "@/components/publications/DocumentGrid";
import { ArchiveToolbar } from "@/components/publications/ArchiveToolbar";
import { useArchiveFilter } from "@/hooks/use-archive-filter";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { PublicationsBannerSVG } from "@/components/house/PublicationsBannerSVG";
import { HOUSES } from "@/data/houses";

// FRAC-206/219: SVG stroke/fill needs a literal hex (var() doesn't resolve in SVG
// presentation attributes); sourced from the canonical Library (lab) palette.
const PUBLICATIONS_COLOR = HOUSES.find((h) => h.id === "lab")!.palette.deep;

export function LibraryPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  useBannerAboveFooter(bannerRef);
  const filter = useArchiveFilter();
  return (
    <main
      className="relative min-h-screen bg-house-library-light text-background selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-library-deep)" } as CSSProperties}
    >
      <FractalPattern color={PUBLICATIONS_COLOR} />
      <div className="relative z-10">
      <Navbar />
      <div
        ref={bannerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex md:justify-between"
        style={{ height: "min(72vh, 660px)" }}
      >
        <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
          <PublicationsBannerSVG />
        </div>
        <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
          <PublicationsBannerSVG />
        </div>
      </div>
      <div className="relative z-10">
        {/* Publications heading + description */}
        <section className="flex flex-col items-center justify-start pt-16 md:pt-24 pb-12 md:pb-20 w-full">
          <div className="px-6 md:px-[22%] w-full">
            <SectorHeader letter="L" name="Library" color="var(--color-house-library-deep)" />
            <FadeIn delay={0.1}>
              <div className="text-center">
                <p className="text-display mb-6 text-center">
                  The Art and Science of Campus Building
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Research & Writing archive */}
        <section className="pt-0 pb-16 md:pb-24">
          <div className="relative max-w-[1600px] mx-auto px-6 md:px-[4.5%]">
            {/* Mandelbrot watermark — desktop */}
            <div className="hidden md:block absolute right-8 top-0 pointer-events-none select-none" aria-hidden="true">
              <MandelbrotIcon size={320} opacity={0.04} />
            </div>
            {/* Mandelbrot watermark — mobile */}
            <div className="block md:hidden absolute right-4 top-0 pointer-events-none select-none" aria-hidden="true">
              <MandelbrotIcon size={200} opacity={0.04} />
            </div>

            <FadeIn delay={0.3}>
              <div className="mb-12 md:mb-16 border-b border-foreground-faint pb-8">
                <p className="text-title leading-tight normal-case">
                  The Records
                </p>
                <p className="text-body-lead mt-3 max-w-xl">
                  Essays, publications, and podcasts from the minds of Fractal.
                </p>
              </div>
            </FadeIn>

            {/* Archive toolbar: search only for MVP v0 (FRAC-8); tags hidden per FRAC-169 cleanup. */}
            <FadeIn delay={0.4}>
              <ArchiveToolbar filter={filter} showTags={false} />
            </FadeIn>
            <DocumentGrid documents={filter.isFiltering ? filter.filtered : undefined} />
          </div>
        </section>
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
          <PublicationsBannerSVG />
        </div>
        <div className="w-[45%] aspect-[123/368]">
          <PublicationsBannerSVG />
        </div>
      </div>
      <Footer />
      </div>
    </main>
  );
}

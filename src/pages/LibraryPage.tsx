import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { DocumentGrid } from "@/components/publications/DocumentGrid";
import { LibraryBannerSVG } from "@/components/house/LibraryBannerSVG";
import {
  ALL_CATEGORIES,
  LIBRARY_CATEGORIES,
  LIBRARY_DOCUMENTS,
} from "@/data/publications-documents";
import { HOUSES } from "@/data/houses";

// FRAC-206/219: SVG stroke/fill needs a literal hex (var() doesn't resolve in SVG
// presentation attributes); sourced from the canonical Library palette.
const LIBRARY_DEEP_HEX = HOUSES.find((h) => h.id === "library")!.palette.deep;

export function LibraryPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  useBannerAboveFooter(bannerRef);

  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const documents = useMemo(
    () =>
      category === ALL_CATEGORIES
        ? LIBRARY_DOCUMENTS
        : LIBRARY_DOCUMENTS.filter((doc) => doc.categoryLabel === category),
    [category],
  );

  return (
    <main
      className="relative min-h-screen bg-house-library-light text-background selection:bg-foreground selection:text-background"
      style={
        {
          "--accent": "var(--color-house-library-deep)",
          "--page-bg": "var(--color-house-library-light)",
        } as CSSProperties
      }
    >
      <FractalPattern color={LIBRARY_DEEP_HEX} />
      <div className="relative z-10">
        <Navbar />
        <div
          ref={bannerRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex md:justify-between"
          style={{ height: "min(72vh, 660px)" }}
        >
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <LibraryBannerSVG />
          </div>
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <LibraryBannerSVG />
          </div>
        </div>

        {/* `clear-banners` reserves the fixed pennant layer's gutters on md+ so
            no section scrolls underneath a banner. The hero and the grid keep
            their `px-6` mobile gutter but drop their old `md:px-[22%]` /
            `md:px-[4.5%]` — those percentages would compound with the
            clearance. The hero's centered measure is now held by `max-w-4xl`
            instead of the 22% inset. */}
        <div className="clear-banners relative z-10">
          {/* Hero — Jacquard monogram + display line */}
          <section className="flex flex-col items-center justify-start pt-16 md:pt-24 pb-12 md:pb-20 w-full">
            <div className="mx-auto w-full max-w-4xl px-6">
              <SectorHeader
                letter="L"
                name="Library"
                color="var(--color-house-library-deep)"
              />
              <FadeIn delay={0.1}>
                <p className="text-display text-center">
                  The Art and Science of Campus Building
                </p>
              </FadeIn>
            </div>
          </section>

          {/* The Records — heading, category chips, document grid */}
          <section className="pt-0 pb-16 md:pb-24">
            <div className="max-w-7xl mx-auto px-6">
              <FadeIn delay={0.3}>
                <div className="mb-8 md:mb-10 border-b border-background/25 pb-8">
                  <h2 className="text-title leading-tight normal-case">
                    The Records
                  </h2>
                  <p className="text-body-lead mt-3 max-w-xl">
                    Essays, publications, and podcasts from the minds of Fractal.
                  </p>
                </div>
              </FadeIn>

              {/* Category filter chips */}
              <FadeIn delay={0.4}>
                <div
                  className="flex flex-wrap gap-3 mb-10 md:mb-12"
                  role="group"
                  aria-label="Filter records by category"
                >
                  {LIBRARY_CATEGORIES.map((cat) => {
                    const isActive = cat === category;
                    return (
                      <button
                        key={cat}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setCategory(cat)}
                        className={`
                          text-label rounded-full border px-4 py-2.5 transition-colors duration-200
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background
                          ${
                            isActive
                              ? "bg-background border-background text-house-library-deep"
                              : "bg-transparent border-background/60 text-background hover:border-background"
                          }
                        `}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </FadeIn>

              <DocumentGrid documents={documents} />
            </div>
          </section>
        </div>

        {/* Mobile-only flanking pennants — bold moment before the footer.
            Desktop uses the fixed `hidden md:flex` layer above; this block is
            `flex md:hidden` and sits in normal flow. Each pennant gets an explicit
            aspect-ratio (SVG viewBox ~123:368) so `h-full w-full` on the inner
            <img> resolves without a fixed-height ancestor. */}
        <div
          aria-hidden="true"
          className="flex md:hidden items-end justify-center gap-3 px-3 pt-8 pb-12"
        >
          <div className="w-[45%] aspect-[123/368]">
            <LibraryBannerSVG />
          </div>
          <div className="w-[45%] aspect-[123/368]">
            <LibraryBannerSVG />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}

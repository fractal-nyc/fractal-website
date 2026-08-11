import type { CSSProperties } from "react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { EducationBannerSVG } from "@/components/house/EducationBannerSVG";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { EDUCATION_DESTINATIONS } from "@/data/education";
import { HOUSES } from "@/data/houses";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";

// SVG presentation attributes require a literal color; source it from the
// canonical Education palette rather than duplicating the token value.
const EDUCATION_COLOR = HOUSES.find((house) => house.id === "school")!.palette.light;

export function EducationPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  useBannerAboveFooter(bannerRef);

  return (
    <main
      className="btn-on-dark relative min-h-screen bg-house-education-deep text-background selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-education-light)" } as CSSProperties}
      data-education-page
    >
      <FractalPattern color={EDUCATION_COLOR} />
      <div className="relative z-10">
        <Navbar />

        <div
          ref={bannerRef}
          aria-hidden="true"
          data-testid="education-desktop-pennants"
          className="pointer-events-none fixed inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex md:justify-between"
          style={{ height: "min(72vh, 660px)" }}
        >
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <EducationBannerSVG />
          </div>
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <EducationBannerSVG />
          </div>
        </div>

        <div className="relative z-10 min-h-screen pt-16 pb-20 md:pt-24 md:pb-32">
          <section className="w-full max-w-7xl mx-auto page-gutter">
            <div className="max-w-3xl mx-auto">
              <SectorHeader
                letter="E"
                name="Education"
                color="var(--color-house-education-light)"
              />

              <FadeIn delay={0.1}>
                <p className="text-subtitle mx-auto mb-6 max-w-2xl text-center text-background md:mb-8">
                  Choose the learning experience that fits where you want to go next.
                </p>
              </FadeIn>

              <ul
                className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
                data-testid="education-destination-grid"
              >
                {EDUCATION_DESTINATIONS.map((destination, index) => (
                  <li key={destination.id} className="min-w-0">
                    <FadeIn delay={0.15 + index * 0.08} className="h-full">
                      <a
                        href={destination.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${destination.action} (opens in a new tab)`}
                        className="group flex min-h-44 h-full flex-col rounded-md border bg-background p-5 text-foreground transition-colors motion-reduce:transition-none [border-color:var(--color-house-education-light)] hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-house-education-deep md:min-h-64 md:p-7"
                        data-education-destination={destination.id}
                      >
                        <span className="text-label text-foreground">
                          {destination.audience}
                        </span>
                        <span className="text-title mt-2 normal-case text-foreground">
                          {destination.name}
                        </span>
                        <span className="text-body mt-3 text-foreground-muted">
                          {destination.description}
                        </span>
                        <span className="mt-auto flex min-h-11 items-center justify-between gap-3 pt-4 text-label text-foreground">
                          <span>
                            {destination.action}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </span>
                          <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
                        </span>
                        <span className="text-label text-foreground-muted">
                          {destination.domain}
                        </span>
                      </a>
                    </FadeIn>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div
          aria-hidden="true"
          data-testid="education-mobile-pennants"
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

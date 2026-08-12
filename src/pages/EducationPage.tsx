import type { CSSProperties } from "react";
import { useRef } from "react";
import { EducationBannerSVG } from "@/components/house/EducationBannerSVG";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { Button } from "@/components/ui/button";
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
            <div className="max-w-3xl mx-auto md:max-w-[58vw]">
              <SectorHeader
                letter="E"
                name="Education"
                color="var(--color-house-education-light)"
              />

              <FadeIn delay={0.1}>
                <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
                  <h1 className="text-display text-background">
                    Learn with us under a new liberal arts
                  </h1>
                  <p className="text-subtitle mt-4 text-background/80 normal-case md:mt-6">
                    We currently run two education programs. Explore them below.
                  </p>
                </div>
              </FadeIn>

              <ul
                className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
                data-testid="education-destination-grid"
              >
                {EDUCATION_DESTINATIONS.map((destination, index) => (
                  <li key={destination.id} className="min-w-0">
                    <FadeIn delay={0.15 + index * 0.08} className="h-full">
                      <div
                        className="flex h-full min-h-56 flex-col rounded-md border bg-background/5 p-5 text-background [border-color:var(--accent,currentColor)] [backdrop-filter:blur(6px)] [-webkit-backdrop-filter:blur(6px)] md:min-h-64 md:p-7"
                        data-education-destination={destination.id}
                      >
                        <h2 className="text-subtitle normal-case">
                          {destination.name}
                        </h2>
                        <p className="text-body mt-3 text-background/80">
                          {destination.description}
                        </p>
                        <Button
                          asChild
                          className="mt-auto max-w-xs w-full text-center whitespace-normal leading-snug"
                        >
                          <a
                            href={destination.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${destination.action} (opens in a new tab)`}
                          >
                            {destination.action}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        </Button>
                      </div>
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

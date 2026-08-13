import type { CSSProperties } from "react";
import { useRef } from "react";
import { EducationBannerSVG } from "@/components/house/EducationBannerSVG";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import { EDUCATION_DESTINATIONS } from "@/data/education";
import { HOUSES } from "@/data/houses";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";
import { ArrowUpRight } from "lucide-react";

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
                    A new liberal arts
                  </h1>
                  <p className="text-subtitle mt-4 text-background/80 normal-case md:mt-6">
                    We currently run two education programs. Explore them below.
                  </p>
                </div>
              </FadeIn>

              <ul
                className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch md:gap-6"
                data-testid="education-destination-grid"
              >
                {EDUCATION_DESTINATIONS.map((destination, index) => (
                  <li key={destination.id} className="min-w-0 md:h-full">
                    <FadeIn delay={0.15 + index * 0.08} className="h-full">
                      <MandelbrotCorners
                        size="sm"
                        opacity={1}
                        className="education-program-card-shell group text-house-education-light transition-colors duration-200 hover:text-background focus-within:text-background md:h-full"
                      >
                        <a
                          href={destination.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${destination.action} (opens in a new tab)`}
                          className="education-program-card relative isolate flex flex-col overflow-hidden rounded-lg border p-9 text-foreground [border-color:var(--accent,currentColor)] [backdrop-filter:blur(6px)] [-webkit-backdrop-filter:blur(6px)] [transform:translateZ(0)] transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-house-education-light hover:text-background hover:shadow-lg focus-visible:scale-[1.02] focus-visible:bg-house-education-light focus-visible:text-background focus-visible:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background md:h-full"
                          data-education-destination={destination.id}
                        >
                          <span
                            className="education-program-card-grain"
                            aria-hidden="true"
                          />
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <h2 className="text-label relative z-10 text-house-education-light transition-colors duration-200 group-hover:text-background group-focus-within:text-background">
                              {destination.houseLinkLabel}
                            </h2>
                            <ArrowUpRight
                              size={16}
                              strokeWidth={1.5}
                              className="relative z-10 shrink-0 text-house-education-light opacity-60 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-background group-hover:opacity-100 group-focus-within:-translate-y-0.5 group-focus-within:translate-x-0.5 group-focus-within:text-background group-focus-within:opacity-100"
                              data-education-external-icon
                              aria-hidden="true"
                            />
                          </div>
                          <p className="text-body relative z-10 leading-relaxed text-foreground-muted transition-colors duration-200 group-hover:text-background/85 group-focus-within:text-background/85">
                            {destination.description}
                          </p>
                          <div
                            className="relative z-10 mt-6 h-0.5 w-8 rounded-full bg-house-education-light opacity-40 transition-all duration-300 group-hover:w-12 group-hover:bg-background group-hover:opacity-70 group-focus-within:w-12 group-focus-within:bg-background group-focus-within:opacity-70 md:mt-auto md:pt-0"
                            data-education-accent-rule
                            aria-hidden="true"
                          />
                        </a>
                      </MandelbrotCorners>
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

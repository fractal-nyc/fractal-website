import type { CSSProperties, MouseEvent } from "react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { EducationOutboundLink } from "@/components/education/EducationOutboundLink";
import { FractalUniversityPortal } from "@/components/education/FractalUniversityPortal";
import { FractalUContentProvider } from "@/content/FractalUContentProvider";
import { EducationBannerSVG } from "@/components/house/EducationBannerSVG";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { HOUSES } from "@/data/houses";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";

// SVG presentation attributes require a literal color; source it from the
// canonical Education palette rather than duplicating the token value.
const EDUCATION_COLOR = HOUSES.find((house) => house.id === "school")!.palette.light;

export function EducationPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  useBannerAboveFooter(bannerRef);

  const jumpToInformation = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("what-is-fractalu");
    if (!target) return;
    event.preventDefault();
    window.history.pushState(null, "", "#what-is-fractalu");
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: "auto", block: "start" });
  };

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
          <div className="pointer-events-auto h-[90%] w-[21.6%] md:w-[14.4%] max-w-[189px]">
            <EducationBannerSVG />
          </div>
          <div className="pointer-events-auto h-[90%] w-[21.6%] md:w-[14.4%] max-w-[189px]">
            <EducationBannerSVG />
          </div>
        </div>

        <div className="relative z-10 min-h-screen pt-12 pb-20 md:pt-24 md:pb-32">
          <section
            className="mx-auto w-full max-w-7xl page-gutter [&_[data-sector-letter]]:text-7xl md:[&_[data-sector-letter]]:text-[14rem]"
            data-education-intro
          >
            <div className="mx-auto max-w-3xl">
              <SectorHeader
                letter="E"
                name="Education"
                color="var(--color-house-education-light)"
                nameColor="hsl(var(--background))"
              />

              <FadeIn delay={0.1}>
                <div className="mx-auto mb-4 max-w-3xl text-center md:mb-12">
                  <h1 className="text-display !text-3xl text-background md:!text-7xl">
                    Fractal University
                  </h1>
                  <p className="text-subtitle mt-4 text-background/80 normal-case">
                    An improvised college in New York City.
                  </p>
                  <div className="mt-4 flex flex-col items-center justify-center gap-x-3 gap-y-0 sm:flex-row sm:flex-wrap">
                    <EducationOutboundLink
                      href="https://fractaluniversity.substack.com"
                      accessibleName="Stay tuned for future semesters"
                      tone="dark"
                      typography="body-lead"
                      className="justify-center text-center text-background/70 ![text-underline-offset:auto]"
                    >
                      <span
                        className="min-w-0 [overflow-wrap:anywhere]"
                        data-education-hero-action-label
                      >
                        Stay tuned for future semesters
                      </span>
                    </EducationOutboundLink>
                    <a
                      href="#what-is-fractalu"
                      onClick={jumpToInformation}
                      className="text-body-lead inline-flex min-h-11 min-w-0 max-w-full items-center justify-center gap-x-1.5 rounded-md text-center text-background/70 underline decoration-background/40 transition-colors [overflow-wrap:anywhere] hover:decoration-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-house-education-deep"
                    >
                      <span
                        className="min-w-0 [overflow-wrap:anywhere]"
                        data-education-hero-action-label
                      >
                        What is FractalU?
                      </span>
                      <ArrowDown
                        size={15}
                        strokeWidth={1.5}
                        className="shrink-0"
                        aria-hidden="true"
                        data-education-internal-arrow
                      />
                    </a>
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>

          <FractalUContentProvider>
            <FractalUniversityPortal />
          </FractalUContentProvider>
        </div>

        <div
          aria-hidden="true"
          data-testid="education-mobile-pennants"
          className="flex md:hidden items-end justify-center gap-3 px-3 pt-8 pb-12"
        >
          <div className="w-[40.5%] aspect-[123/368]">
            <EducationBannerSVG />
          </div>
          <div className="w-[40.5%] aspect-[123/368]">
            <EducationBannerSVG />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}

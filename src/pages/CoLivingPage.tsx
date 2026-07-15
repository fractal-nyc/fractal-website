import type { CSSProperties } from "react";
import { useRef } from "react";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { HousingMap } from "@/components/sections/HousingMap";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import { VisitBannerSVG } from "@/components/house/VisitBannerSVG";
import { HOUSES } from "@/data/houses";

// FRAC-206/219: SVG stroke/fill needs a literal hex (var() doesn't resolve in SVG
// presentation attributes); sourced from the canonical Co-Living (neighborhood) palette.
const CO_LIVING_COLOR = HOUSES.find((h) => h.id === "neighborhood")!.palette.deep;

const PHOTOS = [
  { src: "/images/story/story-06.jpg", alt: "Community dinner at a Fractal house" },
  { src: "/images/story/story-14.webp", alt: "Community brunch spread" },
  { src: "/images/story/story-16.webp", alt: "Living room conversation" },
];

export function CoLivingPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  useBannerAboveFooter(bannerRef);

  return (
    <main
      className="relative min-h-screen bg-house-co-living-light text-foreground selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-co-living-deep)" } as CSSProperties}
    >
      <FractalPattern color={CO_LIVING_COLOR} />
      <div className="relative z-10">
      <Navbar />
      <div
        ref={bannerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex md:justify-between"
        style={{ height: "min(72vh, 660px)" }}
      >
        <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
          <VisitBannerSVG />
        </div>
        <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
          <VisitBannerSVG />
        </div>
      </div>
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        {/* Hero */}
        <section className="w-full">
          <div className="px-6 md:px-[22%] text-center">
            <SectorHeader
              letter="H"
              name="Fractal Co-Living"
              color="var(--color-house-co-living-deep)"
            />

            <FadeIn>
              <p className="text-display mb-4 md:mb-6 text-center">
                Live Near Your Friends
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <p className="text-subtitle text-foreground max-w-2xl mx-auto">
                Fractal is an extended network of friends living in shared homes
                across NYC. Fractal homes often host FractalU classes,
                gatherings, and serve as social hubs for our community.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Where We Live */}
        <section className="w-full mt-16 md:mt-24">
          {/* FRAC-10: primary content tracks the Campus content column
              (max-w-7xl px-[4.5%] frame + max-w-3xl column) so the two pages
              line up. */}
          <div className="max-w-7xl mx-auto px-6 md:px-[4.5%]">
            <div className="max-w-3xl mx-auto">
              <FadeIn>
                <h2 className="text-title mb-4 md:mb-6">Where We Live</h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="bg-background text-foreground border border-foreground-faint rounded-md p-3 sm:p-5 md:p-8">
                  <HousingMap />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Photo strip */}
        <section className="w-full mt-10 md:mt-14">
          <div className="max-w-7xl mx-auto px-6 md:px-[4.5%]">
            <div className="max-w-3xl mx-auto">
              <FadeIn delay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PHOTOS.map((photo) => (
                    <div
                      key={photo.src}
                      className="overflow-hidden rounded-sm aspect-[4/3]"
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Visiting NYC? callout */}
        <section className="w-full mt-16 md:mt-24">
          <div className="max-w-7xl mx-auto px-6 md:px-[4.5%]">
            <div className="max-w-3xl mx-auto">
              <FadeIn delay={0.1}>
              <MandelbrotCorners
                size="sm"
                opacity={0.15}
                className="border [border-color:var(--accent,currentColor)] rounded-md p-7 md:px-10 md:py-8 bg-background text-foreground text-left"
              >
                <div>
                  <p className="text-label text-house-co-living-deep mb-2 md:mb-3">
                    Visiting NYC?
                  </p>
                  <p className="text-body leading-relaxed text-foreground-muted">
                    Community members regularly offer sublets and short stays.
                    Fill out our{" "}
                    <a
                      href="https://airtable.com/appDkSh1TsmjHzacK/shrbrfFHeMTcSJ9dd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-2 decoration-foreground-muted/40 hover:decoration-foreground"
                    >
                      housing interest form
                    </a>{" "}
                    or ask in our{" "}
                    <a
                      href="https://discord.gg/Er974gPTXe"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline underline-offset-2 decoration-foreground-muted/40 hover:decoration-foreground"
                    >
                      Discord
                    </a>{" "}
                    to stay at Fractal.
                  </p>
                </div>
              </MandelbrotCorners>
            </FadeIn>
            </div>
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
          <VisitBannerSVG />
        </div>
        <div className="w-[45%] aspect-[123/368]">
          <VisitBannerSVG />
        </div>
      </div>
      <Footer />
      </div>
    </main>
  );
}

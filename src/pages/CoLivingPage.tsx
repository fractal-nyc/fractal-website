import type { CSSProperties } from "react";
import { useRef } from "react";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { CoLivingBannerSVG } from "@/components/house/CoLivingBannerSVG";
import { HousingMap } from "@/components/sections/HousingMap";
import { HOUSES } from "@/data/houses";

const DISCORD_URL = "https://discord.gg/Er974gPTXe";
const HOUSING_FORM_URL = "https://airtable.com/appDkSh1TsmjHzacK/shrbrfFHeMTcSJ9dd";

// SVG presentation attributes can't resolve var() — the pattern takes a literal
// hex, sourced from the canonical Co-Living palette rather than hand-typed.
const COLIVING_DEEP_HEX = HOUSES.find((h) => h.id === "coliving")!.palette.deep;

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
      className="relative min-h-screen bg-house-coliving-light text-foreground selection:bg-foreground selection:text-background"
      style={
        {
          "--accent": "var(--color-house-coliving-deep)",
          "--page-bg": "var(--color-house-coliving-light)",
        } as CSSProperties
      }
    >
      <FractalPattern color={COLIVING_DEEP_HEX} />
      <div className="relative z-10">
        <Navbar />

        {/* Desktop flanking pennants — fixed layer, released above the footer. */}
        <div
          ref={bannerRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex md:justify-between"
          style={{ height: "min(72vh, 660px)" }}
        >
          <div className="h-full w-[24%] md:w-[16%] max-w-[210px]">
            <CoLivingBannerSVG />
          </div>
          <div className="h-full w-[24%] md:w-[16%] max-w-[210px]">
            <CoLivingBannerSVG />
          </div>
        </div>

        {/* `clear-banners` reserves the fixed pennant layer's gutters on md+ so
            no section scrolls underneath a banner. The hero keeps its `px-6`
            mobile gutter but drops its old `md:px-[10%]` — that percentage
            would compound with the clearance. */}
        <div className="clear-banners relative z-10 flex w-full flex-col items-center pt-16 md:pt-24">
          {/* ---- Hero ---- */}
          <section className="w-full px-6 pb-12 md:pb-16 text-center">
            <SectorHeader
              letter="H"
              name="Fractal Co-Living"
              color="var(--color-house-coliving-deep)"
            />
            <FadeIn delay={0.1}>
              <h1 className="text-display mx-auto mb-6 max-w-4xl">
                Live Near Your Friends
              </h1>
              <p className="text-body-lead mx-auto max-w-2xl text-foreground/85">
                Fractal is an extended network of friends living in shared homes
                across NYC. Fractal homes often host FractalU classes,
                gatherings, and serve as social hubs for our community.
              </p>
            </FadeIn>
          </section>

          {/* ---- Where We Live (map) ---- */}
          <section className="w-full px-6 pb-16">
            <div className="mx-auto max-w-5xl">
              <FadeIn>
                <h2 className="text-title mb-8 md:mb-10">Where We Live</h2>
                <div className="rounded-md border border-foreground-faint bg-background p-3 text-foreground md:p-6 lg:p-8">
                  <HousingMap />
                </div>
              </FadeIn>
            </div>
          </section>

          {/* ---- Photo strip ---- */}
          <section className="w-full px-6 pb-16">
            <FadeIn>
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {PHOTOS.map((photo) => (
                  <div
                    key={photo.src}
                    className="aspect-[4/3] overflow-hidden rounded-sm"
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </FadeIn>
          </section>

          {/* ---- Visiting NYC? callout ---- */}
          <section className="w-full px-6 pb-24">
            <FadeIn>
              <div className="mx-auto flex max-w-xl items-start gap-5 rounded-xl border-[1.5px] border-house-coliving-deep bg-background p-6 text-foreground shadow-[0_4px_0_rgba(23,23,23,0.18)] md:px-8 md:py-7">
                <span aria-hidden="true" className="text-3xl leading-none">
                  🏠
                </span>
                <div>
                  <p className="text-label mb-2.5 text-house-coliving-deep">
                    Visiting NYC?
                  </p>
                  <p className="text-body leading-relaxed text-foreground/85">
                    Community members regularly offer sublets and short stays.
                    Fill out our{" "}
                    <a
                      href={HOUSING_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:decoration-foreground"
                    >
                      housing interest form
                    </a>{" "}
                    or ask in our{" "}
                    <a
                      href={DISCORD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline decoration-foreground/35 underline-offset-[3px] transition-colors hover:decoration-foreground"
                    >
                      Discord
                    </a>{" "}
                    to stay at Fractal.
                  </p>
                </div>
              </div>
            </FadeIn>
          </section>
        </div>

        {/* Mobile-only flanking pennants — in normal flow before the footer. */}
        <div
          aria-hidden="true"
          className="flex md:hidden items-end justify-center gap-3 px-3 pt-4 pb-12"
        >
          <div className="w-[45%] aspect-[123/368]">
            <CoLivingBannerSVG />
          </div>
          <div className="w-[45%] aspect-[123/368]">
            <CoLivingBannerSVG />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}

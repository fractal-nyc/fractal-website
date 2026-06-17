import type { CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import { Button } from "@/components/ui/button";
import { VisitBannerSVG } from "@/components/house/VisitBannerSVG";

export function NeighborhoodPage() {
  return (
    <main
      className="relative min-h-screen bg-house-visit-light text-foreground selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-visit-deep)" } as CSSProperties}
    >
      <FractalPattern color="#4A5A30" />
      <div className="relative z-10">
      <Navbar />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex md:justify-between"
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
        <section className="w-full">
          <div className="px-6 md:px-[22%] text-center">
            <SectorHeader letter="V" name="Visit" color="var(--color-house-visit-deep)" />

            <FadeIn>
              <p className="text-display mb-3 md:mb-10 text-center">
                Live Near 100 Friends & Peers
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="mb-6 md:mb-10">
                <p className="text-subtitle text-foreground mb-3 md:mb-4">
                  Want to visit? Fill out this form.
                </p>
                <Button asChild className="max-w-xs w-full text-center">
                  <a
                    href="https://airtable.com/appDkSh1TsmjHzacK/shrbrfFHeMTcSJ9dd"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visitor Form
                  </a>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <MandelbrotCorners size="sm" opacity={0.15} className="border [border-color:var(--accent,currentColor)] rounded-md p-9 md:px-10 md:py-8 mb-3 md:mb-10 bg-foreground/[0.03] text-foreground text-left max-w-xl mx-auto">
                <p className="text-label text-foreground mb-2 md:mb-3">
                  Note
                </p>
                <p className="text-body leading-relaxed text-foreground-muted">
                  Fractal is a decentralized network of apartments rather than a formal organization! So no one is in charge of sublets. The way staying here works:
                </p>
                <div className="flex justify-center mt-1.5 md:mt-3">
                  <ol className="list-decimal list-inside space-y-1 md:space-y-2 text-body leading-relaxed text-foreground-muted text-left">
                    <li>You fill out one of the forms below.</li>
                    <li>
                      An automatic message sends your info to leaseholders.
                    </li>
                    <li>
                      If a leaseholder has a room free, they can contact you. If
                      you don't get a reply, this typically just means that no one
                      has a room free.
                    </li>
                  </ol>
                </div>
              </MandelbrotCorners>
            </FadeIn>
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

import type { CSSProperties } from "react";
import { useRef } from "react";
import { useBannerAboveFooter } from "@/hooks/useBannerAboveFooter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";
import { EventsBannerSVG } from "@/components/house/EventsBannerSVG";
import { HOUSES } from "@/data/houses";

const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";
const CRYSTAL_MAILTO = "mailto:crystal@fractalnyc.com";

// FRAC-206/219: SVG stroke/fill needs a literal hex (var() doesn't resolve in SVG
// presentation attributes); sourced from the canonical Events palette.
const EVENTS_COLOR = HOUSES.find((h) => h.id === "events")!.palette.deep;

export function EventsPage() {
  const bannerRef = useRef<HTMLDivElement>(null);
  useBannerAboveFooter(bannerRef);

  return (
    <main
      className="relative min-h-screen bg-house-events-light text-foreground selection:bg-foreground selection:text-background"
      style={
        {
          "--accent": "var(--color-house-events-deep)",
          "--page-bg": "var(--color-house-events-light)",
        } as CSSProperties
      }
    >
      <FractalPattern color={EVENTS_COLOR} />
      <div className="relative z-10">
        <Navbar />
        <div
          ref={bannerRef}
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-28 md:top-36 z-0 hidden md:flex md:justify-between"
          style={{ height: "min(72vh, 660px)" }}
        >
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <EventsBannerSVG />
          </div>
          <div className="pointer-events-auto h-full w-[24%] md:w-[16%] max-w-[210px]">
            <EventsBannerSVG />
          </div>
        </div>

        {/* `clear-banners` reserves the fixed pennant layer's gutters on md+ so
            no section scrolls underneath a banner. The section keeps its `px-6`
            mobile gutter but drops its old `md:px-[4.5%]` — that percentage
            would compound with the clearance. */}
        <div className="clear-banners relative z-10 min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
          <section className="w-full px-6 text-center">
            <SectorHeader
              letter="E"
              name="Events"
              color="var(--color-house-events-deep)"
            />

            <FadeIn delay={0.1}>
              <p className="text-display mb-6 text-center">See You at Fractal</p>

              {/*
                Luma embed: calendar-ID URL from luma.com/nyc-tech > Manage > Embed.
                Uses the stable `cal-` calendar ID rather than the `nyc-tech` slug.
              */}
              <div className="relative w-full max-w-5xl mx-auto rounded-md overflow-hidden border border-house-events-deep bg-foreground/[0.03] h-[80vh] min-h-[600px] md:h-[850px] mb-6">
                <CornerDecorations size="xs" />
                <iframe
                  src="https://luma.com/embed/calendar/cal-RHI1LJC6K8JRBLI/events"
                  title="Fractal Tech NYC Events Calendar"
                  className="w-full h-full"
                  style={{ border: "none" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a
                href={LUMA_EVENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block max-w-3xl mx-auto mb-12 text-label text-foreground/90 text-center underline decoration-foreground/40 hover:decoration-foreground transition-colors"
              >
                Luma →
              </a>
            </FadeIn>

            <FadeIn delay={0.25}>
              <div className="max-w-2xl mx-auto rounded-md border border-house-events-deep/35 bg-house-events-deep/5 px-6 py-7 md:px-8 text-left">
                <p className="text-label text-house-events-deep mb-3">
                  Host an event in our space
                </p>
                <p className="text-body text-foreground/85 leading-relaxed">
                  To host a free event, add it to our{" "}
                  <a
                    href={LUMA_EVENTS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-house-events-deep underline decoration-house-events-deep/40 hover:decoration-house-events-deep transition-colors"
                  >
                    Luma calendar
                  </a>
                  . To host a paid event, email{" "}
                  <a
                    href={CRYSTAL_MAILTO}
                    className="text-house-events-deep underline decoration-house-events-deep/40 hover:decoration-house-events-deep transition-colors"
                  >
                    crystal@fractalnyc.com
                  </a>
                  .
                </p>
              </div>
            </FadeIn>
          </section>
        </div>

        {/* Mobile-only flanking pennants — bold moment before the footer.
            Desktop uses the fixed `hidden md:flex` layer above; this block is
            `flex md:hidden` and sits in normal flow. Each pennant gets an explicit
            aspect-ratio (SVG viewBox ~123:368) so `h-full w-full` on the inner
            <svg> resolves without a fixed-height ancestor. */}
        <div
          aria-hidden="true"
          className="flex md:hidden items-end justify-center gap-3 px-3 pt-8 pb-12"
        >
          <div className="w-[45%] aspect-[123/368]">
            <EventsBannerSVG />
          </div>
          <div className="w-[45%] aspect-[123/368]">
            <EventsBannerSVG />
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}

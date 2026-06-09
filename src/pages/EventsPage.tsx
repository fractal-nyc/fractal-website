import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";
import { Button } from "@/components/ui/button";

const LUMA_EVENTS_URL = "https://lu.ma/nyc-tech";
const CRYSTAL_MAILTO = "mailto:crystal@fractalnyc.com";

export function EventsPage() {
  return (
    <main className="relative min-h-screen bg-house-events-light text-foreground selection:bg-foreground selection:text-background">
      <FractalPattern color="#C13B2A" />
      <div className="relative z-10">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        <section className="w-full px-6 md:px-[4.5%] text-center">
          <SectorHeader letter="E" name="Events" color="var(--color-house-events-deep)" />

          <FadeIn delay={0.1}>
            <p className="text-display mb-6 text-center">
              Join Tech Events
            </p>
            {/*
              Luma embed: slug-based URL `https://lu.ma/embed/calendar/nyc-tech/events`.
              If Luma ever rejects this path, replace with the canonical calendar-UUID
              embed URL from luma.com/nyc-tech > Manage > Embed.
            */}
            <div className="relative w-full max-w-5xl mx-auto rounded-md overflow-hidden border border-foreground/20 bg-foreground/[0.03] h-[80vh] min-h-[600px] md:h-[850px] mb-6">
              <CornerDecorations size="xs" />
              <iframe
                src="https://lu.ma/embed/calendar/nyc-tech/events"
                title="Fractal Tech NYC Events Calendar"
                className="w-full h-full"
                style={{ border: "none" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="max-w-3xl mx-auto mb-12 text-body text-foreground/90 leading-relaxed text-center">
              Our community hosts events nearly every day. See upcoming events on our{" "}
              <a
                href={LUMA_EVENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-foreground/40 hover:decoration-foreground transition-colors"
              >
                Luma calendar
              </a>{" "}
              →
            </p>
          </FadeIn>

          <FadeIn delay={0.25}>
            <p className="text-display mb-6 text-center">
              Host Our Next Event
            </p>
            <div className="max-w-3xl mx-auto mb-6 space-y-3 text-subtitle text-foreground/90 leading-relaxed text-center">
              <p>Anyone can host an event in our space, even non-members:</p>
              <p>🆓 To host a free event, add it directly to our Luma calendar</p>
              <p>💰 To host a paid event, email crystal@fractalnyc.com</p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 justify-center items-center mb-12">
              <Button asChild className="max-w-xs w-full text-center">
                <a
                  href={LUMA_EVENTS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Luma calendar
                </a>
              </Button>
              <Button asChild className="max-w-xs w-full text-center">
                <a href={CRYSTAL_MAILTO}>Email Crystal</a>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="text-display mb-6 text-center">
              Stay in the Loop
            </p>
            <Button asChild className="max-w-xs w-full text-center">
              <a
                href="https://discord.com/invite/vugp6Nza"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Discord
              </a>
            </Button>
          </FadeIn>
        </section>
      </div>
      <Footer />
      </div>
    </main>
  );
}

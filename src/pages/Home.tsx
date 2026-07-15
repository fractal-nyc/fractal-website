import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { OriginStory } from "@/components/sections/OriginStory";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { gallerySections } from "@/data/storyPhotos";
import { FadeIn } from "@/components/ui/FadeIn";
import { SECTIONS } from "@/data/houses";
import { useEffect } from "react";

// Story's single gold identity accent (matches the Navbar Story link + the
// octahedron Story face). Used only as the SectorHeader letter/label tint.
const STORY_COLOR = SECTIONS.story.accent;

// Story deep-gold — the "Curious about Fractal?" callout label. A blessed
// literal (see DESIGN.md § Colors); deeper than section-story so it reads on
// cream at label size.
const STORY_GOLD_DEEP = "#a08a2e";

const DISCORD_URL = "https://discord.gg/Er974gPTXe";
const IAN_CHAT_URL =
  "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0ektkyvH1NQIxPdiKXPASm0WqwG7ee6QKJCDPIarnT5mS_WvLqDLaBb8Pk_va_YlVRXz6DRwnb";

export function Home() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <Hero />

      {/* Story — merged in from the retired /story page. */}
      <section className="relative flex flex-col items-center justify-start pt-16 md:pt-24">
        {/* Flanking favicon diamonds — decorative brand framing that mirrors the
            house-banner flanking pattern: an absolute, pointer-events-none layer
            pinned to the page edges so it never constrains the heading's width.
            Desktop-only; on mobile the heading stays full-bleed. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-36 md:top-52 z-0 hidden md:flex items-center justify-between"
          style={{ height: "min(46vh, 380px)" }}
        >
          <img src="/favicon.svg" alt="" className="w-[16%] lg:w-[14%] max-w-[260px] h-auto" />
          <img src="/favicon.svg" alt="" className="w-[16%] lg:w-[14%] max-w-[260px] h-auto" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-[4.5%] w-full">
          <SectorHeader letter="S" name="Story" color={STORY_COLOR} />
          <FadeIn>
            <p className="text-display mb-12 text-center">
              From a Single Apartment to a Neighborhood Campus
            </p>
          </FadeIn>
        </div>
      </section>

      <OriginStory />

      <PhotoGallery sections={gallerySections} />

      {/* Curious about Fractal? — Discord + one-on-one chat with Ian. */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-2xl mx-auto px-6 md:px-[4.5%]">
          <FadeIn>
            <div
              className="rounded-md border border-foreground-faint p-7 md:px-8"
              style={{ backgroundColor: `${STORY_COLOR}14` }}
            >
              <p className="text-label mb-3" style={{ color: STORY_GOLD_DEEP }}>
                Curious about Fractal?
              </p>
              <p className="text-body text-foreground/85 leading-relaxed">
                Join our{" "}
                <a
                  href={DISCORD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground transition-colors"
                >
                  Discord
                </a>{" "}
                and say hi. Or if you prefer a one-on-one conversation,{" "}
                <a
                  href={IAN_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground transition-colors"
                >
                  schedule a virtual chat with Ian
                </a>
                .
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}

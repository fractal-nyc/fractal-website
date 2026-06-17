import type { CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { Button } from "@/components/ui/button";
import { SECTIONS } from "@/data/houses";

// FRAC-206: SVG stroke/fill needs a literal hex (var() doesn't resolve in SVG
// presentation attributes); sourced from the canonical SECTIONS.people.deep.
const PEOPLE_COLOR = SECTIONS.people.deep;

export function PeoplePage() {
  return (
    <main
      className="relative min-h-screen bg-section-people-light text-foreground selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-section-people-deep)" } as CSSProperties}
    >
      <FractalPattern color={PEOPLE_COLOR} />
      <div className="relative z-10">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        <section className="w-full">
          <div className="px-6 md:px-[4.5%]">
            <SectorHeader letter="P" name="People" color="var(--color-section-people-deep)" />
            <FadeIn delay={0.2}>
              <div className="text-center">
                <p className="text-display text-white mb-6 text-center">
                  A Fractal Is a Friendship Infrastructure
                </p>
                <Button asChild className="max-w-xs w-full mb-8 text-center">
                  <a
                    href="https://discord.gg/Er974gPTXe"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Join Discord
                  </a>
                </Button>
                <p className="text-body font-light text-white">
                  Look forward to the Fractal Network Portal available to Fractal Members soon...
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
      <Footer />
      </div>
    </main>
  );
}

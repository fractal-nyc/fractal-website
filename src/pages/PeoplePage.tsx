import type { CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { Button } from "@/components/ui/button";

export function PeoplePage() {
  return (
    <main
      className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background"
      style={{ backgroundColor: "#C49040", "--btn-accent": "#B65D19" } as CSSProperties}
    >
      <FractalPattern color="#B65D19" />
      <div className="relative z-10">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        <section className="w-full">
          <div className="px-6 md:px-[4.5%]">
            <SectorHeader letter="P" name="People" color="#B65D19" />
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
                <PretextParagraph
                  size={TEXT_SIZES.lg}
                  className="font-light text-white"
                >
                  {"Look forward to the Fractal Network Portal available to Fractal Members soon..."}
                </PretextParagraph>
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

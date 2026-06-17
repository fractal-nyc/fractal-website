import type { CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { Button } from "@/components/ui/button";

export function PoliticalClubPage() {
  return (
    <main
      className="btn-on-dark relative min-h-screen bg-house-political-club-deep text-background selection:bg-foreground selection:text-background"
      style={{ "--accent": "var(--color-house-political-club-light)" } as CSSProperties}
    >
      <FractalPattern color="var(--color-house-political-club-light)" />
      <div className="relative z-10">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        <section className="w-full">
          <div className="px-6 md:px-[4.5%] text-center">
            <SectorHeader
              letter="PC"
              name="Political Club"
              color="var(--color-house-political-club-light)"
            />
            <FadeIn>
              <p className="text-display text-center mb-10">
                Maximum New York — A New Civics School
              </p>
              <Button asChild className="max-w-xs w-full text-center">
                <a
                  href="https://www.maximumnewyork.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Maximum New York
                </a>
              </Button>
            </FadeIn>
          </div>
        </section>
      </div>
      <Footer />
      </div>
    </main>
  );
}

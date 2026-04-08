import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";

export function PeoplePage() {
  return (
    <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#C49040" }}>
      <FractalPattern color="#B65D19" />
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        <section className="w-full">
          <div className="px-6 md:px-[4.5%]">
            <SectorHeader letter="P" name="People" color="#B65D19" />
            <FadeIn delay={0.2}>
              <div className="text-center">
                <p className="font-serif text-4xl md:text-6xl leading-[1.3] text-white mb-6 text-center" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
                  A Fractal Is a Friendship Infrastructure
                </p>
                <a
                  href="https://discord.com/invite/vugp6Nza"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden mb-8"
                >
                  <CornerDecorations size="xs" />
                  Join Discord
                </a>
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
    </main>
  );
}

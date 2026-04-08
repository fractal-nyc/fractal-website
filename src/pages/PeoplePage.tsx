import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";

export function PeoplePage() {
  return (
    <main className="min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#C49040" }}>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center w-full">
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
                  className="block border border-foreground/20 rounded-md px-8 py-3 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center mb-8"
                >
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

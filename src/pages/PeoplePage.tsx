import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";

export function PeoplePage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <SectorHeader letter="P" name="People" color="#C49040" />
            <FadeIn delay={0.2}>
              <div className="max-w-5xl mx-auto text-center">
                <p className="font-serif text-lg font-light leading-relaxed text-muted-foreground mb-6 text-pretty">
                  To learn more about who is in Fractal join the Discord{" "}
                  <a
                    href="https://discord.com/invite/vugp6Nza"
                    className="underline underline-offset-4 text-foreground hover:opacity-70 transition-opacity"
                  >
                    here
                  </a>{" "}
                  and introduce yourself.
                </p>
                <PretextParagraph
                  size={TEXT_SIZES.lg}
                  className="font-light text-muted-foreground"
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

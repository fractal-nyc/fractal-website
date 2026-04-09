import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { MandelbrotCorners, CornerDecorations } from "@/components/ui/MandelbrotCorners";

export function NeighborhoodPage() {
  return (
    <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#889460" }}>
      <FractalPattern color="#4A5A30" />
      <div className="relative z-10">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        <section className="w-full">
          <div className="px-6 md:px-[4.5%] text-center">
            <SectorHeader letter="N" name="Neighborhood" color="#4A5A30" />

            <FadeIn>
              <p className="font-serif text-xl md:text-6xl leading-[1.3] mb-3 md:mb-10 text-center" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
                Live Near 100 Friends & Peers
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <MandelbrotCorners size="sm" opacity={0.15} className="border border-foreground/20 rounded-md px-3 py-2.5 md:px-5 md:py-5 mb-3 md:mb-10 bg-foreground/[0.03] text-left max-w-xl mx-auto">
                <p className="text-xs font-semibold uppercase tracking-wider text-white mb-2 md:mb-3">
                  Note
                </p>
                <p className="text-xs leading-relaxed text-white">
                  Fractal is a decentralized network of apartments rather than a formal organization! So no one is in charge of sublets. The way staying here works:
                </p>
                <div className="flex justify-center mt-1.5 md:mt-3">
                  <ol className="list-decimal list-inside space-y-1 md:space-y-2 text-xs leading-relaxed text-white text-left">
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

            <FadeIn delay={0.15}>
              <div>
                <PretextParagraph
                  size={TEXT_SIZES.sm}
                  className="text-white mb-3 md:mb-4"
                >
                  {"Want to visit? Fill out this form."}
                </PretextParagraph>
                <a
                  href="https://airtable.com/appDkSh1TsmjHzacK/shrbrfFHeMTcSJ9dd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-4 md:py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
                >
                  <CornerDecorations size="xs" />
                  Visitor Form
                </a>
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

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";
import { FractalPattern } from "@/components/ui/FractalPattern";

export function NeighborhoodPage() {
  return (
    <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#889460" }}>
      <FractalPattern color="#4A5A30" />
      <Navbar />
      <div className="min-h-screen flex items-center justify-center w-full">
        <section className="w-full">
          <div className="px-6 md:px-[4.5%] text-center">
            <SectorHeader letter="N" name="Neighborhood" color="#4A5A30" />

            <FadeIn>
              <p className="font-serif text-2xl md:text-6xl leading-[1.3] mb-5 md:mb-10 text-center" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
                Live Near 100 Friends & Peers
              </p>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="border border-foreground/20 rounded-md px-4 py-3 md:px-5 md:py-5 mb-5 md:mb-10 bg-foreground/[0.03] text-left">
                <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-white mb-2 md:mb-3">
                  Note
                </p>
                <PretextParagraph
                  size={TEXT_SIZES.sm}
                  className="text-white"
                >
                  {"Fractal is a decentralized network of apartments rather than a formal organization! So no one is in charge of sublets. The way staying here works:"}
                </PretextParagraph>
                <ol className="list-decimal list-inside mt-2 md:mt-3 space-y-1 md:space-y-2 text-xs md:text-base leading-relaxed text-white">
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
            </FadeIn>

            <FadeIn delay={0.3}>
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
                  className="block border border-foreground/20 rounded-md px-8 py-3 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center"
                >
                  Visitor Form
                </a>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

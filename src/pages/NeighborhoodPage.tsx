import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";

export function NeighborhoodPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
            <SectorHeader letter="N" name="Neighborhood" color="#889460" />

            <FadeIn delay={0.15}>
              <div className="border border-foreground/20 rounded-md px-5 py-5 mb-10 bg-foreground/[0.03] text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                  Note
                </p>
                <PretextParagraph
                  size={TEXT_SIZES.base}
                  className="text-foreground/80"
                >
                  {"Fractal is a decentralized network of apartments rather than a formal organization! So no one is in charge of sublets. The way staying here works:"}
                </PretextParagraph>
                <ol className="list-decimal list-inside mt-3 space-y-2 text-base leading-relaxed text-foreground/80">
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
                  size={TEXT_SIZES.base}
                  className="text-foreground/80 mb-4"
                >
                  {"Want to visit? Fill out this form."}
                </PretextParagraph>
                <a
                  href="https://airtable.com/appDkSh1TsmjHzacK/shrbrfFHeMTcSJ9dd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-foreground px-8 py-3 text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
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

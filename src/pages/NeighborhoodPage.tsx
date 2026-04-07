import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";

export function NeighborhoodPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <section className="py-16 md:py-24">
          <div className="max-w-2xl mx-auto px-6 md:px-12">
            <FadeIn>
              <h1 className="text-sm font-semibold uppercase tracking-widest text-foreground mb-10">
                Neighborhood
              </h1>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="border border-foreground/20 rounded-md px-5 py-5 mb-10 bg-foreground/[0.03]">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-3">
                  Note
                </p>
                <p className="text-base leading-relaxed text-foreground/80">
                  Fractal is a decentralized network of apartments rather than a
                  formal organization! So no one is in charge of sublets. The way
                  staying here works:
                </p>
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
                <p className="text-base text-foreground/80 mb-4">
                  Want to visit? Fill out this form.
                </p>
                <a
                  href="https://airtable.com/appDkSh1TsmjHzacK/shrbrfFHeMTcSJ9dd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block border border-foreground/30 rounded-md px-5 py-3 text-sm font-medium uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background transition-colors"
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

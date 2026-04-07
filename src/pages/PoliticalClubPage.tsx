import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";

export function PoliticalClubPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <section className="py-24 md:py-40">
          <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
            <SectorHeader letter="P" name="Political Club" color="#6E1830" />
            <FadeIn>
              <p className="font-serif text-2xl md:text-3xl leading-relaxed text-pretty mb-10">
                Learn about our current political club through Maximum New York{" "}
                <a
                  href="https://www.maximumnewyork.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-muted-foreground transition-colors"
                >
                  here
                </a>
                .
              </p>
              <a
                href="https://www.maximumnewyork.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-foreground px-8 py-3 text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
              >
                Maximum New York
              </a>
            </FadeIn>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

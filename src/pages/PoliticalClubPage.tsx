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
            <SectorHeader letter="P" name="Political Club" color="#CC2936" />
            <FadeIn>
              <p className="text-lg md:text-xl leading-relaxed text-pretty">
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
            </FadeIn>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

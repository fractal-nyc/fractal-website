import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";
import { HouseBanner } from "@/components/house/HouseBanner";
import { getHouseBySlug } from "@/data/houses";

export function NeighborhoodPage() {
  const house = getHouseBySlug("neighborhood")!;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <section className="py-24 md:py-40">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn>
              <HouseBanner house={house} variant="full" />
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-16 max-w-2xl mx-auto">
                <p className="text-lg font-light leading-relaxed text-muted-foreground whitespace-pre-line">
                  {house.description}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

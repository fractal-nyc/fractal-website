import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";

export function NeighborhoodPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <section className="py-24 md:py-40">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn>
              <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">Neighborhood</h2>
              <p className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight">
                Coming soon.
              </p>
            </FadeIn>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

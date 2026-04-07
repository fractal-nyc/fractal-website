import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";

export function PeoplePage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn>
              <h1 className="text-4xl md:text-5xl font-serif mb-8">People</h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-lg font-light leading-relaxed text-muted-foreground mb-6">
                  To learn more about who is in Fractal join the Discord{" "}
                  <a
                    href="https://discord.com/invite/vugp6Nza"
                    className="underline underline-offset-4 text-foreground hover:opacity-70 transition-opacity"
                  >
                    here
                  </a>{" "}
                  and introduce yourself.
                </p>
                <p className="text-lg font-light leading-relaxed text-muted-foreground">
                  Look forward to the Fractal Network Portal available to
                  Fractal Members soon...
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

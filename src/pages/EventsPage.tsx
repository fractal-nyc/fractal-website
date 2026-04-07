import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";

export function EventsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <section className="pt-32 pb-24 md:pt-40 md:pb-40 px-6 md:px-12 max-w-3xl mx-auto">
        <FadeIn>
          <h1 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-8">
            Events
          </h1>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-lg md:text-xl leading-relaxed mb-10">
            Public tech events are posted{" "}
            <a
              href="https://luma.com/nyc-tech"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              here
            </a>
            .
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <a
            href="#"
            className="inline-block bg-foreground text-background px-6 py-3 text-sm font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity mb-10"
          >
            Join Discord — Apply Here
          </a>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="text-lg md:text-xl leading-relaxed">
            Want to host an event at Fractal? Email{" "}
            <a
              href="mailto:#"
              className="underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Merlin's Place
            </a>
            !
          </p>
        </FadeIn>
      </section>
      <Footer />
    </main>
  );
}

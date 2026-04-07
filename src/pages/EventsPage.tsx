import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";

export function EventsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <section className="pt-32 pb-24 md:pt-40 md:pb-40 px-6 md:px-12 max-w-5xl mx-auto text-center">
        <SectorHeader letter="E" name="Events" color="#D4857A" />

        <FadeIn delay={0.1}>
          <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-6 text-pretty">
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
          <a
            href="https://luma.com/nyc-tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-foreground px-8 py-3 text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors duration-300 mb-10"
          >
            Events Calendar
          </a>
        </FadeIn>

        <FadeIn delay={0.2}>
          <a
            href="https://discord.com/invite/vugp6Nza"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-foreground text-background px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:opacity-80 transition-opacity mb-10"
          >
            Join Discord — Apply Here
          </a>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-6">
            Want to host an event at Fractal? Email{" "}
            <a
              href="mailto:events@merlins.place"
              className="underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              Merlin's Place
            </a>
            !
          </p>
          <a
            href="mailto:events@merlins.place"
            className="inline-block border border-foreground px-8 py-3 text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            Email Merlin's Place
          </a>
        </FadeIn>
      </section>
      <Footer />
    </main>
  );
}

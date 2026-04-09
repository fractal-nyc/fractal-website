import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";

export function EventsPage() {
  return (
    <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4857A" }}>
      <FractalPattern color="#C13B2A" />
      <div className="relative z-10">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        <section className="w-full px-6 md:px-[4.5%] text-center">
          <SectorHeader letter="E" name="Events" color="#C13B2A" />

          <FadeIn delay={0.1}>
            <p className="font-serif text-4xl md:text-6xl leading-[1.3] mb-6 text-center" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
              Host Our Next Event
            </p>
            <a
              href="mailto:events@merlins.place"
              className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden mb-12"
            >
              <CornerDecorations size="xs" />
              Email Merlin's Place
            </a>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="font-serif text-4xl md:text-6xl leading-[1.3] mb-6 text-center" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
              Join Tech Events
            </p>
            <a
              href="https://luma.com/nyc-tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden mb-12"
            >
              <CornerDecorations size="xs" />
              Luma Calendar
            </a>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="font-serif text-4xl md:text-6xl leading-[1.3] mb-6 text-center" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
              Stay in the Loop
            </p>
            <a
              href="https://discord.com/invite/vugp6Nza"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
            >
              <CornerDecorations size="xs" />
              Join Discord
            </a>
          </FadeIn>
        </section>
      </div>
      <Footer />
      </div>
    </main>
  );
}

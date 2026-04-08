import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";

export function PoliticalClubPage() {
  return (
    <main className="relative min-h-screen text-white selection:bg-white selection:text-[#6E1830]" style={{ backgroundColor: "#6E1830" }}>
      <FractalPattern color="#C83858" />
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 pb-32 md:pb-48 w-full">
        <section className="w-full">
          <div className="px-6 md:px-[4.5%] text-center">
            <SectorHeader letter="PC" name="Political Club" color="#C83858" />
            <FadeIn>
              <p className="font-serif text-4xl md:text-6xl leading-[1.3] text-center mb-10" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
                Maximum New York — A New Civics School
              </p>
              <a
                href="https://www.maximumnewyork.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
              >
                <CornerDecorations size="xs" />
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

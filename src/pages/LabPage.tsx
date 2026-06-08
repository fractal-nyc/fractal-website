import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";
import { DocumentGrid } from "@/components/lab/DocumentGrid";
import { ArchiveToolbar } from "@/components/lab/ArchiveToolbar";
import { useArchiveFilter } from "@/hooks/use-archive-filter";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES } from "@/lib/pretext";
import { FractalPattern } from "@/components/ui/FractalPattern";

export function LabPage() {
  const filter = useArchiveFilter();
  return (
    <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#E870A0" }}>
      <FractalPattern color="#C44878" />
      <div className="relative z-10">
      <Navbar />
      <div>
        {/* Publications heading + description */}
        <section className="flex flex-col items-center justify-start pt-16 md:pt-24 pb-12 md:pb-20 w-full">
          <div className="px-6 md:px-[4.5%] w-full">
            <SectorHeader letter="P" name="Publications" color="#C44878" />
            <FadeIn delay={0.1}>
              <div className="text-center">
                <p className="text-display mb-6 text-center">
                  A Research Institute Doing 'Gain of Function Research on the Golden Age Virus'
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Research & Writing archive */}
        <section className="pt-0 pb-16 md:pb-24">
          <div className="relative max-w-7xl mx-auto px-6 md:px-[4.5%]">
            {/* Mandelbrot watermark — desktop */}
            <div className="hidden md:block absolute right-8 top-0 pointer-events-none select-none" aria-hidden="true">
              <MandelbrotIcon size={320} opacity={0.04} />
            </div>
            {/* Mandelbrot watermark — mobile */}
            <div className="block md:hidden absolute right-4 top-0 pointer-events-none select-none" aria-hidden="true">
              <MandelbrotIcon size={200} opacity={0.04} />
            </div>

            <FadeIn delay={0.3}>
              <div className="mb-12 md:mb-16 border-b border-border pb-8">
                <h2 className="flex items-center gap-2 text-sm font-thin not-italic tracking-widest font-mono text-white mb-3">
                  Research + Writing
                  <MandelbrotIcon size={18} opacity={0.35} />
                </h2>
                <p className="text-3xl md:text-4xl font-serif leading-tight normal-case">
                  The Records
                </p>
                <PretextParagraph
                  size={TEXT_SIZES.base}
                  className="text-white mt-3 font-light max-w-xl"
                >
                  {"Essays, publications, and podcasts from the minds behind Fractal Labs."}
                </PretextParagraph>
              </div>
            </FadeIn>

            {/* Archive toolbar: search only for MVP v0 (FRAC-8); tags hidden per FRAC-169 cleanup. */}
            <FadeIn delay={0.4}>
              <ArchiveToolbar filter={filter} showTags={false} />
            </FadeIn>
            <DocumentGrid documents={filter.isFiltering ? filter.filtered : undefined} />
          </div>
        </section>
      </div>
      <Footer />
      </div>
    </main>
  );
}

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";
import { DocumentGrid } from "@/components/lab/DocumentGrid";
import { ArchiveToolbar } from "@/components/lab/ArchiveToolbar";
import { useArchiveFilter } from "@/hooks/use-archive-filter";
import { FractalPattern } from "@/components/ui/FractalPattern";

export function LabPage() {
  const filter = useArchiveFilter();
  return (
    <main className="relative min-h-screen bg-house-publications-light text-background selection:bg-foreground selection:text-background">
      <FractalPattern color="#C44878" />
      <div className="relative z-10">
      <Navbar />
      <div>
        {/* Publications heading + description */}
        <section className="flex flex-col items-center justify-start pt-16 md:pt-24 pb-12 md:pb-20 w-full">
          <div className="px-6 md:px-[4.5%] w-full">
            <SectorHeader letter="P" name="Publications" color="var(--color-house-publications-deep)" />
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
                <h2 className="text-eyebrow not-italic flex items-center gap-2 mb-3">
                  Research + Writing
                  <MandelbrotIcon size={18} opacity={0.35} />
                </h2>
                <p className="text-title leading-tight normal-case">
                  The Records
                </p>
                <p className="text-body-lead mt-3 max-w-xl">
                  Essays, publications, and podcasts from the minds of Fractal.
                </p>
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

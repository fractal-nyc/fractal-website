import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";
import { DocumentGrid } from "@/components/lab/DocumentGrid";
import { ArchiveToolbar } from "@/components/lab/ArchiveToolbar";
import { useArchiveFilter } from "@/hooks/use-archive-filter";
import { getHouseBySlug } from "@/data/houses";

export function LabPage() {
  const house = getHouseBySlug("lab")!;
  const filter = useArchiveFilter();

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      <Navbar />
      <div className="pt-32">
        {/* Lab heading + description */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn>
              <h1 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-8">
                Lab
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="max-w-4xl mx-auto text-center">
                <p className="text-lg font-light leading-relaxed text-muted-foreground whitespace-pre-line text-pretty">
                  {house.description}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Research & Writing archive */}
        <section className="py-16 md:py-24">
          <div className="relative max-w-7xl mx-auto px-6 md:px-12">
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
                <h2 className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                  Research + Writing
                  <MandelbrotIcon size={18} opacity={0.35} />
                </h2>
                <p className="text-3xl md:text-4xl font-serif leading-tight">
                  The archive
                </p>
                <p className="text-muted-foreground mt-3 font-light text-base max-w-xl">
                  Essays, publications, and podcasts from the minds behind
                  Fractal Labs.
                </p>
              </div>
            </FadeIn>

            {/* Search + tag filter toolbar */}
            <FadeIn delay={0.4}>
              <ArchiveToolbar filter={filter} />
            </FadeIn>

            {/* Document grid — pass filtered docs when filtering, default otherwise */}
            <DocumentGrid
              documents={filter.isFiltering ? filter.filtered : undefined}
            />
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FadeIn } from "@/components/ui/FadeIn";
import { HouseBanner } from "@/components/house/HouseBanner";
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
        {/* House banner */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn>
              <HouseBanner house={house} variant="full" />
            </FadeIn>
          </div>
        </section>

        {/* Lab description */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn delay={0.2}>
              <div className="max-w-2xl mx-auto">
                <p className="text-lg font-light leading-relaxed text-muted-foreground whitespace-pre-line">
                  {house.description}
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Research & Writing archive */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <FadeIn delay={0.3}>
              <div className="mb-12 md:mb-16 border-b border-border pb-8">
                <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                  Research + Writing
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

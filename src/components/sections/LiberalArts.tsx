import { FadeIn } from "@/components/ui/FadeIn";

export function LiberalArts() {
  return (
    <section id="new-liberal-arts" className="py-24 md:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn>
          <div className="mb-20 md:mb-32">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">New Liberal Arts</h2>
            <p className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight">
              Learning as a way of <span className="italic">living.</span>
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div>
            <FadeIn direction="right">
              <div className="flex flex-col gap-6">
                <h3 className="text-3xl md:text-4xl font-serif">Fractal University</h3>
                <p className="text-lg text-foreground/70 leading-relaxed font-light">
                  Where we teach everything from art, to cooking, to coding. Classes are cozy (we teach them from our living rooms), and it's a lot of fun to learn from and with our friends.
                </p>
              </div>
            </FadeIn>
          </div>

          <div>
            <FadeIn direction="left" delay={0.2}>
              <div className="aspect-[4/5] md:aspect-square overflow-hidden bg-muted relative group">
                <img
                  src={`${import.meta.env.BASE_URL}images/fractal-university.png`}
                  alt="Fractal University"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-4 border border-background/30 pointer-events-none z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

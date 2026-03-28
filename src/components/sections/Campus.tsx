import { FadeIn } from "@/components/ui/FadeIn";

export function Campus() {
  return (
    <section id="campus" className="py-24 md:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <FadeIn>
            <div>
              <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">The Campus</h2>
              <p className="text-3xl md:text-5xl font-serif leading-tight mb-8">
                A neighborhood <span className="italic">campus</span> woven into the city.
              </p>
              <div className="space-y-6 text-lg text-foreground/70 font-light leading-relaxed">
                <p>
                  Living near each other has helped us coordinate and incubate a bunch of fun projects. What started as a single apartment has grown into a decentralized campus spread across the neighborhood.
                </p>
                <p>
                  Shared spaces, co-working rooms, classrooms in living rooms, and community gathering spots — all within walking distance of each other in NYC.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="aspect-[4/3] overflow-hidden bg-muted relative group">
              <img
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop"
                alt="New York City neighborhood"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

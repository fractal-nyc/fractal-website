import { FadeIn } from "@/components/ui/FadeIn";

export function Vision() {
  return (
    <section id="vision" className="py-32 md:py-48 bg-muted relative overflow-hidden">
      {/* Texture overlay */}
      <div className="absolute inset-0 mix-blend-overlay opacity-30 pointer-events-none">
        <img 
          src={`${import.meta.env.BASE_URL}images/texture.png`} 
          alt="Texture" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
        <FadeIn>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight text-foreground">
            "Is there a <span className="italic">vision?</span>"
          </h2>
        </FadeIn>
        
        <FadeIn delay={0.2} className="mt-12">
          <p className="text-xl md:text-3xl font-light text-foreground/80 leading-relaxed text-balance">
            Many of us want to help improve the creative and civic culture in NYC—focusing on housing, energy, art, community, and human flourishing.
          </p>
        </FadeIn>

        <FadeIn delay={0.4} className="mt-8">
          <p className="text-lg md:text-2xl font-serif italic text-foreground/60">
            ...but some are just here to live a well-rounded life.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

import { FadeIn } from "@/components/ui/FadeIn";

export function OriginStory() {
  const imageSrc = "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop";

  return (
    <section id="story" className="py-24 md:py-40 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          
          <div className="lg:col-span-5 order-2 lg:order-1">
            <FadeIn direction="right">
              <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
                From a single apartment to a <span className="italic opacity-70">neighborhood campus.</span>
              </h2>
              <div className="space-y-6 text-lg md:text-xl text-background/80 font-light">
                <p>
                  It started simply: weekly dinners where people gave 5-minute talks about things they were passionate about.
                </p>
                <p>
                  What began as a gathering of friends quickly outgrew its original container. Living near each other helped us coordinate, collaborate, and incubate a bunch of fun projects.
                </p>
                <p>
                  Today, Fractal is a decentralized campus woven into the fabric of the city—a place where intellectual curiosity meets communal living.
                </p>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <FadeIn direction="left" delay={0.2}>
              <div className="relative aspect-[4/3] md:aspect-[3/4] overflow-hidden rounded-sm bg-background/10">
                {/* Fallback image representing the NYC loft/campus aesthetic */}
                <img 
                  src={imageSrc}
                  alt="Fractal NYC community space"
                  className="w-full h-full object-cover filter contrast-125 saturate-50 transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 border border-background/20 rounded-sm pointer-events-none"></div>
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </section>
  );
}

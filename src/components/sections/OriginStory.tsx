import { FadeIn } from "@/components/ui/FadeIn";

export function OriginStory() {
  const imageSrc = `${import.meta.env.BASE_URL}images/hero-bg.png`;

  return (
    <section id="story" className="py-24 md:py-40 bg-foreground text-background overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">

        {/* Text — constrained to the content width on the left */}
        <div className="order-2 lg:order-1 px-6 md:px-12 lg:pl-[max(2rem,calc((100vw-80rem)/2+3rem))] lg:pr-12">
          <FadeIn direction="right">
            <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">
              From a single apartment to a <span className="italic opacity-70">neighborhood campus.</span>
            </h2>
            <div className="space-y-6 text-lg md:text-xl text-background/80 font-light">
              <p>
                It started simply: weekly dinners where people gave 5-minute talks about things they were passionate about.
              </p>
              <p>
                What began as a gathering of friends quickly outgrew its original container.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Image — right 50% of viewport, bleeds to edge */}
        <div className="order-1 lg:order-2">
          <FadeIn direction="left" delay={0.2}>
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[600px] overflow-hidden bg-background/10">
              <img
                src={imageSrc}
                alt="Fractal NYC community space"
                className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>

      </div>
    </section>
  );
}

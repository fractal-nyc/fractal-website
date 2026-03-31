import { FadeIn } from "@/components/ui/FadeIn";

export function Events() {
  return (
    <section id="events" className="py-24 md:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn>
          <div className="mb-20 md:mb-32">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">Events</h2>
            <p className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight">
              Come <span className="italic">hang out</span> with us.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <a
            href="https://luma.com/nyc-tech"
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden bg-muted relative group"
          >
            <div className="aspect-[1200/629] overflow-hidden">
              <img
                src="https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,anim=false,background=white,quality=75,width=1200,height=629/calendar-cover-images/hk/b16f08c6-7f65-41ba-a274-24aee3add8fc"
                alt="Fractal Tech: NYC events"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

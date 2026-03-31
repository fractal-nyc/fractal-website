import { FadeIn } from "@/components/ui/FadeIn";

const campusProjects = [
  {
    title: "Fractal Bootcamp & Tech Hub",
    description: "A three month intensive software engineering bootcamp, paired with our co-working space and AI accelerator. A rigorous environment for builders who want to level up their skills and ship projects together.",
    image: `${import.meta.env.BASE_URL}images/fractal-tech-hub.png`
  },
  {
    title: "Merlin's Place",
    description: "Our first community-run third space. A hub for spontaneous connection, featuring a custom 3000-LED lighting installation on the ceiling.",
    image: `${import.meta.env.BASE_URL}images/merlins-place.png`
  }
];

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
                src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
                alt="Fractal community gathering"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>

        <div className="space-y-32 mt-32">
          {campusProjects.map((project, index) => (
            <div
              key={project.title}
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center ${
                index % 2 !== 0 ? "md:rtl" : ""
              }`}
            >
              <div className={index % 2 !== 0 ? "md:col-start-2" : ""}>
                <FadeIn direction={index % 2 === 0 ? "right" : "left"}>
                  <div className="flex flex-col gap-6">
                    <h3 className="text-3xl md:text-4xl font-serif">{project.title}</h3>
                    <p className="text-lg text-foreground/70 leading-relaxed font-light">
                      {project.description}
                    </p>
                  </div>
                </FadeIn>
              </div>

              <div className={index % 2 !== 0 ? "md:col-start-1 md:row-start-1" : ""}>
                <FadeIn direction={index % 2 === 0 ? "left" : "right"} delay={0.2}>
                  <div className="aspect-[4/5] md:aspect-square overflow-hidden bg-muted relative group">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-4 border border-background/30 pointer-events-none z-10 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </FadeIn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

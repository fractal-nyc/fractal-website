import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";

const campusProjects = [
  {
    title: "Fractal Accelerator & Tech Hub",
    description: "A three month intensive software engineering accelerator, paired with our co-working space and AI lab. A rigorous environment for builders who want to level up their skills and ship projects together.",
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
    <section id="campus" style={{ backgroundColor: "#2B5A48", color: "#fff" }}>
      {/* Hero — centered in viewport */}
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 w-full">
        <div className="px-6 md:px-[4.5%] w-full">
        <FadeIn>
          <SectorHeader letter="C" name="Campus" color="#1A3A2E" />
        </FadeIn>

        <FadeIn>
          <div className="text-center">
            <p className="font-serif text-4xl md:text-6xl leading-[1.3] text-white mb-4 text-center" style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}>
              Host or Build with Us at Our Physical Campus with Artists, Builders, and Scientists
            </p>
            <p className="font-serif text-lg text-white/80 mb-8 normal-case">
              Get in touch to book a space at Merlin's Place or cowork at Fractal Tech Hub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:events@merlins.place"
                className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
              >
                <CornerDecorations size="xs" />
                Email Merlin's Place
              </a>
              <a
                href="https://fractalbootcamp.com/fractal-tech-hub"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
              >
                <CornerDecorations size="xs" />
                Fractal Tech Hub
              </a>
            </div>
          </div>
        </FadeIn>
        </div>
      </div>

      {/* Content below the fold */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-40">
        <FadeIn>
          <div>
            <p className="text-2xl md:text-3xl font-serif leading-tight mb-8 normal-case">
              A <span className="italic normal-case">campus</span> woven into the city.
            </p>
            <div className="space-y-6 text-sm text-white/90 font-light leading-relaxed max-w-3xl">
              <p>
                Living near each other has helped us coordinate and incubate a bunch of fun projects. What started as a single apartment has grown into a decentralized campus spread across the neighborhood.
              </p>
              <p>
                Shared spaces, co-working rooms, classrooms in living rooms, and community gathering spots — all within walking distance of each other in NYC.
              </p>
            </div>
          </div>
        </FadeIn>

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
                    <h3 className="text-2xl md:text-3xl font-serif normal-case">{project.title}</h3>
                    <p className="text-sm text-white/90 leading-relaxed font-light">
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

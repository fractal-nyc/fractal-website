import { FadeIn } from "@/components/ui/FadeIn";

const projects = [
  {
    id: "01",
    title: "Fractal Bootcamp & Tech Hub",
    description: "A three month intensive software engineering bootcamp, paired with our co-working space and AI accelerator. A rigorous environment for builders who want to level up their skills and ship projects together.",
    image: `${import.meta.env.BASE_URL}images/fractal-tech-hub.png`
  },
  {
    id: "02",
    title: "Fractal University",
    description: "Where we teach everything from art, to cooking, to coding. Classes are cozy (we teach them from our living rooms), and it's a lot of fun to learn from and with our friends.",
    image: `${import.meta.env.BASE_URL}images/fractal-university.png`
  },
  {
    id: "03",
    title: "Merlin's Place",
    description: "Our first community-run third space. A hub for spontaneous connection, featuring a custom 3000-LED lighting installation on the ceiling.",
    image: `${import.meta.env.BASE_URL}images/merlins-place.png`
  }
];

export function Projects() {
  return (
    <section id="projects" className="py-24 md:py-40 bg-background relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <FadeIn>
          <div className="mb-20 md:mb-32">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4">Incubations</h2>
            <p className="text-3xl md:text-5xl font-serif max-w-2xl leading-tight">
              Three we're <span className="italic">especially proud</span> of.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-32">
          {projects.map((project, index) => (
            <div 
              key={project.id} 
              className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center ${
                index % 2 !== 0 ? "md:rtl" : ""
              }`}
            >
              <div className={index % 2 !== 0 ? "md:col-start-2" : ""}>
                <FadeIn direction={index % 2 === 0 ? "right" : "left"}>
                  <div className="flex flex-col gap-6">
                    <span className="font-serif text-6xl md:text-8xl text-muted/50">{project.id}</span>
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

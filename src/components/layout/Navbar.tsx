import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setIsScrolled(latest > 50);
  });

  const sectionLinks = [
    { name: "The Protocol", href: "#the-protocol" },
    { name: "Neighborhood", href: "#neighborhood" },
    { name: "New Liberal Arts", href: "#new-liberal-arts" },
    { name: "A Campus", href: "#a-campus" },
    { name: "Events", href: "#events" },
    { name: "Political Club", href: "#political-club" },
    { name: "Research + Writing", href: "#research-publication" },
    { name: "Mission", href: "#mission" },
  ];

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="relative py-5 max-md:hidden" style={{ paddingLeft: '6%', paddingRight: '6%' }}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <nav className="flex items-center justify-between" style={{ transform: 'translateY(-20px)' }}>
              {sectionLinks.slice(0, 4).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[11px] font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border/50 hover:border-border hover:bg-secondary/50 whitespace-nowrap"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <a href="#" className="text-center leading-[0.85] tracking-tighter">
              <span className="text-5xl md:text-6xl lg:text-7xl block" style={{ fontFamily: "'Jacquard 24', system-ui" }}>Fractal</span>
              <span className="font-serif text-3xl md:text-4xl lg:text-5xl block italic">Collective</span>
            </a>

            <nav className="flex items-center justify-between" style={{ transform: 'translateY(-20px)' }}>
              {sectionLinks.slice(4).map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[11px] font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border/50 hover:border-border hover:bg-secondary/50 whitespace-nowrap"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="md:hidden px-6 h-20 flex items-center justify-between">
          <a href="#" className="tracking-tight">
            <span className="text-2xl" style={{ fontFamily: "'Jacquard 24', system-ui" }}>Fractal</span>{" "}
            <span className="font-serif text-xl italic">Collective</span>
          </a>
          <button
            className="z-50 relative p-2 -mr-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      <motion.div
        initial={false}
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, pointerEvents: "auto" as const },
          closed: { opacity: 0, pointerEvents: "none" as const },
        }}
        className="fixed inset-0 z-40 bg-background overflow-y-auto pt-24 pb-12"
      >
        <nav className="flex flex-col items-center gap-6 px-6">
          {sectionLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-serif text-3xl hover:text-foreground/70 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>
      </motion.div>
    </>
  );
}

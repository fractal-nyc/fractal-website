import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "wouter";

const topLinks = [
  { name: "Story", href: "/story" },
  { name: "The Protocol", href: "/the-protocol" },
  { name: "People", href: "/people" },
];

const houseLinks = [
  { name: "Neighborhood", href: "/neighborhood" },
  { name: "Events", href: "/events" },
  { name: "Campus", href: "/campus" },
  { name: "New Liberal Arts", href: "/new-liberal-arts" },
  { name: "Political Club", href: "/political-club" },
  { name: "Lab", href: "/lab" },
];

const navLinkClass =
  "text-[11px] font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border/50 hover:border-border hover:bg-secondary/50 whitespace-nowrap";

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
          isScrolled ? "backdrop-blur-md border-b border-border/30" : "bg-transparent"
        }`}
      >
        {/* Desktop nav */}
        <div className="relative py-5 max-md:hidden" style={{ paddingLeft: '6%', paddingRight: '6%' }}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Left side: Top-level links */}
            <nav className="flex items-center justify-end gap-2" style={{ transform: 'translateY(-20px)' }}>
              {topLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={navLinkClass}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Center: Logo */}
            <Link href="/" className="text-center leading-[0.85] tracking-tighter">
              <span className="text-5xl md:text-6xl lg:text-7xl block" style={{ fontFamily: "'Jacquard 24', system-ui" }}>Fractal</span>
              <span className="font-serif text-3xl md:text-4xl lg:text-5xl block italic">Collective</span>
            </Link>

            {/* Right side: Houses dropdown */}
            <nav className="flex items-center justify-start gap-2" style={{ transform: 'translateY(-20px)' }}>
              <div className="relative group">
                <button className={`${navLinkClass} inline-flex items-center gap-1`}>
                  Houses
                  <ChevronDown size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
                <div className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] z-50">
                  {houseLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block px-3 py-2 text-[11px] font-medium text-foreground/80 hover:text-foreground hover:bg-secondary/50 rounded transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile nav header */}
        <div className="md:hidden px-6 h-20 flex items-center justify-between">
          <Link href="/" className="tracking-tight">
            <span className="text-2xl" style={{ fontFamily: "'Jacquard 24', system-ui" }}>Fractal</span>{" "}
            <span className="font-serif text-xl italic">Collective</span>
          </Link>
          <button
            className="z-50 relative p-2 -mr-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, pointerEvents: "auto" as const },
          closed: { opacity: 0, pointerEvents: "none" as const },
        }}
        className="fixed inset-0 z-40 bg-background overflow-y-auto pt-24 pb-12"
      >
        <nav className="flex flex-col items-center gap-4 px-6">
          {/* Top-level links */}
          {topLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-serif text-3xl hover:text-foreground/70 transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Houses section */}
          <div className="mt-4 mb-2">
            <span className="text-xs font-mono font-medium text-foreground/50 uppercase tracking-widest">
              Houses
            </span>
          </div>
          {houseLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-serif text-3xl hover:text-foreground/70 transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </motion.div>
    </>
  );
}

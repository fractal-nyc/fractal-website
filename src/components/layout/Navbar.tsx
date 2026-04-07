import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";

const sectionLinks = [
  { name: "Story", href: "/story", color: "#D4BA58" },
  { name: "Campus", href: "/campus", color: "#2B5A48" },
  { name: "Neighborhood", href: "/neighborhood", color: "#889460" },
  { name: "Events", href: "/events", color: "#D4857A" },
  { name: "New Liberal Arts", href: "/new-liberal-arts", color: "#C41E20" },
  { name: "Political Club", href: "/political-club", color: "#6E1830" },
  { name: "Lab", href: "/lab", color: "#E870A0" },
  { name: "People", href: "/people", color: "#C49040" },
];

const LEFT_TEXT =
  "In 2021, our small group of friends decided to live, learn, & build together. It started as just a single apartment with weekly dinners where people gave 5-minute talks & grew into A neighborhood & campus. now we are building A GOLDEN AGE PROTOCOL.";

const RIGHT_TEXT =
  "we believe small groups who share context deeply & build agentic tools for each other can move dramatically faster than individuals working alone, so We embrace experimentation, joyful cyborgism & fun-first collaboration to solve problems together with friends.";

function NavLink({ name, href, color }: { name: string; href: string; color: string }) {
  const first = name[0];
  const rest = name.slice(1);
  return (
    <Link href={href} className="hover:opacity-70 transition-opacity" style={{ color }}>
      <span
        style={{
          fontFamily: "'Jacquard 24', system-ui",
          fontSize: "38px",
          lineHeight: 1,
        }}
      >
        {first}
      </span>
      <span
        className="font-serif"
        style={{
          fontSize: "22px",
          lineHeight: 1,
          textTransform: "none",
          fontStyle: "normal",
          fontWeight: 300,
        }}
      >
        {rest}
      </span>
    </Link>
  );
}

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

  const leftLinks = sectionLinks.slice(0, 4);
  const rightLinks = sectionLinks.slice(4);

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
        {/* Desktop */}
        <div className="relative py-5 max-md:hidden" style={{ paddingLeft: "4.5%", paddingRight: "4.5%" }}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-6">
            {/* Left side */}
            <div className="flex flex-col gap-2">
              <p
                className="font-mono text-justify uppercase font-thin"
                style={{ fontSize: "13px", lineHeight: 1.4, letterSpacing: "0.01em" }}
              >
                {LEFT_TEXT}
              </p>
              <nav className="flex items-baseline justify-between">
                {leftLinks.map((link) => (
                  <NavLink key={link.name} {...link} />
                ))}
              </nav>
            </div>

            {/* Center title */}
            <Link href="/" className="text-center leading-[1.1] tracking-tighter">
              <span
                className="block"
                style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "82px" }}
              >
                Fractal
              </span>
              <span
                className="font-serif block italic"
                style={{ fontSize: "48px" }}
              >
                Collective
              </span>
            </Link>

            {/* Right side */}
            <div className="flex flex-col gap-2">
              <p
                className="font-mono text-justify uppercase font-thin"
                style={{ fontSize: "13px", lineHeight: 1.4, letterSpacing: "0.01em" }}
              >
                {RIGHT_TEXT}
              </p>
              <nav className="flex items-baseline justify-between">
                {rightLinks.map((link) => (
                  <NavLink key={link.name} {...link} />
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden px-6 h-20 flex items-center justify-between">
          <Link href="/" className="tracking-tight">
            <span className="text-2xl" style={{ fontFamily: "'Jacquard 24', system-ui" }}>
              Fractal
            </span>{" "}
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
        <nav className="flex flex-col items-center gap-6 px-6">
          {sectionLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:opacity-70 transition-opacity"
            >
              <span
                style={{
                  fontFamily: "'Jacquard 24', system-ui",
                  fontSize: "28px",
                  lineHeight: 1,
                  color: link.color,
                }}
              >
                {link.name[0]}
              </span>
              <span className="font-serif" style={{ fontSize: "18px", textTransform: "none", fontStyle: "normal", fontWeight: 300 }}>
                {link.name.slice(1)}
              </span>
            </Link>
          ))}
        </nav>
      </motion.div>
    </>
  );
}

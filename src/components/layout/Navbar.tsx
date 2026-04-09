import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";

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

// Inner-page navbar hides all eight section links. The home page navbar and the
// full-screen overlay menu still expose all eight sections.
const innerPageHiddenLinks = new Set([
  "Story",
  "Campus",
  "Neighborhood",
  "Events",
  "New Liberal Arts",
  "Political Club",
  "Lab",
  "People",
]);
const innerPageSectionLinks = sectionLinks.filter(
  (link) => !innerPageHiddenLinks.has(link.name)
);

const LEFT_TEXT =
  "In 2021, our small group of friends decided to live, learn, & build together. It started as just a single apartment with weekly dinners where people gave 5-minute talks & grew into A neighborhood & campus. now we are building A GOLDEN AGE PROTOCOL.";

const RIGHT_TEXT =
  "we believe small groups who share context deeply & build agentic tools for each other can move dramatically faster than individuals working alone, so We embrace experimentation, joyful cyborgism & fun-first collaboration to solve problems together with friends.";

function NavLink({ name, href, color }: { name: string; href: string; color: string }) {
  const isPoliticalClub = name === "Political Club";
  const first = isPoliticalClub ? "PC" : name[0];
  const rest = isPoliticalClub ? "olitical Club" : name.slice(1);
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

  const [hasScrolledPast, setHasScrolledPast] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const isHome = location === "/" || location === "";

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
      setHasScrolledPast(true);
    } else {
      setHidden(false);
    }
    if (latest < 10) {
      setHasScrolledPast(false);
    }

  });

  const leftLinks = sectionLinks.slice(0, 4);
  const rightLinks = sectionLinks.slice(4);

  const showFull = isHome && !hasScrolledPast;

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      >
        {showFull ? (
          <>
            {/* Full desktop navbar */}
            <div className="relative py-5 max-md:hidden" style={{ paddingLeft: "4.5%", paddingRight: "4.5%" }}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-6">
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

                <Link href="/" className="text-center leading-[1.1] tracking-tighter">
                  <span
                    className="block"
                    style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "82px" }}
                  >
                    Fractal
                  </span>
                  <span
                    className="font-serif block italic"
                    style={{ fontSize: "48px", textTransform: "none", fontWeight: 100 }}
                  >
                    Collective
                  </span>
                </Link>

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

            {/* Full mobile navbar */}
            <div className="md:hidden px-6 pt-5 pb-3">
              {/* Top row: Fractal logo + blurb */}
              <div className="flex items-start gap-3">
                <Link href="/" className="tracking-tighter shrink-0 leading-[0.9] text-center">
                  <span
                    className="block"
                    style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "42px" }}
                  >
                    Fractal
                  </span>
                  <span
                    className="font-serif block italic"
                    style={{ fontSize: "27px", textTransform: "none", fontWeight: 100 }}
                  >
                    Collective
                  </span>
                </Link>
                <p
                  className="font-mono uppercase font-thin text-justify flex-1"
                  style={{ fontSize: "8px", lineHeight: 1.35, letterSpacing: "0.01em", paddingTop: "8px" }}
                >
                  {RIGHT_TEXT}
                </p>
              </div>

              {/* Nav letters row */}
              <nav className="flex items-baseline justify-between mt-2">
                {sectionLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="hover:opacity-70 transition-opacity"
                    style={{ color: link.color }}
                  >
                    <span
                      style={{
                        fontFamily: "'Jacquard 24', system-ui",
                        fontSize: "28px",
                        lineHeight: 1,
                      }}
                    >
                      {link.name === "New Liberal Arts"
                        ? "LA"
                        : link.name === "Political Club"
                          ? "PC"
                          : link.name[0]}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </>
        ) : !isHome ? (
          /* Inner page branded header — scaled-down hero treatment */
          <>
            {/* Desktop inner page header */}
            <div className="max-md:hidden py-4" style={{ paddingLeft: "4.5%", paddingRight: "4.5%" }}>
              <div className="flex items-end justify-between">
                <Link href="/" className="text-center leading-[1.1] tracking-tighter">
                  <span
                    className="block"
                    style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "50px" }}
                  >
                    Fractal
                  </span>
                  <span
                    className="font-serif block italic"
                    style={{ fontSize: "30px", textTransform: "none", fontWeight: 100 }}
                  >
                    Collective
                  </span>
                </Link>
                <nav className="flex items-baseline gap-5">
                  {innerPageSectionLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="hover:opacity-70 transition-opacity font-serif"
                      style={{
                        fontSize: "18px",
                        fontWeight: 300,
                        fontStyle: "normal",
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
                <button
                  className="z-50 relative p-2 -mr-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Mobile inner page header */}
            <div className="md:hidden px-6 pt-4 pb-3">
              <div className="flex items-center justify-between">
                <Link href="/" className="tracking-tighter leading-[0.9] text-center">
                  <span
                    className="block"
                    style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "36px" }}
                  >
                    Fractal
                  </span>
                  <span
                    className="font-serif block italic"
                    style={{ fontSize: "22px", textTransform: "none", fontWeight: 100 }}
                  >
                    Collective
                  </span>
                </Link>
                <button
                  className="z-50 relative p-2 -mr-2"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Home page scrolled — compact bar, same branding size as full navbar */
          <div className="py-4 flex items-center justify-between" style={{ paddingLeft: "4.5%", paddingRight: "4.5%" }}>
            <Link href="/" className="tracking-tighter leading-[0.9] text-center">
              <span
                className="block"
                style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "clamp(42px, 8vw, 82px)" }}
              >
                Fractal
              </span>
              <span
                className="font-serif block italic"
                style={{ fontSize: "clamp(27px, 5vw, 48px)", textTransform: "none", fontWeight: 100 }}
              >
                Collective
              </span>
            </Link>
            <button
              className="z-50 relative p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}
      </motion.header>

      {/* Menu overlay — vertical list of section pages */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, pointerEvents: "auto" as const },
          closed: { opacity: 0, pointerEvents: "none" as const },
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 z-40 bg-background overflow-y-auto"
      >
        {/* Section page list */}
        <nav className="flex flex-col w-full pt-24 pb-8 px-6 max-w-md mx-auto">
          {sectionLinks.map((link) => {
            const letter =
              link.name === "New Liberal Arts"
                ? "LA"
                : link.name === "Political Club"
                  ? "PC"
                  : link.name[0];
            return (
              <button
                key={link.name}
                type="button"
                onClick={() => {
                  setLocation(link.href);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-5 min-h-[56px] py-3 border-b border-foreground/10 hover:bg-foreground/5 transition-colors text-left"
                style={{ borderLeft: `3px solid ${link.color}`, paddingLeft: "16px" }}
              >
                <span
                  style={{
                    fontFamily: "'Jacquard 24', system-ui",
                    fontSize: "36px",
                    lineHeight: 1,
                    color: link.color,
                    minWidth: "44px",
                  }}
                >
                  {letter}
                </span>
                <span
                  className="font-mono uppercase tracking-wider text-foreground"
                  style={{ fontSize: "14px", letterSpacing: "0.08em" }}
                >
                  {link.name}
                </span>
              </button>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
}

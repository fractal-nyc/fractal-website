import { useState, Suspense, lazy } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";

const FractalCityScene = lazy(() =>
  import("@/components/three/FractalCityScene").then((m) => ({
    default: m.FractalCityScene,
  }))
);

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
                    style={{ fontSize: "24px", textTransform: "none", fontWeight: 100 }}
                  >
                    Collective
                  </span>
                </Link>
                <p
                  className="font-mono uppercase font-thin text-justify flex-1"
                  style={{ fontSize: "8px", lineHeight: 1.35, letterSpacing: "0.01em" }}
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
        ) : (
          <div className="h-20 flex items-center justify-between" style={{ paddingLeft: "4.5%", paddingRight: "4.5%" }}>
            <Link href="/" className="tracking-tight">
              <span className="text-2xl md:text-3xl" style={{ fontFamily: "'Jacquard 24', system-ui" }}>
                Fractal
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

      {/* Menu overlay — WebGL model only, full screen */}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, pointerEvents: "auto" as const },
          closed: { opacity: 0, pointerEvents: "none" as const },
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 z-40 bg-background"
      >
        {/* Close button — aligned with hamburger position */}
        <button
          className="fixed top-0 right-0 z-50 p-2 -mr-2 text-foreground h-20 flex items-center"
          style={{ right: "4.5%" }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <X size={24} />
        </button>

        {/* Centered WebGL model */}
        <div className="relative w-full h-full">
          {mobileMenuOpen && (
            <Suspense fallback={null}>
              <FractalCityScene
                onNavigate={(route) => {
                  setMobileMenuOpen(false);
                  setLocation(route);
                }}
              />
            </Suspense>
          )}
        </div>
      </motion.div>
    </>
  );
}

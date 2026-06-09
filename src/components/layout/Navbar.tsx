import { Fragment, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { JustifiedParagraph } from "@/components/typeset/JustifiedParagraph";
import { HOUSES, NAVBAR_HIDDEN_ROUTES } from "@/data/houses";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// FRAC-24: Per-link colors derive from the canonical House palette where a
// House exists. Non-house links (Story, People) keep literal colors — there's
// no House entry to derive from. House links default to `.light` to match
// what each link CURRENTLY shows; Political Club uses `.deep` because the
// link's visual identity has always been the deeper burgundy.
function houseColor(route: string, prefer: "light" | "deep" = "light"): string {
  const palette = HOUSES.find((h) => h.route === route)?.palette;
  return palette ? palette[prefer] : "#000";
}

const sectionLinks = [
  { name: "Story",          href: "/story",             color: "#D4BA58" },
  { name: "Campus",         href: "/campus",            color: houseColor("/campus") },
  { name: "Visit",          href: "/neighborhood",      color: houseColor("/neighborhood") },
  { name: "Events",         href: "/events",            color: houseColor("/events") },
  { name: "Education",      href: "/new-liberal-arts",  color: houseColor("/new-liberal-arts") },
  { name: "Political Club", href: "/political-club",    color: houseColor("/political-club", "deep") },
  { name: "Publications",   href: "/lab",               color: houseColor("/lab") },
  { name: "People",         href: "/people",            color: "#C49040" },
];

// FRAC-32: Hide routes from every nav variant by deriving from the House data
// model (`hideFromNavbar`). Non-house section links (e.g. "People", which has
// a route but no House entry) are hidden via the explicit set below.
// To restore a house, flip its `hideFromNavbar` flag in src/data/houses.ts.
// To restore a non-house link, remove its href from EXTRA_HIDDEN_HREFS.
const EXTRA_HIDDEN_HREFS = new Set<string>(["/people"]);
const visibleSectionLinks = sectionLinks.filter(
  (link) =>
    !NAVBAR_HIDDEN_ROUTES.has(link.href) && !EXTRA_HIDDEN_HREFS.has(link.href),
);

// Inner-page navbar hides all remaining section links. The home page navbar
// and the full-screen overlay menu still expose the visible sections.
const innerPageHiddenLinks = new Set([
  "Story",
  "Campus",
  "Visit",
  "Events",
  "Education",
  "Political Club",
  "Publications",
  "People",
]);
const innerPageSectionLinks = visibleSectionLinks.filter(
  (link) => !innerPageHiddenLinks.has(link.name)
);

const LEFT_TEXT =
  "In 2021, our small group of friends decided to live, learn, & build together. It started as just a single apartment with weekly dinners where people gave 5-minute talks & grew into A neighborhood & campus. now we are building A GOLDEN AGE PROTOCOL.";

const RIGHT_TEXT =
  "we believe small groups who share context deeply & build agentic tools for each other can move dramatically faster than individuals working alone, so We embrace experimentation, joyful cyborgism & fun-first collaboration to solve problems together with friends.";

function NavLink({ name, href, color }: { name: string; href: string; color: string }) {
  // Render each word's leading cap in Jacquard 24 (38px) and the remainder in
  // light serif (22px). Multi-word labels like "New Liberal Arts" and
  // "Political Club" therefore get a Jacquard cap on every word's first
  // letter; single-word labels are unchanged.
  const words = name.split(" ");
  return (
    <Link href={href} className="hover:opacity-70 transition-opacity" style={{ color }}>
      {words.map((word, i) => (
        <Fragment key={i}>
          {i > 0 && (
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
              {"\u00A0"}
            </span>
          )}
          <span
            style={{
              fontFamily: "'Jacquard 24', system-ui",
              fontSize: "38px",
              lineHeight: 1,
            }}
          >
            {word[0]}
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
            {word.slice(1)}
          </span>
        </Fragment>
      ))}
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
  const prefersReducedMotion = usePrefersReducedMotion();

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

  const leftLinks = visibleSectionLinks.slice(0, 3);
  const rightLinks = visibleSectionLinks.slice(3);

  const showFull = isHome && !hasScrolledPast;

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
        }
        className="fixed top-0 left-0 right-0 z-50 bg-transparent"
      >
        {showFull ? (
          <>
            {/* Full desktop navbar — shown at >= 1024px (lg). The 3-col grid
                cannot fit smaller widths without overflow, so tablets get the
                mobile layout below until lg. */}
            <div className="relative py-5 max-lg:hidden" style={{ paddingLeft: "4.5%", paddingRight: "4.5%" }}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-6">
                <div className="flex flex-col gap-2 min-w-0">
                  <JustifiedParagraph
                    text={LEFT_TEXT}
                    fontFamily="'JetBrains Mono'"
                    fontSize={13}
                    lineHeight={18}
                    uppercase
                    className="font-thin"
                  />
                  <nav className="flex items-baseline justify-between">
                    {leftLinks.map((link) => (
                      <NavLink key={link.name} {...link} />
                    ))}
                  </nav>
                </div>

                <Link href="/" className="text-center leading-[1.1] tracking-tighter min-w-0">
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

                <div className="flex flex-col gap-2 min-w-0">
                  <JustifiedParagraph
                    text={RIGHT_TEXT}
                    fontFamily="'JetBrains Mono'"
                    fontSize={13}
                    lineHeight={18}
                    uppercase
                    className="font-thin"
                  />
                  <nav className="flex items-baseline justify-between">
                    {rightLinks.map((link) => (
                      <NavLink key={link.name} {...link} />
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Mobile + tablet navbar — shown at < 1024px (lg). */}
            <div className="lg:hidden px-6 pt-5 pb-3">
              {/* Top row: Fractal logo + blurb */}
              <div className="flex items-start gap-3">
                <Link href="/" className="tracking-tighter shrink-0 leading-[0.9] text-center">
                  <span
                    className="block"
                    style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "clamp(24px, 4.5vw, 42px)" }}
                  >
                    Fractal
                  </span>
                  <span
                    className="font-serif block italic"
                    style={{ fontSize: "clamp(14px, 2.63vw, 25px)", textTransform: "none", fontWeight: 100 }}
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
                {visibleSectionLinks.map((link) => (
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
                      {link.name === "Education"
                        ? "E"
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
                    style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "clamp(28px, 5.5vw, 50px)" }}
                  >
                    Fractal
                  </span>
                  <span
                    className="font-serif block italic"
                    style={{ fontSize: "clamp(16px, 3.22vw, 29px)", textTransform: "none", fontWeight: 100 }}
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
                  type="button"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                  className="z-50 relative cursor-pointer transition-opacity duration-200 hover:opacity-70 active:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md flex items-center justify-center p-3 -mr-3"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
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
                    style={{ fontSize: "21px", textTransform: "none", fontWeight: 100 }}
                  >
                    Collective
                  </span>
                </Link>
                <button
                  type="button"
                  aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={mobileMenuOpen}
                  className="z-50 relative cursor-pointer transition-opacity duration-200 hover:opacity-70 active:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md flex items-center justify-center p-3 -mr-3"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
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
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="z-50 relative cursor-pointer transition-opacity duration-200 hover:opacity-70 active:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md flex items-center justify-center p-3 -mr-3"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
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
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.3, ease: "easeInOut" }
        }
        className="fixed inset-0 z-40 bg-background overflow-y-auto"
      >
        {/* Section page list */}
        <nav className="flex flex-col w-full pt-24 pb-8 px-6 max-w-md mx-auto">
          {visibleSectionLinks.map((link) => {
            const letter =
              link.name === "Education"
                ? "E"
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
                className="flex items-center gap-5 min-h-[56px] py-3 border-b border-foreground/10 cursor-pointer hover:bg-foreground/5 active:bg-foreground/10 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
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
                  className="text-label text-foreground"
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

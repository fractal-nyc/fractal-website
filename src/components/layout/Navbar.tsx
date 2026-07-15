import { Fragment, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { HOUSES, NAVBAR_HIDDEN_ROUTES, SECTIONS } from "@/data/houses";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// FRAC-24: Per-link colors derive from the canonical House palette where a
// House exists. The one non-house link left in the nav (People) has no House
// entry, so it reads from the SECTIONS record instead. House links default to
// `.light`; Political Club uses `.deep` because the link's visual identity has
// always been the deeper burgundy.
// (Story used to be a link too, but it folded into Home in the content port.)
function houseColor(route: string, prefer: "light" | "deep" = "light"): string {
  const palette = HOUSES.find((h) => h.route === route)?.palette;
  return palette ? palette[prefer] : "#000";
}

// Accelerator and FractalU (formerly Education) have no internal page — they
// link out to their standalone sites. The color still comes from the retained
// `accelerator` / `school` house entries (looked up by their old internal
// route), so those nav letters keep their house tint.
const FRACTALU_URL = "https://www.fractalu.nyc/";
const ACCELERATOR_URL = "https://www.fractalaccelerator.com/";

interface SectionLink {
  name: string;
  href: string;
  color: string;
  external?: boolean;
}

const sectionLinks: SectionLink[] = [
  { name: "Campus",         href: "/campus",            color: houseColor("/campus") },
  { name: "Co-Living",      href: "/co-living",         color: houseColor("/co-living") },
  { name: "Accelerator",    href: ACCELERATOR_URL,      color: houseColor("/accelerator"), external: true },
  { name: "Events",         href: "/events",            color: houseColor("/events") },
  { name: "FractalU",       href: FRACTALU_URL,         color: houseColor("/education"), external: true },
  { name: "Political Club", href: "/political-club",    color: houseColor("/political-club", "deep") },
  { name: "Library",        href: "/library",           color: houseColor("/library") },
  { name: "People",         href: "/people",            color: SECTIONS.people.light },
];

// Renders an internal wouter <Link> or, for external destinations, a plain
// new-tab <a> — wouter's <Link> would otherwise try to client-route an absolute
// URL. Used by every nav variant so external links behave everywhere.
function SectionAnchor({
  link,
  className,
  style,
  children,
}: {
  link: SectionLink;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={link.href} className={className} style={style}>
      {children}
    </Link>
  );
}

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
  "Campus",
  "Co-Living",
  "Accelerator",
  "Events",
  "FractalU",
  "Political Club",
  "Library",
  "People",
]);
const innerPageSectionLinks = visibleSectionLinks.filter(
  (link) => !innerPageHiddenLinks.has(link.name)
);

const LEFT_TEXT =
  "In 2021, our small group of friends decided to live, learn, & build together. It started as just a single apartment with weekly dinners where people gave 5-minute talks & grew into A neighborhood & campus. now we are building A GOLDEN AGE PROTOCOL.";

const RIGHT_TEXT =
  "we believe small groups who share context deeply can move dramatically faster than individuals working alone, so We embrace experimentation, joyful cyborgism & fun-first collaboration to solve problems together with friends.";

function NavLink(link: SectionLink) {
  const { name, color } = link;
  // Render each word's leading cap in Jacquard 24 (38px) and the remainder in
  // light serif (22px). Multi-word labels like "Political Club" therefore get a
  // Jacquard cap on every word's first letter; single-word labels are unchanged.
  const words = name.split(" ");
  return (
    <SectionAnchor link={link} className="hover:opacity-70 transition-opacity" style={{ color }}>
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
    </SectionAnchor>
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
                  <p className="font-mono text-[13px] leading-[18px] font-normal uppercase text-justify">
                    {LEFT_TEXT}
                  </p>
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
                  <p className="font-mono text-[13px] leading-[18px] font-normal uppercase text-justify">
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

            {/* Mobile + tablet navbar — shown at < 1024px (lg). */}
            <div className="lg:hidden px-6 pt-5 pb-3">
              {/* Top row: Fractal logo + blurb */}
              <div className="flex items-center gap-3">
                <Link href="/" className="tracking-tighter shrink-0 leading-[0.9] text-center">
                  <span
                    className="block"
                    style={{ fontFamily: "'Jacquard 24', system-ui", fontSize: "clamp(32px, 6vw, 42px)" }}
                  >
                    Fractal
                  </span>
                  <span
                    className="font-serif block italic"
                    style={{ fontSize: "clamp(18px, 3.5vw, 25px)", textTransform: "none", fontWeight: 100 }}
                  >
                    Collective
                  </span>
                </Link>
                <p
                  className="font-mono uppercase font-normal text-justify flex-1"
                  style={{ fontSize: "8px", lineHeight: 1.35, letterSpacing: "0.01em" }}
                >
                  {RIGHT_TEXT}
                </p>
              </div>

              {/* Nav letters row */}
              <nav className="flex items-baseline justify-between mt-2">
                {visibleSectionLinks.map((link) => (
                  <SectionAnchor
                    key={link.name}
                    link={link}
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
                      {link.name === "Political Club" ? "PC" : link.name[0]}
                    </span>
                  </SectionAnchor>
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
                    <SectionAnchor
                      key={link.name}
                      link={link}
                      className="hover:opacity-70 transition-opacity font-serif"
                      style={{
                        fontSize: "18px",
                        fontWeight: 300,
                        fontStyle: "normal",
                      }}
                    >
                      {link.name}
                    </SectionAnchor>
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
            const letter = link.name === "Political Club" ? "PC" : link.name[0];
            return (
              <button
                key={link.name}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (link.external) {
                    window.open(link.href, "_blank", "noopener,noreferrer");
                  } else {
                    setLocation(link.href);
                  }
                }}
                className="flex items-center gap-5 min-h-[56px] py-3 border-b border-foreground-faint cursor-pointer hover:bg-foreground/5 active:bg-foreground/10 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground"
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

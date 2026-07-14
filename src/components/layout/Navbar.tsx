import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { HOUSES, SECTIONS } from "@/data/houses";

/**
 * Menu model.
 *
 * The menu is grouped into three sections — Spaces / Education / Community — and
 * mixes internal routes with external destinations (Merlin's Place, FractalU), so
 * it is NOT derivable from HOUSES alone. House-backed rows read their real hex from
 * HOUSES so the color stays in lockstep with the token; the one row with no house
 * of its own (Merlin's Place) reads from SECTIONS. Per the repo convention, JS
 * string colors always come from the data model, never from a `var()` — see
 * DESIGN.md → FractalPattern.
 */
const house = (id: string) => {
  const h = HOUSES.find((x) => x.id === id);
  if (!h) throw new Error(`Navbar: unknown house id "${id}"`);
  return h;
};

interface NavRowBase {
  letter: string;
  label: string;
  color: string;
}

/**
 * Every row goes SOMEWHERE — an internal route or an external URL, never neither.
 *
 * This used to be `{ route?: string; href?: string }`, which allowed a third,
 * destination-less shape: the "Enter the Fractal" portal row, rendered as a
 * disabled <span>. That row is hidden until the member portal ships (see
 * NAV_GROUPS below), so the shape is now unrepresentable and MenuRow no longer
 * carries a disabled branch. Restoring the row means restoring both.
 */
type NavRow =
  | (NavRowBase & { route: string; href?: never })
  | (NavRowBase & { href: string; route?: never });

const NAV_GROUPS: { title: string; rows: NavRow[] }[] = [
  {
    title: "Spaces",
    rows: [
      { letter: "C", label: "Fractal Campus", color: house("campus").palette.light, route: house("campus").route },
      { letter: "H", label: "Fractal Co-Living", color: house("coliving").palette.light, route: house("coliving").route },
      { letter: "M", label: "Merlin's Place", color: SECTIONS.story.deep, href: "https://merlins.place/" },
    ],
  },
  {
    title: "Education",
    rows: [
      { letter: "A", label: "Fractal Accelerator", color: house("accelerator").palette.light, route: house("accelerator").route },
      // The Education house keeps the abstract internal id "school" (AGENTS.md:
      // house ids are deliberately decoupled from slug and display name).
      { letter: "F", label: "FractalU", color: house("school").palette.light, href: "https://fractalu.nyc" },
    ],
  },
  {
    title: "Community",
    rows: [
      { letter: "E", label: "Events", color: house("events").palette.light, route: house("events").route },
      { letter: "L", label: "Library", color: house("library").palette.light, route: house("library").route },
      // INTENTIONALLY HIDDEN until the member portal ships:
      //   { letter: "F", label: "Enter the Fractal", color: NAV_PORTAL_COLOR },
      // The portal has no page, and a permanently-disabled row is worse than no
      // row. `NAV_PORTAL_COLOR` (src/data/houses.ts) and the `--color-nav-portal`
      // token (src/index.css) are deliberately KEPT so restoring this is a
      // one-line change here plus the disabled branch in MenuRow.
    ],
  },
];

const ROW_CLASS =
  "flex w-full items-center gap-4 min-h-12 px-4 py-2.5 text-left border-l-[3px] transition-colors hover:bg-foreground/5";

function MenuRow({ row, onNavigate }: { row: NavRow; onNavigate: () => void }) {
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="min-w-8 text-[28px] leading-none"
        style={{ fontFamily: "'Jacquard 24', system-ui", color: row.color }}
      >
        {row.letter}
      </span>
      <span className="text-label text-foreground">{row.label}</span>
    </>
  );

  if (row.route) {
    return (
      <Link href={row.route} onClick={onNavigate} className={ROW_CLASS} style={{ borderLeftColor: row.color }}>
        {inner}
      </Link>
    );
  }

  // Not an internal route ⇒ an external URL. There is no third case: the one row
  // that had no destination (the portal) is hidden — see NAV_GROUPS.
  return (
    <a
      href={row.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onNavigate}
      className={ROW_CLASS}
      style={{ borderLeftColor: row.color }}
    >
      {inner}
    </a>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLElement>(null);

  const isHome = location === "/";

  // Close on route change.
  useEffect(() => setOpen(false), [location]);

  // Close on Escape, and on any pointer-down outside the header.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  return (
    // Sticky rather than static: this menu is the site's only navigation, so it has
    // to stay reachable at any scroll depth. `--page-bg` is set per page on <main>
    // (alongside `--accent`) so the bar reads as part of whatever house surface it
    // sits on; it falls back to cream on unthemed pages.
    <header ref={wrapRef} className="sticky top-0 z-50 bg-[var(--page-bg,var(--color-background))]">
      <div
        className={
          isHome
            ? "relative flex items-center justify-center px-[4.5%] pt-5"
            : "relative flex items-center justify-between px-[4.5%] py-4"
        }
      >
        <Link
          href="/"
          className="cursor-pointer text-center leading-[1.1] tracking-[-0.02em] no-underline"
          aria-label="Fractal — home"
        >
          <span
            className="block"
            style={{
              fontFamily: "'Jacquard 24', system-ui",
              fontSize: isHome ? "clamp(42px, 8vw, 82px)" : "clamp(28px, 5.5vw, 50px)",
            }}
          >
            Fractal
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={menuId}
          className={
            isHome
              ? "absolute right-[4.5%] top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center p-3"
              : "flex cursor-pointer items-center justify-center p-3"
          }
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        {open && (
          <nav
            id={menuId}
            className="absolute right-[4.5%] top-full z-50 w-[280px] overflow-hidden rounded-lg border border-foreground-faint bg-background text-foreground shadow-[0_12px_32px_rgba(23,23,23,0.14)]"
          >
            <div className="flex flex-col py-2">
              {NAV_GROUPS.map((group, i) => (
                <div key={group.title} className="flex flex-col">
                  <span
                    className={`px-4 pb-1 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45 ${
                      i > 0 ? "mt-2 border-t border-foreground-faint pt-4" : "pt-3"
                    }`}
                  >
                    {group.title}
                  </span>
                  {group.rows.map((row) => (
                    <MenuRow key={row.label} row={row} onNavigate={() => setOpen(false)} />
                  ))}
                </div>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

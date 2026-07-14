import { HOUSES, SECTIONS } from "@/data/houses";

// ---------------------------------------------------------------------------
// FractalDiagram — the "neighborhood campus" lockup on the home page.
//
// A square SVG geometry (decagon + pentagon + spokes + three translucent inner
// triangles) with five labelled nodes arranged around the pentagon, and a
// centre lockup reading "Fractal / NYC / A neighborhood campus founded in 2021".
//
// TOKEN NOTE (house rule 2): SVG presentation attributes (`fill`, `stroke`) and
// JS string colors cannot resolve `var()`, so they take literal hexes — but the
// literals are *sourced from* the canonical palettes in src/data/houses.ts, never
// hand-typed. Same convention as EventsPage / Navbar.
//
// SIZE NOTE: the label + centre type scales with the diagram itself via CSS
// container queries (`container-type: inline-size` + `cqw` units). That is what
// keeps the five node labels legible at 375px and proportionate at 1024px. The
// semantic type utilities (.text-label, .text-body) can't express a cqw-relative
// clamp, so font-size/letter-spacing are set inline here as a deliberate,
// scoped deviation; the FAMILY still comes from the theme tokens (font-mono /
// font-sans / var(--font-serif)).
// ---------------------------------------------------------------------------

const house = (id: string) => {
  const h = HOUSES.find((x) => x.id === id);
  if (!h) throw new Error(`FractalDiagram: unknown house id "${id}"`);
  return h;
};

// Node colors: every node carries its OWN house/section color, sourced from the
// canonical palettes — never hand-typed.
//
// The Accelerator node used to take the CAMPUS green (#2E6B4A), which was a slip:
// Campus isn't even a node on this diagram, so the Accelerator was wearing another
// house's color for no reason a reader could decode. It now takes the Accelerator
// house's own light (#8E2A1E). That does put two reds on the right-hand side —
// University (#C41E20, upper right) above Accelerator (#8E2A1E, lower right) — but
// they are far apart in luminance (5.5:1 vs 7.8:1 on cream), read as bright-red vs
// dark-brick, and never touch. Both clear WCAG AA at the label's minimum 11px.
const EVENTS = house("events").palette.light; // #D4857A
const UNIVERSITY = house("school").palette.light; // #C41E20 — the Education house
const COLIVING = house("coliving").palette.light; // #889460
const ACCELERATOR_NODE = house("accelerator").palette.light; // #8E2A1E
const VENUES = SECTIONS.story.deep; // #a08a2e
// The geometry lines take the LIGHT gold — decoration only, never text.
const GEOMETRY = SECTIONS.story.light; // #D4BA58

// Shared type sizing for the five nodes. cqw = 1% of the diagram's own width.
const NODE_ICON = { width: "clamp(26px, 4.5cqw, 44px)", height: "auto" };
const NODE_LABEL: React.CSSProperties = {
  fontSize: "clamp(11px, 2cqw, 19px)",
  letterSpacing: "0.08em",
};
const NODE_STAT: React.CSSProperties = { fontSize: "clamp(9px, 1.55cqw, 15px)", lineHeight: 1.5 };

export function FractalDiagram() {
  return (
    <div className="mx-auto w-full max-w-5xl px-[4.5%]">
      {/*
        `container-type: inline-size` establishes the query container that every
        `cqw` below resolves against. Negative margins pull the (visually airy)
        square lockup tight against the prose above and below it.

        Design rule (≤700px): the diagram gets extra bottom margin so the two
        lower node labels, which overflow the square, don't collide with the
        paragraph that follows.
      */}
      <div
        aria-label="Fractal NYC neighborhood campus diagram"
        className="relative mx-auto aspect-square w-full max-w-[940px] -mt-[4%] -mb-[5%] max-[700px]:mb-[24%]"
        style={{ containerType: "inline-size" }}
      >
        {/* Geometry */}
        <svg
          viewBox="0 0 1000 1000"
          aria-hidden="true"
          className="absolute inset-0 block h-full w-full"
        >
          <polygon
            points="500,230 670.5,245.4 737.8,402.7 775.8,569.6 646.9,682.3 500,770 353.1,682.3 224.2,569.6 262.2,402.7 329.5,245.4"
            fill="none"
            stroke={GEOMETRY}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <polygon
            points="500,230 737.8,402.7 646.9,682.3 353.1,682.3 262.2,402.7"
            fill="none"
            stroke={GEOMETRY}
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <line x1="500" y1="230" x2="500" y2="480" stroke={GEOMETRY} strokeWidth="6" />
          <line x1="737.8" y1="402.7" x2="500" y2="480" stroke={GEOMETRY} strokeWidth="6" />
          <line x1="646.9" y1="682.3" x2="500" y2="480" stroke={GEOMETRY} strokeWidth="6" />
          <line x1="353.1" y1="682.3" x2="500" y2="480" stroke={GEOMETRY} strokeWidth="6" />
          <line x1="262.2" y1="402.7" x2="500" y2="480" stroke={GEOMETRY} strokeWidth="6" />

          <polygon points="500,356 632,480 368,480" fill={EVENTS} fillOpacity="0.55" />
          <polygon points="500,356 632,480 500,480" fill={UNIVERSITY} fillOpacity="0.35" />
          <polygon points="368,480 632,480 500,604" fill={COLIVING} fillOpacity="0.55" />

          <circle cx="500" cy="230" r="14" fill={EVENTS} />
          <circle cx="737.8" cy="402.7" r="14" fill={UNIVERSITY} />
          <circle cx="646.9" cy="682.3" r="14" fill={ACCELERATOR_NODE} />
          <circle cx="353.1" cy="682.3" r="14" fill={VENUES} />
          <circle cx="262.2" cy="402.7" r="14" fill={COLIVING} />
        </svg>

        {/* Center lockup */}
        <div className="absolute left-1/2 top-[48%] z-[1] -translate-x-1/2 -translate-y-1/2 text-center text-foreground">
          <span
            className="block leading-none"
            style={{
              fontFamily: "'Jacquard 24', system-ui",
              fontSize: "clamp(28px, 7cqw, 66px)",
            }}
          >
            Fractal
          </span>
          <span
            className="block"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 100,
              fontSize: "clamp(17px, 4.2cqw, 40px)",
              lineHeight: 1.15,
            }}
          >
            NYC
          </span>
          <span
            className="mt-[0.6em] block font-mono font-medium uppercase text-foreground-muted"
            style={{ fontSize: "clamp(8px, 1.35cqw, 13px)", letterSpacing: "0.08em" }}
          >
            A neighborhood campus
            <br />
            founded in 2021
          </span>
        </div>

        {/* Events — top */}
        <div className="absolute left-1/2 top-[6.5%] flex w-[44%] -translate-x-1/2 flex-col items-center gap-[0.4em] text-center">
          <svg viewBox="0 0 40 40" fill="none" stroke={EVENTS} strokeWidth="1.4" style={NODE_ICON} aria-hidden="true">
            <ellipse cx="20" cy="20" rx="16" ry="7" />
            <ellipse cx="20" cy="20" rx="16" ry="7" transform="rotate(60 20 20)" />
            <ellipse cx="20" cy="20" rx="16" ry="7" transform="rotate(120 20 20)" />
            <circle cx="20" cy="20" r="3.5" />
          </svg>
          <span
            className="font-mono font-medium uppercase"
            style={{ ...NODE_LABEL, color: EVENTS }}
          >
            Events
          </span>
          <span className="font-sans text-foreground-muted" style={NODE_STAT}>
            100+ events/month
          </span>
        </div>

        {/* Community-run University — upper right */}
        <div className="absolute left-[77%] top-[25%] flex w-[23%] flex-col items-start gap-[0.4em] text-left">
          <svg viewBox="0 0 40 40" fill="none" stroke={UNIVERSITY} strokeWidth="1.2" style={NODE_ICON} aria-hidden="true">
            <circle cx="20" cy="20" r="17" />
            <circle cx="14" cy="14" r="7.5" />
            <circle cx="27" cy="16" r="5" />
            <circle cx="24" cy="28" r="7" />
            <circle cx="12" cy="27" r="4" />
            <circle cx="19" cy="8" r="2.2" />
          </svg>
          <span
            className="font-mono font-medium uppercase"
            style={{ ...NODE_LABEL, color: UNIVERSITY }}
          >
            Community-run University
          </span>
          <span className="font-sans text-foreground-muted" style={NODE_STAT}>
            100+ classes taught
          </span>
        </div>

        {/* Co-Living — upper left */}
        <div className="absolute left-0 top-[25%] flex w-[23%] flex-col items-end gap-[0.4em] text-right">
          <svg viewBox="0 0 40 40" fill="none" stroke={COLIVING} strokeWidth="1.4" style={NODE_ICON} aria-hidden="true">
            <path d="M6 20 L20 7 L34 20" />
            <path d="M10 18 V33 H30 V18" />
            <path d="M14 22 L20 16.5 L26 22" />
            <rect x="17" y="25" width="6" height="8" />
          </svg>
          <span
            className="font-mono font-medium uppercase"
            style={{ ...NODE_LABEL, color: COLIVING }}
          >
            Co-Living
          </span>
          <span className="font-sans text-foreground-muted" style={NODE_STAT}>
            75+ residents
          </span>
        </div>

        {/* Fractal AI Accelerator — lower right */}
        <div className="absolute left-[59%] top-[73.5%] flex w-[40%] flex-col items-start gap-[0.4em] text-left">
          <svg viewBox="0 0 40 40" fill="none" stroke={ACCELERATOR_NODE} strokeWidth="1.4" style={NODE_ICON} aria-hidden="true">
            <polygon points="20,4 37,36 3,36" />
            <polyline points="11.5,20 28.5,20" />
            <polygon points="20,20 24.25,28 15.75,28" />
          </svg>
          <span
            className="font-mono font-medium uppercase"
            style={{ ...NODE_LABEL, color: ACCELERATOR_NODE }}
          >
            Fractal AI Accelerator
          </span>
          <span className="font-sans text-foreground-muted" style={NODE_STAT}>
            Our flagship class for ambitious professionals
          </span>
        </div>

        {/* Venues — lower left */}
        <div className="absolute left-[1%] top-[73.5%] flex w-[40%] flex-col items-end gap-[0.4em] text-right">
          <svg viewBox="0 0 40 40" fill="none" stroke={VENUES} strokeWidth="1.4" style={NODE_ICON} aria-hidden="true">
            <rect x="6" y="6" width="28" height="28" transform="rotate(45 20 20)" />
            <rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)" />
            <rect x="16" y="16" width="8" height="8" transform="rotate(45 20 20)" />
          </svg>
          <span
            className="font-mono font-medium uppercase"
            style={{ ...NODE_LABEL, color: VENUES }}
          >
            Venues
          </span>
          <span className="font-sans text-foreground-muted" style={NODE_STAT}>
            2+ community third spaces
          </span>
        </div>
      </div>
    </div>
  );
}

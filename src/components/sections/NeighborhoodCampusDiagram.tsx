// ---------------------------------------------------------------------------
// NeighborhoodCampusDiagram
//
// Responsive "neighborhood campus" diagram for the Story page.
// - Desktop: circular arrangement with 5 pillars around a center node,
//   connected by a ring/arc.
// - Mobile (< md): vertical stack. Center block on top, 5 pillar cards below.
// - No white background / card frame around the diagram — sits directly on
//   the page background.
// ---------------------------------------------------------------------------

interface Pillar {
  title: string;
  emoji: string;
  stats: string[];
}

const PILLARS: Pillar[] = [
  {
    title: "Events",
    emoji: "\u{1F389}", // 🎉
    stats: ["100+ events/month", "1000+ attendees"],
  },
  {
    title: "Community-run University",
    emoji: "\u{1F3DB}\u{FE0F}", // 🏛️
    stats: [
      "30+ in-person courses",
      "250\u2013350 students per semester",
      "3 semesters per year",
    ],
  },
  {
    title: "Fractal Tech",
    emoji: "\u{1F47E}", // 👾
    stats: [
      "100% job placement rate of engineers from 3-month programming bootcamp",
      "40+ full-time coworking members",
      "5 startups launched and counting",
    ],
  },
  {
    title: "Venues",
    emoji: "\u{1F4CD}", // 📍
    stats: [
      "5 \u201Cthird spaces\u201D hosting 100s of classes, dances, film screenings, residencies, hackathons, and hangouts",
    ],
  },
  {
    title: "Housing Network",
    emoji: "\u{1F3E0}", // 🏠
    stats: ["75+ residents", "22 apartments & townhouses", "4 neighborhoods"],
  },
];

// Ring color — tuned for the Story page's golden background.
const RING_COLOR = "#8A7A20";
const RING_SOFT = "#8A7A2033";

// ---------------------------------------------------------------------------
// Pillar card — used in both circular (desktop) and stacked (mobile) layouts.
// ---------------------------------------------------------------------------

function PillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div
      className="rounded-xl p-4 md:p-5 text-left"
      style={{
        backgroundColor: "transparent",
        border: `1px solid ${RING_SOFT}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl md:text-2xl" aria-hidden>
          {pillar.emoji}
        </span>
        <h3 className="font-serif text-base md:text-lg leading-tight normal-case tracking-tight">
          {pillar.title}
        </h3>
      </div>
      <ul className="space-y-1 text-xs md:text-sm leading-snug text-foreground/90">
        {pillar.stats.map((stat) => (
          <li key={stat} className="flex gap-2">
            <span aria-hidden className="opacity-60">
              {"\u2022"}
            </span>
            <span>{stat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Center node — "Fractal NYC — A neighborhood campus founded in 2021".
// ---------------------------------------------------------------------------

function CenterNode({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-full flex flex-col items-center justify-center text-center ${compact ? "w-28 h-28 sm:w-40 sm:h-40 md:w-56 md:h-56" : "w-full max-w-xs mx-auto aspect-square"}`}
      style={{
        border: `2px solid ${RING_COLOR}`,
        backgroundColor: "transparent",
      }}
    >
      <div className="px-4">
        <div className="font-serif text-lg md:text-xl leading-tight tracking-tight normal-case">
          Fractal NYC
        </div>
        <div className="text-[10px] md:text-xs mt-2 opacity-80 leading-snug">
          A neighborhood campus
          <br />
          founded in 2021
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop circular layout.
// ---------------------------------------------------------------------------

function CircularLayout() {
  // Diagram dimensions. Use a generous square canvas so pillar cards have
  // room at the cardinal-ish positions without colliding with the ring.
  // The canvas is a percentage-based square that scales with viewport,
  // keeping the diagram circular at every breakpoint.
  const size = 760;
  const center = size / 2;
  const ringRadius = 240;

  // 5 pillars distributed around the circle, starting at top (-90deg).
  // Positions are normalized to percentages of the canvas so the diagram
  // scales faithfully when the container shrinks below 760px.
  const positions = PILLARS.map((_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / PILLARS.length;
    return {
      xPct: ((center + ringRadius * Math.cos(angle)) / size) * 100,
      yPct: ((center + ringRadius * Math.sin(angle)) / size) * 100,
    };
  });

  return (
    <div
      className="relative mx-auto aspect-square"
      style={{
        width: "min(100vw - 32px, 760px)",
        maxWidth: "100%",
      }}
    >
      {/* Ring */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          cx={center}
          cy={center}
          r={ringRadius}
          fill="none"
          stroke={RING_COLOR}
          strokeWidth={1.5}
          strokeDasharray="4 6"
          opacity={0.6}
        />
      </svg>

      {/* Center node */}
      <div
        className="absolute"
        style={{
          left: center,
          top: center,
          transform: "translate(-50%, -50%)",
        }}
      >
        <CenterNode compact />
      </div>

      {/* Pillar cards */}
      {PILLARS.map((pillar, i) => {
        const { xPct, yPct } = positions[i];
        return (
          <div
            key={pillar.title}
            className="absolute w-[45%] sm:w-[35%] md:w-[220px]"
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <PillarCard pillar={pillar} />
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top-level component.
// ---------------------------------------------------------------------------

export function NeighborhoodCampusDiagram() {
  return (
    <div className="mt-16 md:mt-24 px-[4.5%]" aria-label="Neighborhood campus diagram">
      {/* Circular layout at all widths — scales down on narrow viewports. */}
      <CircularLayout />
    </div>
  );
}

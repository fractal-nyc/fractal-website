// FRAC-181: extracted from OctahedronHero.tsx so non-WebGL call sites (like
// Hero.tsx's keyboard-accessible skip-nav) can import OUTER_NAV_NODES without
// dragging the entire three.js dependency chain (three + @react-three/fiber +
// drei + three-stdlib) onto the entry chunk. Importing from this module is
// three-free — reach in here directly for OUTER_NAV_NODES / NavNode.
import { HOUSES, SECTIONS } from "@/data/houses";

// The two visible gold roles in the hero are canonical Story and People
// accents rather than a separate 3D-only palette. Keep this map three-free so
// non-WebGL consumers and tests can import the contract without pulling in the
// React Three Fiber dependency chain.
export const HERO_GOLD_ROLES = {
  streamingHighlight: SECTIONS.story.accent,
  connectorStructural: SECTIONS.people.accent,
} as const;

// A missing house/face palette falls back to the shared People connector role.
export const PALETTE_FALLBACK = HERO_GOLD_ROLES.connectorStructural;

export const housePalette = (
  id: string,
  prefer: "light" | "deep" = "light"
): string => {
  const palette = HOUSES.find((h) => h.id === id)?.palette;
  return palette ? palette[prefer] : PALETTE_FALLBACK;
};

export interface NavNode {
  label: string;
  route: string;
  color: string;
  vertexIndex: number;
}

// The six octahedron vertices map to the six main destinations. Story folded
// into Home so its vertex became the Accelerator; the decorative Story FACE
// texture is unaffected (faces and vertex nodes are independent — see
// OctahedronHero). FractalU and Accelerator remain distinct visible nodes but
// share the internal Education hub route and canonical Education palette.
export const OUTER_NAV_NODES: NavNode[] = [
  { label: "Co-Living",   route: "/co-living",                         color: housePalette("neighborhood"), vertexIndex: 3 },
  { label: "Events",      route: "/events",                            color: housePalette("events"),       vertexIndex: 2 },
  { label: "Campus",      route: "/campus",                            color: housePalette("campus"),       vertexIndex: 0 },
  { label: "FractalU",    route: "/education",                         color: housePalette("school"),       vertexIndex: 1 },
  { label: "Library",     route: "/library",                           color: housePalette("lab"),          vertexIndex: 5 },
  { label: "Accelerator", route: "/education",                         color: housePalette("school"),       vertexIndex: 4 },
];

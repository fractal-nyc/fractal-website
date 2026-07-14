// FRAC-181: extracted from OctahedronHero.tsx so non-WebGL call sites (like
// Hero.tsx's keyboard-accessible skip-nav) can import OUTER_NAV_NODES without
// dragging the entire three.js dependency chain (three + @react-three/fiber +
// drei + three-stdlib) onto the entry chunk. Importing from this module is
// three-free — reach in here directly for OUTER_NAV_NODES / NavNode.
import { HOUSES, SECTIONS } from "@/data/houses";

// Octahedron model gold — the graceful fallback when a section/house color is
// missing. Shared by housePalette() below and the face materials in
// OctahedronHero (FRAC-207: replaced a magenta #ff00ff debug sentinel).
export const PALETTE_FALLBACK = "#c4a265";

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

// Routes/labels only: Visit → Fractal Co-Living (/co-living), Publications →
// Library (/library), and Story — which folded into Home — now points at "/".
// House ids follow houses.ts (`neighborhood` → `coliving`, `lab` → `library`).
// Story's color is SECTIONS.story.light (#D4BA58 — the old `accent` value);
// it is decorative here (a glowing 3D node), never text.
//
// vertexIndex 1 used to be Education (/education). That page was retired and the
// route now 404s, so the vertex was repointed at the Accelerator rather than
// dropped — the node COUNT stays at 6 and the octahedron geometry is untouched.
export const OUTER_NAV_NODES: NavNode[] = [
  { label: "Fractal Co-Living", route: "/co-living",   color: housePalette("coliving"),    vertexIndex: 3 },
  { label: "Events",            route: "/events",      color: housePalette("events"),      vertexIndex: 2 },
  { label: "Campus",            route: "/campus",      color: housePalette("campus"),      vertexIndex: 0 },
  { label: "Accelerator",       route: "/accelerator", color: housePalette("accelerator"), vertexIndex: 1 },
  { label: "Library",           route: "/library",     color: housePalette("library"),     vertexIndex: 5 },
  { label: "Story",             route: "/",            color: SECTIONS.story.light,        vertexIndex: 4 },
];

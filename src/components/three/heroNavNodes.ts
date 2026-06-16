// FRAC-181: extracted from OctahedronHero.tsx so non-WebGL call sites (like
// Hero.tsx's keyboard-accessible skip-nav) can import OUTER_NAV_NODES without
// dragging the entire three.js dependency chain (three + @react-three/fiber +
// drei + three-stdlib) onto the entry chunk. Importing from this module is
// three-free; importing OUTER_NAV_NODES from OctahedronHero still works via a
// re-export, but new call sites should reach in here directly.
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

export const OUTER_NAV_NODES: NavNode[] = [
  { label: "Visit",          route: "/neighborhood",     color: housePalette("neighborhood"), vertexIndex: 3 },
  { label: "Events",         route: "/events",           color: housePalette("events"),       vertexIndex: 2 },
  { label: "Campus",         route: "/campus",           color: housePalette("campus"),       vertexIndex: 0 },
  { label: "Education",      route: "/new-liberal-arts", color: housePalette("school"),       vertexIndex: 1 },
  { label: "Publications",   route: "/lab",              color: housePalette("lab"),          vertexIndex: 5 },
  { label: "Story",          route: "/story",            color: SECTIONS.story.accent,        vertexIndex: 4 },
];

import { useSyncExternalStore } from "react";

// FRAC-14: shared hover bridge between the navbar section links and the hero
// octahedron. It works BOTH ways:
//   • Hovering/focusing a nav link (source "nav") glows the matching vertex node
//     AND rotates/tilts that node to the front.
//   • Hovering a node on the model (source "node") highlights the matching nav
//     link — but does NOT rotate, since the node is already under the cursor and
//     spinning it away would fight the pointer.
//
// The `source` is what lets the scene rotate for nav-driven hovers only. Kept as
// a module-level store (not context) because the fixed navbar and the hero
// <Canvas> share no provider boundary; three-free so importing it from the
// navbar never drags the WebGL chunk into that bundle.

export type HeroNavHoverSource = "nav" | "node";

export interface HeroNavHover {
  route: string;
  source: HeroNavHoverSource;
}

let active: HeroNavHover | null = null;
const listeners = new Set<() => void>();

export function setHeroNavHover(
  route: string | null,
  source: HeroNavHoverSource = "nav"
): void {
  if (route === null) {
    if (active === null) return;
    active = null;
  } else {
    if (active && active.route === route && active.source === source) return;
    active = { route, source };
  }
  for (const listener of listeners) listener();
}

// Read imperatively — used inside the scene's per-frame useFrame loop, where
// subscribing (and re-rendering) every change would be wasteful. The returned
// reference is stable between changes, so it is also a safe getSnapshot.
export function getHeroNavHover(): HeroNavHover | null {
  return active;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// React binding for components that DO want to re-render on change (the node
// meshes and the nav links, to toggle their highlight). Server snapshot mirrors
// the client one.
export function useHeroNavHover(): HeroNavHover | null {
  return useSyncExternalStore(subscribe, getHeroNavHover, getHeroNavHover);
}

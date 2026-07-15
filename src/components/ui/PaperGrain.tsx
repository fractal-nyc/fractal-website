import * as React from "react";

// ═══════════════════════════════════════════════════════════════════════════
// PaperGrain — the warm paper-grain overlay ported from Renoverse's
// .fx-grain--warm (shared/effects.css). Single-sourced here so the Button
// (ui/button.tsx) and the frosted Campus audience cards share one copy of the
// brand fingerprint — the baseFrequency / numOctaves / seed values are part of
// that fingerprint; don't drift them (FRAC-52, FRAC-7).
//
// Drop inside any `relative` (ideally `overflow-hidden`, isolated) container as
// a decorative sibling; it tiles a 320×320 fractal-noise SVG and blends via
// `mix-blend-mode: overlay`.
// ═══════════════════════════════════════════════════════════════════════════

const PAPER_GRAIN_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.96 0 0 0 0 0.93 0 0 0 0 0.85 0 0 0 0 0.9 0'/%3E%3C/filter%3E%3Crect width='320' height='320' filter='url(%23n)'/%3E%3C/svg%3E\")";

const grainStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  backgroundImage: PAPER_GRAIN_BG,
  backgroundSize: "320px 320px",
  mixBlendMode: "overlay",
  opacity: 0.35,
};

export function PaperGrain() {
  return <span style={grainStyle} aria-hidden />;
}

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { CampusPage } from "@/pages/CampusPage";

function renderCampus() {
  const { hook } = memoryLocation({ path: "/campus", static: true });
  return render(
    <WouterRouter hook={hook}>
      <CampusPage />
    </WouterRouter>,
  );
}

// The nine Meet-the-Space photos are identified by their alt text (the caption
// shows one-at-a-time below the coverflow, so alt text carries content parity).
const ALTS = [
  /private rooftop deck/i,
  /Fractal Campus kitchen/i,
  /coworking floor/i,
  /Lounge seating/i,
  /Large call booths/i,
  /Small call booths/i,
  /working side-by-side/i,
  /Private office/i,
  /Bathroom/i,
];

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-8 — Meet the Space 3D coverflow (Swiper)
// ═══════════════════════════════════════════════════════════════════════════

describe("Campus — Meet the Space coverflow", () => {
  it("renders all nine photos as slides (content parity via alt text)", () => {
    renderCampus();
    // A couple of alts (e.g. lounge seating) are reused by the separate
    // overview photo pair higher up the page, so assert presence rather than
    // uniqueness.
    for (const alt of ALTS) {
      expect(screen.getAllByAltText(alt).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("shows the active photo's caption below the stage", () => {
    renderCampus();
    // First slide is active on mount; its caption is the rooftop line.
    expect(
      screen.getByText(/5000 sq\. ft of private rooftop/i),
    ).toBeTruthy();
  });

  it("exposes previous/next controls and a dot per photo", () => {
    renderCampus();
    expect(screen.getByRole("button", { name: /previous photo/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /next photo/i })).toBeTruthy();
    const dots = screen.getAllByRole("button", { name: /go to photo/i });
    expect(dots).toHaveLength(9);
  });

  it("renders a NN / TT position counter", () => {
    renderCampus();
    expect(screen.getByText(/01 \/ 09/)).toBeTruthy();
  });
});

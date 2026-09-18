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

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-7 — campus contact link
// (The four audience cards were removed when /campus moved to the
// Coworking / Events / AI Accelerator information architecture.)
// ═══════════════════════════════════════════════════════════════════════════

describe("Campus — contact link", () => {
  it("keeps every campus contact an arrowless inline email link", () => {
    renderCampus();
    const links = screen.getAllByRole("link", { name: "campus@fractalnyc.com" });
    // One inline campus@ link per contact point: the hero CTA and Coworking.
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "mailto:campus@fractalnyc.com");
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
      expect(link).toHaveClass("font-sans", "text-background");
      expect(link).not.toHaveClass("text-body", "text-body-lead", "text-label");
      expect(link.querySelector("[data-outbound-arrow]")).not.toBeInTheDocument();
    }
  });

  it("keeps the hero contact inside the lead-size tour paragraph", () => {
    renderCampus();
    const tour = screen.getByRole("link", {
      name: "Sign up for a guided tour here",
    });
    const paragraph = tour.closest("p");
    expect(paragraph).toHaveClass("text-body-lead");
    const email = paragraph!.querySelector('a[href="mailto:campus@fractalnyc.com"]');
    expect(email).toBeTruthy();
  });
});

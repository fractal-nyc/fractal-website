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

  it("puts a short access line above each hero membership price", () => {
    renderCampus();
    const fullTime = screen.getByRole("link", {
      name: "Full-time membership, 24/7 access; can bring guests, $300/mo",
    });
    const partTime = screen.getByRole("link", {
      name: "Part-time membership, 20 hrs/week; no guests, $150/mo",
    });
    expect(fullTime).toHaveAttribute(
      "href",
      "https://buy.stripe.com/4gM5kDckk5r008p3B608g0L",
    );
    expect(partTime).toHaveAttribute(
      "href",
      "https://buy.stripe.com/eVq4gzckk06G3kB1sY08g0G",
    );
    for (const link of [fullTime, partTime]) {
      const lines = [...link.querySelectorAll("span")]
        .map((span) => span.textContent?.trim() ?? "")
        .filter(Boolean);
      const detail = link === fullTime
        ? "24/7 access; can bring guests"
        : "20 hrs/week; no guests";
      const price = link === fullTime ? "$300/mo" : "$150/mo";
      expect(lines.indexOf(detail)).toBeGreaterThan(lines.indexOf(lines[0]));
      expect(lines.indexOf(price)).toBeGreaterThan(lines.indexOf(detail));
    }
    // Coworking cards keep their own access sentences and do not pick up the
    // button lines.
    expect(
      screen.getByRole("link", { name: "Full-time membership — $300/mo, sign up (opens in a new tab)" }),
    ).not.toHaveTextContent("can bring guests");
    expect(
      screen.getByRole("link", { name: "Part-time membership — $150/mo, sign up (opens in a new tab)" }),
    ).not.toHaveTextContent("no guests");
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

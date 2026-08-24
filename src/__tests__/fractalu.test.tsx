import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { FractalUPage } from "@/pages/FractalUPage";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return { ...actual, useScroll: () => ({ scrollY: { getPrevious: () => 0, on: () => () => {} } }), useMotionValueEvent: () => {} };
});

function renderPage() {
  const { hook } = memoryLocation({ path: "/fractalu" });
  return render(<Router hook={hook}><FractalUPage /></Router>);
}

describe("FractalU page", () => {
  it("renders the complete catalog, clubs, and information", () => {
    renderPage();
    expect(document.querySelectorAll('[data-testid="course-list"] [data-course-category]')).toHaveLength(20);
    expect(screen.getByRole("heading", { name: "Clubs & open groups" })).toBeInTheDocument();
    expect(screen.getAllByText(/Controversial Politics Salon/).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "What is FractalU?" })).toBeInTheDocument();
    expect(screen.getByText("Take yourself and others seriously.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Read the canon/ })).toHaveAttribute("href", "https://ajr.fyi/files/fractal-canon.pdf");
  });

  it("filters both desktop and mobile catalogs by category", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Technology" }));
    expect(screen.getByRole("button", { name: "Technology" })).toHaveAttribute("aria-pressed", "true");
    const mobile = screen.getByTestId("course-list");
    expect(within(mobile).getAllByText("Technology").length).toBeGreaterThan(0);
    expect(within(mobile).queryByText("The Lost Generation Close Reading")).not.toBeInTheDocument();
  });

  it("keeps application, syllabus, video, and teaching links accessible", () => {
    renderPage();
    expect(screen.getAllByRole("link", { name: /Apply|Application Form|Schedule a call/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Syllabus/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Watch video/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "fractalu@fractalnyc.com" })[0]).toHaveAttribute("href", "mailto:fractalu@fractalnyc.com");
  });
});

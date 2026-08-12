import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { EDUCATION_DESTINATIONS } from "@/data/education";
import { HOUSES } from "@/data/houses";
import { EducationPage } from "@/pages/EducationPage";

function renderEducationPage() {
  const { hook } = memoryLocation({ path: "/education", static: true });
  return render(
    <WouterRouter hook={hook}>
      <EducationPage />
    </WouterRouter>,
  );
}

describe("EducationPage", () => {
  it("establishes the page with one display heading and explanatory subtitle", () => {
    renderEducationPage();
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Learn with us under a new liberal arts",
    });
    expect(heading.className).toContain("text-display");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const subtitle = screen.getByText(
      "We currently run two education programs. Explore them below.",
    );
    expect(subtitle.className).toContain("text-subtitle");
  });

  it("presents the two programs as subtitle-tier sections in priority order", () => {
    renderEducationPage();
    const grid = screen.getByTestId("education-destination-grid");
    const headings = within(grid).getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      EDUCATION_DESTINATIONS[0].name,
      EDUCATION_DESTINATIONS[1].name,
    ]);
    expect(
      headings.every((heading) => heading.className.includes("text-subtitle")),
    ).toBe(true);
    expect(within(grid).getByText(/ambitious professionals/)).toBeTruthy();
    expect(within(grid).getByText(/community-run courses/)).toBeTruthy();
  });

  it("uses explicit accessible CTA links without linked program containers or embeds", () => {
    const { container } = renderEducationPage();
    const grid = screen.getByTestId("education-destination-grid");
    const links = within(grid).getAllByRole("link");
    expect(links).toHaveLength(2);
    for (const destination of EDUCATION_DESTINATIONS) {
      const link = screen.getByRole("link", {
        name: `${destination.action} (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.className).toContain("max-w-xs");
      expect(link.className).toContain("w-full");
      expect(link.className).toContain("whitespace-normal");
      expect(link.className).toContain("leading-snug");
      expect(link.className).toContain("focus-visible:ring-2");
    }
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("button a, a button")).toBeNull();
    expect(
      Array.from(grid.querySelectorAll("[data-education-destination]")).every(
        (program) => program.tagName === "DIV",
      ),
    ).toBe(true);
  });

  it("uses the Education deep surface, light accent, and canonical pattern color", () => {
    const { container } = renderEducationPage();
    const education = HOUSES.find(({ id }) => id === "school")!;
    const main = container.querySelector<HTMLElement>("main[data-education-page]")!;
    expect(main.className).toContain("bg-house-education-deep");
    expect(main.className).toContain("text-background");
    expect(main.style.getPropertyValue("--accent")).toBe("var(--color-house-education-light)");
    expect(container.querySelector(`svg [stroke="${education.palette.light}"]`)).toBeTruthy();
  });

  it("stacks program containers by default and progressively enhances to equal columns", () => {
    renderEducationPage();
    const grid = screen.getByTestId("education-destination-grid");
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("md:grid-cols-2");
    const programs = grid.querySelectorAll("[data-education-destination]");
    expect(programs).toHaveLength(2);
    expect(Array.from(programs).every((program) => program.className.includes("h-full"))).toBe(true);
    expect(grid.parentElement?.className).toContain("md:max-w-[58vw]");
  });

  it("renders site chrome and both decorative pennant shells", () => {
    renderEducationPage();
    expect(document.querySelector("header")).toBeTruthy();
    expect(document.querySelector("footer[data-site-footer]")).toBeTruthy();
    expect(screen.getByTestId("education-desktop-pennants")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("education-mobile-pennants")).toHaveAttribute("aria-hidden", "true");
  });
});

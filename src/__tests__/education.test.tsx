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
      name: "A new liberal arts",
    });
    expect(heading.className).toContain("text-display");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const subtitle = screen.getByText(
      "We currently run two education programs. Explore them below.",
    );
    expect(subtitle.className).toContain("text-subtitle");
  });

  it("presents the two programs as mono label-tier cards in priority order", () => {
    renderEducationPage();
    const grid = screen.getByTestId("education-destination-grid");
    const headings = within(grid).getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      EDUCATION_DESTINATIONS[0].houseLinkLabel,
      EDUCATION_DESTINATIONS[1].houseLinkLabel,
    ]);
    expect(
      headings.every((heading) => heading.className.includes("text-label")),
    ).toBe(true);
    expect(within(grid).getByText(/ambitious professionals/)).toBeTruthy();
    expect(within(grid).getByText(/community-run courses/)).toBeTruthy();
  });

  it("uses each whole card as an accessible external link without nested controls", () => {
    const { container } = renderEducationPage();
    const grid = screen.getByTestId("education-destination-grid");
    const links = within(grid).getAllByRole("link");
    expect(links).toHaveLength(2);
    for (const destination of EDUCATION_DESTINATIONS) {
      const accessibleName = `Visit ${destination.houseLinkLabel} (opens in a new tab)`;
      const link = screen.getByRole("link", {
        name: accessibleName,
      });
      expect(link).toHaveAccessibleName(accessibleName);
      expect(accessibleName).toContain(destination.houseLinkLabel);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.className).toContain("education-program-card");
      expect(link.className).toContain("p-9");
      expect(link.className).toContain("focus-visible:ring-2");
      expect(link).toHaveAttribute("data-education-destination", destination.id);
      expect(
        link.querySelectorAll("[data-education-external-icon]"),
      ).toHaveLength(1);
      expect(
        link.querySelectorAll(".education-program-card-grain"),
      ).toHaveLength(1);

      const decoratedShell = link.parentElement;
      expect(decoratedShell?.className).toContain(
        "education-program-card-shell",
      );
      expect(
        decoratedShell?.querySelectorAll('svg[width="30"][height="30"]'),
      ).toHaveLength(4);
      expect(link.className).not.toContain("min-h-");
    }
    expect(
      screen.getByRole("link", {
        name: "Visit Fractal University (opens in a new tab)",
      }),
    ).toBeTruthy();
    expect(container.querySelector("iframe")).toBeNull();
    expect(within(grid).queryAllByRole("button")).toHaveLength(0);
    expect(container.querySelector("button a, a button")).toBeNull();
    expect(
      Array.from(grid.querySelectorAll("[data-education-destination]")).every(
        (program) => program.tagName === "A",
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
    expect(grid.className).toContain("md:items-stretch");
    const programs = grid.querySelectorAll("[data-education-destination]");
    expect(programs).toHaveLength(2);
    expect(
      Array.from(programs).every((program) =>
        program.className.includes("md:h-full"),
      ),
    ).toBe(true);
    expect(
      Array.from(programs).every((program) =>
        program.parentElement?.className.includes("md:h-full"),
      ),
    ).toBe(true);
    expect(
      Array.from(programs).every((program) =>
        program.closest("li")?.className.includes("md:h-full"),
      ),
    ).toBe(true);
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

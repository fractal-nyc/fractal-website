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
  it("presents the two canonical destinations in priority order", () => {
    renderEducationPage();
    const links = within(screen.getByTestId("education-destination-grid")).getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", EDUCATION_DESTINATIONS[0].url);
    expect(links[1]).toHaveAttribute("href", EDUCATION_DESTINATIONS[1].url);
    expect(links[0]).toHaveTextContent("ambitious professionals");
    expect(links[1]).toHaveTextContent("community-run courses");
  });

  it("uses accessible external links without nested embeds", () => {
    const { container } = renderEducationPage();
    for (const destination of EDUCATION_DESTINATIONS) {
      const link = screen.getByRole("link", {
        name: `${destination.action} (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.className).toContain("min-h-44");
      expect(link.className).toContain("focus-visible:ring-2");
    }
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("button a, a button")).toBeNull();
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

  it("stacks cards by default and progressively enhances to equal columns", () => {
    renderEducationPage();
    const grid = screen.getByTestId("education-destination-grid");
    expect(grid.className).toContain("grid-cols-1");
    expect(grid.className).toContain("md:grid-cols-2");
    expect(within(grid).getAllByRole("link").every((card) => card.className.includes("h-full"))).toBe(true);
  });

  it("renders site chrome and both decorative pennant shells", () => {
    renderEducationPage();
    expect(document.querySelector("header")).toBeTruthy();
    expect(document.querySelector("footer[data-site-footer]")).toBeTruthy();
    expect(screen.getByTestId("education-desktop-pennants")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("education-mobile-pennants")).toHaveAttribute("aria-hidden", "true");
  });
});

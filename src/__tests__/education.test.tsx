import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { EDUCATION_ACCELERATOR } from "@/data/education";
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
  it("keeps the approved display hierarchy and explanatory subtitle", () => {
    renderEducationPage();
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "A new liberal arts",
    });
    expect(heading.className).toContain("text-display");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByText("We currently run two education programs. Explore them below."),
    ).toHaveClass("text-subtitle");
  });

  it("puts the sole program-level external Accelerator card before the native portal", () => {
    const { container } = renderEducationPage();
    const accelerator = screen.getByRole("link", {
      name: "Visit Fractal AI Accelerator (opens in a new tab)",
    });
    const portal = container.querySelector<HTMLElement>("[data-fractalu-portal]")!;

    expect(accelerator).toHaveAttribute("href", EDUCATION_ACCELERATOR.url);
    expect(accelerator).toHaveAttribute("target", "_blank");
    expect(accelerator).toHaveAttribute("rel", "noopener noreferrer");
    expect(accelerator).toHaveAttribute("data-education-destination", "accelerator");
    expect(accelerator.className).toContain("education-program-card");
    expect(accelerator.className).toContain("p-9");
    expect(accelerator.querySelector(".education-program-card-grain")).toBeTruthy();
    expect(
      accelerator.parentElement?.querySelectorAll('svg[width="30"][height="30"]'),
    ).toHaveLength(4);
    expect(
      accelerator.compareDocumentPosition(portal) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Fractal University" })).toBeTruthy();
  });

  it("does not embed or expose a FractalU outbound program card or nested controls", () => {
    const { container } = renderEducationPage();
    const programs = screen.getByTestId("education-programs");
    expect(within(programs).getAllByRole("link")).toHaveLength(1);
    expect(
      within(programs).queryByRole("link", { name: /FractalU|University/ }),
    ).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("button a, a button")).toBeNull();
    expect(container.querySelector('[data-education-destination="fractalu"]')).toBeNull();
  });

  it("uses the Education deep surface, light accent, and canonical pattern color", () => {
    const { container } = renderEducationPage();
    const education = HOUSES.find(({ id }) => id === "school")!;
    const main = container.querySelector<HTMLElement>("main[data-education-page]")!;
    expect(main.className).toContain("bg-house-education-deep");
    expect(main.className).toContain("text-background");
    expect(main.style.getPropertyValue("--accent")).toBe(
      "var(--color-house-education-light)",
    );
    expect(container.querySelector(`svg [stroke="${education.palette.light}"]`)).toBeTruthy();
    expect(container.querySelector("[data-fractalu-portal]")).toHaveClass(
      "bg-background",
      "text-foreground",
    );
  });

  it("renders site chrome and both decorative pennant shells", () => {
    renderEducationPage();
    expect(document.querySelector("header")).toBeTruthy();
    expect(document.querySelector("footer[data-site-footer]")).toBeTruthy();
    expect(screen.getByTestId("education-desktop-pennants")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByTestId("education-mobile-pennants")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});

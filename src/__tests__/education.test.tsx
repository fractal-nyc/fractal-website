import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
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
  it("leads with the approved Fractal University identity and actions", () => {
    renderEducationPage();
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Fractal University",
    });
    expect(heading.className).toContain("text-display");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("An improvised college in New York City.")).toHaveClass("text-subtitle");
    expect(screen.getByRole("link", { name: /Stay tuned for future semesters/ })).toHaveAttribute(
      "href",
      "https://fractaluniversity.substack.com",
    );
    expect(screen.getByRole("link", { name: "What is FractalU?" })).toHaveAttribute(
      "href",
      "#what-is-fractalu",
    );
  });

  it("places the transparent Library-scale catalog after the intro", () => {
    const { container } = renderEducationPage();
    const intro = container.querySelector<HTMLElement>("[data-education-intro]")!;
    const portal = container.querySelector<HTMLElement>("[data-fractalu-portal]")!;
    expect(intro.compareDocumentPosition(portal) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(portal.querySelector("[data-fractalu-wide-shell]")).toHaveClass(
      "max-w-[1600px]",
      "page-gutter",
      "z-20",
    );
    expect(portal.querySelector("[data-fractalu-catalog-frame]")).not.toHaveClass(
      "bg-background",
      "shadow-lg",
    );
  });

  it("does not embed or expose a standalone Accelerator promotion or nested controls", () => {
    const { container } = renderEducationPage();
    expect(screen.queryByRole("link", { name: /Visit Fractal AI Accelerator/ })).toBeNull();
    expect(container.querySelector("[data-education-destination='accelerator']")).toBeNull();
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
    expect(education.palette.light).toBe("#CB2B23");
    expect(container.querySelector("[data-fractalu-wide-shell]")).toHaveClass("text-background");
    expect(container.querySelector("[data-sector-letter]")).toHaveStyle({
      color: "var(--color-house-education-light)",
    });
    expect(container.querySelector("[data-sector-name]")).toHaveStyle({
      color: "hsl(var(--background))",
    });
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
    const desktopPennants = screen.getByTestId("education-desktop-pennants");
    expect(desktopPennants).toHaveClass(
      "inset-x-4",
      "sm:inset-x-8",
      "md:inset-x-12",
      "lg:inset-x-16",
      "top-28",
      "md:top-36",
    );
    for (const slot of Array.from(desktopPennants.children)) {
      expect(slot).toHaveClass("h-full", "w-[24%]", "md:w-[16%]", "max-w-[210px]");
    }
  });

  it("scrolls and focuses the What is FractalU section from the intro action", () => {
    renderEducationPage();
    const target = document.getElementById("what-is-fractalu")!;
    target.scrollIntoView = vi.fn();
    fireEvent.click(screen.getByRole("link", { name: "What is FractalU?" }));
    expect(window.location.hash).toBe("#what-is-fractalu");
    expect(target).toHaveFocus();
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { HOUSES } from "@/data/houses";
import { FRACTALU_CATALOG } from "@/data/fractalu";
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
    const futureSemesters = screen.getByRole("link", {
      name: /Stay tuned for future semesters/,
    });
    expect(futureSemesters).toHaveAttribute(
      "href",
      "https://fractaluniversity.substack.com",
    );
    expect(futureSemesters).toHaveAttribute("target", "_blank");
    expect(futureSemesters).toHaveAttribute("rel", "noopener noreferrer");
    const informationJump = screen.getByRole("link", { name: "What is FractalU?" });
    expect(informationJump).toHaveAttribute(
      "href",
      "#what-is-fractalu",
    );
    expect(futureSemesters).toHaveClass(
      "text-body-lead",
      "text-background/70",
      "min-h-11",
      "decoration-background/40",
      "hover:decoration-background",
      "focus-visible:decoration-background",
    );
    expect(informationJump).toHaveClass(
      "text-body-lead",
      "text-background/70",
      "min-h-11",
      "decoration-background/40",
      "hover:decoration-background",
    );
    const heroArrow = futureSemesters.querySelector("[data-education-outbound-arrow]")!;
    expect(heroArrow.tagName).toBe("svg");
    expect(heroArrow).toHaveClass("lucide-arrow-up-right");
    expect(heroArrow).toHaveAttribute("aria-hidden", "true");
    const informationArrow = informationJump.querySelector(
      "[data-education-internal-arrow]",
    )!;
    expect(informationArrow.tagName).toBe("svg");
    expect(informationArrow).toHaveClass("lucide-arrow-down");
    expect(informationArrow).toHaveAttribute("aria-hidden", "true");
    expect(informationJump.querySelector("[data-education-outbound-arrow]")).toBeNull();
    expect(
      screen.getByText("What is FractalU?", {
        selector: "[data-education-hero-action-label]",
      }),
    ).not.toHaveClass("text-subtitle", "text-body");

    for (const heroLink of [futureSemesters, informationJump]) {
      expect(heroLink.closest("button")).toBeNull();
      expect(heroLink).not.toHaveClass(
        "border",
        "bg-[var(--accent,currentColor)]",
        "shadow-[0_8px_24px_-12px_rgba(11,26,43,0.18)]",
        "w-full",
      );
      expect(heroLink.querySelector("[data-paper-grain]")).toBeNull();
      expect(heroLink.querySelector("[data-mandelbrot-icon]")).toBeNull();
    }
  });

  it("covers the complete 53-link outbound inventory without changing destinations", () => {
    const { container } = renderEducationPage();
    const expectedHrefs = [
      "https://fractaluniversity.substack.com",
      ...FRACTALU_CATALOG.courses.flatMap((course) => [
        ...(course.detailsUrl ? [course.detailsUrl] : []),
        course.applicationUrl,
        ...(course.videoUrl ? [course.videoUrl] : []),
      ]),
      ...FRACTALU_CATALOG.clubs.flatMap((club) => [
        ...(club.detailsUrl ? [club.detailsUrl] : []),
        club.actionUrl,
      ]),
      "mailto:fractalu@fractalnyc.com",
      "https://ajr.fyi/files/fractal-canon.pdf",
      "https://fractaluniversity.substack.com",
      "mailto:fractalu@fractalnyc.com",
    ];
    const outboundLinks = Array.from(
      container.querySelectorAll<HTMLAnchorElement>("[data-education-outbound-link]"),
    );

    expect(expectedHrefs).toHaveLength(53);
    expect(outboundLinks).toHaveLength(expectedHrefs.length);
    expect(outboundLinks.map((link) => link.getAttribute("href")).sort()).toEqual(
      [...expectedHrefs].sort(),
    );
    for (const link of outboundLinks) {
      const arrows = link.querySelectorAll("[data-education-outbound-arrow]");
      expect(arrows).toHaveLength(1);
      expect(arrows[0].tagName).toBe("svg");
      expect(arrows[0]).toHaveClass("lucide-arrow-up-right");
      expect(arrows[0]).toHaveAttribute("aria-hidden", "true");
      expect(link).not.toHaveTextContent("→");
      expect(link.getAttribute("aria-label") ?? "").not.toContain("→");
      if (link.getAttribute("href")?.startsWith("http")) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
        expect(link.getAttribute("aria-label")).toMatch(/opens in a new tab/);
      } else {
        expect(link).not.toHaveAttribute("target");
        expect(link).not.toHaveAttribute("rel");
      }
    }
    const informationJump = container.querySelector<HTMLAnchorElement>(
      'a[href="#what-is-fractalu"]',
    )!;
    expect(informationJump).not.toHaveAttribute("data-education-outbound-link");
    expect(informationJump).not.toHaveAttribute("target");
    expect(informationJump).not.toHaveAttribute("aria-label");
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
    expect(education.palette.light).toBe("#B22B23");
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
      "hidden",
      "md:flex",
      "inset-x-4",
      "sm:inset-x-8",
      "md:inset-x-12",
      "lg:inset-x-16",
      "top-28",
      "md:top-36",
    );
    for (const slot of Array.from(desktopPennants.children)) {
      expect(slot).toHaveClass(
        "h-[90%]",
        "w-[21.6%]",
        "md:w-[14.4%]",
        "max-w-[189px]",
      );
    }

    const mobilePennants = screen.getByTestId("education-mobile-pennants");
    expect(mobilePennants).toHaveClass(
      "flex",
      "md:hidden",
      "items-end",
      "justify-center",
      "gap-3",
      "px-3",
      "pt-8",
      "pb-12",
    );
    for (const slot of Array.from(mobilePennants.children)) {
      expect(slot).toHaveClass("w-[40.5%]", "aspect-[123/368]");
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

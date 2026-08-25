import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractalUniversityPortal } from "@/components/education/FractalUniversityPortal";
import { FRACTALU_CATALOG, FRACTALU_CATEGORIES } from "@/data/fractalu";

const originalMatchMedia = window.matchMedia;

function mockFinePointer(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: originalMatchMedia,
  });
  window.history.replaceState(null, "", "/");
});

describe("FractalUniversityPortal", () => {
  it("renders one 20-course collection and the four-group snapshot", () => {
    render(<FractalUniversityPortal />);
    const catalog = screen.getByTestId("fractalu-course-catalog");
    expect(within(catalog).getAllByRole("article")).toHaveLength(20);
    expect(document.querySelectorAll("[data-course-collection]")).toHaveLength(1);
    expect(document.querySelector("table")).toBeNull();
    expect(document.querySelector("details, summary")).toBeNull();
    expect(within(screen.getByTestId("fractalu-clubs")).getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText(`Fractal University · ${FRACTALU_CATALOG.semester}`)).toBeTruthy();
  });

  it("exposes all categories as 44px-minimum pressed-state filters", () => {
    render(<FractalUniversityPortal />);
    const group = screen.getByRole("group", { name: "Filter classes by subject" });
    const filters = within(group).getAllByRole("button");
    expect(filters.map((button) => button.textContent)).toEqual(FRACTALU_CATEGORIES);
    expect(filters.every((button) => button.className.includes("min-h-11"))).toBe(true);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Technology" }));
    expect(screen.getByRole("button", { name: "Technology" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(within(screen.getByTestId("fractalu-course-catalog")).getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("3 courses shown.")).toHaveAttribute("aria-live", "polite");
    expect(screen.queryByText("The Lost Generation Close Reading")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(within(screen.getByTestId("fractalu-course-catalog")).getAllByRole("article")).toHaveLength(20);
    expect(screen.getByText("20 courses shown.")).toHaveAttribute("aria-live", "polite");
  });

  it("uses Library-style category-first hierarchy and source-case course titles", () => {
    render(<FractalUniversityPortal />);
    const firstCard = within(screen.getByTestId("fractalu-course-catalog")).getAllByRole("article")[0];
    const category = within(firstCard).getByText(FRACTALU_CATALOG.courses[0].category);
    const title = firstCard.querySelector("h3")!;
    expect(category.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(title).toHaveClass("normal-case");
    expect(title.className).not.toMatch(/uppercase/);
    expect(firstCard.querySelector("[data-course-external-icon]")).toBeTruthy();
  });

  it("links the 19 verified course documents and preserves the Butoh source fallback", () => {
    render(<FractalUniversityPortal />);
    const catalog = screen.getByTestId("fractalu-course-catalog");
    const verifiedCourses = FRACTALU_CATALOG.courses.filter((course) => course.detailsUrl);
    expect(verifiedCourses).toHaveLength(19);
    for (const course of verifiedCourses) {
      const link = within(catalog).getByRole("link", {
        name: `${course.title} course description (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("href", course.detailsUrl);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link).toHaveAttribute("aria-describedby", `${course.id}-description`);
    }
    const butohCard = catalog.querySelector<HTMLElement>('[data-course-id="butoh-into-the-depth"]')!;
    expect(within(butohCard).queryByRole("link", { name: /Butoh: Into the Depth course description/ })).toBeNull();
    expect(butohCard.querySelector("[data-course-title-fallback]")).toBeTruthy();
    expect(within(butohCard).getByRole("link", { name: /Apply for Butoh/ })).toHaveAttribute(
      "href",
      "https://www.vangeline.com/calendar",
    );
  });

  it("keeps descriptions and available bios in normal flow without matchMedia", () => {
    mockFinePointer(false);
    render(<FractalUniversityPortal />);
    const catalog = screen.getByTestId("fractalu-course-catalog");
    expect(catalog.querySelectorAll("[data-course-description]")).toHaveLength(20);
    expect(catalog.querySelectorAll("[data-instructor-bio]")).toHaveLength(18);
    expect(within(catalog).queryByRole("button", { name: "Elena Navarrete" })).toBeNull();
    for (const panel of catalog.querySelectorAll("[data-course-description], [data-instructor-bio]")) {
      expect(panel.className).not.toMatch(/hidden|sr-only/);
    }
    for (const id of ["making-a-lamp", "how-to-make-a-planter"]) {
      const card = catalog.querySelector<HTMLElement>(`[data-course-id="${id}"]`)!;
      expect(card.querySelector("[data-instructor-bio]")).toBeNull();
      expect(within(card).queryByRole("button")).toBeNull();
    }
  });

  it("progressively enhances instructor bios with focus, pinning, and Escape", () => {
    mockFinePointer(true);
    render(<FractalUniversityPortal />);
    const button = screen.getAllByRole("button", { name: "Elena Navarrete" })[0];
    const bioId = button.getAttribute("aria-controls")!;
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(bioId)).toHaveAttribute("data-instructor-bio");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button.closest("[data-pinned]")).toHaveAttribute("data-pinned", "true");
    fireEvent.keyDown(button, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("jumps to and focuses the Campus-style What is FractalU section", () => {
    render(<FractalUniversityPortal />);
    const target = document.getElementById("what-is-fractalu")!;
    target.scrollIntoView = vi.fn();
    fireEvent.click(screen.getByRole("link", { name: "What's FractalU?" }));
    expect(window.location.hash).toBe("#what-is-fractalu");
    expect(target).toHaveFocus();
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    expect(target).toHaveClass("max-w-7xl", "page-gutter", "scroll-mt-24");
    expect(target.firstElementChild).toHaveClass("max-w-3xl");
  });

  it("keeps every HTTP action safe without nested interactive controls", () => {
    const { container } = render(<FractalUniversityPortal />);
    const externalLinks = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'));
    expect(externalLinks.length).toBeGreaterThan(20);
    for (const link of externalLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.getAttribute("aria-label")).toMatch(/opens in a new tab/);
    }
    expect(container.querySelector("a a, a button, button a, button button")).toBeNull();
    expect(container.querySelectorAll('a[href^="mailto:"]')).toHaveLength(2);
    expect(container.querySelector('a[href^="mailto:"]')).not.toHaveAttribute("target");
  });

  it("uses the source-owned responsive collage without cropping", () => {
    render(<FractalUniversityPortal />);
    const picture = screen.getByTestId("fractalu-collage");
    const source = picture.querySelector("source")!;
    const image = picture.querySelector("img")!;
    expect(source).toHaveAttribute("srcset", "/images/fractalu-mobile.png");
    expect(source).toHaveAttribute("width", "639");
    expect(source).toHaveAttribute("height", "318");
    expect(image).toHaveAttribute("src", "/images/fractalu.png");
    expect(image).toHaveAttribute("width", "800");
    expect(image).toHaveAttribute("height", "133");
    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveClass("h-auto", "w-full");
  });

  it("uses the approved information and Mandelbrot teaching-callout hierarchy", () => {
    render(<FractalUniversityPortal />);
    expect(screen.getByRole("heading", { name: "What is FractalU?" })).toBeTruthy();
    expect(screen.getByText(/No credentials, no grades, no gatekeeping/)).toBeTruthy();
    const teachingLabel = screen.getByText("Want to teach?");
    const callout = teachingLabel.closest(".p-9")!;
    expect(callout).toHaveClass("bg-background", "text-foreground", "p-9");
    expect(callout.querySelectorAll('svg[width="30"][height="30"]')).toHaveLength(4);
    expect(screen.getByText("Take yourself and others seriously.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Read the FractalU canon PDF/ })).toHaveAttribute(
      "href",
      "https://ajr.fyi/files/fractal-canon.pdf",
    );
  });

  it("does not imply accounts, forms, routes, or embeds", () => {
    const { container } = render(<FractalUniversityPortal />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(screen.queryByText(/sign in|log in|student portal/i)).toBeNull();
  });
});

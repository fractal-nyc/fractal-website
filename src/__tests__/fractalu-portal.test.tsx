import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractalUniversityPortal } from "@/components/education/FractalUniversityPortal";
import {
  FRACTALU_CATALOG,
  FRACTALU_CATEGORIES,
  FRACTALU_SOURCE_PROVENANCE,
} from "@/data/fractalu";

const MEL_BRAND_BIO =
  "Mel Brand is a Brooklyn-based industrial designer creating environmentally conscious furniture that balances sustainability with playful conceptual thinking. With 10 years of experience in architecture, architectural lighting design, and industrial design her work considers the relationship between furniture, space, and human interaction in the home. She brings levity to complex topics, using humor as a design tool to make serious issues more approachable. Her recent projects span furniture, lighting, and home goods, often working with materials such as wood, 3D printing, ceramics, and fabric. By combining thoughtful design with a systems-oriented mindset, Mel aims to create work that sparks both joy and reflection.";
const JULIANNE_LEFELHOCZ_BIO =
  "Julianne Lefelhocz is a multidisciplinary creative technologist and designer merging fashion, design, math, and technology. With over 10 years of experience 3D modeling, two degrees in Computer Science and Footwear and Accessories Design, she is a teacher at the Brooklyn Shoe Space for 3D modeling footwear and a software engineer building CAD tools for jewelry design. She leverages tools such as 3D printing, laser cutting, electronics, kinetics and parametric code to create unique designs for accessories, home goods and fashion. Inspired by the natural world and the mathematical formulas that underpin it, her work often reflects themes of recursion, geometry, and dichotomy.";
const ANDREW_ROSE_BIO =
  "Andrew Rose, Founder of Fractal, Fractal University, and Fractal Bootcamp — Andrew has trained 100 engineers in the last 2 years, following his career as a software engineer and educator.";
const LIAM_DUFFY_BIO =
  "Liam Duffy, senior software engineer at Seso Inc. — Liam has been a senior software engineer for over 5 years and has been engineering for over a decade. At Seso, he is leading the adoption of AI engineering practices, and now he's bringing that real-world expertise to Fractal Accelerator students.";
const OLD_ACCELERATOR_PARAPHRASE =
  "Andrew Rose, Founder of Fractal, Fractal University, and Fractal Bootcamp, has trained 100 engineers in the last two years following his career as a software engineer and educator. Liam Duffy is a senior software engineer at Seso Inc. with over a decade of engineering experience; he leads the adoption of AI engineering practices at Seso and brings that real-world expertise to Fractal Accelerator students.";

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

function mockFinePointerController(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    get matches() {
      return matches;
    },
    media: "(min-width: 64rem) and (hover: hover) and (pointer: fine)",
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => mediaQueryList),
  });

  return {
    setMatches(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches, media: mediaQueryList.media } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
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
    const clubs = screen.getByTestId("fractalu-clubs");
    expect(within(catalog).getAllByRole("article")).toHaveLength(20);
    expect(document.querySelectorAll("[data-course-collection]")).toHaveLength(1);
    expect(document.querySelector("table")).toBeNull();
    expect(document.querySelector("details, summary")).toBeNull();
    expect(within(clubs).getAllByRole("article")).toHaveLength(4);
    expect(within(clubs).queryByText(/^Open group$/)).toBeNull();
    expect(screen.getByRole("heading", { name: "Clubs & open groups" })).toBeTruthy();
    const semester = screen.getByText(FRACTALU_CATALOG.semester, {
      selector: "[data-fractalu-semester-eyebrow]",
    });
    const catalogHeading = screen.getByRole("heading", { level: 2, name: "Course Catalog" });
    expect(semester.tagName).toBe("P");
    expect(
      semester.compareDocumentPosition(catalogHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Browse this semester's classes by subject.")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: `${FRACTALU_CATALOG.semester} semester` }),
    ).toBeNull();
    expect(screen.queryByText("Filter classes by subject.")).toBeNull();
    expect(document.querySelector("[data-fractalu-portal]")).toHaveAttribute(
      "aria-labelledby",
      "fractalu-catalog-title",
    );
  });

  it("promotes labelled club schedules and locations directly below each title", () => {
    render(<FractalUniversityPortal />);
    const clubs = screen.getByTestId("fractalu-clubs");

    for (const club of FRACTALU_CATALOG.clubs) {
      const card = clubs.querySelector<HTMLElement>(`[data-club-id="${club.id}"]`)!;
      expect(card).toBeTruthy();

      const title = within(card).getByRole("heading", { name: club.name });
      const metadata = card.querySelector<HTMLElement>("[data-club-metadata]")!;
      expect(metadata).toBeTruthy();
      expect(title.nextElementSibling).toBe(metadata);
      expect(Array.from(metadata.querySelectorAll("dt"), (term) => term.textContent)).toEqual([
        "Schedule",
        "Location",
      ]);
      expect(within(metadata).getAllByText(club.schedule, { selector: "dd" })).toHaveLength(1);
      expect(within(metadata).getAllByText(club.location, { selector: "dd" })).toHaveLength(1);
      expect(within(card).queryByText(`${club.schedule} · ${club.location}`)).toBeNull();
      expect(within(card).getByText(club.description)).toBeTruthy();

      const action = within(card).getByRole("link", {
        name: `${club.actionLabel} for ${club.name} (opens in a new tab)`,
      });
      expect(action).toHaveAttribute("href", club.actionUrl);
      expect(action).toHaveAttribute("target", "_blank");
      expect(action).toHaveAttribute("rel", "noopener noreferrer");

      if (club.detailsUrl) {
        const details = within(card).getByRole("link", {
          name: `${club.detailsLabel ?? "Group details"} for ${club.name} (opens in a new tab)`,
        });
        expect(details).toHaveAttribute("href", club.detailsUrl);
        expect(details).toHaveAttribute("target", "_blank");
        expect(details).toHaveAttribute("rel", "noopener noreferrer");
      }
    }
  });

  it("exposes all categories as 44px-minimum pressed-state filters", () => {
    render(<FractalUniversityPortal />);
    const filterBlock = document.querySelector("[data-fractalu-filter-block]")!;
    expect(filterBlock).not.toHaveClass("border-b");
    const group = screen.getByRole("group", { name: "Filter classes by subject" });
    const filters = within(group).getAllByRole("button");
    expect(filters.map((button) => button.textContent)).toEqual(FRACTALU_CATEGORIES);
    expect(filters.every((button) => button.className.includes("min-h-11"))).toBe(true);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    const technology = screen.getByRole("button", { name: "Technology" });
    expect(technology).toHaveClass(
      "hover:bg-house-education-light",
      "hover:text-background",
      "focus-visible:bg-house-education-light",
      "focus-visible:text-background",
    );

    fireEvent.click(technology);
    expect(technology).toHaveAttribute("aria-pressed", "true");
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
    expect(firstCard).toHaveClass("fractalu-course-card");
    expect(firstCard.parentElement?.querySelectorAll('svg[width="20"][height="20"]')).toHaveLength(4);
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
      expect(link.querySelector("[data-course-external-icon]")).toBeTruthy();
    }
    const butohCard = catalog.querySelector<HTMLElement>('[data-course-id="butoh-into-the-depth"]')!;
    expect(within(butohCard).queryByRole("link", { name: /Butoh: Into the Depth course description/ })).toBeNull();
    expect(butohCard.querySelector("[data-course-title-fallback]")).toBeTruthy();
    expect(within(butohCard).getByRole("link", { name: /Apply for Butoh/ })).toHaveAttribute(
      "href",
      "https://www.vangeline.com/calendar",
    );
  });

  it("keeps descriptions and all source biographies in normal flow without matchMedia", () => {
    mockFinePointer(false);
    render(<FractalUniversityPortal />);
    const catalog = screen.getByTestId("fractalu-course-catalog");
    expect(catalog.querySelectorAll("[data-course-description]")).toHaveLength(20);
    expect(catalog.querySelectorAll("[data-instructor-bio]")).toHaveLength(20);
    expect(catalog.querySelectorAll("[data-instructor-record]")).toHaveLength(23);
    expect(within(catalog).queryByRole("button", { name: "Elena Navarrete" })).toBeNull();
    for (const panel of catalog.querySelectorAll("[data-course-description], [data-instructor-bio]")) {
      expect(panel.className).not.toMatch(/hidden|sr-only/);
    }
  });

  it("preserves exact ordered multi-instructor source records and provenance", () => {
    mockFinePointer(true);
    render(<FractalUniversityPortal />);

    expect(FRACTALU_CATALOG.courses).toHaveLength(20);
    for (const course of FRACTALU_CATALOG.courses) {
      expect(course.instructors.length).toBeGreaterThan(0);
      expect(course.instructors.every(({ name, bio }) => name.length > 0 && bio.length > 0)).toBe(true);
      expect(course.instructor).toBe(course.instructors.map(({ name }) => name).join(" & "));
    }

    for (const id of ["making-a-lamp", "how-to-make-a-planter"]) {
      const course = FRACTALU_CATALOG.courses.find((candidate) => candidate.id === id)!;
      expect(course.instructors).toEqual([
        { name: "Mel Brand", bio: MEL_BRAND_BIO },
        { name: "Julianne Lefelhocz", bio: JULIANNE_LEFELHOCZ_BIO },
      ]);
      const card = document.querySelector<HTMLElement>(`[data-course-id="${id}"]`)!;
      const trigger = within(card).getByRole("button", {
        name: "Mel Brand & Julianne Lefelhocz",
      });
      const panel = document.getElementById(trigger.getAttribute("aria-controls")!)!;
      expect(within(panel).getByText(MEL_BRAND_BIO)).toBeTruthy();
      expect(within(panel).getByText(JULIANNE_LEFELHOCZ_BIO)).toBeTruthy();
      expect(panel.querySelectorAll("[data-instructor-record]")).toHaveLength(2);
      expect(panel.querySelector("a, button")).toBeNull();
    }

    const accelerator = FRACTALU_CATALOG.courses.find(
      (course) => course.id === "fractal-accelerator",
    )!;
    expect(accelerator.instructors).toEqual([
      { name: "Andrew Rose", bio: ANDREW_ROSE_BIO },
      { name: "Liam Duffy", bio: LIAM_DUFFY_BIO },
    ]);
    expect(screen.getByText(ANDREW_ROSE_BIO)).toBeTruthy();
    expect(screen.getByText(LIAM_DUFFY_BIO)).toBeTruthy();
    expect(screen.queryByText(OLD_ACCELERATOR_PARAPHRASE)).toBeNull();

    expect(FRACTALU_SOURCE_PROVENANCE).toEqual({
      url: "https://www.fractalu.nyc/",
      verifiedAt: "2026-08-25T21:24:12Z",
      lastModified: "Sat, 22 Aug 2026 14:48:29 GMT",
      etag: '"2cc1fc19d0554d960a08ada91c6063a8"',
      byteLength: 103678,
      sha256: "99194ce63e46c93f17763dbcddac0015b29a8fe70a2df812d55696b9f0c7b1d7",
    });
  });

  it("progressively enhances instructor bios with focus, pinning, and Escape", () => {
    mockFinePointer(true);
    render(<FractalUniversityPortal />);
    const button = screen.getAllByRole("button", { name: "Elena Navarrete" })[0];
    const bioId = button.getAttribute("aria-controls")!;
    const bio = document.getElementById(bioId)!;
    const preview = button.closest("[data-pinned]")!;
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(bio).toHaveAttribute("data-instructor-bio");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(preview).toHaveAttribute("data-pinned", "true");
    fireEvent.keyDown(button, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
    expect(preview).toHaveAttribute("data-pinned", "false");
    expect(preview).toHaveAttribute("data-suppressed", "true");
    expect(getComputedStyle(bio).visibility).toBe("hidden");
    expect(getComputedStyle(bio).opacity).toBe("0");

    const courseCard = button.closest("article")!;
    const applicationLink = within(courseCard).getByRole("link", {
      name: /Apply for The Lost Generation Close Reading/,
    });
    act(() => applicationLink.focus());
    expect(preview).toHaveAttribute("data-suppressed", "false");
    act(() => button.focus());
    expect(button).toHaveFocus();
    expect(getComputedStyle(bio).visibility).not.toBe("hidden");
  });

  it("clears Escape suppression when the bio switches between enhanced and inline modes", () => {
    const media = mockFinePointerController(true);
    render(<FractalUniversityPortal />);
    const catalog = screen.getByTestId("fractalu-course-catalog");
    const enhancedButton = screen.getAllByRole("button", { name: "Elena Navarrete" })[0];
    const bioId = enhancedButton.getAttribute("aria-controls")!;
    const bio = document.getElementById(bioId)!;
    const preview = bio.closest("[data-suppressed]")!;

    fireEvent.click(enhancedButton);
    fireEvent.keyDown(enhancedButton, { key: "Escape" });
    expect(preview).toHaveAttribute("data-suppressed", "true");
    expect(getComputedStyle(bio).visibility).toBe("hidden");

    act(() => media.setMatches(false));
    expect(catalog).toHaveAttribute("data-preview-mode", "inline");
    expect(within(catalog).queryByRole("button", { name: "Elena Navarrete" })).toBeNull();
    expect(preview).toHaveAttribute("data-suppressed", "false");
    expect(getComputedStyle(bio).position).toBe("static");
    expect(getComputedStyle(bio).visibility).toBe("visible");
    expect(getComputedStyle(bio).opacity).toBe("1");

    act(() => media.setMatches(true));
    expect(catalog).toHaveAttribute("data-preview-mode", "enhanced");
    expect(preview).toHaveAttribute("data-suppressed", "false");
    const restoredButton = within(catalog).getAllByRole("button", {
      name: "Elena Navarrete",
    })[0];
    act(() => restoredButton.focus());
    expect(getComputedStyle(bio).visibility).toBe("visible");
  });

  it("keeps the Campus-style What is FractalU section as a focus target", () => {
    render(<FractalUniversityPortal />);
    const target = document.getElementById("what-is-fractalu")!;
    expect(target).toHaveAttribute("tabindex", "-1");
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

  it("ends with the information content and does not render the dormant collage assets", () => {
    render(<FractalUniversityPortal />);
    expect(screen.queryByRole("region", { name: "Fractal University in community" })).toBeNull();
    expect(screen.queryByTestId("fractalu-collage")).toBeNull();
    expect(document.querySelector("[data-fractalu-final-collage]")).toBeNull();
    expect(document.querySelector('img[src="/images/fractalu.png"]')).toBeNull();
    expect(document.querySelector('source[srcset="/images/fractalu-mobile.png"]')).toBeNull();
    expect(screen.getByRole("heading", { name: "The canon" })).toBeTruthy();
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

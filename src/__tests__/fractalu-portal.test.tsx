import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FractalUniversityPortal } from "@/components/education/FractalUniversityPortal";
import { FRACTALU_CATALOG, FRACTALU_CATEGORIES } from "@/data/fractalu";

describe("FractalUniversityPortal", () => {
  it("renders the reviewed 20-course and four-group snapshot", () => {
    render(<FractalUniversityPortal />);
    const cards = screen.getByTestId("fractalu-course-cards");
    const table = screen.getByTestId("fractalu-course-table");
    expect(within(cards).getAllByRole("article")).toHaveLength(20);
    expect(within(table).getAllByRole("row")).toHaveLength(21);
    expect(within(screen.getByTestId("fractalu-clubs")).getAllByRole("article")).toHaveLength(4);
    expect(screen.getByText(`Fractal University · ${FRACTALU_CATALOG.semester}`)).toBeTruthy();
  });

  it("exposes all source categories as 44px-minimum pressed-state filters", () => {
    render(<FractalUniversityPortal />);
    const group = screen.getByRole("group", { name: "Filter classes by subject" });
    const filters = within(group).getAllByRole("button");
    expect(filters.map((button) => button.textContent)).toEqual(FRACTALU_CATEGORIES);
    expect(filters.every((button) => button.className.includes("min-h-11"))).toBe(true);
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Technology" }));
    expect(screen.getByRole("button", { name: "Technology" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "false");
    expect(within(screen.getByTestId("fractalu-course-cards")).getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("3 courses shown.")).toHaveAttribute("aria-live", "polite");
    expect(screen.queryByText("The Lost Generation Close Reading")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(within(screen.getByTestId("fractalu-course-cards")).getAllByRole("article")).toHaveLength(20);
    expect(screen.getByText("20 courses shown.")).toHaveAttribute("aria-live", "polite");
  });

  it("keeps the mobile cards and desktop table as one responsive catalog contract", () => {
    render(<FractalUniversityPortal />);
    expect(screen.getByTestId("fractalu-course-cards")).toHaveClass("lg:hidden");
    expect(screen.getByTestId("fractalu-course-table")).toHaveClass("hidden", "lg:block", "overflow-x-auto");
    const table = within(screen.getByTestId("fractalu-course-table"));
    expect(table.getByRole("table")).toBeTruthy();
    expect(table.getAllByRole("columnheader").map((cell) => cell.textContent)).toEqual([
      "Class",
      "Instructor",
      "Day & time",
      "Dates",
      "Location",
      "Price",
      "Apply",
    ]);
  });

  it("uses keyboard-operable details for descriptions and instructor biographies", () => {
    render(<FractalUniversityPortal />);
    const firstCard = within(screen.getByTestId("fractalu-course-cards")).getAllByRole("article")[0];
    const disclosures = firstCard.querySelectorAll("details");
    expect(disclosures).toHaveLength(2);
    expect(within(firstCard).getByText("Course description").closest("summary")).toBeTruthy();
    expect(within(firstCard).getByText(/About Elena Navarrete/).closest("summary")).toBeTruthy();
  });

  it("keeps every HTTP action safe and explicit about opening a new tab", () => {
    const { container } = render(<FractalUniversityPortal />);
    const externalLinks = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'));
    expect(externalLinks.length).toBeGreaterThan(20);
    for (const link of externalLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(link.getAttribute("aria-label")).toMatch(/opens in a new tab/);
    }
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

  it("preserves the public information, teaching, etiquette, and canon copy", () => {
    render(<FractalUniversityPortal />);
    expect(screen.getByRole("heading", { name: "What is FractalU?" })).toBeTruthy();
    expect(screen.getByText(/No credentials, no grades, no gatekeeping/)).toBeTruthy();
    expect(screen.getByText("Want to teach?")).toBeTruthy();
    expect(screen.getByText("Take yourself and others seriously.")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Read the FractalU canon PDF/ })).toHaveAttribute(
      "href",
      "https://ajr.fyi/files/fractal-canon.pdf",
    );
    expect(screen.getAllByRole("link", { name: "fractalu@fractalnyc.com" })[0]).toHaveAttribute(
      "href",
      "mailto:fractalu@fractalnyc.com",
    );
  });

  it("does not imply accounts, authentication, enrollment forms, or embeds", () => {
    const { container } = render(<FractalUniversityPortal />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('input[type="password"]')).toBeNull();
    expect(screen.queryByText(/sign in|log in|student portal/i)).toBeNull();
  });
});

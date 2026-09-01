import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SpecimenCard } from "../../components/catalog/SpecimenCard";
import { COMPONENT_REGISTRY } from "../../components/catalog/registry";
import { VisualSpecimenCard } from "../../components/catalog/VisualSpecimenCard";
import { ComponentDetail } from "../../components/catalog/ComponentDetail";

describe("interactive component specimens", () => {
  it("renders only the controls explicitly declared by each entry", () => {
    const referenceEntry = COMPONENT_REGISTRY.find(({ id }) => id === "page-frame")!;
    const { container } = render(<SpecimenCard entry={referenceEntry} initialColorway="neutral" initialSurface="paper" />);
    expect(container.querySelector("fieldset")).not.toBeInTheDocument();
    expect(within(container).getByText("Supporting implementation")).toBeInTheDocument();
  });

  it("makes every declared control materially change its specimen output", () => {
    for (const entry of COMPONENT_REGISTRY.filter(({ render }) => render)) {
      for (const control of entry.controls) {
        const alternatives = control.kind === "select" || control.kind === "preview-width"
          ? control.options.map(({ value }) => value).filter((value) => value !== control.defaultValue)
          : [control.testValue];
        for (const alternative of alternatives) {
          const { container, unmount } = render(<SpecimenCard entry={entry} initialColorway="neutral" initialSurface="paper" />);
          const card = container.querySelector("article") as HTMLElement;
          const canvas = card.querySelector(".library-canvas") as HTMLElement;
          const before = canvas.innerHTML;
          const field = within(card).getByLabelText(control.label);
          fireEvent.change(field, { target: { value: alternative } });
          expect(canvas.innerHTML, `${entry.id} control ${control.id}=${alternative}`).not.toBe(before);
          unmount();
          cleanup();
        }
      }
    }
  }, 15_000);

  it("edits note content, corner size, viewport, and section surfaces without an action slot", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "note-callout")!;
    const { container } = render(<SpecimenCard entry={entry} initialColorway="neutral" initialSurface="deep" />);
    const card = container.querySelector("article") as HTMLElement;
    fireEvent.change(within(card).getByLabelText("Note label"), { target: { value: "Semester reminder" } });
    expect(within(card).getByText("Semester reminder")).toBeInTheDocument();

    fireEvent.change(within(card).getByLabelText("Body content"), { target: { value: "long" } });
    expect(within(card).getByText(/deliberately long specimen/i)).toBeInTheDocument();
    expect(within(card).queryByLabelText("Actions")).not.toBeInTheDocument();
    expect(within(card).queryByRole("button", { name: /action/i })).not.toBeInTheDocument();
    fireEvent.change(within(card).getByLabelText("Corner size"), { target: { value: "lg" } });
    expect(card.querySelector(".library-canvas svg")).toHaveAttribute("width", "60");
    fireEvent.change(within(card).getByLabelText("Preview width"), { target: { value: "320" } });
    expect(card.querySelector("[data-preview-width]")).toHaveAttribute("data-preview-width", "320");

    fireEvent.change(within(card).getByLabelText("Color pairing"), { target: { value: "story" } });
    const surface = within(card).getByLabelText("Surface") as HTMLSelectElement;
    expect(Array.from(surface.options).map(({ value }) => value)).toEqual(["paper"]);
    expect(surface).toHaveValue("paper");
  });

  it("keeps closed gallery cards preview-first with only name and copy actions", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "note-callout")!;
    const onOpen = vi.fn();
    const { container } = render(<VisualSpecimenCard entry={entry} onOpen={onOpen} />);
    const card = container.querySelector("article")!;
    expect(card.children).toHaveLength(2);
    expect(card.firstElementChild).toHaveClass("library-gallery-preview");
    expect(card.lastElementChild).toHaveClass("library-card-actions");
    const name = within(container).getByRole("button", { name: "View details for Note Box" });
    const copy = within(container).getByRole("button", { name: "Copy prompt for Note Box" });
    expect(within(card.lastElementChild as HTMLElement).getAllByRole("button")).toEqual([name, copy]);
    fireEvent.click(name);
    expect(onOpen).toHaveBeenCalledWith(entry, name);
    expect(within(container).queryByText("CalloutCard")).not.toBeInTheDocument();
    expect(within(container).queryByText("Use when")).not.toBeInTheDocument();
    expect(within(container).queryByText(entry.purpose)).not.toBeInTheDocument();
    expect(within(container).queryByText(/learn more/i)).not.toBeInTheDocument();
    expect(container.querySelector(".library-mini-swatches, .library-fixed-style")).not.toBeInTheDocument();
    expect(container.querySelector("fieldset")).not.toBeInTheDocument();
  });

  it("copies the same context-aware prompt from browse and detail with localized feedback", async () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "action-buttons")!;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const { container, unmount } = render(<VisualSpecimenCard entry={entry} onOpen={() => undefined} />);
    fireEvent.click(within(container).getByRole("button", { name: "Copy prompt for Primary Button" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(entry.agentPhrase.replaceAll("**", "")));
    expect(within(container).getByText("Copied")).toBeInTheDocument();
    expect(within(container).getByRole("status")).toHaveTextContent("Prompt copied for Primary Button");
    unmount();

    const detail = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
    fireEvent.click(within(detail.container).getByRole("button", { name: "Copy prompt for Primary Button" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    expect(writeText).toHaveBeenLastCalledWith(entry.agentPhrase.replaceAll("**", ""));
  });

  it("reports clipboard rejection without opening the component", async () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "outbound-link")!;
    const onOpen = vi.fn();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    const { container } = render(<VisualSpecimenCard entry={entry} onOpen={onOpen} />);
    fireEvent.click(within(container).getByRole("button", { name: "Copy prompt for Standalone Link" }));
    await waitFor(() => expect(within(container).getByText("Copy failed")).toBeInTheDocument());
    expect(within(container).getByRole("status")).toHaveTextContent("Could not copy prompt for Standalone Link");
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("orders focused details as preview, controls, then closed usage guidance", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "outbound-link")!;
    const { container } = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
    const preview = container.querySelector(".library-detail-preview")!;
    const controls = container.querySelector(".library-detail-controls")!;
    const details = container.querySelector("details")!;
    expect(preview.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(controls.compareDocumentPosition(details) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(details).not.toHaveAttribute("open");
    expect(within(container).getByLabelText("Site color")).toBeInTheDocument();
    expect(within(container).getByLabelText("Background")).toBeInTheDocument();
    expect(within(container).getByText("Usage details")).toBeInTheDocument();
  });

  it("renders the four public action choices as distinct production patterns", () => {
    const primary = COMPONENT_REGISTRY.find(({ id }) => id === "action-buttons")!;
    const standalone = COMPONENT_REGISTRY.find(({ id }) => id === "outbound-link")!;
    const outbound = COMPONENT_REGISTRY.find(({ id }) => id === "outbound-text-link")!;
    const inline = COMPONENT_REGISTRY.find(({ id }) => id === "inline-text-link")!;
    const primaryView = render(<VisualSpecimenCard entry={primary} onOpen={() => undefined} />);
    expect(primaryView.container.querySelectorAll(".library-gallery-preview button")).toHaveLength(1);
    expect(within(primaryView.container).queryByText(/outline action|quiet action|disabled|inline link/i)).not.toBeInTheDocument();
    expect(primary.controls.map(({ id }) => id)).not.toContain("primaryState");
    primaryView.unmount();

    const standaloneView = render(<VisualSpecimenCard entry={standalone} onOpen={() => undefined} />);
    expect(standaloneView.container.querySelectorAll(".library-gallery-preview a[data-outbound-link]")).toHaveLength(1);
    expect(standaloneView.container.querySelectorAll(".library-gallery-preview [data-outbound-arrow]")).toHaveLength(1);
    standaloneView.unmount();

    const outboundView = render(<VisualSpecimenCard entry={outbound} onOpen={() => undefined} />);
    const outboundAnchor = outboundView.container.querySelector("a[data-outbound-link]");
    expect(outboundAnchor).toHaveClass("font-sans");
    expect(outboundAnchor).not.toHaveClass("text-body", "text-body-lead", "text-label");
    expect(outboundAnchor?.parentElement).toHaveClass("text-body");
    expect(outboundView.container.querySelectorAll("[data-outbound-arrow]")).toHaveLength(1);
    outboundView.unmount();

    const inlineView = render(<VisualSpecimenCard entry={inline} onOpen={() => undefined} />);
    expect(inlineView.container.querySelector(".library-gallery-preview p a[data-outbound-link]")).toBeInTheDocument();
    expect(inlineView.container.querySelector(".library-gallery-preview [data-outbound-arrow]")).not.toBeInTheDocument();
    expect(inlineView.container.querySelector(".library-gallery-preview p a[data-outbound-link]")).toHaveClass("font-sans");
    expect(inlineView.container.querySelector(".library-gallery-preview p a[data-outbound-link]")).not.toHaveClass("text-label", "text-body", "text-body-lead");
    expect(inlineView.container.querySelector("[data-text-link-context='body']")).toHaveClass("text-body");
  });

  it("previews Outbound and Inline Text Links in body or lead contexts without changing component identity", () => {
    for (const id of ["outbound-text-link", "inline-text-link"]) {
      const entry = COMPONENT_REGISTRY.find((candidate) => candidate.id === id)!;
      const view = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
      const anchor = view.container.querySelector(".library-detail-preview a[data-outbound-link]")!;
      expect(anchor).toHaveClass("font-sans");
      expect(anchor).not.toHaveClass("text-body", "text-body-lead", "text-label");
      expect(view.container.querySelector("[data-text-link-context='body']")).toHaveClass("text-body");
      fireEvent.change(within(view.container).getByLabelText("Example text context"), { target: { value: "lead" } });
      expect(view.container.querySelector("[data-text-link-context='lead']")).toHaveClass("text-body-lead");
      expect(view.container.querySelector(".library-detail-preview a[data-outbound-link]")).toBe(anchor);
      expect(within(view.container).getByRole("button", { name: `Copy prompt for ${entry.name}` })).toBeInTheDocument();
      view.unmount();
    }
  });

  it("uses production Inter author roles and derives Course Card icons from subject", () => {
    const article = COMPONENT_REGISTRY.find(({ id }) => id === "library-article-card")!;
    const articleView = render(
      <ComponentDetail entry={article} onBack={() => undefined} onOpenLive={() => undefined} />,
    );
    const byline = articleView.container.querySelector("[data-document-byline]");
    expect(byline).toHaveClass("text-body");
    expect(byline).not.toHaveClass("text-aside");
    expect(byline).not.toHaveClass("text-label");
    expect(articleView.container.querySelector("[data-category-icon-label]")).toBeInTheDocument();
    articleView.unmount();

    const course = COMPONENT_REGISTRY.find(({ id }) => id === "course-card")!;
    const courseView = render(
      <ComponentDetail entry={course} onBack={() => undefined} onOpenLive={() => undefined} />,
    );
    const instructor = courseView.container.querySelector("[data-instructor-name]");
    expect(instructor).toHaveClass("text-body");
    expect(instructor).not.toHaveClass("text-label");
    expect(courseView.container.querySelector("[data-category-icon-label]")).toHaveAttribute(
      "data-category-icon-key",
      "book-open",
    );
    expect(within(courseView.container).queryByLabelText(/icon name/i)).not.toBeInTheDocument();

    fireEvent.change(within(courseView.container).getByLabelText("Subject and icon"), {
      target: { value: "Technology" },
    });
    expect(courseView.container.querySelector("[data-category-icon-label]")).toHaveAttribute(
      "data-category-icon-key",
      "cpu",
    );
    expect(within(courseView.container.querySelector("[data-category-icon-label]")!).getByText("Technology")).toBeInTheDocument();

    fireEvent.change(within(courseView.container).getByLabelText("Subject and icon"), {
      target: { value: "Experimental category" },
    });
    expect(courseView.container.querySelector("[data-category-icon-label]")).toHaveAttribute(
      "data-category-icon-key",
      "shapes",
    );
    expect(within(courseView.container.querySelector("[data-category-icon-label]")!).getByText("Experimental category")).toBeInTheDocument();
  });

  it("renders internal inventory as a non-copyable technical notice", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "site-navigation")!;
    const { container } = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
    expect(within(container).getByText("Internal reference")).toBeInTheDocument();
    expect(within(container).getByText(/not an option to copy/i)).toBeInTheDocument();
    expect(within(container).queryByRole("button", { name: /copy prompt/i })).not.toBeInTheDocument();
    expect(container.querySelector("[data-site-navbar], canvas, .library-detail-preview")).not.toBeInTheDocument();
  });

  it("renders the shared Search Bar and real Photo Carousel as separate minimal tiles", () => {
    const search = COMPONENT_REGISTRY.find(({ id }) => id === "search-bar")!;
    const searchView = render(<VisualSpecimenCard entry={search} onOpen={() => undefined} />);
    expect(within(searchView.container).getByRole("combobox", { name: "Search Fractal" })).toBeInTheDocument();
    expect(searchView.container.querySelector("[data-hero-shell], canvas")).not.toBeInTheDocument();
    expect(within(searchView.container).getByRole("button", { name: "Copy prompt for Search Bar" })).toBeInTheDocument();
    searchView.unmount();

    const carousel = COMPONENT_REGISTRY.find(({ id }) => id === "meet-space-carousel")!;
    const carouselView = render(<VisualSpecimenCard entry={carousel} onOpen={() => undefined} />);
    expect(within(carouselView.container).getByRole("button", { name: "Previous photo" })).toBeInTheDocument();
    expect(within(carouselView.container).getByRole("button", { name: "Next photo" })).toBeInTheDocument();
    expect(within(carouselView.container).getAllByRole("button", { name: /Go to photo/ })).toHaveLength(3);
    expect(within(carouselView.container).getByText("01 / 03")).toBeInTheDocument();
    expect(within(carouselView.container).getByRole("button", { name: "Copy prompt for Photo Carousel" })).toBeInTheDocument();
  });
});

import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SpecimenCard } from "../../components/catalog/SpecimenCard";
import { COMPONENT_REGISTRY } from "../../components/catalog/registry";
import { VisualSpecimenCard } from "../../components/catalog/VisualSpecimenCard";
import { ComponentDetail } from "../../components/catalog/ComponentDetail";
import { ComponentLibraryApp } from "../../components/ComponentLibraryApp";

const FINE_POINTER_QUERY =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine)";
const COMPONENT_LIBRARY_PREVIEW_QUERY =
  "(min-width: 48rem) and (hover: hover) and (pointer: fine)";
const originalMatchMedia = window.matchMedia;

function mockPreviewQueries({
  site = false,
  componentLibrary = false,
}: {
  site?: boolean;
  componentLibrary?: boolean;
}) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches:
        query === FINE_POINTER_QUERY
          ? site
          : query === COMPONENT_LIBRARY_PREVIEW_QUERY
            ? componentLibrary
            : false,
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
});

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

  it("keeps closed gallery cards preview-first with one View options link and one Copy Prompt button", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "note-callout")!;
    const onOpen = vi.fn();
    const { container } = render(<VisualSpecimenCard entry={entry} onOpen={onOpen} />);
    const card = container.querySelector("article")!;
    expect(card.children).toHaveLength(2);
    expect(card.firstElementChild).toHaveClass("library-gallery-preview");
    expect(card.lastElementChild).toHaveClass("library-card-actions");
    const open = within(container).getByRole("link", { name: "View options for Note Box" });
    const copy = within(container).getByRole("button", { name: "Copy prompt for Note Box" });
    expect(open).toHaveAttribute("href", "#component/note-callout");
    expect(open).toContainElement(within(container).getByText("Note Box"));
    expect(within(card.lastElementChild as HTMLElement).getAllByRole("link")).toEqual([open]);
    expect(within(card.lastElementChild as HTMLElement).getAllByRole("button")).toEqual([copy]);
    expect(open.querySelector("button")).not.toBeInTheDocument();
    expect(copy.querySelector("a")).not.toBeInTheDocument();
    fireEvent.click(open);
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(entry, open);
    expect(within(container).queryByText("CalloutCard")).not.toBeInTheDocument();
    expect(within(container).queryByText("Use when")).not.toBeInTheDocument();
    expect(within(container).queryByText(entry.purpose)).not.toBeInTheDocument();
    expect(within(container).queryByText(/learn more/i)).not.toBeInTheDocument();
    expect(container.querySelector(".library-mini-swatches, .library-fixed-style")).not.toBeInTheDocument();
    expect(container.querySelector("fieldset")).not.toBeInTheDocument();
  });

  it("opens from a non-control card surface but never steals live preview controls", () => {
    const note = COMPONENT_REGISTRY.find(({ id }) => id === "note-callout")!;
    const onSurfaceOpen = vi.fn();
    const noteView = render(<VisualSpecimenCard entry={note} onOpen={onSurfaceOpen} />);
    const openLink = within(noteView.container).getByRole("link", { name: "View options for Note Box" });
    fireEvent.click(noteView.container.querySelector(".library-canvas-scope")!);
    expect(onSurfaceOpen).toHaveBeenCalledTimes(1);
    expect(onSurfaceOpen).toHaveBeenCalledWith(note, openLink);
    noteView.unmount();

    const primary = COMPONENT_REGISTRY.find(({ id }) => id === "action-buttons")!;
    const onActionSurfaceOpen = vi.fn();
    const primaryView = render(<VisualSpecimenCard entry={primary} onOpen={onActionSurfaceOpen} />);
    const primaryOpenLink = within(primaryView.container).getByRole("link", { name: "View options for Primary Button" });
    fireEvent.click(primaryView.container.querySelector(".library-gallery-preview--compact-actions .library-canvas-scope")!);
    expect(onActionSurfaceOpen).toHaveBeenCalledWith(primary, primaryOpenLink);
    primaryView.unmount();

    const representativeControls = [
      ["action-buttons", "button"],
      ["outbound-link", "a"],
      ["outbound-text-link", "a"],
      ["inline-text-link", "a"],
      ["search-bar", "input"],
      ["filter-bar", "button"],
      ["meet-space-carousel", "button"],
    ] as const;
    for (const [id, selector] of representativeControls) {
      const entry = COMPONENT_REGISTRY.find((candidate) => candidate.id === id)!;
      const onOpen = vi.fn();
      const view = render(<VisualSpecimenCard entry={entry} onOpen={onOpen} />);
      const control = view.container.querySelector(`.library-gallery-preview ${selector}`) as HTMLElement;
      expect(control, `${id} should render a representative ${selector}`).toBeInTheDocument();
      if (control instanceof HTMLAnchorElement) control.addEventListener("click", (event) => event.preventDefault(), { once: true });
      fireEvent.click(control);
      expect(onOpen, `${id} control should not open its card`).not.toHaveBeenCalled();
      view.unmount();
      cleanup();
    }
  });

  it("renders the browse shell with one title and none of the removed instructional copy", () => {
    window.history.replaceState(null, "", "/components/#browse/common");
    const { container } = render(<ComponentLibraryApp />);
    expect(within(container).getAllByRole("heading", { name: "Component Library" })).toHaveLength(1);
    expect(container.querySelectorAll(".library-gallery-heading")).toHaveLength(0);
    for (const phrase of [
      "Team component gallery",
      "Choose by looking",
      "Select a component name for options, or copy its prompt and hand it to an agent.",
      "Pick the one that looks right",
      "The patterns editors use most often.",
    ]) expect(within(container).queryByText(phrase)).not.toBeInTheDocument();
    expect(within(container).getByRole("searchbox", { name: "Search components" })).toBeInTheDocument();
    expect(within(container).getByRole("button", { name: "Browse components" })).toBeInTheDocument();
    expect(within(container).getByRole("button", { name: "Edit Education courses" })).toBeInTheDocument();
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
    expect(primaryView.container.querySelector(".library-gallery-preview")).toHaveClass("library-gallery-preview--compact-actions");
    expect(primaryView.container.querySelectorAll(".library-gallery-preview button")).toHaveLength(1);
    expect(within(primaryView.container).queryByText(/outline action|quiet action|disabled|inline link/i)).not.toBeInTheDocument();
    expect(primary.controls.map(({ id }) => id)).not.toContain("primaryState");
    primaryView.unmount();

    const standaloneView = render(<VisualSpecimenCard entry={standalone} onOpen={() => undefined} />);
    expect(standaloneView.container.querySelector(".library-gallery-preview")).toHaveClass("library-gallery-preview--compact-actions");
    expect(standaloneView.container.querySelectorAll(".library-gallery-preview a[data-outbound-link]")).toHaveLength(1);
    expect(standaloneView.container.querySelectorAll(".library-gallery-preview [data-outbound-arrow]")).toHaveLength(1);
    standaloneView.unmount();

    const outboundView = render(<VisualSpecimenCard entry={outbound} onOpen={() => undefined} />);
    expect(outboundView.container.querySelector(".library-gallery-preview")).toHaveClass("library-gallery-preview--compact-actions");
    const outboundAnchor = outboundView.container.querySelector("a[data-outbound-link]");
    expect(outboundAnchor).toHaveClass("font-sans");
    expect(outboundAnchor).not.toHaveClass("text-body", "text-body-lead", "text-label");
    expect(outboundAnchor?.parentElement).toHaveClass("text-body");
    expect(outboundView.container.querySelectorAll("[data-outbound-arrow]")).toHaveLength(1);
    outboundView.unmount();

    const inlineView = render(<VisualSpecimenCard entry={inline} onOpen={() => undefined} />);
    expect(inlineView.container.querySelector(".library-gallery-preview")).toHaveClass("library-gallery-preview--compact-actions");
    expect(inlineView.container.querySelector(".library-gallery-preview p a[data-outbound-link]")).toBeInTheDocument();
    expect(inlineView.container.querySelector(".library-gallery-preview [data-outbound-arrow]")).not.toBeInTheDocument();
    expect(inlineView.container.querySelector(".library-gallery-preview p a[data-outbound-link]")).toHaveClass("font-sans");
    expect(inlineView.container.querySelector(".library-gallery-preview p a[data-outbound-link]")).not.toHaveClass("text-label", "text-body", "text-body-lead");
    expect(inlineView.container.querySelector("[data-text-link-context='body']")).toHaveClass("text-body");
    inlineView.unmount();

    for (const id of ["library-article-card", "search-bar"]) {
      const entry = COMPONENT_REGISTRY.find((candidate) => candidate.id === id)!;
      const view = render(<VisualSpecimenCard entry={entry} onOpen={() => undefined} />);
      expect(view.container.querySelector(".library-gallery-preview")).not.toHaveClass("library-gallery-preview--compact-actions");
      view.unmount();
    }
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

    mockPreviewQueries({ componentLibrary: true });
    const course = COMPONENT_REGISTRY.find(({ id }) => id === "course-card")!;
    const courseView = render(
      <ComponentDetail entry={course} onBack={() => undefined} onOpenLive={() => undefined} />,
    );
    const instructor = courseView.container.querySelector("[data-instructor-name]");
    const collection = courseView.container.querySelector("[data-course-collection]");
    expect(collection).toHaveAttribute("data-preview-mode", "enhanced");
    expect(collection).toHaveAttribute(
      "data-course-presentation-context",
      "component-library",
    );
    expect(collection?.querySelector('[data-fractalu-reveal-slot="course"]')).toHaveAttribute(
      "data-fractalu-reveal-mode",
      "static",
    );
    expect(within(collection as HTMLElement).getByRole("button", { name: "Elena Navarrete" })).toHaveAttribute(
      "aria-controls",
      `${collection?.querySelector("[data-course-id]")?.getAttribute("data-course-id")}-instructor-bio`,
    );
    expect(instructor).toHaveClass("text-body");
    expect(instructor).not.toHaveClass("text-label");
    expect(courseView.container.querySelector("[data-category-icon-label]")).toHaveAttribute(
      "data-category-icon-key",
      "book-open",
    );
    expect(within(courseView.container).queryByLabelText(/icon name/i)).not.toBeInTheDocument();
    expect(
      within(courseView.container).queryByLabelText(/presentation context/i),
    ).not.toBeInTheDocument();

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

  it("keeps browse and focused previews in the same registry-owned native context", () => {
    for (const entry of COMPONENT_REGISTRY.filter(({ presentation }) => presentation === "gallery")) {
      const browse = render(<VisualSpecimenCard entry={entry} onOpen={() => undefined} />);
      const browseScope = browse.container.querySelector(".library-gallery-preview > .library-canvas-scope");
      expect(browseScope, entry.id).toHaveAttribute("data-component-colorway", entry.defaultColorway);
      expect(browseScope, entry.id).toHaveAttribute("data-component-surface", entry.defaultSurface);
      browse.unmount();

      const detail = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
      const detailScope = detail.container.querySelector(".library-detail-preview > .library-canvas-scope");
      expect(detail.container.querySelector(".library-detail-preview")).not.toHaveClass("library-gallery-preview--compact-actions");
      expect(detailScope, entry.id).toHaveAttribute("data-component-colorway", entry.defaultColorway);
      expect(detailScope, entry.id).toHaveAttribute("data-component-surface", entry.defaultSurface);
      detail.unmount();
      cleanup();
    }
  });

  it("places production paper cards on their native house fields without recoloring the cards", () => {
    for (const [id, colorway, surface, selector] of [
      ["library-article-card", "library", "light", "[data-document-byline]"],
      ["course-card", "education", "deep", ".fractalu-course-card"],
      ["club-card", "education", "deep", ".fractalu-club-card"],
    ] as const) {
      const entry = COMPONENT_REGISTRY.find((candidate) => candidate.id === id)!;
      const view = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
      const outer = view.container.querySelector(".library-detail-preview > .library-canvas-scope")!;
      expect(outer).toHaveAttribute("data-component-colorway", colorway);
      expect(outer).toHaveAttribute("data-component-surface", surface);
      const productionContent = view.container.querySelector(selector)!;
      const paperScope = productionContent.closest("[data-component-surface='paper']");
      expect(paperScope, id).toBeInTheDocument();
      expect(paperScope, id).not.toBe(outer);
      expect((paperScope as HTMLElement).style.backgroundColor).toBe("transparent");
      view.unmount();
      cleanup();
    }
  });

  it("derives public link tone from the selected canvas surface", () => {
    for (const [id, initialTone] of [
      ["outbound-link", "light"],
      ["outbound-text-link", "light"],
      ["inline-text-link", "light"],
    ] as const) {
      const entry = COMPONENT_REGISTRY.find((candidate) => candidate.id === id)!;
      const view = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
      const link = () => view.container.querySelector(".library-detail-preview a[data-outbound-link]")!;
      expect(link()).toHaveAttribute("data-outbound-tone", initialTone);
      expect(link()).toHaveClass("text-foreground");
      expect(link()).toHaveClass("component-surface-link");
      expect(link()).toHaveAttribute("data-outbound-surface-adaptive", "");

      fireEvent.change(within(view.container).getByLabelText("Site color"), { target: { value: "education" } });
      fireEvent.change(within(view.container).getByLabelText("Background"), { target: { value: "deep" } });
      fireEvent.change(within(view.container).getByLabelText("Destination type"), { target: { value: "external" } });
      expect(link()).toHaveAttribute("data-outbound-tone", "dark");
      expect(link()).toHaveAttribute("target", "_blank");
      expect(link()).toHaveAttribute("rel", "noopener noreferrer");
      view.unmount();
      cleanup();
    }
  });

  it("keeps nested paper surfaces readable when the outer canvas changes to Education deep", () => {
    const note = COMPONENT_REGISTRY.find(({ id }) => id === "note-callout")!;
    const noteView = render(<ComponentDetail entry={note} onBack={() => undefined} onOpenLive={() => undefined} />);
    fireEvent.change(within(noteView.container).getByLabelText("Card treatment"), { target: { value: "paper" } });
    fireEvent.change(within(noteView.container).getByLabelText("Site color"), { target: { value: "education" } });
    fireEvent.change(within(noteView.container).getByLabelText("Background"), { target: { value: "deep" } });
    const noteOuter = noteView.container.querySelector(".library-detail-preview > .library-canvas-scope")!;
    const notePaper = noteView.container.querySelector(".library-detail-preview .component-paper-surface")!;
    const noteLink = noteView.container.querySelector(".library-detail-preview a[data-outbound-link]")! as HTMLElement;
    expect(noteOuter).toHaveAttribute("data-component-colorway", "education");
    expect(noteOuter).toHaveAttribute("data-component-surface", "deep");
    expect(notePaper).toHaveClass("bg-background", "text-foreground");
    expect(noteLink).toHaveAttribute("data-outbound-tone", "light");
    expect(noteLink).not.toHaveClass("component-surface-link");
    noteView.unmount();
    cleanup();

    for (const [id, selector] of [
      ["library-article-card", "[data-document-byline]"],
      ["course-card", ".fractalu-course-card a[data-outbound-link]"],
      ["club-card", ".fractalu-club-card a[data-outbound-link]"],
    ] as const) {
      const entry = COMPONENT_REGISTRY.find((candidate) => candidate.id === id)!;
      const view = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
      const content = view.container.querySelector(selector)!;
      const paperScope = content.closest("[data-component-surface='paper']");
      expect(paperScope, id).toBeInTheDocument();
      expect(paperScope, id).not.toBe(view.container.querySelector(".library-detail-preview > .library-canvas-scope"));
      if (content.matches("a[data-outbound-link]")) {
        expect(content).toHaveClass("text-foreground");
        expect(content).not.toHaveClass("component-surface-link");
      }
      view.unmount();
      cleanup();
    }
  });

  it("defaults Filter Bar to the complete live Education capsule treatment", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "filter-bar")!;
    const { container } = render(<ComponentDetail entry={entry} onBack={() => undefined} onOpenLive={() => undefined} />);
    const outerScope = container.querySelector(".library-detail-preview .library-canvas-scope");
    expect(outerScope).toHaveAttribute("data-component-colorway", "education");
    expect(outerScope).toHaveAttribute("data-component-surface", "deep");
    const group = within(container).getByRole("group", { name: "Filter classes by subject" });
    expect(within(group).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "All",
      "Literature",
      "Writing",
      "Movement",
      "Music",
      "Technology",
      "Craft",
      "Nature",
      "Mind & Body",
    ]);
    expect(within(container).getByText("20 courses shown.")).toHaveAttribute("aria-live", "polite");
    fireEvent.click(within(group).getByRole("button", { name: "Technology" }));
    expect(within(group).getByRole("button", { name: "Technology" })).toHaveAttribute("aria-pressed", "true");
    expect(within(container).getByText("3 courses shown.")).toBeInTheDocument();

    fireEvent.change(within(container).getByLabelText("Selection behavior"), { target: { value: "multiple" } });
    expect(within(container).getByRole("group", { name: "Filter by tag" })).toBeInTheDocument();
    expect(within(container).getByRole("button", { name: /Community, \d+ results/ })).toHaveAttribute("aria-pressed", "true");
  });
});

import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
  });

  it("edits note content, action state, corner size, viewport, and section surfaces", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "note-callout")!;
    const { container } = render(<SpecimenCard entry={entry} initialColorway="neutral" initialSurface="deep" />);
    const card = container.querySelector("article") as HTMLElement;
    fireEvent.change(within(card).getByLabelText("Note label"), { target: { value: "Semester reminder" } });
    expect(within(card).getByText("Semester reminder")).toBeInTheDocument();

    fireEvent.change(within(card).getByLabelText("Body content"), { target: { value: "long" } });
    expect(within(card).getByText(/deliberately long specimen/i)).toBeInTheDocument();
    fireEvent.change(within(card).getByLabelText("Actions"), { target: { value: "without" } });
    expect(within(card).queryByRole("button", { name: "Optional action" })).not.toBeInTheDocument();
    fireEvent.change(within(card).getByLabelText("Corner size"), { target: { value: "lg" } });
    expect(card.querySelector(".library-canvas svg")).toHaveAttribute("width", "60");
    fireEvent.change(within(card).getByLabelText("Preview width"), { target: { value: "320" } });
    expect(card.querySelector("[data-preview-width]")).toHaveAttribute("data-preview-width", "320");

    fireEvent.change(within(card).getByLabelText("Color pairing"), { target: { value: "story" } });
    const surface = within(card).getByLabelText("Surface") as HTMLSelectElement;
    expect(Array.from(surface.options).map(({ value }) => value)).toEqual(["paper"]);
    expect(surface).toHaveValue("paper");
  });

  it("keeps closed gallery cards visual and moves documentation behind Learn more", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "note-callout")!;
    const { container } = render(<VisualSpecimenCard entry={entry} onLearnMore={() => undefined} />);
    expect(within(container).getByText("Note Box")).toBeInTheDocument();
    expect(container.querySelector(".library-gallery-preview")).toBeInTheDocument();
    expect(within(container).getByRole("button", { name: "Learn more about Note Box" })).toBeInTheDocument();
    expect(within(container).queryByText("CalloutCard")).not.toBeInTheDocument();
    expect(within(container).queryByText("Use when")).not.toBeInTheDocument();
    expect(container.querySelector("fieldset")).not.toBeInTheDocument();
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
});

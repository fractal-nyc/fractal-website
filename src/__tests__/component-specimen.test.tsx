import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecimenCard } from "../../components/catalog/SpecimenCard";
import { COMPONENT_REGISTRY } from "../../components/catalog/registry";

describe("interactive component specimens", () => {
  it("renders only the controls explicitly declared by each entry", () => {
    const referenceEntry = COMPONENT_REGISTRY.find(({ id }) => id === "page-frame")!;
    const { container } = render(<SpecimenCard entry={referenceEntry} initialColorway="neutral" initialSurface="paper" />);
    expect(container.querySelector("fieldset")).not.toBeInTheDocument();
    expect(within(container).getByText("Reference specimen")).toBeInTheDocument();
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
});

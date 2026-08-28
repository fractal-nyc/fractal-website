import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecimenCard } from "../../components/catalog/SpecimenCard";
import { COMPONENT_REGISTRY } from "../../components/catalog/registry";

describe("interactive component specimens", () => {
  it("edits content, switches state and viewport, and constrains section surfaces", () => {
    const entry = COMPONENT_REGISTRY.find(({ id }) => id === "note-callout")!;
    const { container } = render(<SpecimenCard entry={entry} initialColorway="neutral" initialSurface="deep" />);
    const card = container.querySelector("article") as HTMLElement;
    fireEvent.change(within(card).getByLabelText("Sample content"), { target: { value: "Semester reminder" } });
    expect(within(card).getByText("Semester reminder")).toBeInTheDocument();

    fireEvent.change(within(card).getByLabelText("State"), { target: { value: "long" } });
    expect(within(card).getByText(/deliberately long specimen/i)).toBeInTheDocument();
    fireEvent.change(within(card).getByLabelText("Preview width"), { target: { value: "320" } });
    expect(card.querySelector("[data-preview-width]")).toHaveAttribute("data-preview-width", "320");

    fireEvent.change(within(card).getByLabelText("Color pairing"), { target: { value: "story" } });
    const surface = within(card).getByLabelText("Surface") as HTMLSelectElement;
    expect(Array.from(surface.options).map(({ value }) => value)).toEqual(["paper"]);
    expect(surface).toHaveValue("paper");
  });
});

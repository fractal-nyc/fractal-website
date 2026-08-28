import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EducationContentWorkshop } from "../../components/workshop/EducationContentWorkshop";
import { FRACTALU_CATALOG_SNAPSHOT, type FractalUCatalogSnapshot } from "@/data/fractalu";

const smallSnapshot = JSON.parse(JSON.stringify({
  ...FRACTALU_CATALOG_SNAPSHOT,
  courses: FRACTALU_CATALOG_SNAPSHOT.courses.slice(0, 1),
  clubs: FRACTALU_CATALOG_SNAPSHOT.clubs.slice(0, 1),
})) as FractalUCatalogSnapshot;

describe("Education Content Workshop", () => {
  it("supports a safe local edit, validation, preview, and malformed-import flow", () => {
    render(<EducationContentWorkshop initialSnapshot={smallSnapshot} />);
    expect(screen.getByText("Local draft — not saved to the website")).toBeInTheDocument();
    expect(document.querySelector("[data-fractalu-portal]")).toBeTruthy();
    expect(document.querySelector("[data-course-id]")).toBeTruthy();
    expect(document.querySelector("[data-club-id]")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Add course" }));
    expect(screen.getAllByText("New course").length).toBeGreaterThanOrEqual(2);
    const semester = screen.getByLabelText("Semester");
    fireEvent.change(semester, { target: { value: "" } });
    expect(screen.getByText("Semester is required.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy normalized JSON" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Download JSON" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Paste catalog JSON"), { target: { value: "not json" } });
    fireEvent.click(screen.getByRole("button", { name: "Import JSON" }));
    expect(screen.getByRole("status")).toHaveTextContent("Import failed");
    expect(screen.getByLabelText("Semester")).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "Reset snapshot" }));
    expect(screen.getByLabelText("Semester")).toHaveValue("Summer 2026");
    expect(screen.getByRole("button", { name: "Copy normalized JSON" })).toBeEnabled();
  }, 30_000);
});

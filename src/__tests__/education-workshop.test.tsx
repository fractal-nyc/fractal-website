import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

  it("imports structurally malformed JSON without crashing and focuses summary targets", async () => {
    render(<EducationContentWorkshop initialSnapshot={smallSnapshot} />);
    fireEvent.change(screen.getByLabelText("Paste catalog JSON"), { target: { value: JSON.stringify({ semester: "Fall 2026", sourceProvenance: null, courses: [null], clubs: [null] }) } });
    fireEvent.click(screen.getByRole("button", { name: "Import JSON" }));
    expect(screen.getByRole("status")).toHaveTextContent("Imported safely");
    expect(screen.getByText("Preview paused")).toBeInTheDocument();
    const instructorError = screen.getByRole("link", { name: /courses\.0\.instructors:/i });
    fireEvent.click(instructorError);
    await waitFor(() => expect(document.activeElement).toBe(document.getElementById("workshop-courses-0-instructors")));
  });

  it("strips unknown, derived, and UI-only keys from copied JSON", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<EducationContentWorkshop initialSnapshot={smallSnapshot} />);
    const imported = JSON.parse(JSON.stringify(smallSnapshot));
    imported.uiState = { selected: true };
    imported.courses[0].instructor = "derived label";
    imported.courses[0].unknown = "remove me";
    fireEvent.change(screen.getByLabelText("Paste catalog JSON"), { target: { value: JSON.stringify(imported) } });
    fireEvent.click(screen.getByRole("button", { name: "Import JSON" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy normalized JSON" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).not.toContain("uiState");
    expect(copied).not.toContain('"instructor"');
    expect(copied).not.toContain("unknown");
  });

  it("supports repeatable semester editor operations", () => {
    render(<EducationContentWorkshop initialSnapshot={smallSnapshot} />);
    fireEvent.click(screen.getByRole("button", { name: "Add instructor" }));
    expect(screen.getAllByLabelText("Name")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "Delete instructor" })[1]);
    expect(screen.getAllByLabelText("Name")).toHaveLength(1);

    fireEvent.click(screen.getAllByRole("button", { name: "Duplicate" })[0]);
    expect(screen.getAllByText(/\(copy\)/).length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByRole("button", { name: "Add club" }));
    const newClub = screen.getAllByText("New club").map((element) => element.closest("details")).find(Boolean)!;
    expect(newClub).toBeInTheDocument();
    fireEvent.click(within(newClub).getByRole("button", { name: "Delete" }));
    expect(screen.queryByText("New club")).not.toBeInTheDocument();
  });
});

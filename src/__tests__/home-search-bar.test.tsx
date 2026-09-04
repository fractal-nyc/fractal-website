import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomeSearchBar } from "@/components/sections/HomeSearchBar";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("HomeSearchBar", () => {
  it("keeps grouped combobox keyboard behavior without selecting or navigating in catalog mode", () => {
    const onSelectResult = vi.fn();
    render(<HomeSearchBar onSelectResult={onSelectResult} enableGlobalShortcut={false} />);
    const input = screen.getByRole("combobox", { name: "Search Fractal" });

    fireEvent.keyDown(document, { key: "/" });
    expect(input).not.toHaveFocus();

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Campus" } });
    const listbox = screen.getByRole("listbox", { name: "Search results" });
    expect(within(listbox).getByText("Pages")).toBeInTheDocument();
    expect(within(listbox).getAllByRole("option").length).toBeGreaterThan(0);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    const activeId = input.getAttribute("aria-activedescendant");
    expect(activeId).toBeTruthy();
    expect(document.getElementById(activeId!)).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelectResult).toHaveBeenCalledWith(expect.objectContaining({ title: "Campus", href: "/campus" }));
    expect(input).toHaveValue("");
    expect(screen.queryByRole("listbox", { name: "Search results" })).not.toBeInTheDocument();
  });

  it("supports Escape and installs the slash shortcut only when explicitly enabled", () => {
    const { unmount } = render(<HomeSearchBar onSelectResult={() => undefined} enableGlobalShortcut={false} />);
    const catalogInput = screen.getByRole("combobox", { name: "Search Fractal" });
    fireEvent.focus(catalogInput);
    fireEvent.change(catalogInput, { target: { value: "Campus" } });
    fireEvent.keyDown(catalogInput, { key: "Escape" });
    expect(screen.queryByRole("listbox", { name: "Search results" })).not.toBeInTheDocument();
    expect(catalogInput).not.toHaveFocus();
    unmount();

    render(<HomeSearchBar onSelectResult={() => undefined} enableGlobalShortcut />);
    const homeInput = screen.getByRole("combobox", { name: "Search Fractal" });
    fireEvent.keyDown(document.body, { key: "/" });
    expect(homeInput).toHaveFocus();
  });
});

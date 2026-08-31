import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { EventsPage } from "@/pages/EventsPage";

function renderEvents() {
  const { hook } = memoryLocation({ path: "/events", static: true });
  return render(
    <WouterRouter hook={hook}>
      <EventsPage />
    </WouterRouter>,
  );
}

describe("Events page — content width", () => {
  it("uses the Campus-style wide frame and a separate max-w-3xl content column", () => {
    renderEvents();

    const calendar = screen.getByTitle("Fractal Tech NYC Events Calendar");
    const contentColumn = calendar.closest(".max-w-3xl");
    const outerFrame = contentColumn?.parentElement;

    expect(contentColumn).toBeTruthy();
    expect(contentColumn).toHaveClass("max-w-3xl", "mx-auto");
    expect(contentColumn).not.toHaveClass("page-gutter", "max-w-2xl");
    expect(outerFrame).toHaveClass(
      "w-full",
      "max-w-7xl",
      "mx-auto",
      "page-gutter",
    );
    expect(outerFrame).not.toHaveClass("max-w-2xl", "max-w-3xl");

    const primaryContent = within(contentColumn as HTMLElement);
    expect(primaryContent.getByText("Events")).toBeTruthy();
    expect(primaryContent.getByText("See You at Fractal")).toBeTruthy();
    expect(primaryContent.getByRole("link", { name: "Luma (opens in a new tab)" })).toBeTruthy();
    expect(primaryContent.getByText("Host an event in our space")).toBeTruthy();
  });

  it("keeps page-gutter as the sole page-edge owner for the mobile layout", () => {
    const { container } = renderEvents();
    const outerFrame = container.querySelector("section.page-gutter");
    const contentColumn = outerFrame?.querySelector(":scope > .max-w-3xl");

    expect(outerFrame).toBeTruthy();
    expect(contentColumn).toBeTruthy();
    expect(contentColumn).not.toHaveClass("page-gutter");
    expect(outerFrame?.querySelectorAll(".page-gutter")).toHaveLength(0);
  });
});

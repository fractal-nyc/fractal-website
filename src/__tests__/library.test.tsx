import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: () => <div data-testid="fractal-city-mock" />,
}));

import { LibraryPage } from "@/pages/LibraryPage";
import {
  ALL_CATEGORIES,
  LIBRARY_CATEGORIES,
  LIBRARY_DOCUMENTS,
} from "@/data/publications-documents";

// ═══════════════════════════════════════════════════════════════════════════
// Library category chips.
//
// The Library replaced the old Publications archive (which had a search box, a
// tag filter and a toolbar) with a single row of category chips over one flat
// grid. The chips are toggle buttons: each carries `aria-pressed`, and exactly
// one is pressed at a time.
//
// Card counting: DocumentCard renders each record as an <a> containing an <h3>
// title, and the page has no other <h3>, so `role=heading level=3` is an exact
// count of the visible records.
// ═══════════════════════════════════════════════════════════════════════════

function renderLibrary() {
  const { hook } = memoryLocation({ path: "/library", static: true });
  const user = userEvent.setup();
  const utils = render(
    <WouterRouter hook={hook}>
      <LibraryPage />
    </WouterRouter>,
  );
  return { ...utils, user };
}

/** The chip row — scoped, because the category names also appear on every card. */
const chipGroup = () =>
  screen.getByRole("group", { name: /filter records by category/i });

const chip = (name: string) =>
  within(chipGroup()).getByRole("button", { name });

const visibleCards = () => screen.getAllByRole("heading", { level: 3 });

/** Categories other than "All", each with the number of records it should show. */
const REAL_CATEGORIES = LIBRARY_CATEGORIES.filter((c) => c !== ALL_CATEGORIES).map(
  (category) => ({
    category,
    count: LIBRARY_DOCUMENTS.filter((d) => d.categoryLabel === category).length,
  }),
);

describe("Library — category chips", () => {
  it("renders one chip per category, derived from the documents", () => {
    renderLibrary();
    for (const category of LIBRARY_CATEGORIES) {
      expect(chip(category)).toBeTruthy();
    }
    expect(within(chipGroup()).getAllByRole("button").length).toBe(
      LIBRARY_CATEGORIES.length,
    );
  });

  it('defaults to "All" pressed, with every record on screen', () => {
    renderLibrary();

    expect(chip(ALL_CATEGORIES).getAttribute("aria-pressed")).toBe("true");
    expect(visibleCards().length).toBe(LIBRARY_DOCUMENTS.length);

    // Exactly one chip is pressed.
    const pressed = within(chipGroup())
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") === "true");
    expect(pressed.length).toBe(1);
  });

  it("has more than one category, so filtering is actually observable", () => {
    // Guards the suite against going vacuous if the data collapses to one type.
    expect(REAL_CATEGORIES.length).toBeGreaterThan(1);
    for (const { category, count } of REAL_CATEGORIES) {
      expect(count, `${category} has no documents`).toBeGreaterThan(0);
      expect(count).toBeLessThan(LIBRARY_DOCUMENTS.length);
    }
  });

  for (const { category, count } of REAL_CATEGORIES) {
    it(`filters the grid to the ${count} "${category}" record(s) and flips aria-pressed`, async () => {
      const { user } = renderLibrary();

      await user.click(chip(category));

      // The grid now shows only this category...
      expect(visibleCards().length).toBe(count);
      // ...and every visible card really carries that category label. Each
      // DocumentCard is an <a> whose category is a `span.text-label` child;
      // the chips are <button>s, so this selector can't pick them up.
      const cardLabels = Array.from(
        document.querySelectorAll("a span.text-label"),
      ).filter((el) => el.textContent?.trim() === category);
      expect(cardLabels.length).toBe(count);

      // aria-pressed moved to the clicked chip, and off "All".
      expect(chip(category).getAttribute("aria-pressed")).toBe("true");
      expect(chip(ALL_CATEGORIES).getAttribute("aria-pressed")).toBe("false");

      const pressed = within(chipGroup())
        .getAllByRole("button")
        .filter((b) => b.getAttribute("aria-pressed") === "true");
      expect(pressed.length).toBe(1);
    });
  }

  it('restores the full grid when "All" is clicked again', async () => {
    const { user } = renderLibrary();
    const { category } = REAL_CATEGORIES[0];

    await user.click(chip(category));
    expect(visibleCards().length).toBeLessThan(LIBRARY_DOCUMENTS.length);

    await user.click(chip(ALL_CATEGORIES));

    expect(visibleCards().length).toBe(LIBRARY_DOCUMENTS.length);
    expect(chip(ALL_CATEGORIES).getAttribute("aria-pressed")).toBe("true");
  });
});

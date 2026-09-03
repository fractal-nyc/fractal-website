import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocumentCard } from "@/components/publications/DocumentCard";
import { DocumentGrid } from "@/components/publications/DocumentGrid";
import { PUBLICATION_DOCUMENTS } from "@/data/publications-documents";

function expectTransparentLibraryScope(scope: HTMLElement) {
  expect(scope).toHaveAttribute("data-component-colorway", "library");
  expect(scope).toHaveAttribute("data-component-surface", "paper");
  expect(scope.style.backgroundColor).toBe("transparent");
  expect(scope).not.toHaveClass("bg-transparent");
}

describe("Library archive surfaces", () => {
  it("keeps the token scope transparent and the Article Card as the sole paper surface", () => {
    const { container } = render(<DocumentCard document={PUBLICATION_DOCUMENTS[0]} />);
    const scope = container.querySelector<HTMLElement>("[data-component-colorway='library']")!;
    expectTransparentLibraryScope(scope);

    const card = within(scope).getByRole("link");
    const paper = card.querySelector<HTMLElement>(".bg-background")!;
    expect(paper).toHaveClass("rounded-lg", "text-foreground");
    expect(paper).toHaveClass("bg-[var(--component-surface,var(--color-background))]");
    expect(within(card).getByText(PUBLICATION_DOCUMENTS[0].byline)).toHaveClass("text-body");
    expect(card.querySelector("[data-category-icon-label] svg[aria-hidden='true']")).toBeTruthy();
    expect(
      scope.querySelectorAll(":scope > .relative > span.absolute.pointer-events-none svg"),
    ).toHaveLength(4);
  });

  it("keeps default and partial-result grids transparent around every Article Card", () => {
    const defaultGrid = render(<DocumentGrid />);
    const defaultScopes = defaultGrid.container.querySelectorAll<HTMLElement>(
      "[data-component-colorway='library']",
    );
    expect(defaultScopes.length).toBe(PUBLICATION_DOCUMENTS.length);
    defaultScopes.forEach(expectTransparentLibraryScope);
    defaultGrid.unmount();

    const partialGrid = render(<DocumentGrid documents={[PUBLICATION_DOCUMENTS[0]]} />);
    const partialScopes = partialGrid.container.querySelectorAll<HTMLElement>(
      "[data-component-colorway='library']",
    );
    expect(partialScopes).toHaveLength(1);
    expectTransparentLibraryScope(partialScopes[0]);
  });

  it("renders a transparent, card-scope-free empty result state", () => {
    const { container } = render(<DocumentGrid documents={[]} />);
    const message = screen.getByText("No documents match your filters.");
    expect(message.closest(".py-16")).not.toHaveClass("bg-background");
    expect(container.querySelector("[data-component-colorway]")).toBeNull();
  });
});

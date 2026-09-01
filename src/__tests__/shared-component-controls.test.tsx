import { useState } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "@/components/content/FilterGroup";
import { HighlightBox } from "@/components/content/HighlightBox";
import { OutboundLink } from "@/components/content/OutboundLink";
import { ArchiveSearch } from "@/components/publications/ArchiveSearch";

describe("shared component controls", () => {
  it("uses one working clear control in the collection Search Bar", async () => {
    function Harness() {
      const [query, setQuery] = useState("");
      return <ArchiveSearch value={query} onChange={setQuery} />;
    }

    const { container } = render(<Harness />);
    const input = screen.getByRole("searchbox", { name: "Search the archive" });
    expect(input).toHaveAttribute("type", "text");
    fireEvent.change(input, { target: { value: "housing" } });

    const clear = screen.getByRole("button", { name: "Clear search" });
    expect(within(container).getAllByRole("button", { name: "Clear search" })).toHaveLength(1);
    fireEvent.click(clear);
    expect(input).toHaveValue("");
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("supports one configurable Filter Bar in single- and multi-select modes", () => {
    const options = [
      { value: "all", label: "All", count: 8 },
      { value: "arts", label: "Arts", count: 3 },
    ];
    const onSingleChange = vi.fn();
    const single = render(<FilterBar label="Filter classes" options={options} selected="all" onChange={onSingleChange} />);
    expect(within(single.container).getByRole("group", { name: "Filter classes" })).toBeInTheDocument();
    expect(within(single.container).getByRole("button", { name: "All, 8 results" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(single.container).getByRole("button", { name: "Arts, 3 results" }));
    expect(onSingleChange).toHaveBeenCalledWith("arts");
    single.unmount();

    const onMultipleChange = vi.fn();
    const multiple = render(<FilterBar label="Filter articles" options={options} mode="multiple" selected={["arts"]} onChange={onMultipleChange} />);
    const arts = within(multiple.container).getByRole("button", { name: "Arts, 3 results" });
    expect(arts).toHaveAttribute("aria-pressed", "true");
    expect(arts).toHaveClass("min-h-11", "min-w-11");
    fireEvent.click(within(multiple.container).getByRole("button", { name: "All, 8 results" }));
    expect(onMultipleChange).toHaveBeenCalledWith(["arts", "all"]);
  });

  it("keeps link typography and arrow semantics distinct", () => {
    const { container } = render(<p className="text-body">
      Read the <OutboundLink href="/publications" variant="inline">inline reference</OutboundLink>.
      <OutboundLink href="/education#courses" variant="prominent">Explore courses</OutboundLink>
      <OutboundLink href="https://example.com" variant="standalone">External destination</OutboundLink>
    </p>);

    const inline = screen.getByRole("link", { name: "inline reference" });
    expect(inline).not.toHaveClass("text-label", "text-body-lead");
    expect(inline.querySelector("[data-outbound-arrow]")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore courses" })).toHaveClass("text-body-lead");
    expect(screen.getByRole("link", { name: "Explore courses" }).querySelector("[data-outbound-arrow]")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "External destination" })).toHaveClass("text-label");
    expect(container.querySelectorAll("[data-outbound-arrow]")).toHaveLength(2);
  });

  it("renders Highlight Box as static content or an accessible whole-card link", () => {
    const { rerender } = render(<HighlightBox eyebrow="On campus" title="Build together" description="A shared place to work." />);
    const staticBox = screen.getByText("Build together").closest("[data-highlight-box]");
    expect(staticBox?.tagName).toBe("DIV");
    expect(staticBox).not.toHaveClass("hover:bg-[var(--btn-fill,rgba(242,234,216,0.16))]");

    rerender(<HighlightBox eyebrow="On campus" title="Build together" description="A shared place to work." href="https://example.com" accessibleName="Learn about campus" />);
    const linked = screen.getByRole("link", { name: "Learn about campus (opens in a new tab)" });
    expect(linked).toHaveAttribute("target", "_blank");
    expect(linked).toHaveAttribute("rel", "noopener noreferrer");
  });
});

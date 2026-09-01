import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { COMPONENT_COLORWAYS, ComponentColorScope, getComponentSurfaceTone } from "@/components/content/ComponentColorScope";
import { HOUSES } from "@/data/houses";

describe("ComponentColorScope", () => {
  it("computes an explicit background and text color for every permitted surface", () => {
    for (const colorway of COMPONENT_COLORWAYS) {
      for (const surface of colorway.allowedSurfaces) {
        const { container, unmount } = render(<ComponentColorScope colorway={colorway.id} surface={surface}>Example</ComponentColorScope>);
        const scope = container.firstElementChild as HTMLElement;
        const computed = getComputedStyle(scope);
        expect(computed.backgroundColor).not.toBe("");
        expect(computed.backgroundColor).not.toBe("transparent");
        expect(computed.color).not.toBe("");
        expect(scope.style.getPropertyValue("--component-surface")).toBeTruthy();
        expect(scope.style.getPropertyValue("--component-on-surface")).toBeTruthy();
        unmount();
      }
    }
  });

  it("preserves inverted accents and clamps decorative sections to paper", () => {
    const education = HOUSES.find(({ id }) => id === "school")!;
    const { container } = render(<ComponentColorScope colorway="education" surface="paper">Education</ComponentColorScope>);
    const scope = container.firstElementChild as HTMLElement;
    expect(scope.style.getPropertyValue("--component-accent")).toBe(education.palette.light);

    const { container: storyContainer } = render(<ComponentColorScope colorway="story" surface="deep">Story</ComponentColorScope>);
    expect(storyContainer.firstElementChild).toHaveAttribute("data-component-surface", "paper");
  });

  it("derives link tone from the actual approved surface semantics", () => {
    expect(getComponentSurfaceTone("events", "light")).toBe("light");
    expect(getComponentSurfaceTone("events", "deep")).toBe("light");
    expect(getComponentSurfaceTone("campus", "light")).toBe("dark");
    expect(getComponentSurfaceTone("education", "deep")).toBe("dark");
    expect(getComponentSurfaceTone("library", "light")).toBe("light");
    expect(getComponentSurfaceTone("story", "deep")).toBe("light");
  });
});

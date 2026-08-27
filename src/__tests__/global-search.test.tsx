import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useGlobalSearch } from "@/hooks/use-global-search";

describe("Education global search", () => {
  for (const query of ["education", "accelerator", "fractal accelerator", "fractal u", "fractal university"]) {
    it(`returns one internal Education page for ${query}`, () => {
      const { result } = renderHook(() => useGlobalSearch());
      act(() => result.current.setQuery(query));
      const pageResults = result.current.flatResults.filter(
        (item) => item.type === "page" && item.href === "/education",
      );
      expect(pageResults).toHaveLength(1);
      expect(pageResults[0]).toMatchObject({ title: "Education", href: "/education" });
      expect(pageResults[0].external).not.toBe(true);
    });
  }

  it("retains external behavior for publication documents", () => {
    const { result } = renderHook(() => useGlobalSearch());
    act(() => result.current.setQuery("fooming the fractal"));
    expect(result.current.flatResults.some(
      (item) => item.type === "document" && item.external === true,
    )).toBe(true);
  });
});

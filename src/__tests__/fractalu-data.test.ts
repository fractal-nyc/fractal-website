import { describe, expect, it } from "vitest";
import { FRACTALU_CATALOG_SNAPSHOT, getFractalUCategories, hydrateFractalUCatalog, validateFractalUCatalog, type FractalUCatalogSnapshot } from "@/data/fractalu";

const clone = () => JSON.parse(JSON.stringify(FRACTALU_CATALOG_SNAPSHOT)) as FractalUCatalogSnapshot;

describe("FractalU serializable catalog boundary", () => {
  it("validates and hydrates the canonical snapshot without exporting derived labels", () => {
    expect(validateFractalUCatalog(FRACTALU_CATALOG_SNAPSHOT)).toEqual({ valid: true, errors: [] });
    const catalog = hydrateFractalUCatalog(FRACTALU_CATALOG_SNAPSHOT);
    expect(catalog.courses[0].instructor).toBe(catalog.courses[0].instructors.map(({ name }) => name).join(" & "));
    expect(JSON.stringify(FRACTALU_CATALOG_SNAPSHOT)).not.toContain('"instructor":');
  });

  it("returns editor-readable paths for duplicate IDs, missing instructors, and invalid URLs", () => {
    const draft = clone();
    draft.courses[1].id = draft.courses[0].id;
    draft.courses[0].instructors = [];
    draft.courses[0].applicationUrl = "javascript:alert(1)";
    draft.clubs[0].detailsUrl = "https://example.com/details";
    draft.clubs[0].detailsLabel = undefined;
    const result = validateFractalUCatalog(draft);
    expect(result.valid).toBe(false);
    expect(result.errors.map(({ path }) => path)).toEqual(expect.arrayContaining(["courses.1.id", "courses.0.instructors", "courses.0.applicationUrl", "clubs.0.detailsLabel"]));
  });

  it("preserves instructor order and derives new subject categories from the supplied draft", () => {
    const draft = clone();
    draft.courses[0].category = "Experimental category";
    draft.courses[0].instructors = [{ name: "First", bio: "First bio" }, { name: "Second", bio: "Second bio" }];
    const catalog = hydrateFractalUCatalog(draft);
    expect(catalog.courses[0].instructor).toBe("First & Second");
    expect(getFractalUCategories(catalog)).toContain("Experimental category");
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMPONENT_REGISTRY, GALLERY_CATEGORIES, galleryEntries, searchableEntryText } from "../../components/catalog/registry";
import { COMPONENT_COLORWAYS } from "@/components/content/ComponentColorScope";
import { HOUSES, SECTIONS } from "@/data/houses";

describe("team component registry", () => {
  it("uses unique stable labels and agent phrases with complete guidance", () => {
    expect(new Set(COMPONENT_REGISTRY.map(({ id }) => id)).size).toBe(COMPONENT_REGISTRY.length);
    expect(new Set(COMPONENT_REGISTRY.map(({ name }) => name)).size).toBe(COMPONENT_REGISTRY.length);
    for (const entry of COMPONENT_REGISTRY) {
      expect(entry.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(entry.agentPhrase).toContain(`**${entry.name}**`);
      expect(entry.purpose).toBeTruthy();
      expect(entry.useWhen).toBeTruthy();
      expect(entry.doNotUseWhen).toBeTruthy();
      expect(entry.accessibility).toBeTruthy();
      expect(entry.responsive).toBeTruthy();
      expect(Boolean(entry.render) || Boolean(entry.internalReason) || entry.previewMode === "visual-board" || entry.previewMode === "asset-family" || entry.previewMode === "full-context").toBe(true);
      expect(new Set(entry.controls.map(({ id }) => id)).size).toBe(entry.controls.length);
      if (entry.presentation !== "gallery" && !entry.render) expect(entry.controls).toEqual([]);
      for (const control of entry.controls) {
        expect(control.defaultValue).not.toBe(control.testValue);
        if (control.kind === "select" || control.kind === "preview-width") {
          expect(control.options.map(({ value }) => value)).toContain(control.defaultValue);
          expect(control.options.map(({ value }) => value)).toContain(control.testValue);
        }
      }
      if (entry.sourcePath.startsWith("src/")) expect(fs.existsSync(path.resolve(entry.sourcePath))).toBe(true);
    }
  });

  it("accounts for every production component source file", () => {
    const sourceFiles: string[] = [];
    const visit = (directory: string) => {
      for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
        const target = path.join(directory, item.name);
        if (item.isDirectory()) visit(target);
        else if (item.name.endsWith(".tsx")) sourceFiles.push(target.split(path.sep).join("/"));
      }
    };
    visit("src/components");
    const covered = new Set(COMPONENT_REGISTRY.map(({ sourcePath }) => sourcePath));
    expect(sourceFiles.filter((file) => !covered.has(file))).toEqual([]);
  });

  it("finds plain-English aliases and exposes only canonical colorways", () => {
    const search = (query: string) => COMPONENT_REGISTRY.filter((entry) => searchableEntryText(entry).includes(query));
    expect(search("note").map(({ name }) => name)).toContain("Note Box");
    expect(search("class container").map(({ name }) => name)).toContain("Course Card");
    expect(search("outsource link").map(({ name }) => name)).toContain("External Link");
    expect(COMPONENT_COLORWAYS.map(({ id }) => id)).toEqual(["neutral", "co-living", "events", "campus", "education", "library", "political-club", "story", "people"]);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "education")?.accent).toBe(HOUSES.find(({ id }) => id === "school")?.palette.light);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "story")?.accent).toBe(SECTIONS.story.accent);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "story")?.allowedSurfaces).toEqual(["paper"]);
  });

  it("declares truthful component-specific controls for the reviewed specimens", () => {
    const controlsFor = (id: string) => COMPONENT_REGISTRY.find((entry) => entry.id === id)!.controls.map(({ label }) => label);
    expect(controlsFor("course-fact-grid")).toContain("Fact values");
    expect(controlsFor("course-subject-filter")).toContain("Filter state");
    expect(controlsFor("editorial-quote")).toContain("Citation");
    expect(controlsFor("mandelbrot-corner-frame")).toContain("Corner size");
    expect(controlsFor("paper-grain-overlay")).toEqual([]);
    expect(COMPONENT_REGISTRY.filter(({ presentation }) => presentation !== "gallery").filter(({ render }) => !render).every(({ controls }) => controls.length === 0)).toBe(true);
  });

  it("provides a visual preview and plain-language category for every gallery entry", () => {
    expect(GALLERY_CATEGORIES.map(({ label }) => label)).toEqual(["Common components", "Cards & boxes", "Buttons & links", "Forms & filters", "Images & decoration", "Page sections", "Design basics", "All components"]);
    for (const entry of galleryEntries) {
      expect(entry.galleryCategory).toBeTruthy();
      expect(entry.previewMode).not.toBe("invisible");
      expect(Boolean(entry.render) || ["visual-board", "asset-family", "full-context"].includes(entry.previewMode!)).toBe(true);
      expect(entry.name).not.toMatch(/ComponentColorScope|FractalUniversityPortal|DocumentCard/);
    }
    expect(galleryEntries.filter(({ common }) => common).map(({ name }) => name)).toEqual(["Action Button", "External Link", "Article Card", "Note Box", "Course Card", "Club Card", "Campus Highlight", "Editorial Quote"]);
  });

  it("keeps supporting and invisible implementation sources out of the visual gallery", () => {
    expect(galleryEntries.some(({ id }) => id === "site-footer-marker")).toBe(false);
    expect(COMPONENT_REGISTRY.filter(({ presentation }) => presentation === "internal").every(({ internalReason }) => Boolean(internalReason))).toBe(true);
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMPONENT_REGISTRY, searchableEntryText } from "../../components/catalog/registry";
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
      expect(Boolean(entry.render) || Boolean(entry.referenceOnly)).toBe(true);
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
    expect(search("note").map(({ name }) => name)).toContain("Note / Callout Card");
    expect(search("class container").map(({ name }) => name)).toContain("Course Card");
    expect(search("outsource link").map(({ name }) => name)).toContain("Outbound Link");
    expect(COMPONENT_COLORWAYS.map(({ id }) => id)).toEqual(["neutral", "co-living", "events", "campus", "education", "library", "political-club", "story", "people"]);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "education")?.accent).toBe(HOUSES.find(({ id }) => id === "school")?.palette.light);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "story")?.accent).toBe(SECTIONS.story.accent);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "story")?.allowedSurfaces).toEqual(["paper"]);
  });
});

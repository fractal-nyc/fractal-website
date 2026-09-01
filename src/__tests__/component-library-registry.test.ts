import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COMPONENT_REGISTRY, GALLERY_CATEGORIES, galleryEntries, searchableEntryText } from "../../components/catalog/registry";
import { COMPONENT_COLORWAYS } from "@/components/content/ComponentColorScope";
import { HOUSES, SECTIONS } from "@/data/houses";
import { readRoute } from "../../components/ComponentLibraryApp";

describe("team component registry", () => {
  it("uses unique stable labels and agent phrases with complete guidance", () => {
    expect(new Set(COMPONENT_REGISTRY.map(({ id }) => id)).size).toBe(COMPONENT_REGISTRY.length);
    expect(new Set(COMPONENT_REGISTRY.map(({ name }) => name)).size).toBe(COMPONENT_REGISTRY.length);
    for (const entry of COMPONENT_REGISTRY) {
      expect(entry.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(entry.agentPhrase).toContain(`**“${entry.name}”**`);
      expect(entry.agentPhrase).toContain("Inherit the target page or section’s approved house/section color tokens");
      expect(entry.agentPhrase).toContain("preserve its accessibility and responsive behavior");
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
    const search = (query: string) => galleryEntries.filter((entry) => searchableEntryText(entry).includes(query));
    expect(search("note").map(({ name }) => name)).toContain("Note Box");
    expect(search("class container").map(({ name }) => name)).toContain("Course Card");
    expect(search("action button").map(({ name }) => name)).toContain("Primary Button");
    expect(search("external link").map(({ name }) => name)).toContain("Standalone Link");
    expect(search("outbound link").map(({ name }) => name)).toContain("Standalone Link");
    expect(search("outsource link").map(({ name }) => name)).toContain("Standalone Link");
    expect(search("prose link").map(({ name }) => name)).toContain("Inline Text Link");
    expect(search("outbound text link").map(({ name }) => name)).toContain("Outbound Text Link");
    expect(search("prominent text link").map(({ name }) => name)).toContain("Outbound Text Link");
    expect(search("inter outbound link").map(({ name }) => name)).toContain("Outbound Text Link");
    expect(search("text link with arrow").map(({ name }) => name)).toContain("Outbound Text Link");
    expect(search("homepage search").map(({ name }) => name)).toContain("Search Bar");
    expect(search("hero search").map(({ name }) => name)).toContain("Search Bar");
    expect(search("archive search field").map(({ name }) => name)).toContain("Search Bar");
    expect(search("library tag filter").map(({ name }) => name)).toContain("Filter Bar");
    expect(search("course subject filter").map(({ name }) => name)).toContain("Filter Bar");
    expect(search("campus highlight").map(({ name }) => name)).toContain("Highlight Box");
    expect(search("meet the space carousel").map(({ name }) => name)).toContain("Photo Carousel");
    expect(search("photo slider").map(({ name }) => name)).toContain("Photo Carousel");
    expect(COMPONENT_COLORWAYS.map(({ id }) => id)).toEqual(["neutral", "co-living", "events", "campus", "education", "library", "political-club", "story", "people"]);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "education")?.accent).toBe(HOUSES.find(({ id }) => id === "school")?.palette.light);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "story")?.accent).toBe(SECTIONS.story.accent);
    expect(COMPONENT_COLORWAYS.find(({ id }) => id === "story")?.allowedSurfaces).toEqual(["paper"]);
  });

  it("declares truthful component-specific controls for the reviewed specimens", () => {
    const controlsFor = (id: string) => COMPONENT_REGISTRY.find((entry) => entry.id === id)!.controls.map(({ label }) => label);
    expect(controlsFor("course-card")).toContain("Content variant");
    expect(controlsFor("course-card")).toContain("Subject and icon");
    expect(controlsFor("filter-bar")).toContain("Selection behavior");
    expect(controlsFor("editorial-quote")).toContain("Citation");
    expect(controlsFor("note-callout")).not.toContain("Actions");
    expect(controlsFor("outbound-text-link")).toEqual(expect.arrayContaining(["Example text context", "Destination type"]));
    expect(controlsFor("inline-text-link")).toEqual(expect.arrayContaining(["Example text context", "Destination type"]));
    expect(COMPONENT_REGISTRY.filter(({ presentation }) => presentation !== "gallery").filter(({ render }) => !render).every(({ controls }) => controls.length === 0)).toBe(true);
  });

  it("provides a visual preview and plain-language category for every gallery entry", () => {
    expect(GALLERY_CATEGORIES.map(({ label }) => label)).toEqual(["Common components", "Cards & boxes", "Buttons & links", "Forms & filters", "Images & media", "All components"]);
    expect(galleryEntries).toHaveLength(15);
    for (const entry of galleryEntries) {
      expect(entry.galleryCategory).toBeTruthy();
      expect(entry.previewMode).not.toBe("invisible");
      expect(Boolean(entry.render) || ["visual-board", "asset-family", "full-context"].includes(entry.previewMode!)).toBe(true);
      expect(entry.name).not.toMatch(/ComponentColorScope|FractalUniversityPortal|DocumentCard/);
    }
    expect(galleryEntries.filter(({ common }) => common).map(({ name }) => name)).toEqual(["Primary Button", "Standalone Link", "Outbound Text Link", "Inline Text Link", "Article Card", "Note Box", "Course Card", "Club Card", "Highlight Box"]);
    expect(galleryEntries.filter(({ galleryCategory }) => galleryCategory === "actions").map(({ name }) => name)).toEqual(["Primary Button", "Standalone Link", "Outbound Text Link", "Inline Text Link"]);
    expect(galleryEntries.filter(({ galleryCategory }) => galleryCategory === "forms").map(({ name }) => name)).toEqual(["Search Bar", "Filter Bar"]);
    expect(galleryEntries.filter(({ galleryCategory }) => galleryCategory === "media").map(({ name }) => name).sort()).toEqual(["House Pennants", "Photo Carousel", "Photo Gallery"]);
  });

  it("keeps editor-only actions and transient states out of the public chooser", () => {
    const galleryNames = galleryEntries.map(({ name }) => name);
    expect(galleryNames).not.toEqual(expect.arrayContaining(["Disabled", "Outline Button", "Quiet Action", "Inline Button Link"]));
    expect(galleryEntries.some(({ id }) => id === "education-outbound-compat")).toBe(false);
    expect(COMPONENT_REGISTRY.find(({ id }) => id === "action-buttons")?.variants.join(" ")).toMatch(/disabled/i);
    expect(COMPONENT_REGISTRY.find(({ id }) => id === "course-card")?.variants).toContain("Linked title");
  });

  it("keeps supporting and invisible implementation sources out of the visual gallery", () => {
    expect(galleryEntries.some(({ id }) => id === "site-footer-marker")).toBe(false);
    expect(COMPONENT_REGISTRY.filter(({ presentation }) => presentation === "internal").every(({ internalReason }) => Boolean(internalReason))).toBe(true);
    const hiddenIds = ["color-pairing", "page-frame", "type-style", "reading-column", "standard-section-frame", "wide-card-grid", "section-header", "site-navigation", "campus-section", "home-hero", "housing-map", "origin-story", "sierpinski-carpet", "fractal-city-scene", "octahedron-hero", "content-card", "course-fact-grid", "membership-button-group", "empty-results-message", "hero-search", "archive-search", "filter-chip", "library-tag-filter", "course-subject-filter", "embed-frame", "mandelbrot-corner-frame", "mandelbrot-icon", "paper-grain-overlay", "fractal-pattern", "fade-in", "gallery-image", "photo-frame", "category-icon-label"];
    for (const id of hiddenIds) {
      const entry = COMPONENT_REGISTRY.find((candidate) => candidate.id === id)!;
      expect(entry.presentation).not.toBe("gallery");
      expect(entry.previewMode).toBe("invisible");
      expect(entry.galleryCategory).toBeUndefined();
      expect(galleryEntries).not.toContain(entry);
    }
  });

  it("keeps Course Card subjects automatic and the shared category lockup internal", () => {
    const course = COMPONENT_REGISTRY.find(({ id }) => id === "course-card")!;
    const subject = course.controls.find(({ id }) => id === "subject");
    expect(subject).toMatchObject({ label: "Subject and icon", testValue: "Experimental category" });
    expect(subject && "options" in subject ? subject.options.map(({ value }) => value) : []).toEqual([
      "Craft",
      "Literature",
      "Mind & Body",
      "Movement",
      "Music",
      "Nature",
      "Technology",
      "Writing",
      "Experimental category",
    ]);
    expect(course.promptNeeds).toMatch(/icon is derived automatically/i);
    expect(course.contentFields.join(" ")).toMatch(/icon derives automatically/i);
    expect(COMPONENT_REGISTRY.find(({ id }) => id === "category-icon-label")).toMatchObject({
      presentation: "internal",
      previewMode: "invisible",
    });
    const catalog = JSON.parse(fs.readFileSync("src/data/fractalu-catalog.json", "utf8")) as {
      courses: Array<Record<string, unknown>>;
    };
    expect(catalog.courses.every((record) => !("icon" in record) && !("iconName" in record))).toBe(true);
    expect(galleryEntries).toHaveLength(15);
  });

  it("exposes one shared search choice and retains thin behavior wrappers internally", () => {
    const search = COMPONENT_REGISTRY.find(({ id }) => id === "search-bar")!;
    expect(search).toMatchObject({ name: "Search Bar", componentName: "SearchBar", sourcePath: "src/components/content/SearchBar.tsx", presentation: "gallery", galleryCategory: "forms", previewMode: "inline", themeable: true });
    expect(search.controls.map(({ label }) => label)).toContain("Search behavior");
    expect(search.usedOn).toMatch(/Home.*Library/i);
    for (const id of ["hero-search", "archive-search"]) expect(COMPONENT_REGISTRY.find((entry) => entry.id === id)).toMatchObject({ presentation: "internal", previewMode: "invisible" });

    const carousel = COMPONENT_REGISTRY.find(({ id }) => id === "meet-space-carousel")!;
    expect(carousel).toMatchObject({ name: "Photo Carousel", componentName: "MeetTheSpaceCarousel", presentation: "gallery", galleryCategory: "media", previewMode: "inline", themeable: false });
    expect(carousel.controls).toEqual([]);
    expect(carousel.usedOn).toMatch(/Campus/i);
    expect(COMPONENT_REGISTRY.find(({ id }) => id === "home-hero")?.sourcePath).toBe("src/components/sections/Hero.tsx");
    const heroSource = fs.readFileSync("src/components/sections/Hero.tsx", "utf8");
    expect(heroSource).toMatch(/<HomeSearchBar[\s\S]*enableGlobalShortcut/);
    expect(heroSource).toMatch(/className="hidden lg:block absolute bottom-12/);
  });

  it("canonicalizes removed chooser hashes to Common components", () => {
    expect(readRoute("#browse/basics")).toEqual({ view: "browse", category: "common", query: "" });
    expect(readRoute("#browse/sections?q=hero")).toEqual({ view: "browse", category: "common", query: "hero" });
  });

  it("canonicalizes old Prominent Text Link detail and preview hashes", () => {
    expect(readRoute("#component/prominent-text-link")).toEqual({ view: "detail", id: "outbound-text-link" });
    expect(readRoute("#preview/prominent-text-link")).toEqual({ view: "preview", id: "outbound-text-link" });
    expect(readRoute("#component/not-a-component")).toEqual({ view: "detail", id: "not-a-component" });
  });
});

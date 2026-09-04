import { describe, expect, it } from "vitest";
import { normalizeFractalUCatalog } from "@/content/normalize-fractalu";
import { FRACTALU_CATALOG } from "@/data/fractalu";
import { FRACTALU_CATALOG_QUERY } from "@/sanity/queries";

const validProjection = () => ({
  semester: "Spring 2027",
  courses: [{
    id: "course-a",
    title: "Course A",
    category: "Making",
    instructors: [
      { name: "Ada", bio: "Ada bio" },
      { name: "Grace", bio: "Grace bio" },
    ],
    schedule: "Mondays",
    dates: "Jan–Mar",
    location: "Fractal Tech",
    price: "$100",
    description: "An exact course description.",
    detailsUrl: "https://example.com/details",
    detailsLabel: "Read details",
    applicationUrl: "https://example.com/apply",
    applicationLabel: "Apply",
    videoUrl: "https://example.com/video",
  }],
  clubs: [{
    id: "club-a",
    name: "Club A",
    description: "A club description.",
    schedule: "Tuesdays",
    location: "Fractal Tech",
    actionUrl: "https://example.com/join",
    actionLabel: "Join",
  }],
});

describe("FractalU catalog normalization", () => {
  it("accepts an atomic catalog, derives instructor display text, and preserves local provenance", () => {
    const result = normalizeFractalUCatalog(validProjection(), FRACTALU_CATALOG);
    expect(result?.semester).toBe("Spring 2027");
    expect(result?.courses[0].instructor).toBe("Ada & Grace");
    expect(result?.sourceProvenance).toBe(FRACTALU_CATALOG.sourceProvenance);
  });

  it("accepts empty course or club arrays", () => {
    expect(normalizeFractalUCatalog({ ...validProjection(), courses: [] }, FRACTALU_CATALOG)?.courses).toEqual([]);
    expect(normalizeFractalUCatalog({ ...validProjection(), clubs: [] }, FRACTALU_CATALOG)?.clubs).toEqual([]);
  });

  it.each([
    { name: "missing required text", mutate: (value: ReturnType<typeof validProjection>) => { value.courses[0].title = ""; } },
    { name: "unsafe URL", mutate: (value: ReturnType<typeof validProjection>) => { value.courses[0].applicationUrl = "javascript:alert(1)"; } },
    { name: "unpaired details label", mutate: (value: ReturnType<typeof validProjection>) => { value.courses[0].detailsUrl = ""; } },
    { name: "missing instructor", mutate: (value: ReturnType<typeof validProjection>) => { value.courses[0].instructors = []; } },
    { name: "duplicate course key", mutate: (value: ReturnType<typeof validProjection>) => { value.courses.push({ ...value.courses[0] }); } },
    { name: "duplicate club key", mutate: (value: ReturnType<typeof validProjection>) => { value.clubs.push({ ...value.clubs[0] }); } },
  ])("rejects the whole remote catalog for $name", ({ mutate }) => {
    const value = validProjection();
    mutate(value);
    expect(normalizeFractalUCatalog(value, FRACTALU_CATALOG)).toBeNull();
  });

  it("queries only the first visible semester and its visible, deterministically ordered records", () => {
    expect(FRACTALU_CATALOG_QUERY).toContain('_type == "fractalUSemester" && visible == true');
    expect(FRACTALU_CATALOG_QUERY).toContain("order(displayOrder asc, key asc)[0]");
    expect(FRACTALU_CATALOG_QUERY).toContain('_type == "fractalUCourse"');
    expect(FRACTALU_CATALOG_QUERY).toContain('_type == "fractalUClub"');
    expect(FRACTALU_CATALOG_QUERY.match(/visible == true/g)).toHaveLength(3);
    expect(FRACTALU_CATALOG_QUERY.match(/references\(\^\._id\)/g)).toHaveLength(2);
    expect(FRACTALU_CATALOG_QUERY.match(/order\(displayOrder asc, key asc\)/g)).toHaveLength(3);
  });
});

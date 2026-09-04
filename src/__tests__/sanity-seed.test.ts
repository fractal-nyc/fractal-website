import { describe, expect, it } from "vitest";
import { buildSeed } from "../../scripts/sanity/build-seed";
import { FRACTALU_CATALOG } from "@/data/fractalu";
import { FRACTALU_LOCATION_OTHER_VALUE } from "../../sanity/components/FractalULocationInput";

describe("deterministic FractalU Sanity seed", () => {
  it("is byte-identical across runs and contains exactly the local catalog", () => {
    const first = buildSeed();
    const second = buildSeed();
    expect(second.ndjson).toBe(first.ndjson);
    expect(second.checksum).toBe(first.checksum);
    expect(first.counts).toEqual({
      total: 1 + FRACTALU_CATALOG.courses.length + FRACTALU_CATALOG.clubs.length,
      semesters: 1,
      courses: FRACTALU_CATALOG.courses.length,
      clubs: FRACTALU_CATALOG.clubs.length,
    });
    expect(new Set(first.documents.map(({ _id }) => _id)).size).toBe(first.documents.length);
  });

  it("uses one stable semester reference plus source order and visibility", () => {
    const seed = buildSeed();
    const semesters = seed.documents.filter(({ _type }) => _type === "fractalUSemester");
    const courses = seed.documents.filter(({ _type }) => _type === "fractalUCourse");
    const clubs = seed.documents.filter(({ _type }) => _type === "fractalUClub");
    expect(semesters).toHaveLength(1);
    expect(courses.map(({ displayOrder }) => displayOrder)).toEqual(FRACTALU_CATALOG.courses.map((_, index) => index));
    expect(clubs.map(({ displayOrder }) => displayOrder)).toEqual(FRACTALU_CATALOG.clubs.map((_, index) => index));
    for (const document of [...semesters, ...courses, ...clubs]) expect(document.visible).toBe(true);
    for (const document of [...courses, ...clubs]) {
      expect(document.semester).toEqual({ _type: "reference", _ref: semesters[0]._id });
    }
  });

  it("preserves multi-instructor ordering and applicable source links", () => {
    const seed = buildSeed();
    const localCourse = FRACTALU_CATALOG.courses.find(({ instructors }) => instructors.length > 1)!;
    const course = seed.documents.find(({ _id }) => _id === `fractalu-course-${localCourse.id}`)!;
    expect((course.instructors as Array<{ name: string; bio: string }>).map(({ name }) => name)).toEqual(
      localCourse.instructors.map(({ name }) => name),
    );
    expect(course).toMatchObject({
      applicationUrl: localCourse.applicationUrl,
      applicationLabel: localCourse.applicationLabel,
    });
    if (localCourse.detailsUrl) {
      expect(course).toMatchObject({ detailsUrl: localCourse.detailsUrl, detailsLabel: localCourse.detailsLabel });
    }
    if (localCourse.videoUrl) expect(course.videoUrl).toBe(localCourse.videoUrl);
  });

  it("preserves exact scalar locations without location documents or UI sentinels", () => {
    const seed = buildSeed();
    const courses = seed.documents.filter(({ _type }) => _type === "fractalUCourse");
    const clubs = seed.documents.filter(({ _type }) => _type === "fractalUClub");

    expect(courses.map(({ location }) => location)).toEqual(
      FRACTALU_CATALOG.courses.map(({ location }) => location),
    );
    expect(clubs.map(({ location }) => location)).toEqual(
      FRACTALU_CATALOG.clubs.map(({ location }) => location),
    );
    for (const document of [...courses, ...clubs]) {
      expect(document.location).toBeTypeOf("string");
      expect(document.location).not.toBe(FRACTALU_LOCATION_OTHER_VALUE);
    }
    expect(seed.documents.map(({ _type }) => _type)).not.toContain("fractalULocation");
    expect(seed.ndjson).not.toContain(FRACTALU_LOCATION_OTHER_VALUE);
  });

  it("contains no unrelated documents, media directives, or snapshot provenance", () => {
    const seed = buildSeed();
    expect(new Set(seed.documents.map(({ _type }) => _type))).toEqual(
      new Set(["fractalUSemester", "fractalUCourse", "fractalUClub"]),
    );
    expect(seed.ndjson).not.toContain("_sanityAsset");
    expect(seed.ndjson).not.toContain("sourceProvenance");
    expect(seed.ndjson).not.toMatch(/"_type":"(?:house|person|publication|page|siteSettings)"/);
  });
});

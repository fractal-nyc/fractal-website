import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { schemaTypes } from "../../sanity/schemaTypes";
import {
  FRACTALU_LOCATION_PRESETS,
  FractalULocationInput,
} from "../../sanity/components/FractalULocationInput";
import { FRACTALU_CATALOG } from "@/data/fractalu";
import packageJson from "../../package.json";

type SchemaType = (typeof schemaTypes)[number] & {
  fields?: Array<{
    name: string;
    type: string;
    initialValue?: unknown;
    validation?: unknown;
    components?: { input?: unknown };
    to?: Array<{ type: string }>;
  }>;
};

const schema = (name: string) => schemaTypes.find((type) => type.name === name) as SchemaType;

describe("focused FractalU Sanity schema", () => {
  it("uses the local Sanity v4 development command and exposes exactly four types", () => {
    expect(packageJson.scripts["sanity:studio"]).toBe("sanity dev");
    expect(schemaTypes.map(({ name }) => name)).toEqual([
      "fractalUSemester",
      "fractalUCourse",
      "fractalUClub",
      "instructor",
    ]);
  });

  it("keeps both locations as required strings with one shared preset input", () => {
    for (const name of ["fractalUCourse", "fractalUClub"]) {
      const location = schema(name).fields?.find((field) => field.name === "location");
      expect(location).toMatchObject({
        name: "location",
        type: "string",
        components: { input: FractalULocationInput },
      });
      expect(location?.validation).toBeTypeOf("function");
    }

    const values = FRACTALU_LOCATION_PRESETS.map(({ value }) => value);
    const catalogValues = [
      ...FRACTALU_CATALOG.courses.map(({ location }) => location),
      ...FRACTALU_CATALOG.clubs.map(({ location }) => location),
    ];
    expect(values.every((value) => value.trim().length > 0)).toBe(true);
    expect(new Set(values).size).toBe(values.length);
    expect(new Set(values)).toEqual(new Set(catalogValues));
    expect(schemaTypes).toHaveLength(4);
    expect(schemaTypes.map(({ name }) => name)).not.toContain("fractalULocation");
  });

  it("associates every card with a semester and exposes editable order and visibility", () => {
    for (const name of ["fractalUCourse", "fractalUClub"]) {
      const semester = schema(name).fields?.find((field) => field.name === "semester");
      expect(semester).toMatchObject({ type: "reference", to: [{ type: "fractalUSemester" }] });
      expect(semester?.validation).toBeTypeOf("function");
    }
    for (const name of ["fractalUSemester", "fractalUCourse", "fractalUClub"]) {
      expect(schema(name).fields?.find((field) => field.name === "displayOrder")?.validation).toBeTypeOf("function");
      expect(schema(name).fields?.find((field) => field.name === "visible")).toMatchObject({
        type: "boolean",
        initialValue: true,
      });
    }
  });

  it("requires ordered instructor records and validates every card URL as http/https", () => {
    expect(schema("fractalUCourse").fields?.find((field) => field.name === "instructors")?.validation).toBeTypeOf("function");
    for (const field of schema("instructor").fields ?? []) {
      expect(["name", "bio"]).toContain(field.name);
      expect(field.validation).toBeTypeOf("function");
    }
    const courseSource = readFileSync("sanity/schemaTypes/documents/fractalUCourse.ts", "utf8");
    const clubSource = readFileSync("sanity/schemaTypes/documents/fractalUClub.ts", "utf8");
    expect(courseSource.match(/uri\(\{ scheme: \["http", "https"\] \}\)/g)).toHaveLength(3);
    expect(clubSource.match(/uri\(\{ scheme: \["http", "https"\] \}\)/g)).toHaveLength(2);
    expect(courseSource).toContain("Details URL and label must be provided together");
    expect(clubSource).toContain("Details URL and label must be provided together");
  });

  it("contains no general CMS, design, route, markup, or script fields", () => {
    const forbiddenTypes = ["siteSettings", "house", "person", "publication", "page", "portableBody", "fractalImage"];
    expect(schemaTypes.map(({ name }) => name)).not.toEqual(expect.arrayContaining(forbiddenTypes));

    const forbiddenFields = new Set([
      "color", "palette", "class", "className", "css", "html", "iframe",
      "script", "route", "slug", "sourceProvenance", "catalogIntro", "information",
      "etiquette", "canon", "teaching",
    ]);
    for (const type of schemaTypes as SchemaType[]) {
      for (const field of type.fields ?? []) {
        expect(forbiddenFields.has(field.name), `${type.name}.${field.name}`).toBe(false);
      }
    }
  });
});

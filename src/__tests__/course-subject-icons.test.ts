import { describe, expect, it } from "vitest";
import {
  BookOpen,
  Brain,
  Cpu,
  Footprints,
  Hammer,
  Music2,
  PenLine,
  Shapes,
  Sprout,
} from "lucide-react";
import {
  normalizeCourseSubject,
  resolveCourseSubjectIcon,
} from "@/components/education/courseSubjectIcons";
import { FRACTALU_CATALOG, getFractalUCategories } from "@/data/fractalu";

describe("Education course subject icons", () => {
  it.each([
    ["Craft", "hammer", Hammer],
    ["Literature", "book-open", BookOpen],
    ["Mind & Body", "brain", Brain],
    ["Movement", "footprints", Footprints],
    ["Music", "music-2", Music2],
    ["Nature", "sprout", Sprout],
    ["Technology", "cpu", Cpu],
    ["Writing", "pen-line", PenLine],
  ] as const)("maps %s to %s", (subject, key, icon) => {
    expect(resolveCourseSubjectIcon(subject)).toEqual({
      icon,
      key,
      isFallback: false,
    });
  });

  it("normalizes surrounding whitespace and case", () => {
    expect(normalizeCourseSubject("  MIND & BODY  ")).toBe("mind & body");
    expect(resolveCourseSubjectIcon("  lItErAtUrE ").key).toBe("book-open");
  });

  it.each(["Experimental category", "", "Unknown"])(
    "uses the generic Shapes fallback for %j",
    (subject) => {
      expect(resolveCourseSubjectIcon(subject)).toEqual({
        icon: Shapes,
        key: "shapes",
        isFallback: true,
      });
    },
  );

  it("intentionally maps every category in the canonical semester", () => {
    for (const category of getFractalUCategories(FRACTALU_CATALOG)) {
      if (category === "All") continue;
      expect(resolveCourseSubjectIcon(category).isFallback, category).toBe(false);
    }
  });
});

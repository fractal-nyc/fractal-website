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
  type LucideIcon,
} from "lucide-react";

export type CourseSubjectIconKey =
  | "hammer"
  | "book-open"
  | "brain"
  | "footprints"
  | "music-2"
  | "sprout"
  | "cpu"
  | "pen-line"
  | "shapes";

export interface CourseSubjectIconResolution {
  icon: LucideIcon;
  key: CourseSubjectIconKey;
  isFallback: boolean;
}

const SUBJECT_ICONS: Record<string, Omit<CourseSubjectIconResolution, "isFallback">> = {
  craft: { icon: Hammer, key: "hammer" },
  literature: { icon: BookOpen, key: "book-open" },
  "mind & body": { icon: Brain, key: "brain" },
  movement: { icon: Footprints, key: "footprints" },
  music: { icon: Music2, key: "music-2" },
  nature: { icon: Sprout, key: "sprout" },
  technology: { icon: Cpu, key: "cpu" },
  writing: { icon: PenLine, key: "pen-line" },
};

const FALLBACK_ICON: CourseSubjectIconResolution = {
  icon: Shapes,
  key: "shapes",
  isFallback: true,
};

export function normalizeCourseSubject(category: string | null | undefined) {
  return typeof category === "string" ? category.trim().toLowerCase() : "";
}

export function resolveCourseSubjectIcon(category: string | null | undefined): CourseSubjectIconResolution {
  const resolution = SUBJECT_ICONS[normalizeCourseSubject(category)];
  return resolution ? { ...resolution, isFallback: false } : FALLBACK_ICON;
}

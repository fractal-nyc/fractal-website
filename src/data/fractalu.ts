import catalogSnapshot from "@/data/fractalu-catalog.json";

/** Canonical source for the reviewed public catalog snapshot. */
export const FRACTALU_SOURCE_URL = "https://www.fractalu.nyc/";
export const FRACTALU_INFO_URL = "https://www.fractalu.nyc/info";
export const FRACTALU_SNAPSHOT_DATE = "2026-08-25";

export interface FractalUInstructor {
  name: string;
  bio: string;
}

export interface FractalUCourseSnapshot {
  id: string;
  title: string;
  category: string;
  instructors: FractalUInstructor[];
  schedule: string;
  dates: string;
  location: string;
  price: string;
  description: string;
  detailsUrl?: string;
  detailsLabel?: string;
  applicationUrl: string;
  applicationLabel: string;
  videoUrl?: string;
}

export interface FractalUSourceProvenance {
  url: string;
  verifiedAt: string;
  lastModified: string;
  etag: string;
  byteLength: number;
  sha256: string;
}

export interface FractalUCourse extends FractalUCourseSnapshot {
  /** Ordered source names joined for the course card's single instructor label. */
  instructor: string;
}

export interface FractalUClub {
  id: string;
  name: string;
  description: string;
  schedule: string;
  location: string;
  detailsUrl?: string;
  detailsLabel?: string;
  actionUrl: string;
  actionLabel: string;
}

export interface FractalUCatalog {
  semester: string;
  sourceProvenance: FractalUSourceProvenance;
  courses: FractalUCourse[];
  clubs: FractalUClub[];
}

export interface FractalUCatalogSnapshot {
  semester: string;
  sourceProvenance: FractalUSourceProvenance;
  courses: FractalUCourseSnapshot[];
  clubs: FractalUClub[];
}

export interface FractalUValidationError {
  path: string;
  message: string;
}

export interface FractalUValidationResult {
  valid: boolean;
  errors: FractalUValidationError[];
}

const REQUIRED_PROVENANCE_FIELDS = [
  "url",
  "verifiedAt",
  "lastModified",
  "etag",
  "sha256",
] as const;

const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAllowedUrl(value: string) {
  try {
    return ALLOWED_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Validate an imported/editor draft and return stable field-addressed errors. */
export function validateFractalUCatalog(value: unknown): FractalUValidationResult {
  const errors: FractalUValidationError[] = [];
  const add = (path: string, message: string) => errors.push({ path, message });
  if (!isRecord(value)) return { valid: false, errors: [{ path: "catalog", message: "Catalog must be a JSON object." }] };

  if (!hasText(value.semester)) add("semester", "Semester is required.");

  const provenance = value.sourceProvenance;
  if (!isRecord(provenance)) {
    add("sourceProvenance", "Source provenance is required.");
  } else {
    for (const field of REQUIRED_PROVENANCE_FIELDS) {
      if (!hasText(provenance[field])) add(`sourceProvenance.${field}`, `${field} is required.`);
    }
    if (hasText(provenance.url) && !isAllowedUrl(provenance.url)) {
      add("sourceProvenance.url", "Source URL must use http, https, or mailto.");
    }
    if (!Number.isFinite(provenance.byteLength) || Number(provenance.byteLength) < 0) {
      add("sourceProvenance.byteLength", "Byte length must be a non-negative number.");
    }
  }

  const seenIds = new Map<string, string>();
  const validateId = (path: string, id: unknown) => {
    if (!hasText(id)) {
      add(path, "A stable ID is required.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) add(path, "Use a lowercase kebab-case ID.");
    const previous = seenIds.get(id);
    if (previous) add(path, `ID duplicates ${previous}.`);
    else seenIds.set(id, path);
  };
  const validateOptionalPair = (
    record: Record<string, unknown>,
    base: string,
    urlField: string,
    labelField: string,
  ) => {
    const url = record[urlField];
    const label = record[labelField];
    if ((hasText(url) && !hasText(label)) || (!hasText(url) && hasText(label))) {
      add(`${base}.${hasText(url) ? labelField : urlField}`, `${urlField} and ${labelField} must be provided together.`);
    }
    if (hasText(url) && !isAllowedUrl(url)) add(`${base}.${urlField}`, "URL must use http, https, or mailto.");
  };

  if (!Array.isArray(value.courses)) add("courses", "Courses must be an array.");
  else value.courses.forEach((course, index) => {
    const base = `courses.${index}`;
    if (!isRecord(course)) {
      add(base, "Course must be an object.");
      return;
    }
    validateId(`${base}.id`, course.id);
    for (const field of ["title", "category", "schedule", "dates", "location", "price", "description", "applicationUrl", "applicationLabel"] as const) {
      if (!hasText(course[field])) add(`${base}.${field}`, `${field} is required.`);
    }
    if (hasText(course.applicationUrl) && !isAllowedUrl(course.applicationUrl)) add(`${base}.applicationUrl`, "Application URL must use http, https, or mailto.");
    validateOptionalPair(course, base, "detailsUrl", "detailsLabel");
    if (hasText(course.videoUrl) && !isAllowedUrl(course.videoUrl)) add(`${base}.videoUrl`, "Video URL must use http or https.");
    if (!Array.isArray(course.instructors) || course.instructors.length === 0) {
      add(`${base}.instructors`, "Add at least one instructor, in display order.");
    } else {
      course.instructors.forEach((instructor, instructorIndex) => {
        const instructorBase = `${base}.instructors.${instructorIndex}`;
        if (!isRecord(instructor)) {
          add(instructorBase, "Instructor must be an object.");
          return;
        }
        if (!hasText(instructor.name)) add(`${instructorBase}.name`, "Instructor name is required.");
        if (!hasText(instructor.bio)) add(`${instructorBase}.bio`, "Instructor biography is required.");
      });
    }
  });

  if (!Array.isArray(value.clubs)) add("clubs", "Clubs must be an array.");
  else value.clubs.forEach((club, index) => {
    const base = `clubs.${index}`;
    if (!isRecord(club)) {
      add(base, "Club must be an object.");
      return;
    }
    validateId(`${base}.id`, club.id);
    for (const field of ["name", "description", "schedule", "location", "actionUrl", "actionLabel"] as const) {
      if (!hasText(club[field])) add(`${base}.${field}`, `${field} is required.`);
    }
    if (hasText(club.actionUrl) && !isAllowedUrl(club.actionUrl)) add(`${base}.actionUrl`, "Action URL must use http, https, or mailto.");
    validateOptionalPair(club, base, "detailsUrl", "detailsLabel");
  });

  return { valid: errors.length === 0, errors };
}

/** Derive view-only labels from a serializable, validated snapshot. */
export function hydrateFractalUCatalog(snapshot: FractalUCatalogSnapshot): FractalUCatalog {
  return {
    ...snapshot,
    courses: snapshot.courses.map((course) => ({
      ...course,
      instructors: course.instructors.map((instructor) => ({ ...instructor })),
      instructor: course.instructors.map(({ name }) => name).join(" & "),
    })),
    clubs: snapshot.clubs.map((club) => ({ ...club })),
    sourceProvenance: { ...snapshot.sourceProvenance },
  };
}

export function getFractalUCategories(catalog: FractalUCatalog) {
  return ["All", ...Array.from(new Set(catalog.courses.map(({ category }) => category)))] as string[];
}

// This is deliberately a static, reviewed snapshot. Refresh it explicitly by
// following EDITING.md; never turn this into a runtime dependency on FractalU.
export const FRACTALU_CATALOG_SNAPSHOT = catalogSnapshot as FractalUCatalogSnapshot;

const snapshotValidation = validateFractalUCatalog(FRACTALU_CATALOG_SNAPSHOT);
if (!snapshotValidation.valid) {
  throw new Error(`Invalid src/data/fractalu-catalog.json:\n${snapshotValidation.errors.map(({ path, message }) => `- ${path}: ${message}`).join("\n")}`);
}

export const FRACTALU_CATALOG = hydrateFractalUCatalog(FRACTALU_CATALOG_SNAPSHOT);

export const FRACTALU_SOURCE_PROVENANCE = FRACTALU_CATALOG.sourceProvenance;

export const FRACTALU_CATEGORIES = getFractalUCategories(FRACTALU_CATALOG);

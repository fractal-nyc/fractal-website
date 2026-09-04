import { createHash } from "node:crypto";
import { FRACTALU_CATALOG } from "../../src/data/fractalu";
import { isSafeFractalUUrl } from "../../src/content/normalize-fractalu";

interface SanityReference {
  _type: "reference";
  _ref: string;
}

export type FractalUSeedDocument = Record<string, unknown> & {
  _id: string;
  _type: "fractalUSemester" | "fractalUCourse" | "fractalUClub";
};

const stableKey = (value: string) =>
  createHash("sha256").update(value).digest("hex").slice(0, 12);

const semesterId = `fractalu-semester-${stableKey(FRACTALU_CATALOG.semester)}`;
const semesterReference = (): SanityReference => ({
  _type: "reference",
  _ref: semesterId,
});

function assertText(value: unknown, context: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required text at ${context}.`);
  }
}

function validateDocuments(documents: FractalUSeedDocument[]) {
  const ids = new Set<string>();
  const keysByType = new Map<string, Set<string>>();
  for (const document of documents) {
    if (ids.has(document._id)) throw new Error(`Duplicate Sanity document id: ${document._id}`);
    ids.add(document._id);
    assertText(document.key, `${document._id}.key`);
    const keys = keysByType.get(document._type) ?? new Set<string>();
    if (keys.has(document.key)) throw new Error(`Duplicate ${document._type} key: ${document.key}`);
    keys.add(document.key);
    keysByType.set(document._type, keys);

    if (!Number.isInteger(document.displayOrder) || Number(document.displayOrder) < 0) {
      throw new Error(`Invalid display order at ${document._id}.`);
    }
    if (document.visible !== true) throw new Error(`Seed record must be visible: ${document._id}.`);

    if (document._type !== "fractalUSemester") {
      const semester = document.semester as SanityReference | undefined;
      if (semester?._type !== "reference" || semester._ref !== semesterId) {
        throw new Error(`Missing semester reference at ${document._id}.`);
      }
    }

    for (const [field, value] of Object.entries(document)) {
      if ((field.endsWith("Url") || field === "url") && typeof value === "string" && !isSafeFractalUUrl(value)) {
        throw new Error(`Unsafe URL at ${document._id}.${field}: ${value}`);
      }
    }

    if (document._type === "fractalUCourse") {
      for (const field of ["title", "category", "schedule", "dates", "location", "price", "description", "applicationUrl", "applicationLabel"]) {
        assertText(document[field], `${document._id}.${field}`);
      }
      if (!Array.isArray(document.instructors) || document.instructors.length === 0) {
        throw new Error(`Course requires ordered instructors: ${document._id}.`);
      }
      const instructorKeys = new Set<string>();
      document.instructors.forEach((candidate, index) => {
        const instructor = candidate as Record<string, unknown>;
        assertText(instructor._key, `${document._id}.instructors[${index}]._key`);
        assertText(instructor.name, `${document._id}.instructors[${index}].name`);
        assertText(instructor.bio, `${document._id}.instructors[${index}].bio`);
        if (instructorKeys.has(instructor._key)) throw new Error(`Duplicate instructor key in ${document._id}.`);
        instructorKeys.add(instructor._key);
      });
      if (Boolean(document.detailsUrl) !== Boolean(document.detailsLabel)) {
        throw new Error(`Course details URL and label must be paired: ${document._id}.`);
      }
    }

    if (document._type === "fractalUClub") {
      for (const field of ["name", "description", "schedule", "location", "actionUrl", "actionLabel"]) {
        assertText(document[field], `${document._id}.${field}`);
      }
      if (Boolean(document.detailsUrl) !== Boolean(document.detailsLabel)) {
        throw new Error(`Club details URL and label must be paired: ${document._id}.`);
      }
    }
  }

  for (const document of documents) {
    if (document._type !== "fractalUSemester") {
      const reference = document.semester as SanityReference;
      if (!ids.has(reference._ref)) throw new Error(`Missing semester document ${reference._ref}.`);
    }
  }
}

export function buildSeed() {
  const documents: FractalUSeedDocument[] = [
    {
      _id: semesterId,
      _type: "fractalUSemester",
      key: stableKey(FRACTALU_CATALOG.semester),
      semester: FRACTALU_CATALOG.semester,
      displayOrder: 0,
      visible: true,
    },
    ...FRACTALU_CATALOG.courses.map((course, displayOrder): FractalUSeedDocument => ({
      _id: `fractalu-course-${course.id}`,
      _type: "fractalUCourse",
      semester: semesterReference(),
      key: course.id,
      title: course.title,
      category: course.category,
      instructors: course.instructors.map((instructor, index) => ({
        _type: "instructor",
        _key: stableKey(`${course.id}-instructor-${index}-${instructor.name}`),
        name: instructor.name,
        bio: instructor.bio,
      })),
      schedule: course.schedule,
      dates: course.dates,
      location: course.location,
      price: course.price,
      description: course.description,
      ...(course.detailsUrl ? { detailsUrl: course.detailsUrl, detailsLabel: course.detailsLabel } : {}),
      applicationUrl: course.applicationUrl,
      applicationLabel: course.applicationLabel,
      ...(course.videoUrl ? { videoUrl: course.videoUrl } : {}),
      displayOrder,
      visible: true,
    })),
    ...FRACTALU_CATALOG.clubs.map((club, displayOrder): FractalUSeedDocument => ({
      _id: `fractalu-club-${club.id}`,
      _type: "fractalUClub",
      semester: semesterReference(),
      key: club.id,
      name: club.name,
      description: club.description,
      schedule: club.schedule,
      location: club.location,
      ...(club.detailsUrl ? { detailsUrl: club.detailsUrl, detailsLabel: club.detailsLabel } : {}),
      actionUrl: club.actionUrl,
      actionLabel: club.actionLabel,
      displayOrder,
      visible: true,
    })),
  ];

  validateDocuments(documents);
  const ndjson = `${documents.map((document) => JSON.stringify(document)).join("\n")}\n`;
  const checksum = createHash("sha256").update(ndjson).digest("hex");
  return {
    documents,
    ndjson,
    checksum,
    counts: {
      total: documents.length,
      semesters: 1,
      courses: FRACTALU_CATALOG.courses.length,
      clubs: FRACTALU_CATALOG.clubs.length,
    },
  };
}

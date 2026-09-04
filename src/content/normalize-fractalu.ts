import type {
  FractalUClub,
  FractalUCourse,
  FractalUCatalog,
  FractalUInstructor,
} from "@/data/fractalu";

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function requiredText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function isSafeFractalUUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function optionalLink(
  record: Record<string, unknown>,
  urlField: string,
  labelField: string,
): { url?: string; label?: string } | null {
  const url = optionalText(record[urlField]);
  const label = optionalText(record[labelField]);
  if (!url && !label) return {};
  if (!url || !label || !isSafeFractalUUrl(url)) return null;
  return { url, label };
}

function instructors(value: unknown): FractalUInstructor[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const result: FractalUInstructor[] = [];
  for (const candidate of value) {
    const item = asRecord(candidate);
    const name = requiredText(item?.name);
    const bio = requiredText(item?.bio);
    if (!name || !bio) return null;
    result.push({ name, bio });
  }
  return result;
}

function course(value: unknown): FractalUCourse | null {
  const item = asRecord(value);
  if (!item) return null;
  const id = requiredText(item.id ?? item.key);
  const title = requiredText(item.title);
  const category = requiredText(item.category);
  const parsedInstructors = instructors(item.instructors);
  const schedule = requiredText(item.schedule);
  const dates = requiredText(item.dates);
  const location = requiredText(item.location);
  const price = requiredText(item.price);
  const description = requiredText(item.description);
  const applicationUrl = requiredText(item.applicationUrl);
  const applicationLabel = requiredText(item.applicationLabel);
  const details = optionalLink(item, "detailsUrl", "detailsLabel");
  const videoUrl = optionalText(item.videoUrl);
  if (
    !id || !title || !category || !parsedInstructors || !schedule || !dates ||
    !location || !price || !description || !applicationUrl || !applicationLabel ||
    !isSafeFractalUUrl(applicationUrl) || !details ||
    (videoUrl && !isSafeFractalUUrl(videoUrl))
  ) return null;

  return {
    id,
    title,
    category,
    instructors: parsedInstructors,
    instructor: parsedInstructors.map(({ name }) => name).join(" & "),
    schedule,
    dates,
    location,
    price,
    description,
    ...(details.url ? { detailsUrl: details.url, detailsLabel: details.label } : {}),
    applicationUrl,
    applicationLabel,
    ...(videoUrl ? { videoUrl } : {}),
  };
}

function club(value: unknown): FractalUClub | null {
  const item = asRecord(value);
  if (!item) return null;
  const id = requiredText(item.id ?? item.key);
  const name = requiredText(item.name);
  const description = requiredText(item.description);
  const schedule = requiredText(item.schedule);
  const location = requiredText(item.location);
  const actionUrl = requiredText(item.actionUrl);
  const actionLabel = requiredText(item.actionLabel);
  const details = optionalLink(item, "detailsUrl", "detailsLabel");
  if (
    !id || !name || !description || !schedule || !location || !actionUrl ||
    !actionLabel || !isSafeFractalUUrl(actionUrl) || !details
  ) return null;

  return {
    id,
    name,
    description,
    schedule,
    location,
    ...(details.url ? { detailsUrl: details.url, detailsLabel: details.label } : {}),
    actionUrl,
    actionLabel,
  };
}

function uniqueIds(items: Array<{ id: string }>): boolean {
  return new Set(items.map(({ id }) => id)).size === items.length;
}

export function normalizeFractalUCatalog(
  value: unknown,
  localCatalog: FractalUCatalog,
): FractalUCatalog | null {
  const item = asRecord(value);
  const semester = requiredText(item?.semester);
  if (!item || !semester || !Array.isArray(item.courses) || !Array.isArray(item.clubs)) {
    return null;
  }

  const courses = item.courses.map(course);
  const clubs = item.clubs.map(club);
  if (courses.some((entry) => !entry) || clubs.some((entry) => !entry)) return null;

  const validCourses = courses as FractalUCourse[];
  const validClubs = clubs as FractalUClub[];
  if (!uniqueIds(validCourses) || !uniqueIds(validClubs)) return null;

  return {
    semester,
    sourceProvenance: localCatalog.sourceProvenance,
    courses: validCourses,
    clubs: validClubs,
  };
}

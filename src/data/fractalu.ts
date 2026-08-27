import catalogSnapshot from "@/data/fractalu-catalog.json";

/** Canonical source for the reviewed public catalog snapshot. */
export const FRACTALU_SOURCE_URL = "https://www.fractalu.nyc/";
export const FRACTALU_INFO_URL = "https://www.fractalu.nyc/info";
export const FRACTALU_SNAPSHOT_DATE = "2026-08-25";

export interface FractalUInstructor {
  name: string;
  bio: string;
}

export interface FractalUSourceProvenance {
  url: string;
  verifiedAt: string;
  lastModified: string;
  etag: string;
  byteLength: number;
  sha256: string;
}

export interface FractalUCourse {
  id: string;
  title: string;
  category: string;
  instructors: FractalUInstructor[];
  /** Ordered source names joined for the course card's single instructor label. */
  instructor: string;
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

// This is deliberately a static, reviewed snapshot. Refresh it explicitly by
// following EDITING.md; never turn this into a runtime dependency on FractalU.
const sourceCatalog = catalogSnapshot as Omit<FractalUCatalog, "courses"> & {
  courses: Omit<FractalUCourse, "instructor">[];
};

export const FRACTALU_CATALOG: FractalUCatalog = {
  ...sourceCatalog,
  courses: sourceCatalog.courses.map((course) => ({
    ...course,
    instructor: course.instructors.map(({ name }) => name).join(" & "),
  })),
};

export const FRACTALU_SOURCE_PROVENANCE = FRACTALU_CATALOG.sourceProvenance;

export const FRACTALU_CATEGORIES = [
  "All",
  ...Array.from(new Set(FRACTALU_CATALOG.courses.map(({ category }) => category))),
] as const;

export interface EducationDestination {
  id: "accelerator" | "fractalu";
  name: string;
  houseLinkLabel: string;
  url: string;
  description: string;
  action: string;
}

/**
 * Stable, date-agnostic descriptions of Education's two live destinations.
 * Cohort dates, applications, and course catalogs belong on the external sites.
 */
export const EDUCATION_DESTINATIONS: readonly EducationDestination[] = [
  {
    id: "accelerator",
    name: "Fractal AI Accelerator",
    houseLinkLabel: "Fractal AI Accelerator",
    url: "https://go.fractalaccelerator.com/fractalnycwebsite",
    description:
      "A hands-on, six-week, in-person NYC AI program for ambitious professionals.",
    action: "Visit Fractal AI Accelerator",
  },
  {
    id: "fractalu",
    name: "FractalU",
    houseLinkLabel: "Fractal University",
    url: "https://www.fractalu.nyc/",
    description:
      "An improvised college in NYC with community-run courses across arts, technology, movement, and other disciplines.",
    action: "Browse FractalU",
  },
] as const;

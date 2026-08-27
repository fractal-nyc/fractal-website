export interface EducationProgramLink {
  id: "accelerator";
  name: string;
  houseLinkLabel: string;
  url: string;
  description: string;
  action: string;
}

/**
 * Education has one program-level external destination. Fractal University is
 * rendered natively on /education from the reviewed catalog snapshot.
 */
export const EDUCATION_ACCELERATOR: EducationProgramLink = {
  id: "accelerator",
  name: "Fractal AI Accelerator",
  houseLinkLabel: "Fractal AI Accelerator",
  url: "https://go.fractalaccelerator.com/fractalnycwebsite",
  description:
    "A hands-on, six-week, in-person NYC AI program for ambitious professionals.",
  action: "Visit Fractal AI Accelerator",
};

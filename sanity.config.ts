import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemaTypes";

function requiredStudioEnv(name: "SANITY_STUDIO_PROJECT_ID" | "SANITY_STUDIO_DATASET"): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to start the local Sanity Studio. Copy .env.example to .env.local and provide the project values.`);
  }
  return value;
}

export default defineConfig({
  name: "fractal-nyc",
  title: "FractalU catalog",
  projectId: requiredStudioEnv("SANITY_STUDIO_PROJECT_ID"),
  dataset: requiredStudioEnv("SANITY_STUDIO_DATASET"),
  plugins: [
    structureTool({
      structure: (S) => S.list().title("Content").items([
        S.documentTypeListItem("fractalUSemester").title("FractalU semesters"),
        S.documentTypeListItem("fractalUCourse").title("FractalU courses"),
        S.documentTypeListItem("fractalUClub").title("FractalU clubs"),
      ]),
    }),
  ],
  schema: { types: schemaTypes },
});

export interface SanityPublicConfig {
  projectId: string;
  dataset: string;
}

export interface SanityEnvResult {
  config: SanityPublicConfig | null;
  reason?: string;
}

const PROJECT_ID = /^[a-z0-9]+$/;
const DATASET = /^[a-z0-9][a-z0-9_-]*$/;

export function getSanityPublicConfig(
  env: Record<string, string | boolean | undefined> = import.meta.env,
): SanityEnvResult {
  const projectId = typeof env.VITE_SANITY_PROJECT_ID === "string"
    ? env.VITE_SANITY_PROJECT_ID.trim()
    : "";
  const dataset = typeof env.VITE_SANITY_DATASET === "string"
    ? env.VITE_SANITY_DATASET.trim()
    : "";

  if (!projectId && !dataset) return { config: null };
  if (!projectId || !dataset) {
    return {
      config: null,
      reason: "Both VITE_SANITY_PROJECT_ID and VITE_SANITY_DATASET are required; using the local FractalU catalog.",
    };
  }
  if (!PROJECT_ID.test(projectId) || !DATASET.test(dataset)) {
    return {
      config: null,
      reason: "Sanity project or dataset has an invalid format; using the local FractalU catalog.",
    };
  }

  return { config: { projectId, dataset } };
}

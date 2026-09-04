import { FRACTALU_CATALOG, type FractalUCatalog } from "@/data/fractalu";
import { normalizeFractalUCatalog } from "@/content/normalize-fractalu";
import { createPublishedSanityClient } from "@/sanity/client";
import { getSanityPublicConfig, type SanityPublicConfig } from "@/sanity/env";
import { FRACTALU_CATALOG_QUERY } from "@/sanity/queries";
import type { FRACTALU_CATALOG_QUERYResult } from "@/sanity/sanity.types";

export async function loadPublishedFractalUCatalog(
  config?: SanityPublicConfig,
): Promise<FractalUCatalog | null> {
  const resolved = config ?? getSanityPublicConfig().config;
  if (!resolved) return null;
  const client = createPublishedSanityClient(resolved);
  const result = await client.fetch<FRACTALU_CATALOG_QUERYResult>(FRACTALU_CATALOG_QUERY);
  return normalizeFractalUCatalog(result, FRACTALU_CATALOG);
}

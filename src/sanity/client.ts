import { createClient, type SanityClient } from "@sanity/client";
import type { SanityPublicConfig } from "@/sanity/env";

export const SANITY_API_VERSION = "2026-09-03";

export function createPublishedSanityClient(config: SanityPublicConfig): SanityClient {
  return createClient({
    ...config,
    apiVersion: SANITY_API_VERSION,
    useCdn: true,
    perspective: "published",
  });
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { FRACTALU_CATALOG, type FractalUCatalog } from "@/data/fractalu";
import { getSanityPublicConfig, type SanityPublicConfig } from "@/sanity/env";

const FractalUContentContext = createContext<FractalUCatalog>(FRACTALU_CATALOG);

interface FractalUContentProviderProps {
  children: ReactNode;
  initialCatalog?: FractalUCatalog;
  env?: Record<string, string | boolean | undefined>;
  loadCatalog?: (config: SanityPublicConfig) => Promise<FractalUCatalog | null>;
}

export function FractalUContentProvider({
  children,
  initialCatalog = FRACTALU_CATALOG,
  env = import.meta.env,
  loadCatalog,
}: FractalUContentProviderProps) {
  const [catalog, setCatalog] = useState(initialCatalog);

  useEffect(() => {
    let active = true;
    const envResult = getSanityPublicConfig(env);
    if (!envResult.config) {
      if (envResult.reason && import.meta.env.DEV) {
        console.warn(`[fractalu] ${envResult.reason}`);
      }
      return () => { active = false; };
    }

    const loader = loadCatalog ?? (async (config: SanityPublicConfig) => {
      const { loadPublishedFractalUCatalog } = await import("@/sanity/load-fractalu");
      return loadPublishedFractalUCatalog(config);
    });

    void loader(envResult.config)
      .then((nextCatalog) => {
        if (active && nextCatalog) {
          setCatalog(nextCatalog);
        } else if (active && import.meta.env.DEV) {
          console.warn("[fractalu] Published catalog was invalid; using the local snapshot.");
        }
      })
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          const detail = error instanceof Error ? error.message : "unknown error";
          console.warn(`[fractalu] Published catalog unavailable; using the local snapshot (${detail}).`);
        }
      });

    return () => { active = false; };
  }, [env, loadCatalog]);

  return (
    <FractalUContentContext.Provider value={catalog}>
      {children}
    </FractalUContentContext.Provider>
  );
}

export function useFractalUContent(): FractalUCatalog {
  return useContext(FractalUContentContext);
}

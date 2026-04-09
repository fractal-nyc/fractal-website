import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";

/**
 * Inline plugin: after the build finishes, read `dist/.vite/manifest.json`,
 * walk the entry chunk plus the FractalCityScene dynamic import chunk's
 * transitive static imports, and inject `<link rel="modulepreload">` tags
 * into `dist/index.html` so the browser starts fetching them during HTML
 * parse (rather than waiting for the entry script to parse and execute the
 * `lazy()` call). The three-vendor chunk is discovered via the manifest —
 * no hardcoded filenames.
 *
 * FRAC-146 will walk the same manifest to emit Netlify `_headers`
 * `Link: rel=preload` headers; the manifest is the shared contract.
 */
function injectModulePreload(): Plugin {
  return {
    name: "fractal-inject-modulepreload",
    apply: "build",
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, "dist");
      const manifestPath = path.join(distDir, ".vite", "manifest.json");
      const htmlPath = path.join(distDir, "index.html");
      if (!fs.existsSync(manifestPath) || !fs.existsSync(htmlPath)) {
        this.warn(
          `[inject-modulepreload] Skipping: manifest or index.html missing (manifest=${fs.existsSync(manifestPath)}, html=${fs.existsSync(htmlPath)})`,
        );
        return;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Record<
        string,
        {
          file: string;
          isEntry?: boolean;
          isDynamicEntry?: boolean;
          imports?: string[];
          dynamicImports?: string[];
        }
      >;

      // Walk from a starting manifest key and collect every chunk reachable
      // via static `imports`. We do NOT descend into `dynamicImports` by
      // default — those are the lazy boundaries we want to keep lazy, except
      // for the one dynamic entry we explicitly want to preload.
      const wanted = new Set<string>();
      const visit = (key: string) => {
        const entry = manifest[key];
        if (!entry || wanted.has(entry.file)) return;
        wanted.add(entry.file);
        for (const imp of entry.imports ?? []) visit(imp);
      };

      const entryKey = Object.keys(manifest).find((k) => manifest[k].isEntry);
      if (entryKey) visit(entryKey);

      // Pull in the dynamic FractalCityScene chunk + its transitive static
      // imports (which will include three-vendor once we split it).
      const sceneKey = Object.keys(manifest).find(
        (k) => manifest[k].isDynamicEntry && k.includes("FractalCityScene"),
      );
      if (sceneKey) visit(sceneKey);

      // Build the modulepreload tags. Skip the entry itself — Vite already
      // emits a <script type="module"> for it.
      const entryFile = entryKey ? manifest[entryKey].file : null;
      const preloadFiles = [...wanted].filter((f) => f !== entryFile);
      if (preloadFiles.length === 0) {
        this.warn(
          "[inject-modulepreload] No preload targets found in manifest — something is wrong with the walk.",
        );
        return;
      }
      const html = fs.readFileSync(htmlPath, "utf8");

      // Vite auto-injects modulepreload tags for the entry chunk's STATIC
      // imports (e.g. react-vendor, vite-preload-helper). We must NOT
      // duplicate those — only add tags for files Vite hasn't already
      // preloaded. The key addition from this plugin is the dynamic
      // FractalCityScene chunk plus its transitive three-vendor dep, which
      // Vite will NOT auto-preload because dynamic imports are lazy by
      // design.
      const alreadyPreloaded = new Set<string>();
      const preloadRegex = /<link[^>]*rel="modulepreload"[^>]*href="\/([^"]+)"/g;
      for (const m of html.matchAll(preloadRegex)) {
        alreadyPreloaded.add(m[1]);
      }

      const newFiles = preloadFiles.filter((f) => !alreadyPreloaded.has(f));
      if (newFiles.length === 0) {
        // Nothing to add — Vite already covered everything. No-op is fine.
        return;
      }

      const tags = newFiles
        .map((f) => `    <link rel="modulepreload" crossorigin href="/${f}">`)
        .join("\n");

      // Insert immediately before the existing <script type="module"> tag so
      // the preload hints are in <head> and discovered during HTML parse.
      const rewritten = html.replace(
        /(\s*)<script type="module"/,
        `\n${tags}$1<script type="module"`,
      );

      if (rewritten === html) {
        throw new Error(
          "[inject-modulepreload] Failed to inject modulepreload tags into dist/index.html — the <script type=\"module\"> anchor was not found. Has Vite's emitted HTML shape changed?",
        );
      }

      fs.writeFileSync(htmlPath, rewritten);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectModulePreload()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Route three + three-stdlib + @react-three/* into a single
          // three-vendor chunk so the scene chunk stays small and
          // independently cacheable. pnpm-aware: handles both the npm
          // layout (node_modules/<pkg>/...) and the pnpm layout
          // (node_modules/.pnpm/<pkg>@<ver>/node_modules/<pkg>/...).
          //
          // NOTE on Rollup shared-code placement: @react-three/drei uses
          // a dynamic `import("hls.js")` inside VideoTexture, which forces
          // Rollup to generate a `__vitePreload` helper (the virtual
          // `\0vite/preload-helper.js` module). The entry chunk ALSO needs
          // `__vitePreload` for `lazy(() => import("FractalCityScene"))`.
          // Without intervention, Rollup parks the helper in three-vendor
          // and the entry chunk ends up statically importing three-vendor
          // to pull the helper back out — which eagerly loads the entire
          // 900KB three-vendor chunk on first paint, defeating the whole
          // split. Isolating the helper into its own tiny chunk breaks the
          // cycle: both the entry and three-vendor pull it from there, and
          // neither becomes a static dependency of the other.
          if (id.includes("vite/preload-helper")) {
            return "vite-preload-helper";
          }

          if (!id.includes("node_modules")) return;

          // React runtime (and its close shims) into their own chunk so
          // they do NOT get absorbed into three-vendor when drei/fiber
          // transitively reference them. Without this carve-out, Rollup
          // promotes React (and shims like use-sync-external-store, which
          // is transitively depended on by BOTH wouter and drei/fiber)
          // into three-vendor, and the entry chunk ends up statically
          // importing three-vendor just to get those symbols back — which
          // eagerly loads all 900KB of three code on first paint and
          // defeats the lazy split entirely.
          if (
            /[\\/]node_modules[\\/](?:\.pnpm[\\/][^\\/]*[\\/]node_modules[\\/])?(react|react-dom|scheduler|react-reconciler|use-sync-external-store)[\\/]/.test(
              id,
            )
          ) {
            return "react-vendor";
          }

          if (
            /[\\/]node_modules[\\/](?:\.pnpm[\\/][^\\/]*[\\/]node_modules[\\/])?(three|three-stdlib|@react-three[\\/][^\\/]+)[\\/]/.test(
              id,
            )
          ) {
            return "three-vendor";
          }
        },
      },
    },
  },
});

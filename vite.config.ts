import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import fs from "node:fs";

/**
 * Inline plugin: after the build finishes, read `dist/.vite/manifest.json`,
 * walk the entry chunk plus the FractalCityScene dynamic import chunk's
 * transitive static imports, and produce TWO outputs from the same walk:
 *
 *   1. Inject `<link rel="modulepreload">` tags into `dist/index.html` so
 *      the browser starts fetching chunks during HTML parse (rather than
 *      waiting for the entry script to parse and execute `lazy()`). The
 *      three-vendor chunk is discovered via the manifest — no hardcoded
 *      filenames. (FRAC-147)
 *
 *   2. Emit `dist/_headers` with `Link: rel=preload` entries for the same
 *      manifest-walked chunks plus a static `as=image` preload for
 *      `hero-poster.jpg`. On Netlify these land as HTTP response headers,
 *      which arrive earlier in the critical path than in-HTML preload
 *      tags. On Netlify Pro, the platform auto-converts them into 103
 *      Early Hints that fire BEFORE the HTML 200 response. On the free
 *      tier the same headers still work — they just arrive with the 200.
 *      (FRAC-146)
 *
 * The HTML tags and `_headers` Link entries are derived from the SAME
 * `wanted` Set inside this hook so they cannot drift. If a future refactor
 * splits these two outputs into separate plugins, the manifest walk must
 * be extracted to a shared helper or the two outputs will silently
 * diverge. See FRAC-146 plan file for the rationale.
 *
 * COLLISION WARNING: if a future task ever adds a `public/_headers` file,
 * Vite will copy it verbatim to `dist/_headers` during build, and this
 * plugin will then overwrite it. If that becomes a real concern, switch
 * this code to append-if-exists. Today we overwrite because nothing else
 * produces `dist/_headers`. (FRAC-146 open risk.)
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

      // HTML rewrite: only if there are un-preloaded files to add. If
      // Vite already covered everything in its auto-emitted tags, skip
      // the HTML mutation — but still fall through to the _headers
      // generation below, which is a separate concern from HTML dedupe.
      if (newFiles.length > 0) {
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
      }

      // -----------------------------------------------------------------
      // FRAC-146: Emit dist/_headers with Link: rel=preload entries for
      // the same manifest-walked chunks, plus hero-poster.jpg.
      //
      // NOTE on dedupe divergence from the HTML branch above:
      // The HTML branch uses `newFiles` — a set filtered to exclude chunks
      // Vite ALREADY emitted `<link rel="modulepreload">` tags for (to
      // avoid duplicate tags in the HTML <head>). That filter is
      // HTML-specific: Vite's auto-emitted modulepreload tags live only
      // in the HTML body. They do NOT appear in HTTP response headers,
      // so there is nothing to deduplicate against on the headers side.
      //
      // Therefore `_headers` uses the UNFILTERED `preloadFiles` set: the
      // full transitive walk (entry's static imports + FractalCityScene
      // dynamic chunk + its transitive deps, minus the entry file itself).
      // This means the headers will cover e.g. react-vendor and
      // vite-preload-helper even though Vite's HTML already preloads
      // them — which is correct, because the headers are the ONLY
      // preload signal the browser has before the HTML body is parsed
      // (and, on Netlify Pro, before the HTML 200 response at all via
      // 103 Early Hints).
      //
      // COLLISION WARNING (repeated from plugin-top JSDoc): if
      // public/_headers ever exists, Vite copies it to dist/_headers
      // during build and THIS writeFileSync will overwrite it. Switch
      // to append-if-exists if that becomes a real problem.
      // -----------------------------------------------------------------
      const headersPath = path.join(distDir, "_headers");
      const scriptLinks = preloadFiles
        .map((f) => `  Link: </${f}>; rel=preload; as=script; crossorigin`)
        .join("\n");
      // hero-poster.jpg is a static public/ asset (NOT in the Rollup
      // manifest), hardcoded here. If FRAC-145's poster path ever
      // changes, update this line to match. See
      // src/components/sections/Hero.tsx (the <img> tag rendered before
      // FractalCityScene mounts) for the source of truth on the path.
      // No `crossorigin` on the image preload: the <img> tag has no
      // crossorigin attribute, so adding it here would cause a
      // double-fetch.
      const imageLink = `  Link: </images/hero-poster.jpg>; rel=preload; as=image`;
      const headersBody = `/*\n${scriptLinks}\n${imageLink}\n`;
      fs.writeFileSync(headersPath, headersBody);
      this.info(
        `[inject-modulepreload] Wrote dist/_headers with ${preloadFiles.length} script preload(s) + 1 image preload.`,
      );
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

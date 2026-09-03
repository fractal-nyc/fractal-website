import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createReadStream, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";

const mimeTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function serveImagesFrom(root: string) {
  return (request: IncomingMessage, response: ServerResponse, next: () => void) => {
    const pathname = decodeURIComponent((request.url ?? "").split("?", 1)[0]);
    const candidate = path.resolve(root, `.${pathname}`);
    if (!candidate.startsWith(`${root}${path.sep}`)) return next();
    try {
      if (!statSync(candidate).isFile()) return next();
    } catch {
      return next();
    }
    response.setHeader("Content-Type", mimeTypes[path.extname(candidate).toLowerCase()] ?? "application/octet-stream");
    createReadStream(candidate).pipe(response);
  };
}

const publicImages = path.resolve(import.meta.dirname, "public/images");
const builtImages = path.resolve(import.meta.dirname, "dist-components/images");
const catalogPublicAssets = {
  name: "catalog-public-assets",
  configureServer(server: { middlewares: { use: (route: string, handler: ReturnType<typeof serveImagesFrom>) => void } }) {
    server.middlewares.use("/images", serveImagesFrom(publicImages));
  },
  configurePreviewServer(server: { middlewares: { use: (route: string, handler: ReturnType<typeof serveImagesFrom>) => void } }) {
    server.middlewares.use("/images", serveImagesFrom(builtImages));
  },
};

export default defineConfig({
  root: path.resolve(import.meta.dirname, "components"),
  base: "/components/",
  publicDir: path.resolve(import.meta.dirname, "public"),
  plugins: [catalogPublicAssets, react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist-components"),
    emptyOutDir: true,
  },
});

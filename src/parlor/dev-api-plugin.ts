import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

/**
 * `pnpm dev` is Vite, which does not serve the Vercel `/api` folder.
 * This middleware answers `/api/parlor` with the same handler the deployment uses.
 */
export function parlorDevApi(): Plugin {
  const middleware = async (
    req: IncomingMessage,
    res: ServerResponse,
    next: (error?: unknown) => void,
  ) => {
    const url = req.url ?? "";
    if (!url.startsWith("/api/parlor")) {
      next();
      return;
    }
    try {
      const { handleNodeParlor } = await import("./node-adapter");
      await handleNodeParlor(req, res);
    } catch (error) {
      next(error);
    }
  };

  return {
    name: "parlor-dev-api",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

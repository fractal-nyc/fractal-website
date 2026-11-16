import { handleNodeParlor, handleParlorRequest } from "./handler.mjs";

function failure(error) {
  console.error(error);
  const message = error instanceof Error ? error.message : String(error);
  return JSON.stringify({ error: message });
}

/**
 * Vercel invokes this with either a Web Request or the Node (req, res) pair.
 * The bundled handler is plain ESM so the function does not have to compile
 * the TypeScript under src/parlor at runtime.
 */
export default async function handler(req, res) {
  try {
    if (typeof Request !== "undefined" && req instanceof Request) {
      return handleParlorRequest(req);
    }
    await handleNodeParlor(req, res);
  } catch (error) {
    const body = failure(error);
    if (res && typeof res.end === "function" && !res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(body);
      return;
    }
    return new Response(body, {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

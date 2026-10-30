import type { IncomingMessage, ServerResponse } from "node:http";

import { handleParlorRequest } from "./http";

type NodeRequest = IncomingMessage & { body?: unknown };

const SKIP_HEADERS = new Set(["host", "connection", "content-length", "transfer-encoding"]);

async function rawBody(req: NodeRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length > 0 && Buffer.concat(chunks).length > 0) return Buffer.concat(chunks);
  if (typeof req.body === "string") return Buffer.from(req.body);
  if (req.body != null && typeof req.body === "object") return Buffer.from(JSON.stringify(req.body));
  return Buffer.alloc(0);
}

/**
 * Shared by the Vite dev server and the Vercel Node function. The catch-all
 * rewrite in vercel.json must not swallow `/api/parlor`, and this adapter is
 * what actually answers it.
 */
export async function handleNodeParlor(req: NodeRequest, res: ServerResponse): Promise<void> {
  const host = req.headers.host ?? "localhost";
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwarded) ? forwarded[0] : forwarded) ?? "http";
  const url = new URL(req.url ?? "/", `${proto}://${host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null || SKIP_HEADERS.has(key.toLowerCase())) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else {
      headers.set(key, value);
    }
  }
  const method = req.method ?? "GET";
  const body = method === "GET" || method === "HEAD" ? undefined : await rawBody(req);
  const request = new Request(url, {
    method,
    headers,
    body: body && body.byteLength > 0 ? new Uint8Array(body) : undefined,
  });
  const response = await handleParlorRequest(request);
  res.statusCode = response.status;
  const cookies = response.headers.getSetCookie?.() ?? [];
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") return;
    res.setHeader(key, value);
  });
  if (cookies.length > 0) res.setHeader("set-cookie", cookies);
  res.end(Buffer.from(await response.arrayBuffer()));
}

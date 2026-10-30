import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  get,
  put,
} from "@vercel/blob";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

import { createSeed } from "./seed";
import type { ParlorState, StoreInfo } from "./types";

export type ParlorStore = {
  read(): Promise<ParlorState>;
  write(update: (state: ParlorState) => ParlorState): Promise<ParlorState>;
};

/**
 * Persistence order:
 * 1. `PARLOR_STORE=file` always uses the local JSON file.
 * 2. `DATABASE_URL` or `POSTGRES_URL` uses Neon (preferred once connected).
 * 3. `BLOB_READ_WRITE_TOKEN` uses the private Blob store already linked to this project.
 * 4. Otherwise a JSON file — durable in `pnpm dev`, ephemeral on Vercel.
 */
export function databaseUrl(): string | null {
  const value = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  return value.trim() ? value.trim() : null;
}

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export function storeDriver(): "postgres" | "blob" | "file" {
  if (process.env.PARLOR_STORE === "file") return "file";
  if (databaseUrl()) return "postgres";
  if (blobConfigured()) return "blob";
  return "file";
}

export function storeInfo(): StoreInfo {
  const driver = storeDriver();
  if (driver === "postgres") {
    return {
      driver,
      persistent: true,
      note: "Responses are saved to Neon Postgres.",
    };
  }
  if (driver === "blob") {
    return {
      driver,
      persistent: true,
      note: "Responses are saved to a private Vercel Blob.",
    };
  }
  const persistent = !process.env.VERCEL;
  return {
    driver,
    persistent,
    note: persistent
      ? "Responses are saved in a local file (.data/parlor.json). See docs/parlor.md for the Vercel store."
      : "This deployment has no ledger store, so a response can disappear when the function sleeps.",
  };
}

function filePath(): string {
  if (process.env.PARLOR_DATA_FILE) return process.env.PARLOR_DATA_FILE;
  if (process.env.VERCEL) return "/tmp/parlor-state.json";
  return path.join(process.cwd(), ".data", "parlor.json");
}

function parseState(value: unknown): ParlorState {
  const doc = typeof value === "string" ? (JSON.parse(value) as unknown) : value;
  if (!doc || typeof doc !== "object") throw new Error("Parlor ledger is unreadable.");
  const state = doc as ParlorState;
  if (state.schemaVersion !== 1 || !Array.isArray(state.guests) || !state.event?.name) {
    throw new Error("Parlor ledger is unreadable.");
  }
  return state;
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const run = queue.then(work, work);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function fileStore(): ParlorStore {
  const file = filePath();

  async function persist(state: ParlorState): Promise<void> {
    await mkdir(path.dirname(file), { recursive: true });
    const temporary = `${file}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(state, null, 2));
    await rename(temporary, file);
  }

  async function read(): Promise<ParlorState> {
    try {
      return parseState(await readFile(file, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const seed = createSeed();
      await persist(seed);
      return seed;
    }
  }

  return {
    read: () => enqueue(read),
    write: (update) =>
      enqueue(async () => {
        const current = await read();
        const next = update(structuredClone(current));
        next.version = current.version + 1;
        await persist(next);
        return next;
      }),
  };
}

type Sql = NeonQueryFunction<false, false>;

let sqlSingleton: Sql | null = null;
let schemaReady: Promise<void> | null = null;

function sql(): Sql {
  if (!sqlSingleton) {
    const url = databaseUrl();
    if (!url) throw new Error("DATABASE_URL is not set.");
    sqlSingleton = neon(url);
  }
  return sqlSingleton;
}

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql().query(
        `CREATE TABLE IF NOT EXISTS parlor_state (
          id text PRIMARY KEY,
          version integer NOT NULL,
          doc jsonb NOT NULL
        )`,
      );
      const seed = createSeed();
      await sql().query(
        `INSERT INTO parlor_state (id, version, doc)
         VALUES ('current', $1, $2::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [seed.version, JSON.stringify(seed)],
      );
    })().catch((error: unknown) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

async function readRow(): Promise<ParlorState> {
  await ensureSchema();
  const rows = await sql().query("SELECT version, doc FROM parlor_state WHERE id = 'current'");
  const row = rows[0] as { version: number; doc: unknown } | undefined;
  if (!row) throw new Error("Parlor ledger is missing.");
  const state = parseState(row.doc);
  state.version = Number(row.version);
  return state;
}

function postgresStore(): ParlorStore {
  return {
    read: () => enqueue(readRow),
    write: (update) =>
      enqueue(async () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const current = await readRow();
          const next = update(structuredClone(current));
          next.version = current.version + 1;
          const rows = await sql().query(
            `UPDATE parlor_state
             SET version = $1, doc = $2::jsonb
             WHERE id = 'current' AND version = $3
             RETURNING version`,
            [next.version, JSON.stringify(next), current.version],
          );
          if (rows.length > 0) return next;
        }
        throw new Error("The ledger was busy. Try again.");
      }),
  };
}

const BLOB_PATH = "parlor/state.json";

/** Blob GET returns a quoted HTTP etag. Conditional puts want the bare value. */
function normalizeEtag(etag: string): string {
  const weak = etag.trim().replace(/^W\//, "");
  if (weak.startsWith('"') && weak.endsWith('"')) return weak.slice(1, -1);
  return weak;
}

function blobStore(): ParlorStore {
  async function loadBlob(): Promise<{ state: ParlorState; etag: string } | null> {
    try {
      const result = await get(BLOB_PATH, { access: "private", useCache: false });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      const text = await new Response(result.stream).text();
      return { state: parseState(text), etag: normalizeEtag(result.blob.etag) };
    } catch (error) {
      if (error instanceof BlobNotFoundError) return null;
      throw error;
    }
  }

  async function readBlob(): Promise<{ state: ParlorState; etag: string }> {
    const existing = await loadBlob();
    if (existing) return existing;
    const seed = createSeed();
    try {
      const saved = await put(BLOB_PATH, JSON.stringify(seed), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: false,
        cacheControlMaxAge: 60,
      });
      return { state: seed, etag: normalizeEtag(saved.etag) };
    } catch (error) {
      const raced = await loadBlob();
      if (raced) return raced;
      throw error;
    }
  }

  return {
    read: () => enqueue(async () => (await readBlob()).state),
    write: (update) =>
      enqueue(async () => {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const current = await readBlob();
          const next = update(structuredClone(current.state));
          next.version = current.state.version + 1;
          const conditional = attempt < 4 && current.etag.length > 0;
          try {
            await put(BLOB_PATH, JSON.stringify(next), {
              access: "private",
              contentType: "application/json",
              addRandomSuffix: false,
              allowOverwrite: true,
              ...(conditional ? { ifMatch: current.etag } : {}),
              cacheControlMaxAge: 60,
            });
            return next;
          } catch (error) {
            if (error instanceof BlobPreconditionFailedError) continue;
            throw error;
          }
        }
        throw new Error("The ledger was busy. Try again.");
      }),
  };
}

let cached: ParlorStore | null = null;

export function getStore(): ParlorStore {
  if (!cached) {
    const driver = storeDriver();
    cached = driver === "postgres" ? postgresStore() : driver === "blob" ? blobStore() : fileStore();
  }
  return cached;
}

/** Tests swap the data file and must not reuse a store built for the last path. */
export function resetStoreForTests(): void {
  cached = null;
  sqlSingleton = null;
  schemaReady = null;
  queue = Promise.resolve();
}

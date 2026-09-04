import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { buildSeed } from "./build-seed";

const outputPath = resolve(process.cwd(), process.argv[2] ?? ".sanity/seed.ndjson");
const result = buildSeed();
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, result.ndjson, "utf8");
console.log(JSON.stringify({ outputPath, checksum: result.checksum, counts: result.counts }));

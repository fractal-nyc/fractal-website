import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
if (!fs.existsSync(dist)) throw new Error("dist/ is missing. Run pnpm build first.");
const forbidden = ["Education Content Workshop", "Local draft — not saved to the website", "Fractal NYC Component Library", "components/ComponentLibraryApp"];
const files = [];
const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (/\.(?:html|js|css|json)$/.test(entry.name)) files.push(target);
  }
};
visit(dist);
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  for (const needle of forbidden) if (source.includes(needle)) throw new Error(`Production leakage: ${needle} found in ${path.relative(root, file)}`);
}
console.log(`Production bundle is clean: checked ${files.length} files.`);

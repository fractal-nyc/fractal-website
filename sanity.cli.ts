import { defineCliConfig } from "sanity/cli";

// Project/dataset resolution lives in sanity.config.ts. Sanity loads this CLI
// file before it hydrates `.env.local`, so a top-level environment assertion
// here would reject valid local configuration before the Studio config runs.
export default defineCliConfig({
  typegen: {
    path: "./src/**/*.{ts,tsx}",
    schema: "./.sanity/schema.json",
    generates: "./src/sanity/sanity.types.ts",
  },
});

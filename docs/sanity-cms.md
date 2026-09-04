# FractalU Sanity CMS

Sanity is an optional editing surface for the FractalU semester, course cards, and club cards on `/education`. Every other page and every other part of the Education page remains code-owned. The checked-in `src/data/fractalu-catalog.json` snapshot remains the synchronous first render and complete fallback.

## Local configuration

Copy `.env.example` to the ignored `.env.local` and set both pairs:

```sh
SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=production
VITE_SANITY_PROJECT_ID=your-project-id
VITE_SANITY_DATASET=production
```

The `SANITY_STUDIO_*` values configure local Studio/CLI commands. The `VITE_SANITY_*` values enable the browser reader. Browser reads are tokenless, use the published perspective and CDN, and never accept a token in a `VITE_*` variable. Missing, partial, or malformed public configuration disables CMS reads.

The current host must provide the two `VITE_SANITY_*` variables at build time if the deployed site should read the published catalog. Without them, the deployed app intentionally uses the checked-in snapshot.

## Commands

```sh
pnpm sanity:studio      # start the local FractalU-only Studio
pnpm sanity:typecheck   # typecheck Studio, schemas, and seed code
pnpm sanity:typegen     # extract the schema and refresh checked-in query types
pnpm sanity:seed        # write deterministic .sanity/seed.ndjson
pnpm exec sanity build  # validate a production Studio build locally
```

Studio exposes only three document lists: semesters, courses, and clubs. Create one visible semester, associate each course and club with it, and use `displayOrder` plus `visible` to control the catalog. Categories are editorial text and automatically populate the existing course filter. Course instructor records remain ordered so the site can derive the combined instructor label while preserving separate biographies.

## Runtime and fallback behavior

The Education page renders the local catalog immediately. With valid public configuration it then fetches the first visible semester by display order and that semester's visible courses and clubs. Returned cards are ordered by `displayOrder` and stable key.

The remote response is validated as one atomic catalog. Missing fields, duplicate keys, unsafe URLs, malformed instructor records, request failures, or a missing semester keep the complete local snapshot in place. Remote and local records are never merged. Empty course or club arrays are valid, allowing editors to hide every record of one kind.

When a reviewed catalog change must become the fallback, update `src/data/fractalu-catalog.json` through the existing snapshot-refresh workflow, review the diff, and regenerate the seed. The local snapshot's provenance remains code-owned and is not stored in Sanity.

## Seed and remote-state boundary

`pnpm sanity:seed` performs a pure local export. It writes one semester plus the checked-in courses and clubs, prints counts and a SHA-256 checksum, and makes no network request. Repeated runs from the same checkout must print the same checksum.

Importing the generated NDJSON, changing CORS, provisioning a project or dataset, inviting editors, deploying Studio, configuring a hosting service, or publishing this repository are separate outward-facing actions. Do not run `sanity dataset import`, deploy, or mutate remote Sanity/hosting state without explicit human approval for that exact action.

## What stays code-owned

Education hero and informational copy, headings, filters, markup, actions outside cards, styles, layout, responsive behavior, accessibility, animation, routes, palettes, and all non-FractalU content continue to be edited in their existing source files. See `EDITING.md` for those locations.

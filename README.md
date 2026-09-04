# Fractal NYC

Community site for Fractal NYC — a network of coliving houses, a campus, events, education, an accelerator, and a library in Brooklyn. React + TypeScript + Vite, Tailwind CSS 4, Three.js for the homepage hero. Deployed on Vercel.

**Pages:** `/` (homepage, includes the Story section), `/campus`, `/co-living`, `/education`, `/events`, `/library`, `/political-club`, `/people`, `/the-protocol`. **Education** is the first-party Fractal University home: its public catalog and information portal live natively on `/education` in a Library-style archive. Accelerator data and redirects remain available for its future dedicated destination, but the page has no standalone Accelerator promotion. (Old paths redirect internally: `/story`→`/`, `/visit`→`/co-living`, `/publications`→`/library`, `/neighborhood`→`/co-living`, `/lab`→`/library`, and both `/accelerator` and `/new-liberal-arts`→`/education`.)

## Where to start

- **Editing copy, data, or images?** → [`EDITING.md`](./EDITING.md). Sitemap of every page → section → file, plus prompt patterns for common edits.
- **Editing the FractalU Course Catalog?** → [`docs/sanity-cms.md`](./docs/sanity-cms.md). Focused local setup, fallback behavior, TypeGen, and deterministic seed workflow.
- **Working in the code (developer or AI agent)?** → [`AGENTS.md`](./AGENTS.md) — **start here.** The universal, tool-agnostic rulebook: repo structure, tech stack, commands, house rules, `DESIGN.md` conformance, safety rules, and the **Lattice** work-tracking protocol (every change gets a tracked task, branch, and PR).
- **Testing or checking responsive behavior?** → [`TESTING.md`](./TESTING.md). Labeled test catalog, exact commands, viewport/native-device coverage, evidence locations, and guidance for adding regressions.
- **Looking up tokens / type / colors / components?** → [`DESIGN.md`](./DESIGN.md). The canonical design system.
- **Want to pick or preview a reusable component?** → [`docs/component-library.md`](./docs/component-library.md). Teammates can use the protected Vercel Preview linked from its PR; technical users can also run the catalog locally.
- **Using Claude Code?** → [`CLAUDE.md`](./CLAUDE.md) is a thin entry point that `@import`s `AGENTS.md` (Claude doesn't auto-load `AGENTS.md`). All real rules live in `AGENTS.md`.

## Run locally

```sh
pnpm install
pnpm dev        # dev server at http://localhost:5173
pnpm components # team-only visual component gallery and Education editor at http://localhost:5173/components/
```

Other commands:

```sh
pnpm build      # production build to dist/
pnpm serve      # preview the production build
pnpm typecheck  # TypeScript check
pnpm test       # vitest suite
pnpm sanity:seed      # validate + generate local NDJSON (no remote mutation)
pnpm sanity:studio    # local Studio; requires SANITY_STUDIO_* values
pnpm typecheck:components # type-check the separate catalog
pnpm build:components     # build only the catalog to dist-components/
pnpm check:components-browser # verify catalog interactions, colorways, and migrated pages
```

Responsive and native-mobile verification:

```sh
pnpm test:e2e:fast              # representative Chromium responsive matrix
pnpm test:e2e:full              # all profiles across Chromium, Firefox, WebKit
pnpm simulators:doctor          # check Android/iOS simulator prerequisites
pnpm test:e2e:android-emulator  # native Android Chrome profiles
pnpm test:e2e:ios-simulator     # native Apple Safari profiles
```

See [`TESTING.md`](./TESTING.md) before choosing a lane: it explains the fidelity differences, full file catalog, prerequisites, and evidence output.

## Structure

```
.
├── components/             Team-only interactive component catalog and Education workshop
├── TESTING.md              Test layers, file catalog, commands, and evidence
├── index.html               Entry HTML: title, font loading, image preloads
├── src/
│   ├── App.tsx              Routes
│   ├── index.css            Design tokens, global type rules, semantic utilities
│   ├── pages/               One file per route
│   ├── components/
│   │   ├── content/         Shared cards, callouts, filters, links, color scope
│   │   ├── sections/        Page sections (Hero, Campus, Education, …)
│   │   ├── house/           House banners, pennants, Mandelbrot icon
│   │   ├── three/           OctahedronHero 3D scene
│   │   ├── layout/          Navbar, Footer, SectorHeader
│   │   ├── publications/    Publications archive (search, grid, badges)
│   │   └── ui/              shadcn primitives + brand components
│   ├── content/             Focused FractalU provider and atomic normalization
│   ├── sanity/              Tokenless FractalU query/client and checked-in types
│   └── data/
│       ├── houses.ts        Houses + people — names, taglines, descriptions, palettes
│       ├── publications-documents.ts Publications archive entries
│       └── storyPhotos.ts   Story page gallery
├── public/images/           Hero, banner, campus, and story images
├── tests/e2e/               Playwright responsive, Hero, and visual suites
├── scripts/
│   ├── mobile-simulators/   Appium/WebdriverIO Android and Apple harness
│   ├── sanity/              Deterministic local seed builder/writer
│   └── *.mjs                Conformance and asset pipelines
├── sanity/                  FractalU-only local Studio schemas
├── sanity.config.ts         Focused Studio configuration and structure
└── vercel.json              Vercel build + SPA rewrite config
```

## Brand system

Locked. Cream and charcoal, italic Fraunces headings, JetBrains Mono body, six houses each with a `{light, deep}` color pair. The canonical system lives in [`DESIGN.md`](./DESIGN.md); `src/index.css` and `src/data/houses.ts` are the runtime mirrors — edit `DESIGN.md` first and propagate per [`AGENTS.md`](./AGENTS.md). Never hand-paste hex values.

# Fractal NYC

Community site for Fractal NYC — a network of coliving houses, a campus, events, education, an accelerator, and a library in Brooklyn. React + TypeScript + Vite, Tailwind CSS 4, Three.js for the homepage hero. Deployed on Vercel.

**Pages:** `/` (homepage, includes the Story section), `/campus`, `/co-living`, `/events`, `/library`, `/political-club`, `/people`, `/the-protocol`. The **Accelerator** and **FractalU** (formerly Education) sectors have no internal page — the nav and octahedron link out to `https://www.fractalaccelerator.com/` and `https://www.fractalu.nyc/` (new tab). (Old paths redirect: `/story`→`/`, `/visit`→`/co-living`, `/publications`→`/library`, plus the legacy `/neighborhood`; `/accelerator`, `/education`, and `/new-liberal-arts` external-redirect to the sites above; `/lab`→`/library`.)

## Where to start

- **Editing copy, data, or images?** → [`EDITING.md`](./EDITING.md). Sitemap of every page → section → file, plus prompt patterns for common edits.
- **Working in the code (developer or AI agent)?** → [`AGENTS.md`](./AGENTS.md) — **start here.** The universal, tool-agnostic rulebook: repo structure, tech stack, commands, house rules, `DESIGN.md` conformance, safety rules, and the **Lattice** work-tracking protocol (every change gets a tracked task, branch, and PR).
- **Looking up tokens / type / colors / components?** → [`DESIGN.md`](./DESIGN.md). The canonical design system.
- **Using Claude Code?** → [`CLAUDE.md`](./CLAUDE.md) is a thin entry point that `@import`s `AGENTS.md` (Claude doesn't auto-load `AGENTS.md`). All real rules live in `AGENTS.md`.

## Run locally

```sh
pnpm install
pnpm dev        # dev server at http://localhost:5173
```

Other commands:

```sh
pnpm build      # production build to dist/
pnpm serve      # preview the production build
pnpm typecheck  # TypeScript check
pnpm test       # vitest suite
```

## Structure

```
.
├── index.html               Entry HTML: title, font loading, image preloads
├── src/
│   ├── App.tsx              Routes
│   ├── index.css            Design tokens, global type rules, semantic utilities
│   ├── pages/               One file per route
│   ├── components/
│   │   ├── sections/        Page sections (Hero, Campus, Education, …)
│   │   ├── house/           House banners, pennants, Mandelbrot icon
│   │   ├── three/           OctahedronHero 3D scene
│   │   ├── layout/          Navbar, Footer, SectorHeader
│   │   ├── publications/    Publications archive (search, grid, badges)
│   │   └── ui/              shadcn primitives + brand components
│   └── data/
│       ├── houses.ts        Houses + people — names, taglines, descriptions, palettes
│       ├── publications-documents.ts Publications archive entries
│       └── storyPhotos.ts   Story page gallery
├── public/images/           Hero, banner, campus, and story images
├── scripts/                 Asset pipelines (hero bg, favicon, banner compression)
└── netlify.toml             Build + SPA redirect config
```

## Brand system

Locked. Cream and charcoal, italic Fraunces headings, JetBrains Mono body, six houses each with a `{light, deep}` color pair. The canonical system lives in [`DESIGN.md`](./DESIGN.md); `src/index.css` and `src/data/houses.ts` are the runtime mirrors — edit `DESIGN.md` first and propagate per [`AGENTS.md`](./AGENTS.md). Never hand-paste hex values.

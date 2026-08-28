# Fractal NYC component library

This is the durable naming and editing guide for the separate, team-only interactive component document. It is not a public route, is not linked from the site, and is excluded from the normal production build.

## Open the interactive document

```sh
pnpm install
pnpm components
```

Open `http://localhost:5173/components/`. Search by a human term such as “note,” “article,” “class,” “outsource link,” or by a technical component name. Use the global Color Pairing and Surface controls to preview themeable specimens. Each live specimen shows only the content, state, size, and layout controls that its production component actually supports; reference-only components deliberately show no fake controls. The catalog imports the real production components and `src/index.css`; it does not maintain a duplicate mock component set or token file.

Build and verify it independently with:

```sh
pnpm typecheck:components
pnpm build:components
```

The output is `dist-components/`. Normal `pnpm build` still produces only the public site in `dist/`.

## Stable plain-English names

Use these names in requests to designers, editors, or agents:

- Foundations: **Color Pairing**, **Type Style**, **Page Frame**, **Reading Column**, **Standard Section Frame**, **Wide Card Grid**, **Section Header**, **Site Navigation**, **Site Footer Marker**.
- Actions: **Action Button** (Primary, Outline, Quiet/Ghost, Inline), **Outbound Link**, **Archive Search Field**, **Filter Chip**, **Filter Group**, **Filter Results Summary**, **Empty Results Message**, **Archive Filter Group**, **Library Tag Filter**, **Course Subject Filter**, **Icon Button / Carousel Control**.
- Containers: **Content Card**, **Library Article Card**, **Library Article Grid**, **Note / Callout Card**, **Course Card**, **Course Fact Grid**, **Metadata / Facts List**, **Amenity List**, **Category Badge**, **Club / Open Group Card**, **Campus Audience Highlight**, **Membership Button Group**, **Editorial Quote**.
- Media: **Embedded Content Frame**, **Photo Frame**, **Mandelbrot Corner Frame**, **Mandelbrot Icon**, **Paper Grain Overlay**, **Fractal Pattern**, **Fade In**, **Gallery Image**, **Photo Gallery**.
- Complex composites: each named **House Pennant**, **House Pennant Renderer**, **Campus Section**, **Hero Search / Combobox**, **Housing Map**, **Meet the Space Carousel**, **Origin Story**, **Sierpinski Carpet**, **Fractal City Scene**, and **Octahedron Hero**.

The interactive registry is authoritative for each name’s purpose, fields, variants, usage boundaries, responsive notes, accessibility notes, source path, and agent-ready phrase. A coverage test fails if a new production component file is added without a registry entry.

## Color pairings

Themeable components accept only the canonical token-backed choices: Neutral, Co-Living, Events, Campus, Education, Library, Political Club, Story accent on cream, and People accent on cream. They can use Paper, Light, or Deep surfaces where their component contract permits it.

Arbitrary color input is intentionally excluded. “Any pairing” means any approved semantic pairing—not any two colors combined blindly. The shared Color Pairing scope explicitly supplies the component surface, safe on-surface text, muted text, decorative accent, accent-fill text, border, and focus ring. Campus retains its documented light-surface exception; Education retains its cream text requirements; Story and People remain cream identities with decorative single accents.

## Refresh Education each semester

### Agent path

Ask an agent to edit `src/data/fractalu-catalog.json`. This serializable JSON is the canonical checked-in source. `src/data/fractalu.ts` runtime-validates it and derives view-only fields such as the joined instructor label. Categories are derived from the supplied catalog rather than maintained in a second list.

Example:

> Refresh the Education semester in `src/data/fractalu-catalog.json` from the verified public source. Preserve ordered instructor biographies and truthful source provenance. Use the existing **Course Card**, **Club / Open Group Card**, **Course Fact Grid**, **Course Subject Filter**, and **Outbound Link** components. Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

### Human workshop path

Run `pnpm components`, then open **Education Content Workshop**. It loads a deep copy of the repository snapshot and always says **Local draft — not saved to the website**. You can:

- edit semester and provenance metadata;
- add, edit, duplicate, delete, and reorder courses and clubs;
- add, edit, delete, and reorder instructors without combining biographies;
- create new category/tag values and immediately preview their subject filters;
- edit all course and club content/link fields;
- paste/import JSON, reset to the repository snapshot, copy normalized JSON, or download `fractalu-catalog.json`;
- preview the exact production Education catalog components in any approved color pairing.

Inline errors link to their fields. Export actions stay disabled until the draft validates. Export contains only the serializable source shape—never derived instructor labels or UI state. Replace `src/data/fractalu-catalog.json` with the export, confirm the provenance against the source, and run the verification commands. The workshop does not prove that a source was checked.

## Copyable request examples

> Add this semester course using the **Course Card** component. Include its ordered instructors and separate biographies, category, schedule, dates, location, price, description, course-details link, application link, and optional video link.

> Add this recurring program using the **Club / Open Group Card** component. Include name, description, schedule, location, optional details link, and required action link.

> Add the new category to the course data. Let the **Course Subject Filter** derive it from the catalog; do not hard-code a second tag list.

> Add this short explanation using the **Note / Callout Card** component with the Campus color pairing and Paper surface.

> Add this item using the **Library Article Card** component with its category, title, byline, description, URL, and tags.

> Format this destination with the **Outbound Link** component in the Standalone presentation. Preserve safe new-tab behavior and the diagonal arrow.

## Boundaries

Production components live under `src/components/` and ship on the public pages. The local catalog under `components/` documents and exercises them. The workshop edits an in-memory draft and exports repository-ready JSON. A future CMS may replace or supplement the repository editing workflow, but this task does not add authentication, network writes, publish/deploy controls, or a hosted admin route.

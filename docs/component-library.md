# Fractal NYC component library

This is the durable guide for the separate, team-only visual component gallery. It is not a public route, is not linked from the site, and is excluded from the normal production build.

## Open the interactive document

```sh
pnpm install
pnpm components
```

Open `http://localhost:5173/components/`. The browse screen has one **Component Library** heading, followed by a compact search/tool row, category choices, and the visual component grid. Every card leads with the real production component or source asset, followed by its stable plain-English name. Start with **Common components**, browse a visual category, or search for a term such as “note,” “article,” “class,” or even “outsource link.”

Each tile is deliberately minimal: a live preview, a **View options** link, and **Copy prompt**. Select **View options** or the card's non-control surface when you want the focused view and its real options. Live preview controls and **Copy prompt** remain independent: using them never opens the focused view. Use **Copy prompt** when you already recognize the component and want to hand a configuration-free request directly to an agent. The copied request tells the agent to inherit the target page, house, or section tokens wherever the component supports them, so no color choice is required first.

Cards and house-context specimens open in representative native site contexts so the gallery shows how Fractal's real palette is used rather than flattening every example to monochrome. **Primary Button** likewise begins in its native Events treatment. The three link-role comparison specimens intentionally begin on neutral Paper so their typography and arrows are easy to compare. The focused view begins in the same per-component context, keeps the large live preview first, and then shows only the options that component truly supports. Open **Usage details** for boundaries, current site usage, accessibility notes, technical source, and the same agent prompt. **Site color** and **Background** can still preview other approved token-backed combinations.

Choose **Edit Education courses** for semester work. It opens as a separate tool and never appears below the browse gallery. Browse, category, focused component, and workshop URLs are reload-safe and shareable. The gallery imports real production components and `src/index.css`; it does not maintain a duplicate mock component set or token file.

Build and verify it independently with:

```sh
pnpm typecheck:components
pnpm build:components
```

The output is `dist-components/`. Normal `pnpm build` still produces only the public site in `dist/`.

## The 15 public choices

Use these names in requests to designers, editors, or agents:

- Buttons and links: **Primary Button**, **Standalone Link**, **Outbound Text Link**, and **Inline Text Link**.
- Forms and filters: **Search Bar** and **Filter Bar**.
- Cards and boxes: **Article Card**, **Note Box**, **Course Card**, **Club Card**, **Highlight Box**, and **Editorial Quote**.
- Images and media: **Photo Carousel**, **Photo Gallery**, and **House Pennants**.

The four action choices are intentionally separate. **Primary Button** is the branded Mandelbrot-corner call to action. **Standalone Link** is a compact mono link that sits on its own and has a diagonal outbound arrow. **Outbound Text Link** is Inter text with an arrow that sits outside a sentence. **Inline Text Link** is underlined Inter inside a sentence and has no arrow. Outbound and Inline Text Links can both appear in ordinary body copy or larger lead copy: they inherit the surrounding text size instead of encoding “small” versus “prominent” as separate component choices. The arrow-versus-in-a-sentence behavior is how to choose between them.

**Search Bar** owns one visual shell with two real behavior modes: site search is the Home combobox that finds and navigates to site results, while collection search filters the current archive and has one working clear control. The shared clear X has the same visible hover, keyboard-focus, and pressed feedback in every context, then clears and returns focus to the field.

**Filter Bar** owns the reusable row of filter chips. Its default specimen is the live Education treatment: one subject at a time, complete category labels derived from the current validated semester course data, truthful visible-course counts, Education tokens, and separate cream capsules directly on the deep Education field. The component gallery and `/education` both render the same `CourseSubjectFilter` → `FilterBar` → `FilterChip` source path rather than parallel markup. The shared source can also support several Library tags with per-tag counts, but those tag filters are currently hidden on the public Library page. Editors change the collection data, selection mode, and inherited site tokens rather than creating a new kind of search or filter.

**Note Box** never contains a button action. If its prose needs a destination, use an **Inline Text Link** inside the note. **Highlight Box** is the generic name for the accent-filled pattern first used for Campus highlights; it is not restricted to the Campus colors. Article, Course, and Club cards keep typography tied to content roles: display text for titles, upright Inter for names/bylines and prose, and mono for labels and compact metadata. Article authors and Course instructors both use upright Inter. Course facts remain part of the **Course Card**, not a separate public component. Its subject icon derives automatically from the category text: current subjects use their reviewed semantic icons, while an unfamiliar new category safely displays the generic Shapes icon beside its original label. Editors choose the category, never an icon per course.

Only the three items listed under Images and media are public choices. Photo Gallery is the real gallery component, not a placeholder frame. Supporting shells, empty states, fact grids, membership groups, corner decorations, embed frames, textures, motion helpers, and page structure remain internal implementation inventory. Old phrases such as “Home Search Bar,” “Archive Search Field,” “Library Tag Filter,” “Course Subject Filter,” “Campus Highlight,” and “Meet the Space Carousel” remain searchable aliases that lead to the current public name.

The interactive registry is authoritative for each name’s purpose, fields, variants, usage boundaries, responsive notes, accessibility notes, source path, and agent-ready phrase. Foundations such as site colors, page frames, type rules, and section spacing are applied automatically by agents rather than copied as components. Page infrastructure such as the Navbar, whole Hero, maps, and WebGL scenes is likewise retained as internal inventory instead of being offered as a reusable tile. Supporting and invisible implementation files remain source-accounted without cluttering the visual chooser. A coverage test fails if a new production component file is added without a registry entry.

## Color pairings

Themeable components accept only the canonical token-backed choices: Neutral, Co-Living, Events, Campus, Education, Library, Political Club, Story accent on cream, and People accent on cream. They can use Paper, Light, or Deep surfaces where their component contract permits it.

Arbitrary color input is intentionally excluded. “Any pairing” means any approved semantic pairing—not any two colors combined blindly. The shared Color Pairing scope explicitly supplies the component surface, safe on-surface text, muted text, decorative accent, accent-fill text, border, and focus ring. Campus retains its documented light-surface exception; Education retains its cream text requirements; Story and People remain cream identities with decorative single accents.

## Refresh Education each semester

### Agent path

Ask an agent to edit `src/data/fractalu-catalog.json`. This serializable JSON is the canonical checked-in source. `src/data/fractalu.ts` runtime-validates it and derives view-only fields such as the joined instructor label. Categories are derived from the supplied catalog rather than maintained in a second list. Supply only the category text: every new category immediately receives the generic subject icon, and a future recurring category receives a specialized icon through one central mapping rather than a new JSON field.

Example:

> Refresh the Education semester in `src/data/fractalu-catalog.json` from the verified public source. Preserve ordered instructor biographies and truthful source provenance. Use the existing **Course Card** (including its facts), **Club Card**, **Filter Bar**, and appropriate shared link components. Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

### Human workshop path

Run `pnpm components`, then choose **Edit Education courses**. It loads a deep copy of the repository snapshot and always says **Local draft — not saved to the website**. You can:

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

> Add this recurring program using the **Club Card** component. Include name, description, schedule, location, optional details link, and required action link.

> Add the new category to the course data. Let the Education **Filter Bar** derive its single-select chips and let the **Course Card** derive its subject icon from that category; do not hard-code a second tag list or add an icon field.

> Add this short explanation using the **Note Box** component with the Campus site color and Paper background.

> Add this item using the **Article Card** component with its category, title, byline, description, URL, and tags.

> Format this destination with the **Standalone Link** component. Preserve safe new-tab behavior and the diagonal arrow. (“External link,” “Outbound Link,” and “outsource link” all resolve to this component.)

> Add this destination with the **Outbound Text Link** component. Keep the arrow and inherit the surrounding Inter body or lead text context.

> Link these words inside the sentence with the **Inline Text Link** component. Do not add an arrow or button container; inherit the surrounding Inter body or lead text context.

## Boundaries

Production components live under `src/components/` and ship on the public pages. The local catalog under `components/` documents and exercises them. The workshop edits an in-memory draft and exports repository-ready JSON. A future CMS may replace or supplement the repository editing workflow, but this task does not add authentication, network writes, publish/deploy controls, or a hosted admin route.

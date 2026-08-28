# Fractal NYC component library

This is the durable guide for the separate, team-only visual component gallery. It is not a public route, is not linked from the site, and is excluded from the normal production build.

## Open the interactive document

```sh
pnpm install
pnpm components
```

Open `http://localhost:5173/components/`. The first screen is a visual chooser: every card leads with the real production component or source asset, followed by its stable plain-English name. Start with **Common components**, browse a visual category, or search for a term such as “note,” “article,” “class,” or even “outsource link.”

Each tile is deliberately minimal: a live preview, a clickable component name, and **Copy prompt**. Select the name when you want the focused view and its real options. Use **Copy prompt** when you already recognize the component and want to hand a configuration-free request directly to an agent. The copied request tells the agent to inherit the target page, house, or section tokens wherever the component supports them, so no color choice is required first.

The focused view keeps the large live preview first, then shows only the options that component truly supports. Open **Usage details** for boundaries, current site usage, accessibility notes, technical source, and the same agent prompt. Site color and Background choices remain limited to approved token-backed combinations.

Choose **Edit Education courses** for semester work. It opens as a separate tool and never appears below the browse gallery. Browse, category, focused component, and workshop URLs are reload-safe and shareable. The gallery imports real production components and `src/index.css`; it does not maintain a duplicate mock component set or token file.

Build and verify it independently with:

```sh
pnpm typecheck:components
pnpm build:components
```

The output is `dist-components/`. Normal `pnpm build` still produces only the public site in `dist/`.

## Stable plain-English names

Use these names in requests to designers, editors, or agents:

- Buttons and links: **Primary Button** is the branded Mandelbrot-corner CTA; **Standalone Link** is a prominent link that sits on its own and carries a diagonal arrow; **Inline Text Link** is an underlined link within a sentence and has no arrow.
- Forms and filters: **Home Search Bar** is the real desktop Home combobox for finding pages, people, houses, articles, and topics. It was previously called **Hero Search / Combobox**. This category also includes **Archive Search Field**, **Filter Chip**, **Empty Results Message**, **Library Tag Filter**, and **Course Subject Filter**.
- Cards and boxes: **Content Card**, **Article Card**, **Note Box**, **Course Card**, **Course Fact Grid**, **Club Card**, **Campus Highlight**, **Membership Button Group**, and **Editorial Quote**.
- Media: **Photo Carousel** is the real carousel currently used in Campus’s Meet the Space section and was previously called **Meet the Space Carousel**. This category also includes **Embedded Content Frame**, **Photo Frame**, **Mandelbrot Corner Frame**, **Mandelbrot Icon**, **Paper Grain Overlay**, **Fractal Pattern**, **Fade In**, **Gallery Image**, **Photo Gallery**, and **House Pennants**.

The interactive registry is authoritative for each name’s purpose, fields, variants, usage boundaries, responsive notes, accessibility notes, source path, and agent-ready phrase. Foundations such as site colors, page frames, type rules, and section spacing are applied automatically by agents rather than copied as components. Page infrastructure such as the Navbar, whole Hero, maps, and WebGL scenes is likewise retained as internal inventory instead of being offered as a reusable tile. Supporting and invisible implementation files remain source-accounted without cluttering the visual chooser. A coverage test fails if a new production component file is added without a registry entry.

## Color pairings

Themeable components accept only the canonical token-backed choices: Neutral, Co-Living, Events, Campus, Education, Library, Political Club, Story accent on cream, and People accent on cream. They can use Paper, Light, or Deep surfaces where their component contract permits it.

Arbitrary color input is intentionally excluded. “Any pairing” means any approved semantic pairing—not any two colors combined blindly. The shared Color Pairing scope explicitly supplies the component surface, safe on-surface text, muted text, decorative accent, accent-fill text, border, and focus ring. Campus retains its documented light-surface exception; Education retains its cream text requirements; Story and People remain cream identities with decorative single accents.

## Refresh Education each semester

### Agent path

Ask an agent to edit `src/data/fractalu-catalog.json`. This serializable JSON is the canonical checked-in source. `src/data/fractalu.ts` runtime-validates it and derives view-only fields such as the joined instructor label. Categories are derived from the supplied catalog rather than maintained in a second list.

Example:

> Refresh the Education semester in `src/data/fractalu-catalog.json` from the verified public source. Preserve ordered instructor biographies and truthful source provenance. Use the existing **Course Card**, **Club / Open Group Card**, **Course Fact Grid**, **Course Subject Filter**, and **Outbound Link** components. Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

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

> Add the new category to the course data. Let the **Course Subject Filter** derive it from the catalog; do not hard-code a second tag list.

> Add this short explanation using the **Note Box** component with the Campus site color and Paper background.

> Add this item using the **Article Card** component with its category, title, byline, description, URL, and tags.

> Format this destination with the **Standalone Link** component. Preserve safe new-tab behavior and the diagonal arrow. (“External link,” “Outbound Link,” and “outsource link” all resolve to this component.)

> Link these words inside the sentence with the **Inline Text Link** component. Do not add an arrow or button container.

## Boundaries

Production components live under `src/components/` and ship on the public pages. The local catalog under `components/` documents and exercises them. The workshop edits an in-memory draft and exports repository-ready JSON. A future CMS may replace or supplement the repository editing workflow, but this task does not add authentication, network writes, publish/deploy controls, or a hosted admin route.

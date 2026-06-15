# FRAC-201: Collapse neutral surface palette to genuinely-used tokens

Separate PR from FRAC-200. The shadcn scaffold left a bloated neutral palette;
the editorial design ("charcoal is the voice") uses only a few of these tokens.
Collapse to the genuinely-used set, in deliberate steps the user is directing.

## Design decisions (from the user)
- `muted-foreground` (#525252) becomes the **single softer/secondary text color**.
- `foreground-light` (#333333) is removed entirely.
- Three charcoal text shades (#171717 / #333 / #525252) collapse toward two:
  `foreground` (the voice) + `muted-foreground` (secondary).

## Step 1 (this commit): remove foreground-light → muted-foreground
- `src/pages/NeighborhoodPage.tsx` — its 2 `text-foreground-light` uses (body
  paragraph + ordered list) → `text-muted-foreground`. (These are the ONLY two
  uses in the codebase.)
- `src/index.css` — remove `--color-foreground-light: #333333;` from `@theme`.
- `DESIGN.md` — drop `foreground-light` from the frontmatter `colors:` block and
  the surface-palette table; note `muted-foreground` is the secondary text color.

Acceptance: build + typecheck pass; test suite at FRAC-199 baseline (7 fail /
141 pass); no remaining `foreground-light` reference anywhere in `src/`.

## Later steps (to sequence with the user, same branch)
- Delete 6 dead section components (Directory, Events, PeopleDirectory, Projects,
  SkylineSilhouette, Vision) — this is what drops `secondary`→0 and `muted`→~0.
- People page: decide full removal (PeoplePage + /people route + Navbar entry +
  hidden-href hack + hero banner) vs keep hidden.
- Remove fully-dead token pairs: `card`, `popover`, `accent`, `destructive`
  (+ their `-foreground`). [card/popover/accent removal is stashed: stash@{0}]
- Fold `secondary` (= same hex as `muted`) into `muted`; delete `secondary`(+fg).
- Replace `primary`/`primary-foreground` (only the selection rule in index.css)
  with `foreground`/`background`; delete both tokens.
- Final DESIGN.md palette rewrite to the lean set.

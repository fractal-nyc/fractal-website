# FRAC-187: Arch NEW LIBERAL ARTS text on education banner

**Scope:** Visual-only tweak to `public/images/banners/education-banner.svg`.

**Approach:** Match the arched-label look of the other house banners (visit/publications/events/campus), which arch their single-word label via a `<path>` arc + `<textPath>`. The education label is three words ("NEW LIBERAL ARTS"), too long for one readable arc, so give each line its own parallel arc (`nlaArc1/2/3`) and convert the flat stacked `<text>` lines into `<textPath>`. Arch strength and vertical position tuned live with the user.

**Acceptance:** Three label lines render arched, readable, within the top band above the "E" emblem; SVG remains valid XML. Complexity: low.

# FRAC-167 — New Story page paragraph (from Julianna, 2026-04-14)

Replace the current Story page paragraph with the following copy verbatim. Preserve typographic characters (curly quotes, en-dashes).

---

A "fractal" – aka a "neighborhood campus" – is a social template (like a "church," "college," or "kibbutz").

The focus of a fractal is on integrating all the aspects of a healthy adult life: work, hobbies, family life, partying, and friendship. This isn't anything new. In our grandparents' time it was called civic society. It was extremely common to be a part of voluntary organizations with overlapping membership: trade unions, service clubs, churches, neighborhood associations, and so on. A fractal is just a structure for revitalizing this sort of active community living.

The first of these was called Fractal NYC. In 2021, our small group of friends decided to live, learn, and build together in NYC. It started as just a single apartment with weekly dinners where people gave 5-minute talks.

---

## Implementation notes

- Match existing Story page paragraph styling/typography — just swap the text content.
- Three paragraphs, rendered as three `<p>` blocks.
- Use curly quotes and en-dashes as shown (source used en-dash `–`, not em-dash).

## Also add: "neighborhood campus" diagram (from Julianna, 2026-04-14)

Add a visual element to the Story page showing Fractal NYC as a circular "neighborhood campus" diagram. Julianna shared a reference screenshot — source PNG was in a sandboxed temp path we could not copy; re-request the asset or rebuild natively.

**Important: remove the white background** — the diagram should blend into the Story page background, not sit on a white card.

### Reference diagram content (transcribed)

Center: **Fractal NYC — A neighborhood campus founded in 2021**

Five pillars arranged around the center, connected by a circular flow:

- **Events** 🎉
  - 100+ events/month
  - 1000+ attendees
- **Community-run University** 🏛️
  - 30+ in-person courses
  - 250–350 students per semester
  - 3 semesters per year
- **Fractal Tech** 👾
  - 100% job placement rate of engineers from 3-month programming bootcamp
  - 40+ full-time coworking members
  - 5 startups launched and counting
- **Venues** 📍
  - 5 "third spaces" hosting 100s of classes, dances, film screenings, residencies, hackathons, and hangouts
- **Housing Network** 🏠
  - 75+ residents
  - 22 apartments & townhouses
  - 4 neighborhoods

### Implementation options

1. **Rebuild natively** (preferred): render as SVG/HTML so it's responsive, dark-mode friendly, and has no white background by construction. Aligns with mobile-first requirement.
2. **Use the PNG as-is**: re-request asset from Julianna, strip white background (transparent PNG) before embedding.

Recommend option 1 — the content is simple enough that a native component will look cleaner on mobile and avoid the white-background issue entirely.

# Reorder octahedron faces

## Plan
Single edit in `src/components/three/OctahedronHero.tsx`: replace the FACE_SECTION_MAP array (currently story, campus, neighborhood, events, school, forum, lab, people) with the new order:
```ts
const FACE_SECTION_MAP: (string | null)[] = [
  "campus",        // face 0
  "events",        // face 1
  "lab",           // face 2
  "people",        // face 3
  "neighborhood",  // face 4
  "story",         // face 5
  "forum",         // face 6
  "school",        // face 7
];
```

No other change. FACE_SECTION_COLORS and FACE_BANNER_IMAGES are keyed by section name and don't need to move.

Build + test, push, PR, merge.

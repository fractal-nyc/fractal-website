# Switch palette overlay to light

## Plan
In OctahedronHero.tsx usePerFaceMaterials, change the tint resolution for House sections from `housePalette(sectionKey, "deep")` to `housePalette(sectionKey, "light")`. Non-House sections (story, people) keep their FACE_SECTION_COLORS entries (single-color, no light/deep variant).

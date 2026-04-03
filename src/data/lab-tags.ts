// ---------------------------------------------------------------------------
// Fractal NYC — Lab tag display labels
// Maps raw tag slugs to human-readable labels for the tag filter UI.
// ---------------------------------------------------------------------------

/**
 * Display labels for lab document tags.
 * Keys must match the tag strings used in LAB_DOCUMENTS.
 * Any tag not listed here falls back to title-cased slug.
 */
export const TAG_LABELS: Record<string, string> = {
  ai: "AI",
  altruism: "Altruism",
  building: "Building",
  canon: "Canon",
  civic: "Civic",
  coaching: "Coaching",
  coliving: "Co-Living",
  community: "Community",
  conflict: "Conflict",
  courses: "Courses",
  creative: "Creative",
  culture: "Culture",
  design: "Design",
  education: "Education",
  essays: "Essays",
  events: "Events",
  fearlessness: "Fearlessness",
  fiction: "Fiction",
  food: "Food",
  founding: "Founding",
  institutions: "Institutions",
  interview: "Interview",
  leadership: "Leadership",
  metrics: "Metrics",
  modernity: "Modernity",
  neighborhood: "Neighborhood",
  nyc: "NYC",
  philosophy: "Philosophy",
  podcast: "Podcast",
  politics: "Politics",
  product: "Product",
  social: "Social",
  spirituality: "Spirituality",
  talks: "Talks",
  teaching: "Teaching",
  technology: "Technology",
  theory: "Theory",
  tpot: "TPOT",
  trust: "Trust",
  university: "University",
  updates: "Updates",
  writing: "Writing",
};

/**
 * Get the display label for a tag.
 * Falls back to title-casing the slug if not in TAG_LABELS.
 */
export function getTagLabel(tag: string): string {
  if (tag in TAG_LABELS) return TAG_LABELS[tag];
  // Fallback: capitalize first letter of each word
  return tag
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

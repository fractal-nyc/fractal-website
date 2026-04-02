export interface StoryPhoto {
  src: string;
  alt: string;
  aspect: "landscape" | "portrait" | "panoramic" | "square";
}

export interface GallerySection {
  type: "hero" | "pair" | "masonry" | "panoramic";
  photos: StoryPhoto[];
}

const base = import.meta.env.BASE_URL;

/**
 * All 17 Story page photos, sequentially numbered.
 * Aspect ratios classified from actual pixel dimensions.
 */
export const storyPhotos: StoryPhoto[] = [
  { src: `${base}images/story/story-01.jpg`, alt: "Fractal NYC community gathering", aspect: "landscape" },
  { src: `${base}images/story/story-02.jpg`, alt: "Weekly dinner and talks", aspect: "landscape" },
  { src: `${base}images/story/story-03.jpg`, alt: "Community members in conversation", aspect: "landscape" },
  { src: `${base}images/story/story-04.jpg`, alt: "Fractal house interior", aspect: "portrait" },
  { src: `${base}images/story/story-05.jpg`, alt: "Neighborhood block party", aspect: "landscape" },
  { src: `${base}images/story/story-06.jpg`, alt: "Co-working session at Campus", aspect: "landscape" },
  { src: `${base}images/story/story-07.jpg`, alt: "Late night conversation", aspect: "landscape" },
  { src: `${base}images/story/story-08.jpg`, alt: "Community event setup", aspect: "landscape" },
  { src: `${base}images/story/story-09.jpg`, alt: "Fractal members collaborating", aspect: "landscape" },
  { src: `${base}images/story/story-10.jpg`, alt: "Portrait of a Fractal member", aspect: "portrait" },
  { src: `${base}images/story/story-11.avif`, alt: "Williamsburg streetscape panorama", aspect: "panoramic" },
  { src: `${base}images/story/story-12.webp`, alt: "Rooftop gathering at sunset", aspect: "landscape" },
  { src: `${base}images/story/story-13.avif`, alt: "The Campus courtyard", aspect: "square" },
  { src: `${base}images/story/story-14.webp`, alt: "Community brunch spread", aspect: "landscape" },
  { src: `${base}images/story/story-15.webp`, alt: "Fractal members at an event", aspect: "landscape" },
  { src: `${base}images/story/story-16.webp`, alt: "Living room conversation", aspect: "landscape" },
  { src: `${base}images/story/story-17.webp`, alt: "Fractal NYC from the street", aspect: "landscape" },
];

/**
 * Gallery sections arranged for visual rhythm.
 * Sequence: hero -> pair -> masonry -> panoramic -> pair -> pair -> masonry
 *
 * This layout creates a varied, editorial feel as the user scrolls.
 */
export const gallerySections: GallerySection[] = [
  // Section 1: Hero — single dramatic full-width image
  {
    type: "hero",
    photos: [storyPhotos[0]], // story-01: community gathering
  },
  // Section 2: Pair — two landscapes side by side
  {
    type: "pair",
    photos: [storyPhotos[1], storyPhotos[2]], // story-02, story-03
  },
  // Section 3: Masonry — portrait + two landscapes stacked
  {
    type: "masonry",
    photos: [storyPhotos[3], storyPhotos[4], storyPhotos[5]], // portrait + 2 landscape
  },
  // Section 4: Panoramic — wide shot
  {
    type: "panoramic",
    photos: [storyPhotos[10]], // story-11: panoramic streetscape
  },
  // Section 5: Pair — two small landscapes
  {
    type: "pair",
    photos: [storyPhotos[6], storyPhotos[7]], // story-07, story-08
  },
  // Section 6: Masonry — portrait + square + landscape
  {
    type: "masonry",
    photos: [storyPhotos[9], storyPhotos[12], storyPhotos[8]], // portrait, square, landscape
  },
  // Section 7: Pair — two large landscapes
  {
    type: "pair",
    photos: [storyPhotos[11], storyPhotos[13]], // story-12, story-14
  },
  // Section 8: Hero — closing full-width image
  {
    type: "hero",
    photos: [storyPhotos[14]], // story-15
  },
  // Section 9: Pair — final pair
  {
    type: "pair",
    photos: [storyPhotos[15], storyPhotos[16]], // story-16, story-17
  },
];

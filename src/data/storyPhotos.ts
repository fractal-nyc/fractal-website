interface StoryPhoto {
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
 * All 17 Story photos, sequentially numbered.
 * Aspect ratios classified from actual pixel dimensions.
 *
 * Not every photo is in the published gallery — `gallerySections` below is the
 * curated cut. The full set stays here so a photo can be swapped back in
 * without going hunting for the filename.
 */
const storyPhotos: StoryPhoto[] = [
  { src: `${base}images/story/story-01.jpg`, alt: "Fractal NYC community gathering", aspect: "landscape" },
  { src: `${base}images/story/story-02.jpg`, alt: "Weekly dinner and talks", aspect: "landscape" },
  { src: `${base}images/story/story-03.jpg`, alt: "Community members in conversation", aspect: "landscape" },
  { src: `${base}images/story/story-04.jpg`, alt: "Fractal house interior", aspect: "portrait" },
  { src: `${base}images/story/story-05.jpg`, alt: "Neighborhood block party", aspect: "landscape" },
  { src: `${base}images/story/story-06.jpg`, alt: "Movie night at a Fractal venue", aspect: "landscape" },
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
 * The home-page Story gallery, in scroll order.
 *
 * Rhythm: a full-bleed hero opens, then pairs and a panoramic band alternate so
 * the eye keeps changing pace on the way down, and a hero closes it out.
 * Rendered by StoryGallery.
 */
export const gallerySections: GallerySection[] = [
  { type: "hero", photos: [storyPhotos[0]] }, // story-01
  { type: "pair", photos: [storyPhotos[2], storyPhotos[5]] }, // story-03, story-06
  { type: "panoramic", photos: [storyPhotos[10]] }, // story-11
  { type: "pair", photos: [storyPhotos[6], storyPhotos[7]] }, // story-07, story-08
  { type: "pair", photos: [storyPhotos[12], storyPhotos[11]] }, // story-13, story-12
  { type: "hero", photos: [storyPhotos[14]] }, // story-15
  { type: "pair", photos: [storyPhotos[13], storyPhotos[15]] }, // story-14, story-16
  { type: "hero", photos: [storyPhotos[16]] }, // story-17
];

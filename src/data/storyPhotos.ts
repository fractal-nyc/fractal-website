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

const photo = (
  file: string,
  alt: string,
  aspect: StoryPhoto["aspect"],
): StoryPhoto => ({ src: `${base}images/story/${file}`, alt, aspect });

/**
 * The Home story gallery, keyed to the Claude Design home mockup's photo
 * sequence (12 images across 8 blocks). Each entry pairs a file with the alt
 * text from the design.
 */
const P = {
  gathering: photo("story-01.jpg", "Fractal NYC community gathering", "landscape"),
  conversation: photo("story-03.jpg", "Community members in conversation", "landscape"),
  movieNight: photo("story-06.jpg", "Movie night at a Fractal venue", "landscape"),
  panorama: photo("story-11.avif", "Williamsburg streetscape panorama", "panoramic"),
  lateNight: photo("story-07.jpg", "Late night conversation", "landscape"),
  eventSetup: photo("story-08.jpg", "Community event setup", "landscape"),
  courtyard: photo("story-13.avif", "The Campus courtyard", "square"),
  rooftop: photo("story-12.webp", "Rooftop gathering at sunset", "landscape"),
  event: photo("story-15.webp", "Fractal members at an event", "landscape"),
  brunch: photo("story-14.webp", "Community brunch spread", "landscape"),
  livingRoom: photo("story-16.webp", "Living room conversation", "landscape"),
  street: photo("story-17.webp", "Fractal NYC from the street", "landscape"),
} as const;

/**
 * Gallery sections arranged for visual rhythm, mirroring the Claude Design
 * home mockup: hero -> pair -> panoramic -> pair -> pair -> hero -> pair -> hero.
 *
 * This layout creates a varied, editorial feel as the user scrolls.
 */
export const gallerySections: GallerySection[] = [
  // 1: Hero — single dramatic full-width image
  { type: "hero", photos: [P.gathering] },
  // 2: Pair — conversation + movie night
  { type: "pair", photos: [P.conversation, P.movieNight] },
  // 3: Panoramic — Williamsburg streetscape
  { type: "panoramic", photos: [P.panorama] },
  // 4: Pair — late night + event setup
  { type: "pair", photos: [P.lateNight, P.eventSetup] },
  // 5: Pair — courtyard + rooftop
  { type: "pair", photos: [P.courtyard, P.rooftop] },
  // 6: Hero — full-width event
  { type: "hero", photos: [P.event] },
  // 7: Pair — brunch + living room
  { type: "pair", photos: [P.brunch, P.livingRoom] },
  // 8: Hero — closing streetscape
  { type: "hero", photos: [P.street] },
];

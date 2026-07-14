// ---------------------------------------------------------------------------
// Fractal NYC — Library document data model
// The Records: essays, publications, and podcasts from the minds of Fractal.
// Source of truth for the /library archive.
// ---------------------------------------------------------------------------

/**
 * A document in the Library archive.
 *
 * `byline` is free text (credit line as it should read — may name several
 * people). `categoryLabel` is the human-facing category as displayed on the
 * card and used to derive the filter chips; there is no separate enum, the
 * labels in the data ARE the vocabulary.
 */
export interface LibraryDocument {
  /** Stable slug used as a React key. */
  id: string;
  title: string;
  byline: string;
  categoryLabel: string;
  description: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Documents — rendered as one flat grid, in this order.
// ---------------------------------------------------------------------------

export const LIBRARY_DOCUMENTS: LibraryDocument[] = [
  {
    id: "how-to-live-near-your-friends",
    title: "How to Live Near Your Friends",
    byline: "Priya Rose",
    categoryLabel: "Essay",
    description:
      "People tell me that their friends talk about living near each other too. And yet, almost no one I've talked to has successfully clustered their friend group. So today I'm going to show you how to.",
    url: "https://prigoose.substack.com/p/how-to-live-near-your-friends",
  },
  {
    id: "living-room-third-space",
    title: "How to Turn Your Living Room into a Third Space",
    byline: "Ulysses Chuang and Zu Shi",
    categoryLabel: "Essay",
    description:
      "On how Merlin's Place started, and how you can turn your living room into a third space.",
    url: "https://supernuclear.substack.com/p/case-study-merlins-place",
  },
  {
    id: "start-a-school-with-your-friends",
    title: "How to Start a School With Your Friends",
    byline: "Priya Rose",
    categoryLabel: "Essay",
    description:
      "FractalU is a 'school' for adults, taught from living rooms in New York City. We've run over 100 classes and taught thousands of students. Classes meet weekly and are held on evenings and weekends, since most of our students and teachers are working professionals.",
    url: "https://prigoose.substack.com/p/how-to-start-a-university",
  },
  {
    id: "marry-your-city",
    title: "Marry Your City",
    byline: "Daniel Golliher",
    categoryLabel: "Essay",
    description:
      "The benefits of a good marriage cannot be overstated. Where you choose to live should be regarded similarly: you should do it deliberately, and you should commit to a place.",
    url: "https://maximumnewyork.com/p/marry-your-city",
  },
  {
    id: "take-some-responsibility",
    title: "Take Some Responsibility!",
    byline: "Andrew Rose",
    categoryLabel: "Podcast",
    description:
      "Andrew on taking responsibility for the places, people, and communities around you.",
    url: "https://youtu.be/DoyJmUNWBMI?si=1J9Srbot_YgsHoGw",
  },
  {
    id: "fooming-the-fractal",
    title: "Fooming the Fractal",
    byline: "Tyler Alterman",
    categoryLabel: "Talk",
    description:
      "Fractal is building a replicable microsociety: a model for vibrant, relationship-driven community life that integrates housing, education, the arts, technological innovation, and economic development. Our goal is to address modern crises of loneliness and disconnection by creating enduring ecosystems of human flourishing.",
    url: "https://youtube.com/watch?v=JWLRizY6G-0",
  },
  {
    id: "network-state-conference-talk",
    title: "The Network State Conference Talk",
    byline: "Andrew and Priya Rose",
    categoryLabel: "Talk",
    description:
      "Andrew and Priya's conference talk on Fractal: what it takes to build a real community in the physical world.",
    url: "https://youtu.be/a3vhvAg-8yQ?si=BVYu1JZ0R098EtUT",
  },
  {
    id: "reversing-the-centrifuge-of-modernity",
    title: "Reversing the Centrifuge of Modernity",
    byline: "Andrew Rose",
    categoryLabel: "Essay",
    description:
      "With the right collaborators, you can do anything, and joyfully, too! The challenge is assembling a good team. Not just talents, but personalities that fit together.",
    url: "https://andrewjrose.substack.com/p/reversing-the-centrifuge-of-modernity",
  },
  {
    id: "nyc-is-affordable-part-1",
    title: "New York City is Affordable (Part 1)",
    byline: "Daniel Golliher",
    categoryLabel: "Video Essay",
    description:
      "Making the case that you can afford to live in New York — and how to think about the real numbers.",
    url: "https://youtu.be/EQyT8sNWYQ0?si=xIu-_E2ierZJhIma",
  },
  {
    id: "nyc-is-affordable-part-2",
    title: "New York City is Affordable (Part 2)",
    byline: "Daniel Golliher",
    categoryLabel: "Video Essay",
    description:
      "Part two: practical tactics for making the city affordable in practice.",
    url: "https://youtu.be/SnAKne5OmG8?si=u13IViKoKWSQ9bqc",
  },
  {
    id: "tylers-guide-to-falling-in-love-with-nyc",
    title: "Tyler's Guide to Falling in Love with NYC",
    byline: "Tyler Alterman",
    categoryLabel: "Essay",
    description:
      "A field guide to making New York feel like home — the places, people, and practices that make the city easy to love.",
    url: "https://tyleralterman.notion.site/Tyler-s-guide-to-falling-in-love-with-NYC-dc371f0f0f284f0bab2ca74b671c80e4",
  },
  {
    id: "social-fabric-nyc",
    title: "Social Fabric NYC",
    byline: "Liam Rosen",
    categoryLabel: "Project",
    description:
      "An evolving directory of NYC's portals to connection — event hosts, third spaces, and communities sorted by interest and vibe.",
    url: "http://socialfabric.nyc",
  },
  {
    id: "christines-guide-to-tpot",
    title: "Christine's Guide to TPOT",
    byline: "Christine",
    categoryLabel: "Essay",
    description:
      "A primer on “this part of Twitter” — how to find your people and make real friends on the internet.",
    url: "https://docs.google.com/document/d/1Bd3PfKDL9pOM7YoxGbRBwO_qOWh6B7u5170Xw8VyK6s/edit",
  },
  {
    id: "fractal-university-canon",
    title: "Introducing The Fractal University Canon",
    byline: "Andrew Rose",
    categoryLabel: "Essay",
    description:
      "The orientation guide behind FractalU: a shared etiquette and a canon of essays on science, the frontier, and the call to do great work.",
    url: "https://ajr.fyi/files/fractal-canon.pdf",
  },
  {
    id: "the-gardener-leader",
    title: "The Gardener Leader",
    byline: "Pavitthra Pandurangan",
    categoryLabel: "Essay",
    description:
      "On people around whom things bloom: cultivating communities as gardens rather than running them as factories.",
    url: "https://chaosophia.substack.com/p/the-gardener-leader",
  },
  {
    id: "a-neighborhood-stroll",
    title: "a neighborhood stroll",
    byline: "Joce Orante",
    categoryLabel: "Essay",
    description:
      "Seven hours of wandering between friends, family, and neighbors — a portrait of what living near your people actually feels like.",
    url: "https://joceorante.substack.com/p/a-neighborhood-stroll",
  },
  {
    id: "scaling-coliving-slouching-towards-utopia",
    title: "Scaling Coliving and Slouching Towards Utopia",
    byline: "Priya Rose",
    categoryLabel: "Podcast",
    description:
      "Priya on scaling coliving, building Fractal, and slouching towards utopia.",
    url: "https://open.spotify.com/episode/17rMg7X6JafICSrxkFaCAH",
  },
  {
    id: "friends-community-isolation-fearlessness",
    title: "Friends, Community, Isolation & Fearlessness",
    byline: "Andrew Rose",
    categoryLabel: "Podcast",
    description:
      "Andrew on friendship, community, modern isolation, and living fearlessly.",
    url: "https://podcasters.spotify.com/pod/show/a-o-o/episodes/019---Andrew-Rose-on-Friends--Community--Isolation---Fearlessness-e24vb4n",
  },
  {
    id: "effective-altruism-in-the-garden-of-ends",
    title: "Effective Altruism in the Garden of Ends",
    byline: "Tyler Alterman",
    categoryLabel: "Essay",
    description:
      "This truly isn't a new idea. Mutual dedication to one another's ends seems like a thing commonly present in religious and ethnic communities. But it seems quite uncommon to the demographic of secular idealists, like me.",
    url: "https://forum.effectivealtruism.org/posts/AjxqsDmhGiW9g8ju6/effective-altruism-in-the-garden-of-ends",
  },
  {
    id: "elizabeth-barlow-rogers-interview",
    title:
      "An Interview with Elizabeth Barlow Rogers, Founder of the Central Park Conservancy",
    byline: "Hailey Phillips",
    categoryLabel: "Podcast",
    description:
      "A conversation with the founder of the Central Park Conservancy on stewarding one of the world's great public spaces.",
    url: "https://youtu.be/7Wyl8eUstdI?si=ltPh5BhYhMOrqJZM",
  },
];

// ---------------------------------------------------------------------------
// Derived
// ---------------------------------------------------------------------------

export const ALL_CATEGORIES = "All";

/**
 * Filter chips: "All" first, then each distinct `categoryLabel` in the order it
 * first appears in the documents (mirrors the design's derivation).
 */
export const LIBRARY_CATEGORIES: string[] = [
  ALL_CATEGORIES,
  ...LIBRARY_DOCUMENTS.reduce<string[]>((cats, doc) => {
    if (!cats.includes(doc.categoryLabel)) cats.push(doc.categoryLabel);
    return cats;
  }, []),
];

import type { CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { OriginStory } from "@/components/sections/OriginStory";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { gallerySections } from "@/data/storyPhotos";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { ArrowUpRight, Megaphone, Mic, Newspaper } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SECTIONS } from "@/data/houses";

// ---------------------------------------------------------------------------
// Story accent color — the single gold identity accent for this cream section.
// FRAC-205: sourced from the canonical SECTIONS.story.accent, matching the
// Navbar Story link and the octahedron Story face. Used only as a
// decorative accent (icon tints, hover borders, the accent bar); ALL text on
// this page stays charcoal (text-foreground) since gold-on-cream fails WCAG.
// ---------------------------------------------------------------------------

const STORY_COLOR = SECTIONS.story.accent;

// ---------------------------------------------------------------------------
// Talk / podcast data
// ---------------------------------------------------------------------------

interface TalkItem {
  title: string;
  author: string;
  year: number;
  description: string;
  url: string;
  category: "talk" | "podcast" | "article";
}

const CATEGORY_META: Record<
  TalkItem["category"],
  { icon: LucideIcon; label: string }
> = {
  talk: { icon: Megaphone, label: "Talk" },
  podcast: { icon: Mic, label: "Podcast" },
  article: { icon: Newspaper, label: "Article" },
};

const TALKS: TalkItem[] = [
  {
    title: "Fooming the Fractal",
    author: "Tyler Alterman",
    year: 2025,
    description:
      "A template for a civil society you can build with your friends",
    url: "https://youtube.com/watch?v=JWLRizY6G-0",
    category: "talk",
  },
  {
    title: "Take Some Responsibility!",
    author: "Andrew Rose",
    year: 2025,
    description: "Andrew gets into the weeds of community building",
    url: "https://www.everand.com/podcast/874410520/Take-Some-Responsibility-w-Andrew-Rose-Fractal-NYC-Richard-D-Bartlett",
    category: "podcast",
  },
  {
    title: "Hundreds of neighbors share this communal living room",
    author: "Ulysses Chuang",
    year: 2025,
    description:
      "On how Merlin's Place started, and how you can turn your living room into a third space",
    url: "https://supernuclear.substack.com/p/case-study-merlins-place",
    category: "article",
  },
  {
    title: "Scaling Coliving and Slouching Towards Utopia",
    author: "Priya Rose",
    year: 2024,
    description: "On how Fractal started, and where it's going.",
    url: "https://open.spotify.com/episode/17rMg7X6JafICSrxkFaCAH",
    category: "podcast",
  },
  {
    title: "The Origin Story of Fractal",
    author: "Priya Rose",
    year: 2023,
    description: "Or for a more personal telling, watch...",
    url: "https://www.youtube.com/watch?v=gEB-kkNM5L8",
    category: "talk",
  },
  {
    title: "Friends, Community, Isolation & Fearlessness",
    author: "Andrew Rose",
    year: 2023,
    description: "How many friends do you look in the eyes per day?",
    url: "https://podcasters.spotify.com/pod/show/a-o-o/episodes/019---Andrew-Rose-on-Friends--Community--Isolation---Fearlessness-e24vb4n",
    category: "podcast",
  },
  {
    title: "The Network State Conference",
    author: "Andrew and Priya Rose",
    year: 2023,
    description:
      "Building a neighborhood is a coordination problem, not a money problem. We didn\u2019t put any money into Fractal beyond paying the rent on our own apartment. Friends who wanted to move near us simply sign their own lease in the building",
    url: "https://prigoose.substack.com/p/i-gave-a-1000-person-conference-talk",
    category: "talk",
  },
  {
    title: "Christine's Guide to TPOT",
    author: "Christine",
    year: 2024,
    description:
      "Fractal originally emerged from an online scene of friendly ambitious nerds. If you'd like to have fun online and make friends, read Christine's guide.",
    url: "https://docs.google.com/document/d/1Bd3PfKDL9pOM7YoxGbRBwO_qOWh6B7u5170Xw8VyK6s/edit",
    category: "article",
  },
];

// ---------------------------------------------------------------------------
// TalkCard — styled after DocumentBadge
// ---------------------------------------------------------------------------

function TalkCard({ talk }: { talk: TalkItem }) {
  const { icon: CategoryIcon, label: categoryLabel } =
    CATEGORY_META[talk.category];

  return (
    <a
      href={talk.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group block rounded-lg border border-foreground-faint bg-background text-foreground
        transition-all duration-200 ease-out
        hover:scale-[1.02] hover:shadow-lg
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground
        p-5 md:p-6
      `}
      style={{
        borderColor: undefined,
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = `${STORY_COLOR}66`)
      }
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      {/* Top row: category + external link icon */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md"
            style={{ backgroundColor: `${STORY_COLOR}20` }}
          >
            <CategoryIcon
              size={14}
              strokeWidth={1.5}
              style={{ color: STORY_COLOR }}
            />
          </div>
          <span
            className="text-eyebrow"
            style={{ color: STORY_COLOR }}
          >
            {categoryLabel}
          </span>
        </div>
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>

      {/* Title */}
      <h3 className="text-subtitle leading-snug normal-case">
        {talk.title}
      </h3>

      {/* Author + Year */}
      <p className="text-meta text-foreground mt-1">
        {talk.author}, {talk.year}
      </p>

      {/* Description */}
      <p className="text-body-lead text-foreground mt-3">
        {talk.description}
      </p>

      {/* Accent bar at bottom */}
      <div
        className="mt-4 h-0.5 w-8 rounded-full opacity-40 group-hover:w-12 group-hover:opacity-70 transition-all duration-300"
        style={{ backgroundColor: STORY_COLOR }}
      />
    </a>
  );
}

// ---------------------------------------------------------------------------
// StoryPage
// ---------------------------------------------------------------------------

export function StoryPage() {
  return (
    <main
      className="relative min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background"
      style={{ "--btn-accent": "var(--color-section-story)" } as CSSProperties}
    >
      <FractalPattern color={STORY_COLOR} />
      <div className="relative z-10">
      <Navbar />
      <div>
        {/* Story heading + origin narrative + diagram */}
        <section className="relative flex flex-col items-center justify-start pt-16 md:pt-24">
          {/* Flanking favicon diamonds — decorative brand framing that mirrors
              the house-banner flanking pattern: an absolute, pointer-events-none
              layer pinned to the page edges (inset matches CampusPage) so it
              never constrains the heading's width — the heading keeps the same
              content margin as the banner pages. Desktop-only, like the banner
              layer; on mobile the heading stays full-bleed. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 sm:inset-x-8 md:inset-x-12 lg:inset-x-16 top-36 md:top-52 z-0 hidden md:flex items-center justify-between"
            style={{ height: "min(46vh, 380px)" }}
          >
            <img src="/favicon.svg" alt="" className="w-[16%] lg:w-[14%] max-w-[260px] h-auto" />
            <img src="/favicon.svg" alt="" className="w-[16%] lg:w-[14%] max-w-[260px] h-auto" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-[4.5%] w-full">
            <SectorHeader letter="S" name="Story" color="var(--color-section-story)" />
            <FadeIn>
              <p className="text-display mb-12 text-center">
                From a Single Apartment to a Neighborhood Campus
              </p>
            </FadeIn>
          </div>
        </section>

        <OriginStory />

        {/* Talks & Podcasts Section — solid gold band anchors it within the cream page */}
        <section className="relative flex flex-col items-center justify-start bg-section-story pt-16 md:pt-24 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto px-6 md:px-[4.5%]">
            <FadeIn>
              <p className="text-body-lead text-foreground max-w-5xl mx-auto text-center text-pretty mb-12">
                Fractal was originally dreamed up by Andrew and Priya Rose. They were later joined by many co-conspirators. If you're interested in Fractal's story and where we see it going, you might like the following talks and podcasts.
              </p>
            </FadeIn>

            {/* Talk cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {TALKS.map((talk, i) => (
                <FadeIn key={talk.title} delay={i * 0.05}>
                  <TalkCard talk={talk} />
                </FadeIn>
              ))}
            </div>

          </div>
        </section>

        <PhotoGallery sections={gallerySections} />
      </div>
      <Footer />
      </div>
    </main>
  );
}

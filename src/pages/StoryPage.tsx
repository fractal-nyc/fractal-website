import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { OriginStory } from "@/components/sections/OriginStory";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { gallerySections } from "@/data/storyPhotos";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { PretextParagraph } from "@/components/pretext/PretextParagraph";
import { TEXT_SIZES, FONTS } from "@/lib/pretext";
import { ArrowUpRight, Megaphone, Mic, Newspaper } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Story accent color (matches Navbar story link)
// ---------------------------------------------------------------------------

const STORY_COLOR = "#D4BA58";

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
        group block rounded-lg border border-border bg-background
        transition-all duration-200 ease-out
        hover:scale-[1.02] hover:shadow-lg
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
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
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ color: STORY_COLOR }}
          >
            {categoryLabel}
          </span>
        </div>
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        />
      </div>

      {/* Title */}
      <h3 className="font-serif text-lg md:text-xl leading-snug tracking-tight normal-case">
        {talk.title}
      </h3>

      {/* Author + Year */}
      <p className="text-sm text-foreground mt-1">
        {talk.author}, {talk.year}
      </p>

      {/* Description */}
      <PretextParagraph
        size={TEXT_SIZES.base}
        className="text-foreground mt-3"
      >
        {talk.description}
      </PretextParagraph>

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
    <main className="relative min-h-screen text-foreground selection:bg-foreground selection:text-background" style={{ backgroundColor: "#D4BA58" }}>
      <FractalPattern color="#8A7A20" />
      <div className="relative z-10">
      <Navbar />
      <div>
        {/* Story heading + origin narrative + diagram */}
        <section className="flex flex-col items-center justify-start pt-16 md:pt-24">
          <div className="max-w-6xl mx-auto px-6 md:px-[4.5%] w-full">
            <SectorHeader letter="S" name="Story" color="#8A7A20" />
            <FadeIn>
              <p className="font-serif text-4xl md:text-6xl leading-[1.3] mb-12 text-center display-roman">
                From a Single Apartment to a Neighborhood Campus
              </p>
            </FadeIn>
          </div>
        </section>

        <OriginStory />

        {/* Talks & Podcasts Section */}
        <section className="flex flex-col items-center justify-start pt-8 md:pt-12 pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto px-6 md:px-[4.5%]">
            <FadeIn>
              <PretextParagraph
                size={TEXT_SIZES.lg}
                font={FONTS.body}
                className="text-foreground font-light max-w-5xl mx-auto text-center text-pretty mb-12"
              >
                {"Fractal was originally dreamed up by Andrew and Priya Rose. They were later joined by many co-conspirators. If you're interested in Fractal's story and where we see it going, you might like the following talks and podcasts."}
              </PretextParagraph>
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

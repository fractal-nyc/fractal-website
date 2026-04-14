import { FadeIn } from "@/components/ui/FadeIn";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { CornerDecorations } from "@/components/ui/MandelbrotCorners";

const LUMA_URL = "https://luma.com/nyc-tech";
const FRACTAL_U_URL = "https://fractaluniversity.substack.com/";

const amenities = [
  "24/7 hot desk access",
  "Stocked kitchen w/ espresso machine",
  "3D printer and tool library",
  "Cozy lounge for relaxing and chatting",
  "Private startup offices",
  "Soundproof phone booths",
  "Rooftop coworking (with wifi!)",
  "Free near-daily tech events",
];

const photoCaptions = [
  "Did we mention we had 5000 sq. ft of private rooftop? We have 5000 sq. ft of private rooftop.",
  "A full kitchen, with an island",
  "Seating, seating, and more seating",
  "Nice and clean",
  "Felix doesn't live here, but he does love it here.",
  "Parth and Norman proving that cozy engineers are productive engineers",
  "Roomy private office or large meeting room",
];

const eventTypes = [
  {
    name: "Demo Nights",
    description:
      "Build nights with demos to spotlight your project. Receive fast feedback, practice your pitch, and see what others are working on.",
  },
  {
    name: "Lightning Talks",
    description: "Sharing knowledge and stories through quick informal talks.",
  },
  {
    name: "Fireside Chats",
    description:
      "Conversations with seasoned founders who've been where you are. They'll share their journeys, answer questions, and offer insights into navigating your startup.",
  },
  {
    name: "Group Dinners",
    description: "Share a meal with other interesting, ambitious people.",
  },
  {
    name: "Paper Reading Groups",
    description: "Deep dives into the latest research and trends with a weekly reading group.",
  },
  {
    name: "Hackathons",
    description: "Monthly collaborations to build your ideas and meet new people.",
  },
];

function PrimaryButton({
  href,
  children,
  external = true,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const externalProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  return (
    <a
      href={href}
      {...externalProps}
      className="inline-block max-w-xs w-full border border-foreground/20 rounded-md px-8 py-5 text-sm tracking-widest uppercase bg-foreground/[0.03] hover:bg-foreground/10 transition-colors duration-300 text-center relative overflow-hidden"
    >
      <CornerDecorations size="xs" />
      {children}
    </a>
  );
}

function PhotoPlaceholder({ caption }: { caption: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[4/5] md:aspect-square w-full bg-white/5 border border-white/10 flex items-center justify-center">
        <span className="text-xs tracking-widest uppercase text-white/40">Photo</span>
      </div>
      <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed normal-case">
        {caption}
      </p>
    </div>
  );
}

export function Campus() {
  return (
    <section id="campus" style={{ color: "#fff" }}>
      {/* Hero */}
      <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 w-full">
        <div className="px-6 md:px-[4.5%] w-full">
          <FadeIn>
            <SectorHeader letter="C" name="Campus" color="#1A3A2E" />
          </FadeIn>

          <FadeIn>
            <div className="text-center max-w-4xl mx-auto">
              <p
                className="font-serif text-4xl md:text-6xl leading-[1.3] text-white mb-4 text-center"
                style={{ fontWeight: 300, textTransform: "uppercase", fontStyle: "normal" }}
              >
                Fractal Campus
              </p>
              <p className="font-serif text-lg md:text-xl text-white/80 mb-8 normal-case">
                111 Conselyea St, Brooklyn, NY
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <PrimaryButton href={LUMA_URL}>Visit by joining us for an event</PrimaryButton>
              </div>
              <p className="text-sm md:text-base text-white/90 font-light normal-case mb-2">
                Co-work with us! Register here — $300/mo
              </p>
              <p className="text-sm md:text-base text-white/90 font-light normal-case mb-3">
                Or Purchase a Day Pass for $40*
              </p>
              <p className="text-xs md:text-sm text-white/70 italic normal-case">
                *Want a reduced rate? Let us know. We want the space to be accessible to all.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Overview */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <div className="max-w-3xl">
            <p className="text-2xl md:text-3xl font-serif leading-tight mb-8 normal-case">
              A <span className="italic">campus</span> in the heart of Williamsburg.
            </p>
            <div className="space-y-6 text-sm md:text-base text-white/90 font-light leading-relaxed">
              <p>
                The Fractal Campus is a meeting place in the heart of Williamsburg to do your
                most ambitious work. We offer 4000+ square feet of both shared office space and
                private offices, two kitchens, a communal lounge, and a 5000+ square foot private
                roof deck.
              </p>
            </div>
            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm md:text-base text-white/90 font-light">
              {amenities.map((item) => (
                <li key={item} className="flex gap-3">
                  <span aria-hidden className="text-white/50">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>

      {/* Four audiences */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-8 normal-case">
            Fractal Campus serves four audiences
          </h2>
          <ul className="space-y-5 text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            <li>
              <strong className="font-semibold text-white">Fractal AI Accelerator participants</strong>
            </li>
            <li>
              <strong className="font-semibold text-white">
                <a
                  href={FRACTAL_U_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-white/40 hover:decoration-white transition-colors"
                >
                  Fractal U
                </a>{" "}
                students
              </strong>{" "}
              — participants in a class held on Campus
            </li>
            <li>
              <strong className="font-semibold text-white">Members</strong>, who have 24/7 access
              to our space for coworking and projects
            </li>
            <li>
              <strong className="font-semibold text-white">Guests</strong> coming to one of the 5+
              events we host per week
            </li>
          </ul>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
            <PrimaryButton href={FRACTAL_U_URL}>Fractal U</PrimaryButton>
          </div>
        </FadeIn>
      </div>

      {/* Get shit done */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">
            A place to get shit done…
          </h2>
          <div className="space-y-6 text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            <p>
              Fractal Campus is a curated community. Companies and members that work from the
              Campus have earnest intentions and a firm grip on reality. When we're not doing
              focused work, we're scheming with one another on side projects, figuring out how to
              advise the city government on tech policy, unblocking each other by asking incisive
              questions, or taking a look at that bug you're stuck on, just because it's fun.
            </p>
            <p>
              Oh, and our desks are set up with cushy office chairs and external monitors. Time is
              too precious for a single screen.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* And have a good time */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">
            …and have a good time doing it.
          </h2>
          <div className="space-y-6 text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            <p>
              We prioritize intentional community: you'll share space, meals, conversations, and
              ideate with small companies, talented founders, designers, and engineers from all
              over New York City, as well as be motivated by working alongside our Fractal AI
              Accelerator cohorts.
            </p>
            <p>
              The Campus hosts regular events in evenings and on weekends. We aim to ignite a New
              York City Renaissance by networking
            </p>
            <p>
              While we have strict rules against interrupting people who are mid-work, or being
              loud in our quiet spaces, people at Fractal Campus are social, ambitious, and eager
              to help each other win.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* More than a WeWork */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">
            More than a WeWork…
          </h2>
          <div className="space-y-6 text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            <p>
              When I was building my first startup, I'd eat my Chipotle bowl in the WeWork kitchen
              and eavesdrop on conversations about "optimizing engagement metrics through
              synergistic strategies".
            </p>
            <p>It was lonely. Life is too short for bullshit jobs and wasteful meetings.</p>
            <p>
              Fractal Campus is a sanctuary for serious, experimental tinkerers. Our relationships
              here matter, and you can trust that we are conspiring with everyone in the building
              to push your work forward. We're building a startup community the way we've always
              wanted — as a home away from home.
            </p>
            <p className="text-white/70 italic">— Andrew Rose, Fractal Campus co-founder</p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
            <PrimaryButton href={LUMA_URL}>
              I'm in, I want to become a member! ($300/mo)
            </PrimaryButton>
            <PrimaryButton href={LUMA_URL}>
              Or I want to purchase a Day Pass for $40!
            </PrimaryButton>
          </div>
        </FadeIn>
      </div>

      {/* Meet the Space */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">Meet the Space</h2>
          <p className="text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl mb-12">
            4200 sq ft of open working space, kitchen, phone booths, and large meeting rooms. Oh,
            and 5000 sq. ft of sunny rooftop. We're re-decorating the space now, and will continue
            to do so throughout winter, with an eye towards creativity, focus, and sunny vibes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {photoCaptions.map((caption) => (
              <PhotoPlaceholder key={caption} caption={caption} />
            ))}
          </div>
        </FadeIn>
      </div>

      {/* What's it like */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">
            What's it like to be here?
          </h2>
          <div className="space-y-6 text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            <p>
              Imagine waking up every day to work on projects and companies you burn for, beside
              people who motivate you, in a workplace dedicated to people who love their work.
            </p>
            <p>
              But it's more than that! Imagine a workplace dedicated to research, community,
              effectiveness, and play, where the ultimate product of our work is a one of a kind
              culture — a culture that creates the conditions for exceptional ambition and
              exceptional work, because you know the people here, you trust them, and you want to
              help each other succeed.
            </p>
            <p>
              Fractal Campus is the best place in the world for you to do your most ambitious
              work… no matter how old you are:
            </p>
            <p className="text-white/70 italic">Co-founder (and uncle) Jake Zegil</p>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
            <PrimaryButton href={LUMA_URL}>
              You've inspired me, I'm up for membership! — $300/mo
            </PrimaryButton>
            <PrimaryButton href={LUMA_URL}>
              Or I'm interested in a day pass! — $40
            </PrimaryButton>
          </div>
        </FadeIn>
      </div>

      {/* Events */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">Events</h2>
          <div className="mb-10 flex flex-col sm:flex-row gap-4 justify-start items-center">
            <PrimaryButton href={LUMA_URL}>Check out our Event Calendar</PrimaryButton>
          </div>
          <p className="text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl mb-8">
            Types of events we've hosted at the Fractal Campus so far:
          </p>
          <ul className="space-y-5 text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            {eventTypes.map((event) => (
              <li key={event.name}>
                <strong className="font-semibold text-white">{event.name}:</strong>{" "}
                {event.description}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            And many more — seriously, we've hosted almost one event per day we've been open!
          </p>
          <p className="mt-4 text-sm md:text-base text-white/70 italic font-light leading-relaxed max-w-3xl">
            Want to host an event here? Contact Andrew!
          </p>
        </FadeIn>
      </div>

      {/* Merlin's Place */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">
            Merlin's Place
          </h2>
          <p className="text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl mb-8">
            Merlin's Place is our communal living room — a Brooklyn loft that
            hundreds of neighbors share as a third space. It's where so many of
            our classes, dinners, hangouts, and friendships start.
          </p>
          <PrimaryButton href="https://merlins.place/">
            Visit Merlin's Place
          </PrimaryButton>
        </FadeIn>
      </div>

      {/* Williamsburg */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-32">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">
            Our little corner in Williamsburg
          </h2>
          <p className="text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            We're in the heart of Williamsburg, a few blocks away from the commercial hotspot
            Bedford Avenue. You'll have easy access to great eats, cafes, and transit to
            Manhattan.
          </p>
        </FadeIn>
      </div>

      {/* McCarren Park */}
      <div className="max-w-7xl mx-auto px-6 md:px-[4.5%] pb-24 md:pb-40">
        <FadeIn>
          <h2 className="text-2xl md:text-3xl font-serif mb-6 normal-case">
            …and a short walk to McCarren Park
          </h2>
          <blockquote className="border-l-2 border-white/30 pl-6 my-6 max-w-3xl">
            <p className="text-lg md:text-xl font-serif italic text-white/90 leading-relaxed normal-case">
              "All truly great thoughts are conceived while walking."
            </p>
            <footer className="mt-3 text-sm text-white/70 normal-case">
              — Friedrich Nietzsche
            </footer>
          </blockquote>
          <p className="text-sm md:text-base text-white/90 font-light leading-relaxed max-w-3xl">
            For more, check out our PamPam map of our favorite spots to eat, drink, and explore
            nearby!
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

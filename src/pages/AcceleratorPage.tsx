import { useRef, type CSSProperties, type ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AccelHeroCanvas } from "@/components/sections/AccelHeroCanvas";

/**
 * The Accelerator page is the odd one out.
 *
 * Every other route themes the Fractal NYC brand with a house color pair. This
 * one renders a DIFFERENT brand — the Fractal Accelerator (burgundy / white /
 * warm cream, Fraunces + Inter, soft shadows, hairline borders). So, unlike its
 * siblings, it carries no <FractalPattern>, no pennant banners, and ships its
 * own small footer instead of the shared <Footer />.
 *
 * It still renders the shared <Navbar />, so <main> sets `--page-bg` — the
 * sticky bar paints itself with it and reads as part of the burgundy flood.
 *
 * Type: the accelerator brand's headings are plain Fraunces (sentence case,
 * heavier) rather than the site's uppercase/italic display tiers, so headings
 * here lean on the bare h1–h3 family default from index.css plus Tailwind
 * scale utilities. `.text-body` / `.text-body-lead` carry the Inter body tiers.
 * All color comes from the page-scoped `accel-*` tokens.
 */

const APPLY_URL = "https://www.fractalaccelerator.com/apply";

const EYEBROW = "font-sans text-xs font-semibold uppercase tracking-[0.18em]";
const PANEL_HEADING = "text-3xl font-medium leading-tight";
const CTA_BASE =
  "inline-block rounded-sm px-7 py-3 font-sans text-base font-medium no-underline transition-all duration-200";

interface Testimonial {
  role: string;
  quote: string;
  name: string;
  title: string;
  image: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    role: "The Consultant",
    quote:
      "“I went from idea to launch in one week. Previously that took a team of four and three months.”",
    name: "Erik C.",
    title: "Management Consultant",
    image: "/images/accelerator/erik.jpeg",
  },
  {
    role: "The Analyst",
    quote:
      "“I built an interactive data portal with citations in an hour. That used to take weeks.”",
    name: "Daniel G.",
    title: "Policy Analyst",
    image: "/images/accelerator/daniel.jpeg",
  },
  {
    role: "The Engineer",
    quote:
      "“I ship more work talking to my phone on a walk than I used to in a full day at my desk.”",
    name: "Parth A.",
    title: "Founding Engineer",
    image: "/images/accelerator/parth.png",
  },
];

/* The five result icons. Literal rgba() in SVG presentation attributes is the
   sanctioned exception to the token rule — `var()` does not resolve there. The
   values are `accel-pale` (#FCEBED) at varying alpha. */
const RESULTS: { icon: ReactNode; title: string; body: string }[] = [
  {
    title: "Accelerate your work",
    body: "Learn to make AI work while you sleep, & tackle dozens of tasks in parallel. Kickoff work from anywhere using your phone. Zoom through work by talking to your computer.",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <line x1="43" y1="37" x2="78" y2="3" stroke="rgba(252,235,237,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="44" y1="38" x2="75" y2="18" stroke="rgba(252,235,237,0.2)" strokeWidth="1" strokeLinecap="round" />
        <line x1="44" y1="39" x2="72" y2="30" stroke="rgba(252,235,237,0.25)" strokeWidth="1" strokeLinecap="round" />
        <line x1="44" y1="40" x2="78" y2="38" stroke="rgba(252,235,237,0.18)" strokeWidth="1" strokeLinecap="round" />
        <line x1="44" y1="41" x2="70" y2="48" stroke="rgba(252,235,237,0.22)" strokeWidth="1" strokeLinecap="round" />
        <line x1="44" y1="42" x2="75" y2="58" stroke="rgba(252,235,237,0.2)" strokeWidth="1" strokeLinecap="round" />
        <line x1="43" y1="43" x2="78" y2="77" stroke="rgba(252,235,237,0.3)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="43" y1="44" x2="68" y2="68" stroke="rgba(252,235,237,0.15)" strokeWidth="1" strokeLinecap="round" />
        <line x1="37" y1="37" x2="2" y2="3" stroke="rgba(252,235,237,0.22)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="36" y1="38" x2="8" y2="18" stroke="rgba(252,235,237,0.15)" strokeWidth="1" strokeLinecap="round" />
        <line x1="36" y1="39" x2="5" y2="32" stroke="rgba(252,235,237,0.18)" strokeWidth="1" strokeLinecap="round" />
        <line x1="36" y1="40" x2="3" y2="40" stroke="rgba(252,235,237,0.12)" strokeWidth="1" strokeLinecap="round" />
        <line x1="36" y1="41" x2="8" y2="50" stroke="rgba(252,235,237,0.15)" strokeWidth="1" strokeLinecap="round" />
        <line x1="36" y1="42" x2="5" y2="58" stroke="rgba(252,235,237,0.18)" strokeWidth="1" strokeLinecap="round" />
        <line x1="37" y1="43" x2="2" y2="77" stroke="rgba(252,235,237,0.22)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="37" y1="44" x2="12" y2="68" stroke="rgba(252,235,237,0.12)" strokeWidth="1" strokeLinecap="round" />
        <line x1="41" y1="36" x2="52" y2="2" stroke="rgba(252,235,237,0.18)" strokeWidth="1" strokeLinecap="round" />
        <line x1="40" y1="36" x2="40" y2="3" stroke="rgba(252,235,237,0.15)" strokeWidth="1" strokeLinecap="round" />
        <line x1="39" y1="36" x2="28" y2="2" stroke="rgba(252,235,237,0.18)" strokeWidth="1" strokeLinecap="round" />
        <line x1="41" y1="44" x2="52" y2="78" stroke="rgba(252,235,237,0.18)" strokeWidth="1" strokeLinecap="round" />
        <line x1="40" y1="44" x2="40" y2="77" stroke="rgba(252,235,237,0.15)" strokeWidth="1" strokeLinecap="round" />
        <line x1="39" y1="44" x2="28" y2="78" stroke="rgba(252,235,237,0.18)" strokeWidth="1" strokeLinecap="round" />
        <circle cx="40" cy="40" r="4" fill="rgb(252,235,237)" />
      </svg>
    ),
  },
  {
    title: "Build without limits",
    body: "Build websites, video games, data visualizations, research reports, even hardware projects. Finish with a portfolio of work, and the ability to build whatever else you need.",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="40" cy="40" r="5" fill="rgb(252,235,237)" />
        <circle cx="40" cy="18" r="4" fill="rgba(252,235,237,0.35)" stroke="rgba(252,235,237,0.2)" strokeWidth="1" />
        <circle cx="59" cy="29" r="4" fill="rgba(252,235,237,0.3)" stroke="rgba(252,235,237,0.2)" strokeWidth="1" />
        <circle cx="59" cy="51" r="4" fill="rgba(252,235,237,0.25)" stroke="rgba(252,235,237,0.2)" strokeWidth="1" />
        <circle cx="40" cy="62" r="4" fill="rgba(252,235,237,0.2)" stroke="rgba(252,235,237,0.2)" strokeWidth="1" />
        <circle cx="21" cy="51" r="4" fill="rgba(252,235,237,0.25)" stroke="rgba(252,235,237,0.2)" strokeWidth="1" />
        <circle cx="21" cy="29" r="4" fill="rgba(252,235,237,0.3)" stroke="rgba(252,235,237,0.2)" strokeWidth="1" />
        <line x1="40" y1="35" x2="40" y2="22" stroke="rgba(252,235,237,0.15)" strokeWidth="1" />
        <line x1="44" y1="36" x2="55" y2="30" stroke="rgba(252,235,237,0.15)" strokeWidth="1" />
        <line x1="44" y1="44" x2="55" y2="50" stroke="rgba(252,235,237,0.15)" strokeWidth="1" />
        <line x1="40" y1="45" x2="40" y2="58" stroke="rgba(252,235,237,0.15)" strokeWidth="1" />
        <line x1="36" y1="44" x2="25" y2="50" stroke="rgba(252,235,237,0.15)" strokeWidth="1" />
        <line x1="36" y1="36" x2="25" y2="30" stroke="rgba(252,235,237,0.15)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    title: "Find more focus",
    body: "Automate the repetitive parts of your work. Delegate the boring parts to the computer. Let the AI use the apps you hate. Spend more time on what actually matters.",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="40" cy="8" r="5" fill="rgb(252,235,237)" />
        <circle cx="30" cy="25" r="4" fill="rgba(252,235,237,0.55)" />
        <circle cx="50" cy="25" r="4" fill="rgba(252,235,237,0.55)" />
        <circle cx="22" cy="42" r="3.5" fill="rgba(252,235,237,0.3)" />
        <circle cx="40" cy="42" r="3.5" fill="rgba(252,235,237,0.3)" />
        <circle cx="58" cy="42" r="3.5" fill="rgba(252,235,237,0.3)" />
        <circle cx="14" cy="59" r="3" fill="rgba(252,235,237,0.15)" />
        <circle cx="30" cy="59" r="3" fill="rgba(252,235,237,0.15)" />
        <circle cx="50" cy="59" r="3" fill="rgba(252,235,237,0.15)" />
        <circle cx="66" cy="59" r="3" fill="rgba(252,235,237,0.15)" />
        <circle cx="8" cy="74" r="2.5" fill="rgba(252,235,237,0.07)" />
        <circle cx="22" cy="74" r="2.5" fill="rgba(252,235,237,0.07)" />
        <circle cx="40" cy="74" r="2.5" fill="rgba(252,235,237,0.07)" />
        <circle cx="58" cy="74" r="2.5" fill="rgba(252,235,237,0.07)" />
        <circle cx="72" cy="74" r="2.5" fill="rgba(252,235,237,0.07)" />
      </svg>
    ),
  },
  {
    title: "Make yourself smarter",
    body: "Setup an AI system that improves itself. Teach it about your area of expertise. Then, think through your hardest problems together.",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <ellipse cx="40" cy="68" rx="12" ry="5" stroke="rgba(252,235,237,0.12)" strokeWidth="1" fill="none" />
        <ellipse cx="40" cy="55" rx="18" ry="6" stroke="rgba(252,235,237,0.18)" strokeWidth="1" fill="none" />
        <ellipse cx="40" cy="42" rx="24" ry="7" stroke="rgba(252,235,237,0.25)" strokeWidth="1.5" fill="none" />
        <ellipse cx="40" cy="28" rx="30" ry="8" stroke="rgba(252,235,237,0.35)" strokeWidth="1.5" fill="none" />
        <ellipse cx="40" cy="14" rx="35" ry="9" stroke="rgba(252,235,237,0.45)" strokeWidth="1.5" fill="none" />
        <line
          x1="40"
          y1="75"
          x2="40"
          y2="3"
          stroke="rgba(252,235,237,0.12)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="3 4"
        />
        <circle cx="40" cy="6" r="4" fill="rgb(252,235,237)" />
      </svg>
    ),
  },
  {
    title: "Become a leader",
    body: "Develop a real understanding of how AI works. Become the person your team turns to when they need to understand AI.",
    icon: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="40" cy="40" r="34" stroke="rgba(252,235,237,0.08)" strokeWidth="1" />
        <circle cx="40" cy="40" r="24" stroke="rgba(252,235,237,0.12)" strokeWidth="1" />
        <circle cx="40" cy="40" r="14" stroke="rgba(252,235,237,0.2)" strokeWidth="1.5" />
        <circle cx="40" cy="40" r="5" fill="rgb(252,235,237)" />
        <circle cx="40" cy="6" r="4.5" fill="rgba(252,235,237,0.55)" />
        <circle cx="66" cy="30" r="4" fill="rgba(252,235,237,0.45)" />
        <circle cx="18" cy="52" r="3.5" fill="rgba(252,235,237,0.4)" />
        <circle cx="58" cy="62" r="3" fill="rgba(252,235,237,0.35)" />
      </svg>
    ),
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "Learn & cowork every Saturday on campus",
    body: "10am-1pm at Fractal Campus in NYC. Hands-on learning sessions, community coworking.",
  },
  {
    title: "Apply what you've learned at work",
    body: "~15 hours of weekly practice. Applied projects designed to make your real work better.",
  },
  {
    title: "Compound your skills each week",
    body: "Each week builds on the last. Every week, you work faster and more effectively.",
  },
];

const INCLUDED: string[] = [
  "6 Saturday sessions at Fractal Campus",
  "Shipped projects and portfolio",
  "Curated AI toolkit and resources",
  "Cross-industry peer community",
  "~3 hours/week drop-in office hours",
  "Focused co-working every Saturday",
  "24/7 campus access",
  "Events, demos, community nights",
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Will this work for me? I'm not technical.",
    answer:
      "You don't need to be. We meet you where you are, and the curriculum is designed for professionals who've never written code.",
  },
  {
    question: "I don't have 15 hours a week.",
    answer:
      "The 15 hours aren't homework on top of your life. You're applying AI to your existing work - building tools and automations that make your real job faster. Practice time replaces busywork, not free time.",
  },
  {
    question: "How is this different from just using ChatGPT?",
    answer:
      "ChatGPT is just the surface of what AI can do. This program drops you below the consumer layer to the raw tools - agents, automation, code generation, & compound systems. It's like the difference between playing a racing game and building your own race car.",
  },
  {
    question: "What if I fall behind?",
    answer:
      "Office hours, coworking blocks, and self-paced applied practice are all built in. The program is designed for working professionals with busy schedules.",
  },
];

export function AcceleratorPage() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <main
      className="min-h-screen bg-house-accelerator-light font-sans text-accel-pale"
      style={{ "--page-bg": "var(--color-house-accelerator-light)" } as CSSProperties}
    >
      <Navbar />

      {/* HERO + SOCIAL PROOF — one cream surface, one shared canvas backdrop. */}
      <div className="relative overflow-hidden bg-accel-cream text-accel-ink">
        <AccelHeroCanvas heroRef={heroRef} />

        <section
          ref={heroRef}
          className="relative mx-auto max-w-[1080px] px-6 pt-16 pb-12 text-center md:px-10 md:pt-24 md:pb-[72px]"
        >
          <div className={`${EYEBROW} mb-4 text-accel-ink/60`}>Learn AI, in-person, in NYC</div>
          <h1 className="text-balance mb-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
            Turn 6 weeks into
            <br />
            years of <em className="font-normal italic text-accel-emphasis">acceleration</em>
          </h1>
          <p className="text-body-lead mx-auto mb-6 max-w-[600px] text-accel-ink/85">
            A hands-on program for ambitious professionals who want to master AI. Unlock excellent
            work, move faster, and join a community of builders.
          </p>
          <a
            href={APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${CTA_BASE} bg-accel-cta text-white hover:shadow-lg`}
          >
            Reserve your spot
          </a>
          <p className="text-body mt-4 text-sm text-accel-ink/60">
            Consultants, analysts, and engineers are already building with us.
          </p>
        </section>

        <section className="relative px-6 pb-12 md:px-10">
          <div className="mx-auto flex max-w-[900px] flex-col gap-6 md:flex-row md:flex-wrap">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="relative z-[2] flex flex-1 flex-col rounded-md border border-accel-ink/10 bg-white p-5 text-accel-ink shadow-sm transition-shadow hover:shadow-md md:basis-[240px]"
              >
                <figcaption className={`${EYEBROW} mb-2 text-accel-emphasis`}>{t.role}</figcaption>
                <blockquote className="mb-3.5 flex-1 font-serif text-base font-normal normal-case italic leading-snug">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-2.5">
                  <img
                    src={t.image}
                    alt={t.name}
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-full bg-accel-ink/10 object-cover"
                  />
                  <div>
                    <div className="text-body font-medium">{t.name}</div>
                    <div className="text-body text-sm text-accel-ink/60">{t.title}</div>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        </section>
      </div>

      {/* YOUR RESULTS — the burgundy flood shows through. */}
      <section className="px-6 py-16 text-accel-pale md:px-10 md:py-[72px]">
        <div className="mx-auto max-w-[720px]">
          <div className={`${EYEBROW} mb-3 text-accel-pale/50`}>Our program</div>
          <h2 className="mb-8 text-3xl font-semibold leading-tight">Your Results</h2>
          {RESULTS.map((r) => (
            <div
              key={r.title}
              className="flex items-center gap-4 border-t border-accel-pale/15 py-6 md:gap-5"
            >
              <div aria-hidden="true" className="h-16 w-16 shrink-0 md:h-20 md:w-20">
                {r.icon}
              </div>
              <div className="flex-1">
                <h3 className="mb-1.5 text-xl font-normal">{r.title}</h3>
                <p className="text-body text-sm leading-relaxed text-accel-pale/70">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — white panel. */}
      <section className="bg-white px-6 py-12 text-accel-ink md:px-10">
        <div className="mx-auto max-w-[900px]">
          <div className={`${EYEBROW} mb-2 text-accel-ink/60`}>Our process</div>
          <h2 className={`${PANEL_HEADING} mb-2`}>Three steps, six weeks</h2>
          <p className="text-body mb-6 text-accel-ink/70">
            The first cohort kicks off Saturday, July 11, 2026, and runs six weeks.
          </p>
          <div className="flex flex-col items-stretch gap-10 md:flex-row md:flex-wrap">
            <div className="relative min-h-[280px] min-w-0 flex-1 md:basis-[300px]">
              <img
                src="/images/accelerator/session-learning.jpg"
                alt="Students collaborating around laptops at Fractal Campus"
                loading="lazy"
                className="absolute inset-0 block h-full w-full rounded-md object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 md:basis-[300px]">
              {STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className={`flex gap-4 py-5 ${
                    i < STEPS.length - 1 ? "border-b border-accel-ink/5" : ""
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className="min-w-10 font-serif text-5xl font-light normal-case not-italic leading-none text-accel-ink/25"
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-body mb-1 font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-body text-sm leading-relaxed text-accel-ink/75">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED — cream panel, image on the right at md+. */}
      <section className="bg-accel-cream px-6 py-12 text-accel-ink md:px-10">
        <div className="mx-auto max-w-[900px]">
          <div className="flex flex-col items-stretch gap-10 md:flex-row-reverse md:flex-wrap">
            <div className="relative min-h-[280px] min-w-0 flex-1 md:basis-[300px]">
              <img
                src="/images/accelerator/workspace.jpg"
                alt="People working at Fractal Campus"
                loading="lazy"
                className="absolute inset-0 block h-full w-full rounded-md object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 md:basis-[300px]">
              <div className={`${EYEBROW} mb-2 text-accel-ink/60`}>What's included</div>
              <h2 className={`${PANEL_HEADING} mb-6`}>Everything you need</h2>
              <ul>
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-3 py-1">
                    <span
                      aria-hidden="true"
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accel-emphasis text-[10px] leading-none text-white"
                    >
                      &#10003;
                    </span>
                    <span className="text-body-lead font-normal leading-normal">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE ARE — white panel. */}
      <section className="bg-white px-6 py-12 text-accel-ink md:px-10">
        <div className="mx-auto max-w-[720px]">
          <div className={`${EYEBROW} mb-2 text-accel-ink/60`}>Who we are</div>
          <h2 className={`${PANEL_HEADING} mb-6`}>Built by engineers who teach AI full-time</h2>
          <p className="text-body-lead mb-4">
            Fractal started as an AI engineering accelerator in NYC. Our team includes founding
            engineers and instructors from Netflix, Google, and Stripe.
          </p>
          <p className="text-body-lead">
            Now we're bringing the same hands-on approach, professional tools, and ambitious
            community to professionals who don't have a software background.
          </p>
        </div>
      </section>

      {/* FAQ — white panel. */}
      <section className="bg-white px-6 py-12 text-accel-ink md:px-10">
        <div className="mx-auto max-w-[720px]">
          <div className={`${EYEBROW} mb-2 text-accel-ink/60`}>Answers to</div>
          <h2 className={`${PANEL_HEADING} mb-6`}>Frequently asked questions</h2>
          {FAQS.map((faq, i) => (
            <div
              key={faq.question}
              className={`border-b border-accel-ink/10 py-6 ${
                i === 0 ? "border-t border-accel-ink/10" : ""
              }`}
            >
              <h3 className="text-body mb-2 text-lg font-semibold">{faq.question}</h3>
              <p className="text-body leading-relaxed text-accel-ink/80">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TERMINAL CTA — burgundy flood. */}
      <section className="px-6 pt-16 pb-8 text-center text-accel-pale md:px-10 md:pt-24">
        <div className="mx-auto max-w-[720px]">
          <h2 className="mb-3 text-3xl font-semibold leading-tight">Ready to start?</h2>
          <p className="text-body mb-7 text-accel-pale/70">
            Applications are open for the first cohort, starting July 11, 2026.
          </p>
          <a
            href={APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${CTA_BASE} bg-accel-pale text-accel-ink hover:shadow-lg`}
          >
            Reserve your spot
          </a>
        </div>
      </section>

      {/* This page ships its own footer — the shared <Footer /> belongs to the
          Fractal NYC brand, not the Accelerator's. */}
      <footer className="px-5 py-8 text-center text-sm text-accel-pale/50">
        <div>Fractal Accelerator &middot; NYC</div>
        <div className="mt-2">&copy; 2026</div>
      </footer>
    </main>
  );
}

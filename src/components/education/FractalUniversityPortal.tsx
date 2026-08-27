import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { EducationOutboundLink } from "@/components/education/EducationOutboundLink";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import { FadeIn } from "@/components/ui/FadeIn";
import {
  FRACTALU_CATALOG,
  FRACTALU_CATEGORIES,
  type FractalUClub,
  type FractalUCourse,
} from "@/data/fractalu";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const FINE_POINTER_PREVIEW_QUERY =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine)";

const COURSE_REVEAL_STEP = 0.06;
const COURSE_REVEAL_MAX = 0.3;

function RevealSlot({
  children,
  delay,
  animate = true,
  kind,
}: {
  children: ReactNode;
  delay: number;
  animate?: boolean;
  kind: "course" | "club";
}) {
  const dataAttributes = {
    "data-fractalu-reveal-slot": kind,
    "data-fractalu-reveal-mode": animate ? "animated" : "static",
    "data-fractalu-reveal-delay": delay.toFixed(2),
  };

  if (!animate) {
    return (
      <div className="h-full min-w-0" {...dataAttributes}>
        {children}
      </div>
    );
  }

  return (
    <FadeIn delay={delay} className="h-full min-w-0">
      <div className="h-full min-w-0" {...dataAttributes}>
        {children}
      </div>
    </FadeIn>
  );
}

function useLargeTextScale() {
  const measure = () =>
    typeof window !== "undefined" &&
    Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) >= 24;
  const [usesLargeText, setUsesLargeText] = useState(measure);

  useEffect(() => {
    const update = () => setUsesLargeText(measure());
    update();
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(document.documentElement);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return usesLargeText;
}

function CourseDescriptionPreview({ course }: { course: FractalUCourse }) {
  return (
    <p
      id={`${course.id}-description`}
      className="fractalu-course-preview fractalu-course-description text-body mt-3 leading-relaxed text-foreground-muted md:mt-4"
      data-course-description
    >
      {course.description}
    </p>
  );
}

interface InstructorBioPreviewProps {
  course: FractalUCourse;
  isFinePointer: boolean;
  pinned: boolean;
  suppressed: boolean;
  onToggle: () => void;
  onEscape: () => void;
  onSuppressionReset: () => void;
}

function InstructorBioPreview({
  course,
  isFinePointer,
  pinned,
  suppressed,
  onToggle,
  onEscape,
  onSuppressionReset,
}: InstructorBioPreviewProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const bioId = `${course.id}-instructor-bio`;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape" || !pinned) return;
    event.preventDefault();
    event.stopPropagation();
    onEscape();
    buttonRef.current?.focus();
  };

  return (
    <div
      className="fractalu-instructor-preview relative min-w-0"
      data-pinned={pinned ? "true" : "false"}
      data-suppressed={suppressed ? "true" : "false"}
      onBlurCapture={(event) => {
        const nextTarget = event.relatedTarget;
        if (
          suppressed &&
          (!nextTarget || !event.currentTarget.contains(nextTarget as Node))
        ) {
          onSuppressionReset();
        }
      }}
    >
      {isFinePointer ? (
        <button
          ref={buttonRef}
          type="button"
          aria-controls={bioId}
          aria-expanded={pinned}
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          className="text-body mt-1 min-h-11 max-w-full rounded-md text-left text-foreground-muted underline decoration-foreground-faint underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light md:mt-2"
          data-instructor-name
        >
          {course.instructor}
        </button>
      ) : (
        <p className="text-body mt-1 text-foreground-muted md:mt-2" data-instructor-name>
          {course.instructor}
        </p>
      )}
      <div
        id={bioId}
        className="fractalu-course-preview fractalu-instructor-bio text-body mt-3 space-y-3 leading-relaxed text-foreground-muted"
        data-instructor-bio
        style={
          isFinePointer && suppressed
            ? { opacity: 0, visibility: "hidden" }
            : undefined
        }
      >
        {course.instructors.map((instructor) => (
          <p key={instructor.name} data-instructor-record>
            {instructor.bio}
          </p>
        ))}
      </div>
    </div>
  );
}

function CourseActions({ course }: { course: FractalUCourse }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 md:mt-5">
      <EducationOutboundLink
        href={course.applicationUrl}
        accessibleName={`${course.applicationLabel} for ${course.title}`}
      >
        {course.applicationLabel}
      </EducationOutboundLink>
      {course.videoUrl && (
        <EducationOutboundLink
          href={course.videoUrl}
          accessibleName={`Watch video for ${course.title}`}
        >
          Watch video
        </EducationOutboundLink>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: FractalUCourse;
  isFinePointer: boolean;
  pinnedInstructorId: string | null;
  suppressedInstructorId: string | null;
  setPinnedInstructorId: (id: string | null) => void;
  setSuppressedInstructorId: (id: string | null) => void;
}

function CourseCard({
  course,
  isFinePointer,
  pinnedInstructorId,
  suppressedInstructorId,
  setPinnedInstructorId,
  setSuppressedInstructorId,
}: CourseCardProps) {
  const descriptionId = `${course.id}-description`;
  const instructorPinned = pinnedInstructorId === course.id;

  return (
    <MandelbrotCorners size="xs" opacity={0.12} className="h-full min-w-0">
    <article
      className="fractalu-course-card group min-w-0 max-w-full rounded-lg border border-foreground-faint bg-background p-6 text-foreground"
      data-course-category={course.category}
      data-course-id={course.id}
    >
      <div className="mb-2 flex min-w-0 items-start gap-3 md:mb-3">
        <p className="text-label min-w-0 [overflow-wrap:anywhere] text-house-education-light">
          {course.category}
        </p>
      </div>

      <div className="fractalu-title-preview relative min-w-0">
        <h3 className="text-subtitle min-w-0 leading-snug normal-case text-foreground [overflow-wrap:anywhere]">
          {course.detailsUrl ? (
            <EducationOutboundLink
              href={course.detailsUrl}
              accessibleName={`${course.title} course description`}
              aria-describedby={descriptionId}
              variant="course-title"
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">{course.title}</span>
            </EducationOutboundLink>
          ) : (
            <span
              tabIndex={0}
              aria-describedby={descriptionId}
              className="block min-w-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light"
              data-course-title-fallback
            >
              {course.title}
            </span>
          )}
        </h3>
        <InstructorBioPreview
          course={course}
          isFinePointer={isFinePointer}
          pinned={instructorPinned}
          suppressed={isFinePointer && suppressedInstructorId === course.id}
          onToggle={() => {
            setSuppressedInstructorId(null);
            setPinnedInstructorId(instructorPinned ? null : course.id);
          }}
          onEscape={() => {
            setPinnedInstructorId(null);
            setSuppressedInstructorId(course.id);
          }}
          onSuppressionReset={() => setSuppressedInstructorId(null)}
        />
        <CourseDescriptionPreview course={course} />
      </div>

      <dl
        className="mt-4 grid min-w-0 grid-cols-2 gap-x-3 gap-y-2 text-sm text-foreground-muted md:mt-5 md:gap-3"
        data-course-facts
      >
        {[
          ["Schedule", course.schedule],
          ["Dates", course.dates],
          ["Location", course.location],
          ["Price", course.price],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 [overflow-wrap:anywhere]">
            <dt className="text-label text-foreground">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
      <CourseActions course={course} />
      <div
        className="mt-4 h-0.5 w-8 rounded-full bg-house-education-light opacity-40 transition-all duration-300 group-hover:w-12 group-hover:opacity-70 group-focus-within:w-12 group-focus-within:opacity-70 md:mt-6"
        aria-hidden="true"
      />
    </article>
    </MandelbrotCorners>
  );
}

function CourseCatalog({
  courses,
  isFinePointer,
  animateInitialCards,
}: {
  courses: FractalUCourse[];
  isFinePointer: boolean;
  animateInitialCards: boolean;
}) {
  const [pinnedInstructorId, setPinnedInstructorId] = useState<string | null>(null);
  const [suppressedInstructorId, setSuppressedInstructorId] = useState<string | null>(null);

  useEffect(() => {
    setPinnedInstructorId(null);
    setSuppressedInstructorId(null);
  }, [isFinePointer]);

  useEffect(() => {
    if (!pinnedInstructorId) return;
    const closePinnedBio = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      const trigger = document.querySelector<HTMLButtonElement>(
        `[aria-controls="${pinnedInstructorId}-instructor-bio"]`,
      );
      setPinnedInstructorId(null);
      setSuppressedInstructorId(pinnedInstructorId);
      trigger?.focus();
    };
    window.addEventListener("keydown", closePinnedBio);
    return () => window.removeEventListener("keydown", closePinnedBio);
  }, [pinnedInstructorId]);

  return (
    <div
      className="fractalu-course-grid mt-4 min-w-0 md:mt-8"
      data-testid="fractalu-course-catalog"
      data-course-collection
      data-preview-mode={isFinePointer ? "enhanced" : "inline"}
    >
      {courses.map((course, index) => (
        <RevealSlot
          key={course.id}
          kind="course"
          animate={animateInitialCards}
          delay={Math.min(index * COURSE_REVEAL_STEP, COURSE_REVEAL_MAX)}
        >
          <CourseCard
            course={course}
            isFinePointer={isFinePointer}
            pinnedInstructorId={pinnedInstructorId}
            suppressedInstructorId={suppressedInstructorId}
            setPinnedInstructorId={setPinnedInstructorId}
            setSuppressedInstructorId={setSuppressedInstructorId}
          />
        </RevealSlot>
      ))}
    </div>
  );
}

function ClubCard({ club }: { club: FractalUClub }) {
  return (
    <MandelbrotCorners size="xs" opacity={0.12} className="h-full min-w-0">
    <article
      className="fractalu-club-card group min-w-0 max-w-full rounded-lg border border-foreground-faint bg-background p-6 text-foreground"
      data-club-id={club.id}
    >
      <h3 className="text-subtitle normal-case text-foreground [overflow-wrap:anywhere]">
        {club.name}
      </h3>
      <dl
        className="mt-4 grid min-w-0 gap-3 text-sm text-foreground-muted sm:grid-cols-2"
        data-club-metadata
      >
        {[
          ["Schedule", club.schedule],
          ["Location", club.location],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 [overflow-wrap:anywhere]">
            <dt className="text-label text-foreground">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-body mt-4 leading-relaxed text-foreground-muted">{club.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {club.detailsUrl && (
          <EducationOutboundLink
            href={club.detailsUrl}
            accessibleName={`${club.detailsLabel ?? "Group details"} for ${club.name}`}
          >
            {club.detailsLabel ?? "Group details"}
          </EducationOutboundLink>
        )}
        <EducationOutboundLink
          href={club.actionUrl}
          accessibleName={`${club.actionLabel} for ${club.name}`}
        >
          {club.actionLabel}
        </EducationOutboundLink>
      </div>
    </article>
    </MandelbrotCorners>
  );
}

function FractalUInformation() {
  return (
    <div className="relative z-10 pt-24 text-background md:pt-32" data-fractalu-information>
      <FadeIn>
        <section
          id="what-is-fractalu"
          tabIndex={-1}
          className="mx-auto max-w-7xl scroll-mt-24 page-gutter focus-visible:outline-none"
          aria-labelledby="fractalu-about-title"
          data-fractalu-information-reveal="about"
        >
          <div className="mx-auto max-w-3xl">
            <h2 id="fractalu-about-title" className="text-title mb-8 normal-case">
              What is FractalU?
            </h2>
            <div className="text-body-lead space-y-6 text-background/90">
              <p>
                FractalU is an improvised college in New York City. We offer in-person
                classes at low cost, to anyone in the city. We&apos;re a community of
                people who want to learn, conduct research, and do great work together.
                You can join as an instructor, a student, or both.
              </p>
              <p>
                Anyone can apply to teach. Anyone in NYC can apply to take a class. No
                credentials, no grades, no gatekeeping. Classes meet weekly from living
                rooms, community spaces, and dedicated third spaces across Brooklyn and
                Manhattan.
              </p>
              <p>
                We&apos;ve run over 100 classes to more than 1,000 students since Fall
                2023. The catalog spans STEM, computer science, AI, mind-body practices,
                arts, civics, close readings of great books, and experimental formats.
                No theme, no required canon for students. The range reflects the
                pluralism of the people who show up.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section
          className="mx-auto mt-16 max-w-2xl page-gutter md:mt-24"
          aria-labelledby="fractalu-teach-title"
          data-fractalu-information-reveal="teach"
        >
          <MandelbrotCorners
            size="sm"
            opacity={0.15}
            className="rounded-md border bg-background p-9 text-left text-foreground [border-color:var(--accent,currentColor)]"
          >
            <p id="fractalu-teach-title" className="text-label mb-3 text-house-education-deep">
              Want to teach?
            </p>
            <p className="text-body leading-relaxed text-foreground-muted">
              We&apos;re always looking for instructors with something to share — a
              craft, a body of work, an obsession. Email{" "}
              <EducationOutboundLink
                href="mailto:fractalu@fractalnyc.com"
                typography="body"
                className="align-middle"
              >
                fractalu@fractalnyc.com
              </EducationOutboundLink>{" "}
              with a sentence or two about what you&apos;d teach.
            </p>
          </MandelbrotCorners>
        </section>
      </FadeIn>

      <FadeIn>
        <section
          className="mx-auto mt-24 max-w-7xl page-gutter md:mt-32"
          aria-labelledby="fractalu-etiquette-title"
          data-fractalu-information-reveal="etiquette"
        >
          <div className="mx-auto max-w-3xl">
            <h2 id="fractalu-etiquette-title" className="text-title mb-6 normal-case">
              The etiquette
            </h2>
            <ol className="text-body-lead list-decimal space-y-3 pl-6 text-background/90">
              <li>Take yourself and others seriously.</li>
              <li>Be concrete; no bullshitting.</li>
              <li>Collaborate joyfully and publicly.</li>
            </ol>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section
          className="mx-auto mt-24 max-w-7xl page-gutter md:mt-32"
          aria-labelledby="fractalu-canon-title"
          data-fractalu-information-reveal="canon"
        >
          <div className="mx-auto max-w-3xl">
            <h2 id="fractalu-canon-title" className="text-title mb-6 normal-case">
              The canon
            </h2>
            <div className="text-body-lead space-y-6 text-background/90">
              <p>
                FractalU has a shared intellectual foundation — six essays on what it
                means to do significant work, find knowledge frontiers, and learn in
                community. It was introduced by Andrew Rose to design the school&apos;s
                intellectual environment, the way the Federalist Papers established
                principles for the Constitution.
              </p>
              <p>
                The six pieces are by Adam Mastroianni, Slime Mold Time Mold, Samo
                Burja, Richard Hamming, Paul Graham, and Alan Kay. Together they point
                toward an environment where people read hundreds of books a year, take
                dozens of classes, pursue their curiosities, and do science.
              </p>
            </div>
            <div
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2"
              data-fractalu-resource-links
            >
              <EducationOutboundLink
                href="https://ajr.fyi/files/fractal-canon.pdf"
                accessibleName="Read the FractalU canon PDF"
                tone="dark"
                data-fractalu-resource-link=""
              >
                Read the canon (PDF)
              </EducationOutboundLink>
              <EducationOutboundLink
                href="https://fractaluniversity.substack.com"
                accessibleName="FractalU Substack"
                tone="dark"
                data-fractalu-resource-link=""
              >
                FractalU Substack
              </EducationOutboundLink>
              <EducationOutboundLink
                href="mailto:fractalu@fractalnyc.com"
                tone="dark"
                data-fractalu-resource-link=""
              >
                fractalu@fractalnyc.com
              </EducationOutboundLink>
            </div>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}

export function FractalUniversityPortal() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [hasFiltered, setHasFiltered] = useState(false);
  const usesLargeText = useLargeTextScale();
  const isFinePointer =
    useMediaQuery(FINE_POINTER_PREVIEW_QUERY) && !usesLargeText;
  const courses = useMemo(
    () =>
      activeCategory === "All"
        ? FRACTALU_CATALOG.courses
        : FRACTALU_CATALOG.courses.filter(({ category }) => category === activeCategory),
    [activeCategory],
  );

  return (
    <section className="mt-6 md:mt-24" aria-labelledby="fractalu-catalog-title" data-fractalu-portal>
      <div
        className="relative z-20 mx-auto min-w-0 max-w-[1600px] text-background page-gutter"
        data-fractalu-wide-shell
        data-fractalu-catalog-frame
      >
        <FadeIn delay={0.3}>
          <header
            className="mb-5 border-b border-background/45 pb-5 md:mb-10 md:pb-10"
            data-fractalu-reveal-group="catalog-heading"
            data-fractalu-reveal-delay="0.30"
          >
            <p className="text-label text-background/85" data-fractalu-semester-eyebrow>
              {FRACTALU_CATALOG.semester}
            </p>
            <h2 id="fractalu-catalog-title" className="text-title mt-3 normal-case text-background">
              Course Catalog
            </h2>
            <p className="text-body-lead mt-3 max-w-xl text-background/85">
              Browse this semester&apos;s classes by subject.
            </p>
          </header>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div
            className="pb-2 md:pb-10"
            data-fractalu-filter-block
            data-fractalu-reveal-group="filters"
            data-fractalu-reveal-delay="0.40"
          >
            <p
              id="fractalu-filter-label"
              className="text-label mb-2 text-background/85 md:mb-3"
              data-fractalu-filter-eyebrow
            >
              Filter classes by subject
            </p>
            <div
              role="group"
              aria-labelledby="fractalu-filter-label"
              className="fractalu-filter-row flex flex-wrap gap-1 overflow-visible pb-0 md:gap-2"
            >
              {FRACTALU_CATEGORIES.map((category) => {
                const selected = category === activeCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setHasFiltered(true);
                      setActiveCategory(category);
                    }}
                    className={`min-h-11 min-w-11 shrink-0 rounded-md border-2 bg-background px-1 py-2 font-mono text-xs text-foreground-muted transition-colors focus-visible:border-house-education-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light focus-visible:ring-offset-2 focus-visible:ring-offset-house-education-deep md:px-4 ${
                      selected
                        ? "border-house-education-light shadow-sm"
                        : "border-foreground-faint hover:border-house-education-light"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {courses.length} {courses.length === 1 ? "course" : "courses"} shown.
            </p>
          </div>
        </FadeIn>

        <CourseCatalog
          courses={courses}
          isFinePointer={isFinePointer}
          animateInitialCards={!hasFiltered}
        />

        <section className="mt-20" aria-labelledby="fractalu-clubs-title">
          <FadeIn>
            <h2
              id="fractalu-clubs-title"
              className="text-title normal-case text-background"
              data-fractalu-reveal-group="clubs-heading"
            >
              Clubs &amp; open groups
            </h2>
          </FadeIn>
          <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2 md:gap-6" data-testid="fractalu-clubs">
            {FRACTALU_CATALOG.clubs.map((club, index) => (
              <RevealSlot
                key={club.id}
                kind="club"
                delay={index * COURSE_REVEAL_STEP}
              >
                <ClubCard club={club} />
              </RevealSlot>
            ))}
          </div>
        </section>
      </div>

      <FractalUInformation />
    </section>
  );
}

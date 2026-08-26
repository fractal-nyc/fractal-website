import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ArrowUpRight, Play } from "lucide-react";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import {
  FRACTALU_CATALOG,
  FRACTALU_CATEGORIES,
  type FractalUClub,
  type FractalUCourse,
} from "@/data/fractalu";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const FINE_POINTER_PREVIEW_QUERY =
  "(min-width: 64rem) and (hover: hover) and (pointer: fine)";

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

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  accessibleName: string;
  className?: string;
}

function ExternalLink({ href, children, accessibleName, className = "" }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${accessibleName} (opens in a new tab)`}
      className={`inline-flex min-h-11 min-w-0 max-w-full flex-wrap items-center gap-1.5 [overflow-wrap:anywhere] rounded-md underline decoration-1 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light ${className}`}
    >
      {children}
      <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
    </a>
  );
}

function CourseDescriptionPreview({ course }: { course: FractalUCourse }) {
  return (
    <p
      id={`${course.id}-description`}
      className="fractalu-course-preview fractalu-course-description text-body mt-4 leading-relaxed text-foreground-muted"
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
          className="text-body mt-2 min-h-11 max-w-full rounded-md text-left text-foreground-muted underline decoration-foreground-faint underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light"
        >
          {course.instructor}
        </button>
      ) : (
        <p className="text-body mt-2 text-foreground-muted">{course.instructor}</p>
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
    <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
      <ExternalLink
        href={course.applicationUrl}
        accessibleName={`${course.applicationLabel} for ${course.title}`}
      >
        {course.applicationLabel}
      </ExternalLink>
      {course.videoUrl && (
        <ExternalLink href={course.videoUrl} accessibleName={`Watch video for ${course.title}`}>
          <Play size={13} aria-hidden="true" />
          Watch video
        </ExternalLink>
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
      <div className="mb-3 flex min-w-0 items-start gap-3">
        <p className="text-label min-w-0 [overflow-wrap:anywhere] text-house-education-light">
          {course.category}
        </p>
      </div>

      <div className="fractalu-title-preview relative min-w-0">
        <h3 className="text-subtitle min-w-0 leading-snug normal-case text-foreground [overflow-wrap:anywhere]">
          {course.detailsUrl ? (
            <a
              href={course.detailsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${course.title} course description (opens in a new tab)`}
              aria-describedby={descriptionId}
              className="fractalu-course-title-link inline-flex min-w-0 max-w-full items-start gap-2 rounded-sm underline decoration-house-education-light/50 underline-offset-4 hover:decoration-house-education-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light"
            >
              <span className="min-w-0 [overflow-wrap:anywhere]">{course.title}</span>
              <ArrowUpRight
                size={18}
                strokeWidth={1.5}
                className="fractalu-course-link-arrow mt-1 shrink-0 text-house-education-light"
                aria-hidden="true"
                data-course-external-icon
              />
            </a>
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
        <CourseDescriptionPreview course={course} />
      </div>

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

      <dl className="mt-5 grid min-w-0 gap-3 text-sm text-foreground-muted sm:grid-cols-2">
        {[
          ["Schedule", course.schedule],
          ["Dates", course.dates],
          ["Location", course.location],
          ["Price", course.price],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 [overflow-wrap:anywhere]">
            <dt className="text-body text-foreground">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
      <CourseActions course={course} />
      <div
        className="mt-6 h-0.5 w-8 rounded-full bg-house-education-light opacity-40 transition-all duration-300 group-hover:w-12 group-hover:opacity-70 group-focus-within:w-12 group-focus-within:opacity-70"
        aria-hidden="true"
      />
    </article>
    </MandelbrotCorners>
  );
}

function CourseCatalog({
  courses,
  isFinePointer,
}: {
  courses: FractalUCourse[];
  isFinePointer: boolean;
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
      className="fractalu-course-grid mt-8 min-w-0"
      data-testid="fractalu-course-catalog"
      data-course-collection
      data-preview-mode={isFinePointer ? "enhanced" : "inline"}
    >
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isFinePointer={isFinePointer}
          pinnedInstructorId={pinnedInstructorId}
          suppressedInstructorId={suppressedInstructorId}
          setPinnedInstructorId={setPinnedInstructorId}
          setSuppressedInstructorId={setSuppressedInstructorId}
        />
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
            <dt className="text-body text-foreground">{label}</dt>
            <dd className="mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-body mt-4 leading-relaxed text-foreground-muted">{club.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
        {club.detailsUrl && (
          <ExternalLink
            href={club.detailsUrl}
            accessibleName={`${club.detailsLabel ?? "Group details"} for ${club.name}`}
          >
            {club.detailsLabel ?? "Group details"}
          </ExternalLink>
        )}
        <ExternalLink href={club.actionUrl} accessibleName={`${club.actionLabel} for ${club.name}`}>
          {club.actionLabel}
        </ExternalLink>
      </div>
    </article>
    </MandelbrotCorners>
  );
}

function FractalUInformation() {
  return (
    <div className="relative z-10 pt-24 text-background md:pt-32" data-fractalu-information>
      <section
        id="what-is-fractalu"
        tabIndex={-1}
        className="mx-auto max-w-7xl scroll-mt-24 page-gutter focus-visible:outline-none"
        aria-labelledby="fractalu-about-title"
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

      <section
        className="mx-auto mt-16 max-w-2xl page-gutter md:mt-24"
        aria-labelledby="fractalu-teach-title"
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
            <a
              href="mailto:fractalu@fractalnyc.com"
              className="break-all rounded-sm text-foreground underline decoration-foreground-muted/40 underline-offset-2 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light"
            >
              fractalu@fractalnyc.com
            </a>{" "}
            with a sentence or two about what you&apos;d teach.
          </p>
        </MandelbrotCorners>
      </section>

      <section
        className="mx-auto mt-24 max-w-7xl page-gutter md:mt-32"
        aria-labelledby="fractalu-etiquette-title"
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

      <section
        className="mx-auto mt-24 max-w-7xl page-gutter md:mt-32"
        aria-labelledby="fractalu-canon-title"
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
            <ExternalLink
              href="https://ajr.fyi/files/fractal-canon.pdf"
              accessibleName="Read the FractalU canon PDF"
              className="font-mono text-sm text-background"
            >
              Read the canon (PDF)
            </ExternalLink>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
            <ExternalLink
              href="https://fractaluniversity.substack.com"
              accessibleName="FractalU Substack"
              className="text-background"
            >
              FractalU Substack
            </ExternalLink>
            <a
              href="mailto:fractalu@fractalnyc.com"
              className="inline-flex min-h-11 min-w-0 max-w-full flex-wrap items-center break-all rounded-md text-background underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"
            >
              fractalu@fractalnyc.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export function FractalUniversityPortal() {
  const [activeCategory, setActiveCategory] = useState("All");
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
    <section className="mt-16 md:mt-24" aria-labelledby="fractalu-catalog-title" data-fractalu-portal>
      <div
        className="relative z-20 mx-auto min-w-0 max-w-[1600px] text-background page-gutter"
        data-fractalu-wide-shell
        data-fractalu-catalog-frame
      >
        <header className="mb-8 border-b border-background/45 pb-8 md:mb-10 md:pb-10">
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

        <div className="pb-8 md:pb-10" data-fractalu-filter-block>
          <p
            id="fractalu-filter-label"
            className="text-label mb-3 text-background/85"
            data-fractalu-filter-eyebrow
          >
            Filter classes by subject
          </p>
          <div
            role="group"
            aria-labelledby="fractalu-filter-label"
            className="fractalu-filter-row flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0"
          >
            {FRACTALU_CATEGORIES.map((category) => {
              const selected = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveCategory(category)}
                  className={`min-h-11 shrink-0 rounded-md border px-4 py-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background ${
                    selected
                      ? "border-background bg-house-education-light text-background shadow-sm"
                      : "border-background/55 bg-house-education-deep/70 text-background hover:border-background hover:bg-house-education-light hover:text-background focus-visible:border-background focus-visible:bg-house-education-light focus-visible:text-background"
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

        <CourseCatalog courses={courses} isFinePointer={isFinePointer} />

        <section className="mt-20" aria-labelledby="fractalu-clubs-title">
          <h2 id="fractalu-clubs-title" className="text-title normal-case text-background">
            Clubs &amp; open groups
          </h2>
          <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2 md:gap-6" data-testid="fractalu-clubs">
            {FRACTALU_CATALOG.clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </section>
      </div>

      <FractalUInformation />
    </section>
  );
}

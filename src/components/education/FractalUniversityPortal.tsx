import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import {
  FRACTALU_CATALOG,
  FRACTALU_CATEGORIES,
  type FractalUClub,
  type FractalUCourse,
} from "@/data/fractalu";

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  accessibleName: string;
  className?: string;
}

function ExternalLink({
  href,
  children,
  accessibleName,
  className = "",
}: ExternalLinkProps) {
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

function CourseDisclosures({ course }: { course: FractalUCourse }) {
  return (
    <div className="mt-4 space-y-2">
      <details className="group min-w-0 rounded-md border border-foreground-faint bg-background p-3 text-foreground">
        <summary className="min-h-11 cursor-pointer [overflow-wrap:anywhere] rounded-md font-mono text-xs uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light">
          Course description
        </summary>
        <p className="text-body mt-2 leading-relaxed text-foreground-muted">
          {course.description}
        </p>
        {course.detailsUrl && (
          <ExternalLink
            href={course.detailsUrl}
            accessibleName={`${course.detailsLabel ?? "Course details"} for ${course.title}`}
            className="mt-2 font-mono text-xs"
          >
            {course.detailsLabel ?? "Course details"}
          </ExternalLink>
        )}
      </details>
      {course.instructorBio && (
        <details className="group min-w-0 rounded-md border border-foreground-faint bg-background p-3 text-foreground">
          <summary className="min-h-11 cursor-pointer [overflow-wrap:anywhere] rounded-md font-mono text-xs uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light">
            About {course.instructor}
          </summary>
          <p className="text-body mt-2 leading-relaxed text-foreground-muted">
            {course.instructorBio}
          </p>
        </details>
      )}
    </div>
  );
}

function CourseActions({ course }: { course: FractalUCourse }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
      <ExternalLink
        href={course.applicationUrl}
        accessibleName={`${course.applicationLabel} for ${course.title}`}
      >
        {course.applicationLabel}
      </ExternalLink>
      {course.videoUrl && (
        <ExternalLink
          href={course.videoUrl}
          accessibleName={`Watch video for ${course.title}`}
        >
          <Play size={13} aria-hidden="true" />
          Watch video
        </ExternalLink>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: FractalUCourse }) {
  return (
    <article
      className="min-w-0 max-w-full overflow-hidden rounded-lg border border-foreground-faint bg-background p-5 text-foreground"
      data-course-category={course.category}
    >
      <p className="font-mono text-xs uppercase tracking-wide [overflow-wrap:anywhere] text-house-education-deep">
        {course.category}
      </p>
      <h3 className="text-subtitle mt-2 normal-case text-foreground">
        {course.title}
      </h3>
      <p className="text-body mt-2 text-foreground-muted">{course.instructor}</p>
      <dl className="mt-4 grid gap-2 text-sm text-foreground-muted sm:grid-cols-2">
        <div>
          <dt className="font-mono text-xs uppercase text-foreground">Schedule</dt>
          <dd>{course.schedule}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase text-foreground">Dates</dt>
          <dd>{course.dates}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase text-foreground">Location</dt>
          <dd>{course.location}</dd>
        </div>
        <div>
          <dt className="font-mono text-xs uppercase text-foreground">Price</dt>
          <dd>{course.price}</dd>
        </div>
      </dl>
      <CourseActions course={course} />
      <CourseDisclosures course={course} />
    </article>
  );
}

function CourseTable({ courses }: { courses: FractalUCourse[] }) {
  return (
    <div
      className="hidden max-w-full overflow-x-auto rounded-lg border border-foreground-faint lg:block"
      data-testid="fractalu-course-table"
    >
      <table className="w-full min-w-5xl border-collapse bg-background text-left text-foreground">
        <thead className="bg-house-education-light text-background">
          <tr className="font-mono text-xs uppercase tracking-wide">
            {[
              "Class",
              "Instructor",
              "Day & time",
              "Dates",
              "Location",
              "Price",
              "Apply",
            ].map((label) => (
              <th key={label} scope="col" className="p-3 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr
              key={course.id}
              className="align-top odd:bg-background even:bg-foreground-faint/30"
              data-course-category={course.category}
            >
              <td className="w-60 border-t border-foreground-faint p-3">
                <p className="font-serif text-base leading-snug">{course.title}</p>
                <p className="mt-1 font-mono text-xs uppercase text-house-education-deep">
                  {course.category}
                </p>
                <CourseDisclosures course={course} />
              </td>
              <td className="border-t border-foreground-faint p-3 text-sm">
                {course.instructor}
              </td>
              <td className="border-t border-foreground-faint p-3 text-sm">
                {course.schedule}
              </td>
              <td className="border-t border-foreground-faint p-3 text-sm">
                {course.dates}
              </td>
              <td className="border-t border-foreground-faint p-3 text-sm">
                {course.location}
              </td>
              <td className="border-t border-foreground-faint p-3 text-sm">
                {course.price}
              </td>
              <td className="border-t border-foreground-faint p-3">
                <CourseActions course={course} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClubCard({ club }: { club: FractalUClub }) {
  return (
    <article className="min-w-0 max-w-full overflow-hidden rounded-lg border border-foreground-faint bg-background p-5 text-foreground">
      <h3 className="text-subtitle normal-case text-foreground">{club.name}</h3>
      <p className="text-body mt-4 leading-relaxed text-foreground-muted">
        {club.description}
      </p>
      <p className="mt-4 font-mono text-xs [overflow-wrap:anywhere] text-foreground-muted">
        {club.schedule} · {club.location}
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
        {club.detailsUrl && (
          <ExternalLink
            href={club.detailsUrl}
            accessibleName={`${club.detailsLabel ?? "Group details"} for ${club.name}`}
          >
            {club.detailsLabel ?? "Group details"}
          </ExternalLink>
        )}
        <ExternalLink
          href={club.actionUrl}
          accessibleName={`${club.actionLabel} for ${club.name}`}
        >
          {club.actionLabel}
        </ExternalLink>
      </div>
    </article>
  );
}

export function FractalUniversityPortal() {
  const [activeCategory, setActiveCategory] = useState("All");
  const courses = useMemo(
    () =>
      activeCategory === "All"
        ? FRACTALU_CATALOG.courses
        : FRACTALU_CATALOG.courses.filter(
            ({ category }) => category === activeCategory,
          ),
    [activeCategory],
  );

  return (
    <section
      className="mt-16 rounded-lg bg-background text-foreground shadow-lg md:mt-24"
      aria-labelledby="fractalu-title"
      data-fractalu-portal
    >
      <div className="min-w-0 p-5 sm:p-7 md:p-10">
        <p className="font-mono text-xs uppercase tracking-wide text-house-education-deep">
          Fractal University · {FRACTALU_CATALOG.semester}
        </p>
        <h2 id="fractalu-title" className="text-title mt-3 text-foreground">
          Fractal University
        </h2>
        <p className="text-subtitle mt-3 max-w-2xl normal-case text-foreground">
          An improvised college in New York City.
        </p>
        <ExternalLink
          href="https://fractaluniversity.substack.com"
          accessibleName="Stay tuned for future semesters"
          className="mt-4 font-mono text-sm text-house-education-deep"
        >
          Stay tuned for future semesters
        </ExternalLink>

        <picture className="mt-8 block overflow-hidden rounded-md" data-testid="fractalu-collage">
          <source
            media="(max-width: 639px)"
            srcSet="/images/fractalu-mobile.png"
            width="639"
            height="318"
          />
          <img
            src="/images/fractalu.png"
            width="800"
            height="133"
            alt=""
            className="h-auto w-full"
          />
        </picture>

        <div className="mt-10">
          <p
            id="fractalu-filter-label"
            className="font-mono text-xs uppercase tracking-wide text-foreground"
          >
            Filter classes by subject
          </p>
          <div
            role="group"
            aria-labelledby="fractalu-filter-label"
            className="mt-3 flex flex-wrap gap-2"
          >
            {FRACTALU_CATEGORIES.map((category) => {
              const selected = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveCategory(category)}
                  className={`min-h-11 rounded-md border px-4 py-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light ${
                    selected
                      ? "border-house-education-deep bg-house-education-deep text-background"
                      : "border-foreground-faint bg-background text-foreground hover:border-house-education-light"
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

        <div
          className="mt-8 min-w-0 grid gap-4 lg:hidden"
          data-testid="fractalu-course-cards"
        >
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="mt-8">
          <CourseTable courses={courses} />
        </div>

        <section className="mt-16" aria-labelledby="fractalu-clubs-title">
          <h2 id="fractalu-clubs-title" className="text-title text-foreground">
            Clubs &amp; open groups
          </h2>
          <div className="mt-6 min-w-0 grid gap-4 md:grid-cols-2" data-testid="fractalu-clubs">
            {FRACTALU_CATALOG.clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-3xl" aria-labelledby="fractalu-about-title">
          <h2 id="fractalu-about-title" className="text-title text-foreground">
            What is FractalU?
          </h2>
          <div className="text-body-lead mt-6 space-y-5 text-foreground-muted">
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

          <aside className="mt-10 rounded-lg border border-foreground-faint bg-background p-6 text-foreground">
            <p className="font-mono text-xs uppercase text-house-education-deep">
              Want to teach?
            </p>
            <p className="text-body mt-3 text-foreground-muted">
              We&apos;re always looking for instructors with something to share — a
              craft, a body of work, an obsession. Email{" "}
              <a
                href="mailto:fractalu@fractalnyc.com"
                className="break-all rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light"
              >
                fractalu@fractalnyc.com
              </a>{" "}
              with a sentence or two about what you&apos;d teach.
            </p>
          </aside>

          <h2 className="text-title mt-14 text-foreground">The etiquette</h2>
          <ol className="text-body-lead mt-6 list-decimal space-y-2 pl-6 text-foreground-muted">
            <li>Take yourself and others seriously.</li>
            <li>Be concrete; no bullshitting.</li>
            <li>Collaborate joyfully and publicly.</li>
          </ol>

          <h2 className="text-title mt-14 text-foreground">The canon</h2>
          <div className="text-body-lead mt-6 space-y-5 text-foreground-muted">
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
              className="font-mono text-sm text-house-education-deep"
            >
              Read the canon (PDF)
            </ExternalLink>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
            <ExternalLink
              href="https://fractaluniversity.substack.com"
              accessibleName="FractalU Substack"
              className="text-house-education-deep"
            >
              FractalU Substack
            </ExternalLink>
            <a
              href="mailto:fractalu@fractalnyc.com"
              className="inline-flex min-h-11 min-w-0 max-w-full flex-wrap items-center break-all rounded-md underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-house-education-light"
            >
              fractalu@fractalnyc.com
            </a>
          </div>
        </section>
      </div>
    </section>
  );
}

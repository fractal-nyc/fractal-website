import { useMemo, useState, type CSSProperties } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectorHeader } from "@/components/layout/SectorHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { HOUSES } from "@/data/houses";
import catalogJson from "@/data/fractalu-catalog.json";

interface Instructor { name: string; bio: string }
interface Course {
  id: string; title: string; instructor: string; instructorBio?: string;
  instructors?: Instructor[]; schedule: string; dates: string; sessions: number;
  location: string; price: string; category: string; description: string;
  applicationUrl: string; applicationLabel?: string; syllabusUrl?: string | null;
  videoUrl?: string | null;
}
interface Club {
  id: string; name: string; organizer: string; description: string; schedule?: string;
  location?: string; syllabusUrl?: string | null; contactUrl?: string; contactLabel?: string;
}
interface Catalog { semester: string; starts: string; bannerImages: string[]; courses: Course[]; clubs: Club[] }

const catalog = catalogJson as Catalog;
const education = HOUSES.find((house) => house.id === "school")!;

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
}

function CourseCard({ course }: { course: Course }) {
  const instructors = course.instructors ?? [{ name: course.instructor, bio: course.instructorBio ?? "" }];
  return (
    <article className="rounded-lg border border-foreground-faint bg-background p-5 text-foreground" data-course-category={course.category}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-subtitle leading-tight">{course.title}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-house-education-deep">{course.category}</p>
        </div>
        <ExternalLink href={course.applicationUrl} className="shrink-0 font-mono text-xs underline underline-offset-4">{course.applicationLabel ?? "Apply →"}</ExternalLink>
      </div>
      <p className="mt-4 text-body leading-relaxed">{course.description}</p>
      <dl className="mt-4 grid gap-2 border-t border-foreground-faint pt-4 text-sm sm:grid-cols-2">
        <div><dt className="font-mono text-xs uppercase text-foreground-muted">Instructor</dt><dd>{instructors.map((i) => i.name).join(" & ")}</dd></div>
        <div><dt className="font-mono text-xs uppercase text-foreground-muted">Schedule</dt><dd>{course.schedule}</dd></div>
        <div><dt className="font-mono text-xs uppercase text-foreground-muted">Dates</dt><dd>{course.dates} · {course.sessions} {course.sessions === 1 ? "session" : "sessions"}</dd></div>
        <div><dt className="font-mono text-xs uppercase text-foreground-muted">Place & price</dt><dd>{course.location} · {course.price}</dd></div>
      </dl>
      {instructors.some((i) => i.bio) && <details className="mt-4"><summary className="cursor-pointer font-mono text-xs uppercase">About the instructor{instructors.length > 1 ? "s" : ""}</summary><div className="mt-2 space-y-2 text-sm text-foreground-muted">{instructors.map((i) => <p key={i.name}><strong>{i.name}:</strong> {i.bio}</p>)}</div></details>}
      <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs">
        {course.syllabusUrl && <ExternalLink href={course.syllabusUrl} className="underline underline-offset-4">Syllabus →</ExternalLink>}
        {course.videoUrl && <ExternalLink href={course.videoUrl} className="underline underline-offset-4">Watch video →</ExternalLink>}
      </div>
    </article>
  );
}

export function FractalUPage() {
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(catalog.courses.map((course) => course.category))], []);
  const courses = category === "All" ? catalog.courses : catalog.courses.filter((course) => course.category === category);
  return (
    <main className="relative min-h-screen bg-house-education-deep text-background selection:bg-background selection:text-foreground" style={{ "--accent": "var(--color-house-education-light)" } as CSSProperties}>
      <FractalPattern color={education.palette.light} />
      <div className="relative z-10"><Navbar />
        <section className="page-gutter mx-auto w-full max-w-7xl pb-16 pt-28 md:pt-36">
          <SectorHeader letter="U" name="FractalU" color="var(--color-house-education-light)" />
          <FadeIn><div className="mx-auto max-w-4xl text-center"><h1 className="text-display">An improvised college in New York City.</h1><p className="mx-auto mt-6 max-w-2xl text-body-lead">In-person classes at low cost, open to anyone in the city. Learn, teach, conduct research, and do great work together.</p></div></FadeIn>
          <FadeIn delay={0.1}><picture className="mt-10 block overflow-hidden rounded-lg"><source media="(max-width: 767px)" srcSet="/images/fractalu-mobile.png" /><img src="/images/fractalu.png" alt="People learning together at FractalU" className="h-64 w-full object-cover md:h-96" /></picture></FadeIn>
        </section>

        <section className="bg-background py-16 text-foreground md:py-24" id="catalog">
          <div className="page-gutter mx-auto max-w-7xl">
            <FadeIn><div className="flex flex-col gap-4 border-b border-foreground-faint pb-8 md:flex-row md:items-end md:justify-between"><div><p className="font-mono text-xs uppercase tracking-widest text-house-education-deep">{catalog.semester}</p><h2 className="text-title mt-2">Course catalog</h2></div><ExternalLink href="https://fractaluniversity.substack.com/" className="font-mono text-sm underline underline-offset-4">Stay tuned for future semesters →</ExternalLink></div></FadeIn>
            <div className="my-8 flex flex-wrap gap-2" aria-label="Filter courses by category">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className="rounded-md border border-foreground px-3 py-2 font-mono text-xs uppercase transition-colors aria-pressed:bg-foreground aria-pressed:text-background">{item}</button>)}</div>
            <p className="sr-only" aria-live="polite">Showing {courses.length} courses</p>
            <div className="grid gap-4 lg:hidden" data-testid="course-list">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse text-left text-sm" data-testid="course-table">
                <thead className="bg-house-education-deep text-background"><tr>{["Class", "Instructor", "Day & time", "Dates", "Location", "Price", "Apply"].map((heading) => <th key={heading} className="border border-house-education-light/40 px-3 py-3 font-mono text-xs uppercase">{heading}</th>)}</tr></thead>
                <tbody>{courses.map((course) => {
                  const instructors = course.instructors ?? [{ name: course.instructor, bio: course.instructorBio ?? "" }];
                  return <tr key={course.id} data-course-category={course.category} className="align-top even:bg-foreground/5">
                    <td className="border border-foreground-faint p-3"><p className="font-semibold">{course.title}</p><p className="mt-2 font-mono text-[10px] uppercase text-house-education-deep">{course.category}</p><details className="mt-2"><summary className="cursor-pointer font-mono text-xs">Description</summary><p className="mt-2 leading-relaxed">{course.description}</p></details>{course.syllabusUrl && <ExternalLink href={course.syllabusUrl} className="mt-2 inline-block font-mono text-xs underline">Syllabus →</ExternalLink>}</td>
                    <td className="border border-foreground-faint p-3">{instructors.map((i) => i.name).join(" & ")}{instructors.some((i) => i.bio) && <details className="mt-2"><summary className="cursor-pointer font-mono text-xs">Bio</summary><div className="mt-2 space-y-2">{instructors.map((i) => <p key={i.name}>{i.bio}</p>)}</div></details>}</td>
                    <td className="border border-foreground-faint p-3">{course.schedule}</td><td className="border border-foreground-faint p-3">{course.dates}<br />{course.sessions} {course.sessions === 1 ? "session" : "sessions"}</td><td className="border border-foreground-faint p-3">{course.location}</td><td className="border border-foreground-faint p-3">{course.price}</td>
                    <td className="border border-foreground-faint p-3"><ExternalLink href={course.applicationUrl} className="font-mono text-xs underline">{course.applicationLabel ?? "Apply →"}</ExternalLink>{course.videoUrl && <ExternalLink href={course.videoUrl} className="mt-2 block font-mono text-xs underline">Watch video →</ExternalLink>}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>

            <div className="mt-20"><h2 className="text-title">Clubs & open groups</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{catalog.clubs.map((club) => <article key={club.id} className="rounded-lg border border-foreground-faint p-5"><h3 className="text-subtitle">{club.name}</h3><p className="mt-1 text-aside">Organized by {club.organizer}</p><p className="mt-4 text-body leading-relaxed">{club.description}</p><p className="mt-4 font-mono text-xs">{club.schedule ?? "Schedule TBD"} · {club.location ?? "Location TBD"}</p><div className="mt-4 flex gap-4 font-mono text-xs">{club.syllabusUrl && <ExternalLink href={club.syllabusUrl} className="underline">Details →</ExternalLink>}{club.contactUrl && <ExternalLink href={club.contactUrl} className="underline">{club.contactLabel ?? "Join →"}</ExternalLink>}</div></article>)}</div></div>
          </div>
        </section>

        <section className="page-gutter mx-auto max-w-4xl py-16 md:py-24" id="about">
          <h2 className="text-title">What is FractalU?</h2>
          <div className="mt-8 space-y-5 text-body-lead"><p>FractalU is an improvised college in New York City. We offer in-person classes at low cost, to anyone in the city. We're a community of people who want to learn, conduct research, and do great work together. You can join as an instructor, a student, or both.</p><p>Anyone can apply to teach. Anyone in NYC can apply to take a class. No credentials, no grades, no gatekeeping. Classes meet weekly from living rooms, community spaces, and dedicated third spaces across Brooklyn and Manhattan.</p><p>We've run over 100 classes for more than 1,000 students since Fall 2023. The catalog spans STEM, computer science, AI, mind-body practices, arts, civics, close readings of great books, and experimental formats. No theme, no required canon for students. The range reflects the pluralism of the people who show up.</p></div>
          <aside className="my-12 rounded-lg bg-background p-6 text-foreground"><p className="font-mono text-xs uppercase text-house-education-deep">Want to teach?</p><p className="mt-3 text-body">We're always looking for instructors with something to share — a craft, a body of work, an obsession. Email <a className="underline" href="mailto:fractalu@fractalnyc.com">fractalu@fractalnyc.com</a> with a sentence or two about what you'd teach.</p></aside>
          <h2 className="text-title">The etiquette</h2><ol className="mt-6 list-decimal space-y-2 pl-6 text-body-lead"><li>Take yourself and others seriously.</li><li>Be concrete; no bullshitting.</li><li>Collaborate joyfully and publicly.</li></ol>
          <h2 className="text-title mt-14">The canon</h2><div className="mt-6 space-y-5 text-body-lead"><p>FractalU has a shared intellectual foundation — six essays on what it means to do significant work, find knowledge frontiers, and learn in community. It was introduced by Andrew Rose to design the school's intellectual environment, the way the Federalist Papers established principles for the Constitution.</p><p>The six pieces are by Adam Mastroianni, Slime Mold Time Mold, Samo Burja, Richard Hamming, Paul Graham, and Alan Kay. Together they point toward an environment where people read hundreds of books a year, take dozens of classes, pursue their curiosities, and do science.</p><ExternalLink href="https://ajr.fyi/files/fractal-canon.pdf" className="inline-block font-mono text-sm underline underline-offset-4">Read the canon (PDF) →</ExternalLink></div>
          <div className="mt-14 flex flex-wrap gap-6 font-mono text-sm"><ExternalLink href="https://fractaluniversity.substack.com" className="underline underline-offset-4">FractalU Substack →</ExternalLink><a href="mailto:fractalu@fractalnyc.com" className="underline underline-offset-4">fractalu@fractalnyc.com</a></div>
        </section>
        <Footer />
      </div>
    </main>
  );
}

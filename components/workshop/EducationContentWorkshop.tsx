import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ComponentColorScope, COMPONENT_COLORWAYS, type ComponentColorwayId } from "@/components/content/ComponentColorScope";
import { FractalUCatalogView } from "@/components/education/FractalUniversityPortal";
import {
  FRACTALU_CATALOG_SNAPSHOT,
  hydrateFractalUCatalog,
  validateFractalUCatalog,
  type FractalUCatalogSnapshot,
  type FractalUCourseSnapshot,
  type FractalUClub,
} from "@/data/fractalu";

const cloneSnapshot = (value: FractalUCatalogSnapshot): FractalUCatalogSnapshot => JSON.parse(JSON.stringify(value)) as FractalUCatalogSnapshot;
const fieldId = (path: string) => `workshop-${path.replace(/[^a-z0-9]+/gi, "-")}`;
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "new-item";

const emptyCourse = (index: number): FractalUCourseSnapshot => ({
  id: `new-course-${index + 1}`, title: "New course", category: "New category",
  instructors: [{ name: "Instructor name", bio: "Instructor biography" }],
  schedule: "Schedule to be confirmed", dates: "Dates to be confirmed", location: "Location to be confirmed", price: "Price to be confirmed",
  description: "Describe what students will learn.", applicationUrl: "https://example.com/apply", applicationLabel: "Apply",
});
const emptyClub = (index: number): FractalUClub => ({ id: `new-club-${index + 1}`, name: "New club", description: "Describe the club.", schedule: "Schedule to be confirmed", location: "Location to be confirmed", actionUrl: "https://example.com/join", actionLabel: "Join" });

function Field({ label, path, value, onChange, multiline = false, error }: { label: string; path: string; value: string | number; onChange: (value: string) => void; multiline?: boolean; error?: string }) {
  const id = fieldId(path);
  const shared = "w-full rounded-md border border-foreground-faint bg-background px-3 py-2 text-base text-foreground focus:border-house-education-light focus:outline-none focus:ring-2 focus:ring-house-education-light/30";
  return (
    <div className="library-field">
      <label className="text-label" htmlFor={id}>{label}</label>
      {multiline ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={4} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={shared} /> : <input id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={shared} />}
      {error && <span id={`${id}-error`} className="text-aside text-house-education-light">{error}</span>}
    </div>
  );
}

function MoveButtons({ index, length, onMove }: { index: number; length: number; onMove: (next: number) => void }) {
  return <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={index === 0} onClick={() => onMove(index - 1)}>Move up</Button><Button type="button" variant="outline" disabled={index === length - 1} onClick={() => onMove(index + 1)}>Move down</Button></div>;
}

function reorder<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function EducationContentWorkshop({ initialSnapshot = FRACTALU_CATALOG_SNAPSHOT }: { initialSnapshot?: FractalUCatalogSnapshot }) {
  const [draft, setDraft] = useState(() => cloneSnapshot(initialSnapshot));
  const [colorway, setColorway] = useState<ComponentColorwayId>("education");
  const [importText, setImportText] = useState("");
  const [notice, setNotice] = useState("");
  const validation = useMemo(() => validateFractalUCatalog(draft), [draft]);
  const errors = useMemo(() => new Map(validation.errors.map((error) => [error.path, error.message])), [validation.errors]);
  const hydrated = validation.valid ? hydrateFractalUCatalog(draft) : null;
  const normalized = JSON.stringify(draft, null, 2) + "\n";

  const updateCourse = (index: number, patch: Partial<FractalUCourseSnapshot>) => setDraft((current) => ({ ...current, courses: current.courses.map((course, courseIndex) => courseIndex === index ? { ...course, ...patch } : course) }));
  const updateClub = (index: number, patch: Partial<FractalUClub>) => setDraft((current) => ({ ...current, clubs: current.clubs.map((club, clubIndex) => clubIndex === index ? { ...club, ...patch } : club) }));
  const duplicateCourse = (index: number) => setDraft((current) => { const copy = cloneSnapshot({ ...current, courses: [current.courses[index]], clubs: [] }).courses[0]; copy.id = `${copy.id}-copy`; copy.title = `${copy.title} (copy)`; return { ...current, courses: [...current.courses.slice(0, index + 1), copy, ...current.courses.slice(index + 1)] }; });
  const duplicateClub = (index: number) => setDraft((current) => { const copy = { ...current.clubs[index], id: `${current.clubs[index].id}-copy`, name: `${current.clubs[index].name} (copy)` }; return { ...current, clubs: [...current.clubs.slice(0, index + 1), copy, ...current.clubs.slice(index + 1)] }; });

  const importJson = () => {
    try {
      const parsed = JSON.parse(importText) as Partial<FractalUCatalogSnapshot>;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.courses) || !Array.isArray(parsed.clubs) || !parsed.sourceProvenance) throw new Error("JSON must include sourceProvenance, courses, and clubs.");
      setDraft(parsed as FractalUCatalogSnapshot);
      setNotice("Imported into this local draft. Review validation before export.");
    } catch (error) {
      setNotice(error instanceof Error ? `Import failed: ${error.message}` : "Import failed.");
    }
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(normalized);
    setNotice("Normalized repository JSON copied.");
  };
  const downloadJson = () => {
    const url = URL.createObjectURL(new Blob([normalized], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "fractalu-catalog.json"; anchor.click(); URL.revokeObjectURL(url);
    setNotice("Downloaded fractalu-catalog.json.");
  };

  return (
    <section id="education-workshop" className="library-workshop" aria-labelledby="education-workshop-title">
      <header className="max-w-3xl">
        <p className="text-label text-house-education-light">Education Content Workshop</p>
        <h2 id="education-workshop-title" className="text-title mt-3 normal-case">Refresh a semester without rebuilding cards</h2>
        <p className="text-body-lead mt-4 text-foreground-muted">Edit a local draft, validate it, and preview the exact production Education components. This tool never writes, publishes, deploys, or verifies a source.</p>
        <p className="library-unsaved text-label mt-5">Local draft — not saved to the website</p>
      </header>

      <div className="library-workshop-grid">
        <div className="library-editor" aria-label="Education draft editor">
          {!validation.valid && (
            <div className="library-error-summary" role="alert" aria-labelledby="validation-title">
              <h3 id="validation-title" className="text-subtitle normal-case">Fix {validation.errors.length} validation {validation.errors.length === 1 ? "error" : "errors"}</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-body">{validation.errors.map((error) => <li key={`${error.path}-${error.message}`}><a href={`#${fieldId(error.path)}`} className="underline">{error.path}: {error.message}</a></li>)}</ul>
            </div>
          )}

          <fieldset className="library-fieldset">
            <legend className="text-subtitle normal-case">Semester and provenance</legend>
            <Field label="Semester" path="semester" value={draft.semester} error={errors.get("semester")} onChange={(semester) => setDraft((current) => ({ ...current, semester }))} />
            {(["url", "verifiedAt", "lastModified", "etag", "sha256"] as const).map((key) => <Field key={key} label={key} path={`sourceProvenance.${key}`} value={draft.sourceProvenance[key]} error={errors.get(`sourceProvenance.${key}`)} onChange={(value) => setDraft((current) => ({ ...current, sourceProvenance: { ...current.sourceProvenance, [key]: value } }))} />)}
            <Field label="byteLength" path="sourceProvenance.byteLength" value={draft.sourceProvenance.byteLength} error={errors.get("sourceProvenance.byteLength")} onChange={(value) => setDraft((current) => ({ ...current, sourceProvenance: { ...current.sourceProvenance, byteLength: Number(value) } }))} />
          </fieldset>

          <section className="library-editor-section" aria-labelledby="courses-editor-title">
            <div className="library-section-heading"><h3 id="courses-editor-title" className="text-title normal-case">Courses</h3><Button type="button" onClick={() => setDraft((current) => ({ ...current, courses: [...current.courses, emptyCourse(current.courses.length)] }))}>Add course</Button></div>
            {draft.courses.map((course, courseIndex) => (
              <details key={`${course.id}-${courseIndex}`} className="library-record" open={courseIndex === 0}>
                <summary className="text-subtitle cursor-pointer normal-case">{course.title || `Course ${courseIndex + 1}`}</summary>
                <div className="library-record-body">
                  <div className="library-record-actions"><MoveButtons index={courseIndex} length={draft.courses.length} onMove={(to) => setDraft((current) => ({ ...current, courses: reorder(current.courses, courseIndex, to) }))} /><Button type="button" variant="outline" onClick={() => duplicateCourse(courseIndex)}>Duplicate</Button><Button type="button" variant="ghost" onClick={() => setDraft((current) => ({ ...current, courses: current.courses.filter((_, index) => index !== courseIndex) }))}>Delete</Button></div>
                  {(["id", "title", "category", "schedule", "dates", "location", "price", "description", "detailsUrl", "detailsLabel", "applicationUrl", "applicationLabel", "videoUrl"] as const).map((key) => <Field key={key} label={key} path={`courses.${courseIndex}.${key}`} value={course[key] ?? ""} multiline={key === "description"} error={errors.get(`courses.${courseIndex}.${key}`)} onChange={(value) => updateCourse(courseIndex, { [key]: key === "id" ? slugify(value) : value || undefined })} />)}
                  <fieldset className="library-fieldset library-nested"><legend className="text-subtitle normal-case">Ordered instructors</legend>
                    {course.instructors.map((instructor, instructorIndex) => <div className="library-instructor" key={`${instructor.name}-${instructorIndex}`}><Field label="Name" path={`courses.${courseIndex}.instructors.${instructorIndex}.name`} value={instructor.name} error={errors.get(`courses.${courseIndex}.instructors.${instructorIndex}.name`)} onChange={(name) => updateCourse(courseIndex, { instructors: course.instructors.map((item, index) => index === instructorIndex ? { ...item, name } : item) })} /><Field label="Biography" path={`courses.${courseIndex}.instructors.${instructorIndex}.bio`} value={instructor.bio} multiline error={errors.get(`courses.${courseIndex}.instructors.${instructorIndex}.bio`)} onChange={(bio) => updateCourse(courseIndex, { instructors: course.instructors.map((item, index) => index === instructorIndex ? { ...item, bio } : item) })} /><div className="library-record-actions"><MoveButtons index={instructorIndex} length={course.instructors.length} onMove={(to) => updateCourse(courseIndex, { instructors: reorder(course.instructors, instructorIndex, to) })} /><Button type="button" variant="ghost" onClick={() => updateCourse(courseIndex, { instructors: course.instructors.filter((_, index) => index !== instructorIndex) })}>Delete instructor</Button></div></div>)}
                    <Button type="button" variant="outline" onClick={() => updateCourse(courseIndex, { instructors: [...course.instructors, { name: "New instructor", bio: "Instructor biography" }] })}>Add instructor</Button>
                  </fieldset>
                </div>
              </details>
            ))}
          </section>

          <section className="library-editor-section" aria-labelledby="clubs-editor-title">
            <div className="library-section-heading"><h3 id="clubs-editor-title" className="text-title normal-case">Clubs &amp; open groups</h3><Button type="button" onClick={() => setDraft((current) => ({ ...current, clubs: [...current.clubs, emptyClub(current.clubs.length)] }))}>Add club</Button></div>
            {draft.clubs.map((club, clubIndex) => <details key={`${club.id}-${clubIndex}`} className="library-record"><summary className="text-subtitle cursor-pointer normal-case">{club.name || `Club ${clubIndex + 1}`}</summary><div className="library-record-body"><div className="library-record-actions"><MoveButtons index={clubIndex} length={draft.clubs.length} onMove={(to) => setDraft((current) => ({ ...current, clubs: reorder(current.clubs, clubIndex, to) }))} /><Button type="button" variant="outline" onClick={() => duplicateClub(clubIndex)}>Duplicate</Button><Button type="button" variant="ghost" onClick={() => setDraft((current) => ({ ...current, clubs: current.clubs.filter((_, index) => index !== clubIndex) }))}>Delete</Button></div>{(["id", "name", "description", "schedule", "location", "detailsUrl", "detailsLabel", "actionUrl", "actionLabel"] as const).map((key) => <Field key={key} label={key} path={`clubs.${clubIndex}.${key}`} value={club[key] ?? ""} multiline={key === "description"} error={errors.get(`clubs.${clubIndex}.${key}`)} onChange={(value) => updateClub(clubIndex, { [key]: key === "id" ? slugify(value) : value || undefined })} />)}</div></details>)}
          </section>

          <fieldset className="library-fieldset"><legend className="text-subtitle normal-case">Import, reset, and export</legend>
            <label className="library-field"><span className="text-label">Paste catalog JSON</span><textarea value={importText} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setImportText(event.target.value)} rows={8} className="w-full rounded-md border bg-background p-3 font-mono text-xs" /></label>
            <div className="library-record-actions"><Button type="button" variant="outline" onClick={importJson}>Import JSON</Button><Button type="button" variant="outline" onClick={() => { setDraft(cloneSnapshot(initialSnapshot)); setNotice("Reset to the repository snapshot."); }}>Reset snapshot</Button><Button type="button" disabled={!validation.valid} onClick={copyJson}>Copy normalized JSON</Button><Button type="button" disabled={!validation.valid} onClick={downloadJson}>Download JSON</Button></div>
            {notice && <p className="text-body" role="status">{notice}</p>}
            <p className="text-body text-foreground-muted">Next: replace <code>src/data/fractalu-catalog.json</code> with the validated export, preserve truthful provenance, then run <code>pnpm typecheck &amp;&amp; pnpm test &amp;&amp; pnpm build</code>.</p>
            <label className="library-field"><span className="text-label">Copyable agent prompt</span><textarea readOnly rows={4} value="Replace src/data/fractalu-catalog.json with my attached validated semester export. Preserve its ordering and provenance exactly, then run pnpm typecheck, pnpm test, and pnpm build. Do not change the Course Card or Club / Open Group Card styling." className="w-full rounded-md border bg-background p-3 font-mono text-xs" /></label>
          </fieldset>
        </div>

        <aside className="library-preview" aria-label="Live Education preview">
          <div className="library-preview-controls"><label className="text-label">Preview color pairing<select value={colorway} onChange={(event) => setColorway(event.target.value as ComponentColorwayId)}>{COMPONENT_COLORWAYS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
          {hydrated ? <ComponentColorScope colorway={colorway} surface="deep" className="library-education-preview rounded-lg"><FractalUCatalogView catalog={hydrated} colorway={colorway} animate={false} /></ComponentColorScope> : <div className="library-invalid-preview"><p className="text-subtitle normal-case">Preview paused</p><p className="text-body mt-2">Fix the validation errors to render the draft with production components.</p></div>}
        </aside>
      </div>
    </section>
  );
}

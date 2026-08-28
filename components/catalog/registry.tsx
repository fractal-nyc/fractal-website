import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ComponentColorScope, COMPONENT_COLORWAYS, type ComponentColorwayId, type ComponentSurfaceMode } from "@/components/content/ComponentColorScope";
import { CalloutCard } from "@/components/content/CalloutCard";
import { ContentCard } from "@/components/content/ContentCard";
import { OutboundLink } from "@/components/content/OutboundLink";
import { FactGrid } from "@/components/content/FactGrid";
import { FilterGroup } from "@/components/content/FilterGroup";
import { EmbedFrame } from "@/components/content/EmbedFrame";
import { EditorialQuote } from "@/components/content/EditorialQuote";
import { EmptyResultsMessage } from "@/components/content/EmptyResultsMessage";
import { DocumentCard } from "@/components/publications/DocumentCard";
import { ArchiveSearch } from "@/components/publications/ArchiveSearch";
import { TagFilter } from "@/components/publications/TagFilter";
import { CourseCard, ClubCard, CourseSubjectFilter } from "@/components/education/FractalUniversityPortal";
import { AudienceHighlight, MembershipButtonGroup } from "@/components/sections/Campus";
import { MandelbrotCorners, type MandelbrotCornerSize } from "@/components/ui/MandelbrotCorners";
import { MandelbrotIcon } from "@/components/house/MandelbrotIcon";
import { PaperGrain } from "@/components/ui/PaperGrain";
import { FractalPattern } from "@/components/ui/FractalPattern";
import { FadeIn } from "@/components/ui/FadeIn";
import { PUBLICATION_DOCUMENTS } from "@/data/publications-documents";
import { FRACTALU_CATALOG } from "@/data/fractalu";
import { HOUSES } from "@/data/houses";

export const COMPONENT_CATEGORIES = ["Foundations & layout", "Actions & controls", "Cards & containers", "Media & decoration", "Brand & complex composites"] as const;
export type ComponentCategory = typeof COMPONENT_CATEGORIES[number];

export const GALLERY_CATEGORIES = [
  { id: "common", label: "Common components" },
  { id: "cards", label: "Cards & boxes" },
  { id: "actions", label: "Buttons & links" },
  { id: "forms", label: "Forms & filters" },
  { id: "media", label: "Images & decoration" },
  { id: "sections", label: "Page sections" },
  { id: "basics", label: "Design basics" },
  { id: "all", label: "All components" },
] as const;
export type GalleryCategoryId = typeof GALLERY_CATEGORIES[number]["id"];
export type ComponentPresentation = "gallery" | "supporting" | "internal";
export type ComponentPreviewMode = "inline" | "visual-board" | "asset-family" | "full-context" | "invisible";

interface ControlOption<Value extends string = string> { value: Value; label: string }
interface TextControl<Id extends string = string> { id: Id; kind: "text"; label: string; defaultValue: string; testValue: string }
interface SelectControl<Id extends string = string, Value extends string = string> { id: Id; kind: "select" | "preview-width"; label: string; defaultValue: Value; testValue: Value; options: readonly ControlOption<Value>[] }
interface ColorwayControl { id: "colorway"; kind: "colorway"; label: string; defaultValue: ComponentColorwayId; testValue: ComponentColorwayId }
interface SurfaceControl { id: "surface"; kind: "surface"; label: string; defaultValue: ComponentSurfaceMode; testValue: ComponentSurfaceMode }
export type ComponentSpecimenControl = TextControl | SelectControl | ColorwayControl | SurfaceControl;
export type SpecimenControlValues = Record<string, string>;

type ValueForControl<Control> = Control extends TextControl
  ? string
  : Control extends SelectControl<string, infer Value>
    ? Value
    : never;
type ValuesForControls<Controls extends readonly ComponentSpecimenControl[]> = {
  [Control in Controls[number] as Control extends ColorwayControl | SurfaceControl ? never : Control["id"]]: ValueForControl<Control>
};

export interface ComponentSpecimenContext { colorway: ComponentColorwayId; surface: ComponentSurfaceMode; values: SpecimenControlValues }
export interface ComponentRegistryEntry {
  id: string;
  name: string;
  componentName: string;
  category: ComponentCategory;
  sourcePath: string;
  purpose: string;
  useWhen: string;
  doNotUseWhen: string;
  contentFields: string[];
  variants: string[];
  themeable: boolean;
  surfaceModes: ComponentSurfaceMode[];
  accessibility: string;
  responsive: string;
  agentPhrase: string;
  promptNeeds?: string;
  usedOn?: string;
  keywords: string[];
  controls: readonly ComponentSpecimenControl[];
  render?: (context: ComponentSpecimenContext) => ReactNode;
  presentation?: ComponentPresentation;
  previewMode?: ComponentPreviewMode;
  galleryCategory?: Exclude<GalleryCategoryId, "common" | "all">;
  common?: boolean;
  aliases?: string[];
  internalReason?: string;
}

type SpecimenEntryBase = Omit<ComponentRegistryEntry, "controls" | "render" | "presentation" | "previewMode" | "galleryCategory" | "common" | "internalReason">;
function defineSpecimen<const Controls extends readonly ComponentSpecimenControl[]>(
  entry: SpecimenEntryBase & {
    controls: Controls;
    render: (context: Omit<ComponentSpecimenContext, "values"> & { values: ValuesForControls<Controls> }) => ReactNode;
  },
): ComponentRegistryEntry {
  return entry as unknown as ComponentRegistryEntry;
}

const textControl = <const Id extends string>(id: Id, label: string, defaultValue: string, testValue: string): TextControl<Id> => ({ id, kind: "text", label, defaultValue, testValue });
const selectControl = <const Id extends string, const Value extends string>(id: Id, label: string, defaultValue: Value, testValue: Value, options: readonly ControlOption<Value>[]): SelectControl<Id, Value> => ({ id, kind: "select", label, defaultValue, testValue, options });
const COLORWAY_CONTROL = { id: "colorway", kind: "colorway", label: "Color pairing", defaultValue: "neutral", testValue: "campus" } as const;
const SURFACE_CONTROL = { id: "surface", kind: "surface", label: "Surface", defaultValue: "paper", testValue: "light" } as const;
const DEEP_SURFACE_CONTROL = { id: "surface", kind: "surface", label: "Surface", defaultValue: "paper", testValue: "deep" } as const;
const PREVIEW_WIDTH_CONTROL = {
  id: "previewWidth", kind: "preview-width", label: "Preview width", defaultValue: "full", testValue: "320",
  options: [
    { value: "full", label: "Available width" },
    { value: "320", label: "320px phone" },
    { value: "375", label: "375px phone" },
    { value: "768", label: "768px tablet" },
  ],
} as const;

const reference = (
  id: string,
  name: string,
  componentName: string,
  category: ComponentCategory,
  sourcePath: string,
  purpose: string,
  keywords: string[] = [],
): ComponentRegistryEntry => ({
  id, name, componentName, category, sourcePath, purpose, keywords,
  useWhen: `Use ${name} when this established site pattern matches the content.`,
  doNotUseWhen: "Do not imitate it with page-local markup or force it into a context it does not own.",
  contentFields: ["See the typed source API"], variants: ["Production default"], themeable: false, surfaceModes: ["paper"], controls: [],
  accessibility: "Preserve the component's documented semantics, labels, focus behavior, and reduced-motion behavior.",
  responsive: "Use in its intended page or viewport context; verify at 320px and 375px.",
  agentPhrase: `Use the **${name}** component.`,
  presentation: "internal",
  previewMode: "invisible",
  internalReason: "This source is supporting code or owns a context that is not represented by a small standalone tile.",
});

const sampleCourse = FRACTALU_CATALOG.courses[0];
const sampleClub = FRACTALU_CATALOG.clubs[0];
const longText = "A deliberately long specimen demonstrates how this component wraps when an editor adds substantially more content than the default example.";
const house = (id: string) => HOUSES.find((item) => item.id === id)!;
const patternSamples = {
  campus: { color: house("campus").palette.light, backgroundClass: "bg-house-campus-deep" },
  education: { color: house("school").palette.light, backgroundClass: "bg-house-education-deep" },
  events: { color: house("events").palette.deep, backgroundClass: "bg-house-events-light" },
  library: { color: house("lab").palette.deep, backgroundClass: "bg-house-library-light" },
} as const;

const COMPONENT_REGISTRY_BASE: ComponentRegistryEntry[] = [
  defineSpecimen({
    id: "color-pairing", name: "Color Pairing", componentName: "ComponentColorScope", category: "Foundations & layout", sourcePath: "src/components/content/ComponentColorScope.tsx",
    purpose: "Applies one approved token-backed identity and a safe text color to any themeable component.", useWhen: "Wrap a reusable card or control that needs a Fractal section identity.", doNotUseWhen: "Do not accept arbitrary hex values or use a house accent as essential text when its contrast is insufficient.",
    contentFields: ["colorway", "surface"], variants: COMPONENT_COLORWAYS.map(({ name }) => name), themeable: true, surfaceModes: ["paper", "light", "deep"],
    accessibility: "Every surface explicitly sets its on-surface text and focus variables.", responsive: "No layout behavior; scope follows its container.", agentPhrase: "Use the **Color Pairing** component with the requested approved token pair.", keywords: ["theme", "colour", "palette", "tokens"],
    controls: [textControl("heading", "Sample heading", "Approved color pairing", "Semester color pairing"), selectControl("detail", "Supporting copy", "standard", "long", [{ value: "standard", label: "Standard" }, { value: "long", label: "Long guidance" }]), SURFACE_CONTROL],
    render: ({ surface, values }) => <div className="library-color-grid">{COMPONENT_COLORWAYS.map((palette) => <ComponentColorScope key={palette.id} colorway={palette.id} surface={surface} className="rounded-md border p-4"><p className="text-label">{values.heading}: {palette.name}</p><p className="text-body mt-2 opacity-80">{values.detail === "long" ? `${palette.notes} ${longText}` : palette.notes}</p></ComponentColorScope>)}</div>,
  }),
  reference("page-frame", "Page Frame", "page-gutter + max-width utilities", "Foundations & layout", "src/index.css", "Controls page width, safe-area gutters, and content measure.", ["container", "layout", "gutter"]),
  reference("type-style", "Type Style", "semantic type utilities", "Foundations & layout", "src/index.css", "Applies the named Display, Title, Subtitle, Body, Lead, Aside, Label, Mono-display, Input, or Button tier."),
  reference("reading-column", "Reading Column", "max-w-2xl / max-w-3xl", "Foundations & layout", "src/index.css", "Keeps prose at a readable measure inside a page frame."),
  reference("standard-section-frame", "Standard Section Frame", "page-gutter + section rhythm", "Foundations & layout", "src/index.css", "Owns standard section gutters and vertical rhythm."),
  reference("wide-card-grid", "Wide Card Grid", "intrinsic card grid", "Foundations & layout", "src/index.css", "Arranges repeatable cards with min-width-zero tracks and content-driven wrapping."),
  reference("section-header", "Section Header", "SectorHeader", "Foundations & layout", "src/components/layout/SectorHeader.tsx", "Identifies a house or editorial section with its letter and name."),
  reference("site-navigation", "Site Navigation", "Navbar", "Foundations & layout", "src/components/layout/Navbar.tsx", "Provides the viewport-owned site masthead and navigation."),
  reference("site-footer-marker", "Site Footer Marker", "Footer", "Foundations & layout", "src/components/layout/Footer.tsx", "Marks the page end and coordinates banner clearance."),
  defineSpecimen({ id: "content-card", name: "Content Card", componentName: "ContentCard", category: "Cards & containers", sourcePath: "src/components/content/ContentCard.tsx", purpose: "Provides the shared paper or accent card surface used by repeated content patterns.", useWhen: "Use as the structural shell beneath a specific content card.", doNotUseWhen: "Do not ship an unlabeled generic card when a named pattern already exists.", contentFields: ["semantic element", "surface", "content"], variants: ["Paper", "Accent", "Long support", "No support"], themeable: true, surfaceModes: ["paper", "light", "deep"], accessibility: "Choose article or section semantics only when the content warrants them.", responsive: "Natural height; min-width-zero prevents grid overflow.", agentPhrase: "Use the **Content Card** shell for this new named pattern.", keywords: ["card shell", "container"], controls: [textControl("heading", "Card heading", "Shared card shell", "Semester overview card"), selectControl("cardSurface", "Card treatment", "paper", "accent", [{ value: "paper", label: "Paper" }, { value: "accent", label: "Accent fill" }]), selectControl("support", "Supporting content", "standard", "long", [{ value: "standard", label: "Standard" }, { value: "long", label: "Long" }, { value: "none", label: "None" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, SURFACE_CONTROL], render: ({ values }) => <ContentCard surface={values.cardSurface}><p className="text-subtitle normal-case">{values.heading}</p>{values.support !== "none" && <p className="text-body mt-2 opacity-75">{values.support === "long" ? longText : "A semantic content pattern supplies the actual fields."}</p>}</ContentCard> }),
  defineSpecimen({
    id: "action-buttons", name: "Primary Button", componentName: "Button", category: "Actions & controls", sourcePath: "src/components/ui/button.tsx", purpose: "The branded Mandelbrot-corner button for a page's primary action or important destination.", useWhen: "Use for the clearest primary action on a page or section.", doNotUseWhen: "Do not use for passive information, inline prose, or a secondary editor control.", contentFields: ["button label", "destination or action"], variants: ["Available by default", "Unavailable / disabled only when the action genuinely cannot run"], themeable: true, surfaceModes: ["paper", "light", "deep"], accessibility: "Uses native button/link semantics, a 44px target, visible focus, and a real disabled state when needed.", responsive: "The label stays legible and the button remains usable at narrow widths.", agentPhrase: "Use the **Primary Button** component.", promptNeeds: "button label and destination or action", usedOn: "Campus, Events, People, Political Club, and the 404 page.", keywords: ["cta", "button container", "primary", "primary action", "action button", "main action button"], aliases: ["Action Button", "Main Action Button"],
    controls: [textControl("label", "Button label", "Primary action", "Register for the complete semester program"), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, SURFACE_CONTROL],
    render: ({ values }) => <div className="flex items-start"><Button>{values.label}</Button></div>,
  }),
  defineSpecimen({
    id: "outbound-link", name: "Standalone Link", componentName: "OutboundLink", category: "Actions & controls", sourcePath: "src/components/content/OutboundLink.tsx", purpose: "A prominent link that stands on its own and uses the diagonal outbound arrow.", useWhen: "Use for a visible destination link that sits outside a sentence.", doNotUseWhen: "Do not use inside prose or for a linked card title.", contentFields: ["link label", "destination"], variants: ["Website", "Email"], themeable: true, surfaceModes: ["paper", "deep"], accessibility: "HTTP links open safely in a new tab and announce that behavior when an accessible name is supplied; email links stay in context.", responsive: "Long labels wrap without losing the arrow or target size.", agentPhrase: "Use the **Standalone Link** component.", promptNeeds: "link label and destination", usedOn: "Education course, club, canon, and hero destinations.", keywords: ["external link", "outbound link", "outsource link", "external action link", "arrow link", "url"], aliases: ["External Link", "Outbound Link", "outsource link"],
    controls: [textControl("label", "Link label", "Visit Fractal", "Read the complete Fractal semester guide"), selectControl("destination", "Destination type", "external", "email", [{ value: "external", label: "External website" }, { value: "email", label: "Email" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, DEEP_SURFACE_CONTROL],
    render: ({ values }) => { const href = values.destination === "email" ? "mailto:hello@fractal.nyc" : "https://fractal.nyc"; return <div className="flex items-start"><OutboundLink href={href} accessibleName={values.label}>{values.label}</OutboundLink></div>; },
  }),
  defineSpecimen({
    id: "inline-text-link", name: "Inline Text Link", componentName: "OutboundLink", category: "Actions & controls", sourcePath: "src/components/content/OutboundLink.tsx", purpose: "Underlined linked words placed naturally within a sentence.", useWhen: "Use for a reference or destination that is part of surrounding prose.", doNotUseWhen: "Do not use for a standalone call to action, card title, or an entire clickable card.", contentFields: ["linked words", "destination", "surrounding sentence"], variants: ["Website", "Email"], themeable: true, surfaceModes: ["paper", "deep"], accessibility: "Uses native link semantics and visible focus; website destinations retain safe new-tab behavior.", responsive: "Linked words wrap naturally with the surrounding sentence.", agentPhrase: "Use the **Inline Text Link** component.", promptNeeds: "linked words and destination", usedOn: "This visual pattern appears in prose on Campus, Co-Living, and Home / Story. Request the shared OutboundLink inline variant for new work; existing prose has not all been migrated to it.", keywords: ["inline link", "inline reference", "text link", "prose link", "link in a sentence"], aliases: ["Inline Link", "Inline Reference"],
    controls: [textControl("label", "Linked words", "inline reference", "complete semester guide"), selectControl("destination", "Destination type", "external", "email", [{ value: "external", label: "External website" }, { value: "email", label: "Email" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, DEEP_SURFACE_CONTROL],
    render: ({ values }) => { const href = values.destination === "email" ? "mailto:hello@fractal.nyc" : "https://fractal.nyc"; return <p className="text-body">Read the <OutboundLink href={href} variant="inline">{values.label}</OutboundLink> for more information.</p>; },
  }),
  defineSpecimen({ id: "archive-search", name: "Archive Search Field", componentName: "ArchiveSearch", category: "Actions & controls", sourcePath: "src/components/publications/ArchiveSearch.tsx", purpose: "Searches titles, authors, and topics in the Library archive.", useWhen: "Use for archive keyword filtering.", doNotUseWhen: "Do not use as a general site search.", contentFields: ["value", "onChange"], variants: ["Empty", "Filled", "Focused", "Clearable"], themeable: false, surfaceModes: ["paper"], accessibility: "Native search field with an accessible clear control.", responsive: "Fills its available width.", agentPhrase: "Use the **Archive Search Field** component.", keywords: ["input", "find"], controls: [textControl("query", "Search value", "community", "collective intelligence")], render: ({ values }) => <ArchiveSearch value={values.query} onChange={() => undefined} /> }),
  defineSpecimen({ id: "filter-chip", name: "Filter Chip", componentName: "FilterGroup / FilterChip", category: "Actions & controls", sourcePath: "src/components/content/FilterGroup.tsx", purpose: "Shows a labeled set of mutually selectable content filters.", useWhen: "Use to filter a visible collection by one category.", doNotUseWhen: "Do not use for navigation or multi-step forms.", contentFields: ["label", "options", "selected", "resultCount"], variants: ["Selected", "Unselected", "Empty results"], themeable: true, surfaceModes: ["paper"], accessibility: "Grouped buttons expose aria-pressed and announce result counts.", responsive: "Wraps without changing source order.", agentPhrase: "Use the **Filter Chip** and **Filter Group** components.", keywords: ["tag", "category", "subject", "results summary"], controls: [selectControl("selection", "Selected filter", "Writing", "All", [{ value: "All", label: "All" }, { value: "Writing", label: "Writing" }, { value: "Movement", label: "Movement" }, { value: "No results", label: "Empty results" }]), COLORWAY_CONTROL], render: ({ values }) => <FilterGroup label="Filter examples" options={["All", "Writing", "Movement"]} selected={values.selection} onChange={() => undefined} resultCount={values.selection === "No results" ? 0 : 3} /> }),
  reference("filter-results-summary", "Filter Results Summary", "FilterGroup live region", "Actions & controls", "src/components/content/FilterGroup.tsx", "Announces the current filtered result count without adding visual clutter."),
  defineSpecimen({ id: "empty-results-message", name: "Empty Results Message", componentName: "EmptyResultsMessage", category: "Actions & controls", sourcePath: "src/components/content/EmptyResultsMessage.tsx", purpose: "Explains that a filtered collection is empty and gives a recovery step.", useWhen: "Use when a search or filter produces no visible items.", doNotUseWhen: "Do not leave an empty collection unexplained.", contentFields: ["title", "recovery guidance"], variants: ["Search", "Subject filter"], themeable: true, surfaceModes: ["paper"], accessibility: "Place near the collection and pair dynamic changes with a live result summary.", responsive: "Centered copy wraps naturally.", agentPhrase: "Use the **Empty Results Message** component.", keywords: ["empty state", "zero results"], controls: [textControl("title", "Empty-state title", "No results match your filters.", "No courses match this subject."), selectControl("context", "Recovery guidance", "search", "subject", [{ value: "search", label: "Search or tag filter" }, { value: "subject", label: "Course subject filter" }]), COLORWAY_CONTROL], render: ({ values }) => <EmptyResultsMessage title={values.title} guidance={values.context === "subject" ? "Choose another subject to continue browsing." : "Try another filter or clear your selection."} /> }),
  reference("icon-carousel-control", "Icon Button / Carousel Control", "MeetTheSpaceCarousel controls", "Actions & controls", "src/components/sections/MeetTheSpaceCarousel.tsx", "Provides labeled previous/next controls for the Campus carousel."),
  reference("archive-toolbar", "Archive Filter Group", "ArchiveToolbar", "Actions & controls", "src/components/publications/ArchiveToolbar.tsx", "Combines Library search, tags, and result summary."),
  defineSpecimen({ id: "library-tag-filter", name: "Library Tag Filter", componentName: "TagFilter", category: "Actions & controls", sourcePath: "src/components/publications/TagFilter.tsx", purpose: "Filters Library articles by one or more tags.", useWhen: "Use inside the Library archive toolbar.", doNotUseWhen: "Do not use as site navigation.", contentFields: ["tags", "counts", "active tags"], variants: ["Selected", "Unselected", "None selected"], themeable: false, surfaceModes: ["paper"], accessibility: "Buttons expose pressed state and document counts.", responsive: "Scrolls horizontally on narrow screens and wraps on wider screens.", agentPhrase: "Use the **Library Tag Filter** component.", keywords: ["badge", "tag"], controls: [selectControl("activeTag", "Active tag", "community", "education", [{ value: "community", label: "Community" }, { value: "education", label: "Education" }, { value: "none", label: "None selected" }])], render: ({ values }) => <TagFilter tags={["community", "education"]} tagCounts={new Map([["community", 8], ["education", 3]])} activeTags={values.activeTag === "none" ? new Set() : new Set([values.activeTag])} onToggle={() => undefined} /> }),
  defineSpecimen({
    id: "library-article-card", name: "Library Article Card", componentName: "DocumentCard", category: "Cards & containers", sourcePath: "src/components/publications/DocumentCard.tsx", purpose: "Presents one publication with category, title, byline, description, and destination.", useWhen: "Use for an item in the Library archive.", doNotUseWhen: "Do not use for courses, calls to action, or unlinked notes.", contentFields: ["category", "title", "byline", "description", "url"], variants: ["Full description", "Missing description", "Long title", "Hover/focus"], themeable: true, surfaceModes: ["paper"], accessibility: "The whole card is one external link with a visible focus ring.", responsive: "Fills its grid track; long content wraps.", agentPhrase: "Use the **Library Article Card** component.", keywords: ["article container", "library container", "publication", "document card"], controls: [textControl("title", "Article title", PUBLICATION_DOCUMENTS[0].title, "A much longer essay title about building durable intellectual communities"), selectControl("description", "Description", "full", "missing", [{ value: "full", label: "Full" }, { value: "long", label: "Long" }, { value: "missing", label: "Missing" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL], render: ({ colorway, values }) => <DocumentCard document={{ ...PUBLICATION_DOCUMENTS[0], title: values.title, description: values.description === "missing" ? "" : values.description === "long" ? longText : PUBLICATION_DOCUMENTS[0].description }} colorway={colorway} />,
  }),
  reference("library-article-grid", "Library Article Grid", "DocumentGrid", "Cards & containers", "src/components/publications/DocumentGrid.tsx", "Arranges Library article cards and owns the empty-results message.", ["empty state"]),
  defineSpecimen({
    id: "note-callout", name: "Note / Callout Card", componentName: "CalloutCard", category: "Cards & containers", sourcePath: "src/components/content/CalloutCard.tsx", purpose: "Highlights a short note, invitation, instruction, or related action without becoming a full content card.", useWhen: "Use for notes such as Visiting NYC?, Curious about Fractal?, or Want to teach?.", doNotUseWhen: "Do not use for long articles or repeated catalog items.", contentFields: ["label", "prose", "links/actions", "corner size", "surface"], variants: ["Paper", "Tint", "With actions", "Without actions", "Long copy", "XS/Small/Medium/Large corners"], themeable: true, surfaceModes: ["paper", "light", "deep"], accessibility: "Associate the label with its containing section when it acts as a heading.", responsive: "Natural height and wrapping; no fixed width.", agentPhrase: "Use the **Note / Callout Card** component.", keywords: ["note container", "callout", "highlight", "info box"], controls: [textControl("label", "Note label", "A useful note", "Semester reminder"), selectControl("treatment", "Card treatment", "paper", "tint", [{ value: "paper", label: "Paper" }, { value: "tint", label: "Tint" }]), selectControl("body", "Body content", "standard", "long", [{ value: "standard", label: "Standard" }, { value: "long", label: "Long" }, { value: "empty", label: "Empty" }]), selectControl("actions", "Actions", "with", "without", [{ value: "with", label: "With action" }, { value: "without", label: "Without action" }]), selectControl("cornerSize", "Corner size", "sm", "lg", [{ value: "xs", label: "XS" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, SURFACE_CONTROL], render: ({ values }) => <CalloutCard label={values.label} surface={values.treatment} cornerSize={values.cornerSize} actions={values.actions === "with" ? <Button variant="outline">Optional action</Button> : undefined}>{values.body === "empty" ? "" : values.body === "long" ? longText : "Use this for a concise explanation that deserves a visible boundary."}</CalloutCard>,
  }),
  defineSpecimen({ id: "course-card", name: "Course Card", componentName: "CourseCard", category: "Cards & containers", sourcePath: "src/components/education/FractalUniversityPortal.tsx", purpose: "Presents one class with instructors, description, facts, links, and optional media.", useWhen: "Use for a semester course in the Education catalog.", doNotUseWhen: "Do not manually rebuild this container when refreshing a semester.", contentFields: ["title", "category", "ordered instructors", "schedule", "dates", "location", "price", "description", "links", "video"], variants: ["Linked title", "Missing optional links", "Multiple instructors", "Long content"], themeable: true, surfaceModes: ["paper"], accessibility: "Instructor biographies support keyboard pin/Escape behavior in the catalog view.", responsive: "Uses inline biographies on touch/small screens and enhanced previews for fine pointers.", agentPhrase: "Use the **Course Card** component.", keywords: ["class container", "education course", "semester"], controls: [textControl("title", "Course title", sampleCourse.title, "A Long Course on Collective Inquiry and Public Life"), selectControl("variant", "Content variant", "default", "multiple", [{ value: "default", label: "Default" }, { value: "long", label: "Long description" }, { value: "missing", label: "Missing optional links" }, { value: "multiple", label: "Multiple instructors" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL], render: ({ values }) => <CourseCard course={{ ...sampleCourse, title: values.title, description: values.variant === "long" ? longText : sampleCourse.description, instructors: values.variant === "multiple" ? [...sampleCourse.instructors, { name: "Guest Faculty", bio: "A second ordered instructor biography for the multi-instructor state." }] : sampleCourse.instructors, detailsUrl: values.variant === "missing" ? undefined : sampleCourse.detailsUrl, detailsLabel: values.variant === "missing" ? undefined : sampleCourse.detailsLabel, videoUrl: values.variant === "missing" ? undefined : sampleCourse.videoUrl, instructor: values.variant === "multiple" ? `${sampleCourse.instructor}, Guest Faculty` : sampleCourse.instructor }} isFinePointer={false} pinnedInstructorId={null} suppressedInstructorId={null} setPinnedInstructorId={() => undefined} setSuppressedInstructorId={() => undefined} /> }),
  defineSpecimen({ id: "course-fact-grid", name: "Course Fact Grid", componentName: "FactGrid", category: "Cards & containers", sourcePath: "src/components/content/FactGrid.tsx", purpose: "Pairs compact labels and values for schedule, dates, location, and price.", useWhen: "Use for two or more comparable metadata facts.", doNotUseWhen: "Do not use for narrative prose.", contentFields: ["label/value items"], variants: ["Two-column", "Long values", "Missing optional value"], themeable: true, surfaceModes: ["paper", "light", "deep"], accessibility: "Uses semantic dl/dt/dd markup.", responsive: "Values wrap within min-width-zero tracks.", agentPhrase: "Use the **Course Fact Grid** component.", keywords: ["facts", "metadata list"], controls: [selectControl("values", "Fact values", "default", "long", [{ value: "default", label: "Default" }, { value: "long", label: "Long values" }, { value: "missing", label: "Missing optional value" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, SURFACE_CONTROL], render: ({ values }) => <FactGrid items={[{ label: "Schedule", value: values.values === "long" ? "Every Wednesday evening from 7:00 until 8:30pm Eastern Time" : "Wednesdays, 7–8:30pm" }, { label: "Location", value: "Fractal Campus" }, { label: "Price", value: values.values === "missing" ? "—" : "$160 / $200" }, { label: "Dates", value: "Jun 17 – Jul 8" }]} /> }),
  reference("metadata-facts-list", "Metadata / Facts List", "FactGrid", "Cards & containers", "src/components/content/FactGrid.tsx", "Presents general label/value metadata with semantic description-list markup."),
  reference("amenity-list", "Amenity List", "Campus amenities list", "Cards & containers", "src/components/sections/Campus.tsx", "Presents a concise, scannable set of Campus amenities."),
  reference("category-badge", "Category Badge", "TagFilter / card category label", "Cards & containers", "src/components/publications/TagFilter.tsx", "Labels or filters content by a short category or tag."),
  reference("photo-frame", "Photo Frame", "Campus photo frame", "Media & decoration", "src/components/sections/Campus.tsx", "Provides the bordered, cropped presentation for a single editorial photo."),
  defineSpecimen({ id: "club-card", name: "Club / Open Group Card", componentName: "ClubCard", category: "Cards & containers", sourcePath: "src/components/education/FractalUniversityPortal.tsx", purpose: "Presents a recurring Education club or open group.", useWhen: "Use for clubs and informal recurring programs.", doNotUseWhen: "Do not put a semester course into this smaller record shape.", contentFields: ["name", "description", "schedule", "location", "links"], variants: ["With details", "Action only", "Long copy"], themeable: true, surfaceModes: ["paper"], accessibility: "Links receive specific accessible names.", responsive: "Facts stack or split based on available width.", agentPhrase: "Use the **Club / Open Group Card** component.", keywords: ["club container", "open group"], controls: [textControl("name", "Club name", sampleClub.name, "Open Research and Writing Club"), selectControl("variant", "Content variant", "details", "action", [{ value: "details", label: "With details" }, { value: "action", label: "Action only" }, { value: "long", label: "Long copy" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL], render: ({ values }) => <ClubCard club={{ ...sampleClub, name: values.name, description: values.variant === "long" ? longText : sampleClub.description, detailsUrl: values.variant === "action" ? undefined : sampleClub.detailsUrl, detailsLabel: values.variant === "action" ? undefined : sampleClub.detailsLabel }} /> }),
  defineSpecimen({ id: "course-subject-filter", name: "Course Subject Filter", componentName: "CourseSubjectFilter", category: "Actions & controls", sourcePath: "src/components/education/FractalUniversityPortal.tsx", purpose: "Filters the real Education course collection by derived categories.", useWhen: "Use above an Education course catalog.", doNotUseWhen: "Do not hard-code categories separately from the catalog data.", contentFields: ["derived categories", "selection", "result count"], variants: ["All", "Selected", "New category", "Empty result"], themeable: true, surfaceModes: ["paper"], accessibility: "Pressed state and result announcement are exposed.", responsive: "Options wrap in source order.", agentPhrase: "Use the **Course Subject Filter** component.", keywords: ["class tags", "education filter"], controls: [selectControl("variant", "Filter state", "all", "selected", [{ value: "all", label: "All selected" }, { value: "selected", label: "Subject selected" }, { value: "new", label: "New category" }, { value: "empty", label: "Empty result" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL], render: ({ values }) => { const newCategory = "Civic Practice"; const categories = values.variant === "new" ? ["All", "Literature", "Writing", newCategory] : ["All", "Literature", "Writing"]; const selected = values.variant === "all" ? "All" : values.variant === "new" ? newCategory : "Writing"; return <CourseSubjectFilter categories={categories} selected={selected} onChange={() => undefined} resultCount={values.variant === "empty" ? 0 : values.variant === "all" ? 2 : 1} />; } }),
  defineSpecimen({ id: "campus-audience-highlight", name: "Campus Audience Highlight", componentName: "AudienceHighlight", category: "Cards & containers", sourcePath: "src/components/sections/Campus.tsx", purpose: "Highlights one of the Campus audiences with frosted branded action styling.", useWhen: "Use for a short numbered Campus audience destination.", doNotUseWhen: "Do not use as a generic article card.", contentFields: ["number", "title", "description", "optional link"], variants: ["Linked", "Static", "Long content", "Hover/focus"], themeable: true, surfaceModes: ["paper", "light", "deep"], accessibility: "Linked cards use native anchor semantics and a full touch target.", responsive: "Fills its grid track and wraps long labels.", agentPhrase: "Use the **Campus Audience Highlight** component.", keywords: ["campus highlight container", "audience card"], controls: [textControl("title", "Audience title", "Accelerator participants", "Independent researchers and visiting collaborators"), selectControl("description", "Description", "standard", "long", [{ value: "standard", label: "Standard" }, { value: "long", label: "Long" }]), selectControl("link", "Link state", "linked", "static", [{ value: "linked", label: "Linked" }, { value: "static", label: "Static" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, SURFACE_CONTROL], render: ({ values }) => <AudienceHighlight num="01" title={values.title} description={values.description === "long" ? longText : "Students mastering practical AI in a six-week cohort."} href={values.link === "linked" ? "https://fractal.nyc" : null} /> }),
  defineSpecimen({ id: "membership-button-group", name: "Membership Button Group", componentName: "MembershipButtonGroup", category: "Cards & containers", sourcePath: "src/components/sections/Campus.tsx", purpose: "Presents Campus full-time and part-time membership actions together.", useWhen: "Use for the canonical Campus membership choices.", doNotUseWhen: "Do not use for unrelated two-button groups.", contentFields: ["membership labels", "access", "price", "destinations"], variants: ["Responsive", "Stacked", "Side by side"], themeable: true, surfaceModes: ["deep"], accessibility: "Each option is a native link with a descriptive label.", responsive: "Stacks on mobile and becomes a row at the established breakpoint.", agentPhrase: "Use the **Membership Button Group** component.", keywords: ["campus buttons", "membership tiers"], controls: [selectControl("layout", "Layout", "responsive", "stacked", [{ value: "responsive", label: "Responsive" }, { value: "stacked", label: "Stacked" }, { value: "side-by-side", label: "Side by side" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL], render: ({ values }) => <MembershipButtonGroup layout={values.layout} /> }),
  defineSpecimen({ id: "embed-frame", name: "Embedded Content Frame", componentName: "EmbedFrame", category: "Media & decoration", sourcePath: "src/components/content/EmbedFrame.tsx", purpose: "Frames a trusted embedded calendar or similar external document.", useWhen: "Use for a titled, lazy-loaded iframe such as Events/Luma.", doNotUseWhen: "Do not embed arbitrary untrusted content.", contentFields: ["src", "title", "permissions", "height"], variants: ["Calendar", "Compact preview", "Tall preview"], themeable: true, surfaceModes: ["paper", "light"], accessibility: "Requires a meaningful iframe title.", responsive: "Owns full available width; caller owns intentional height.", agentPhrase: "Use the **Embedded Content Frame** component.", keywords: ["iframe", "luma"], controls: [textControl("title", "Frame title", "Example embedded content", "Semester events calendar"), selectControl("height", "Frame height", "compact", "tall", [{ value: "compact", label: "Compact" }, { value: "tall", label: "Tall" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, SURFACE_CONTROL], render: ({ values }) => <EmbedFrame title={values.title} src="about:blank" className={values.height === "tall" ? "h-80" : "h-48"} /> }),
  defineSpecimen({ id: "editorial-quote", name: "Editorial Quote", componentName: "EditorialQuote", category: "Cards & containers", sourcePath: "src/components/content/EditorialQuote.tsx", purpose: "Formats a substantial quotation with optional semantic citation.", useWhen: "Use for attributed editorial testimony.", doNotUseWhen: "Do not use for decorative pull text without a quotation.", contentFields: ["quote paragraphs", "citation"], variants: ["With citation", "Without citation", "Long quote"], themeable: true, surfaceModes: ["paper", "light", "deep"], accessibility: "Uses blockquote and footer semantics.", responsive: "Indent increases only when space permits.", agentPhrase: "Use the **Editorial Quote** component.", keywords: ["blockquote", "testimonial"], controls: [textControl("quote", "Quote text", "Our relationships here matter, and we conspire to push one another’s work forward.", longText), selectControl("citation", "Citation", "with", "without", [{ value: "with", label: "With citation" }, { value: "without", label: "Without citation" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, SURFACE_CONTROL], render: ({ values }) => <EditorialQuote citation={values.citation === "with" ? "Andrew Rose · Fractal Campus co-founder" : undefined}><p>{values.quote}</p></EditorialQuote> }),
  defineSpecimen({ id: "mandelbrot-corner-frame", name: "Mandelbrot Corner Frame", componentName: "MandelbrotCorners", category: "Media & decoration", sourcePath: "src/components/ui/MandelbrotCorners.tsx", purpose: "Adds inward-facing Mandelbrot corner marks around a container.", useWhen: "Use when a container has enough safe padding for the selected corner size.", doNotUseWhen: "Do not place corners over text or media controls.", contentFields: ["corner size", "opacity", "content"], variants: ["XS", "Small", "Medium", "Large"], themeable: true, surfaceModes: ["paper", "light", "deep"], accessibility: "Decorations are hidden from assistive technology.", responsive: "Padding must meet the documented safe-area invariant.", agentPhrase: "Use the **Mandelbrot Corner Frame** component.", keywords: ["corners", "container decoration"], controls: [textControl("content", "Framed content", "Framed content", "Semester registration note"), selectControl("size", "Corner size", "sm", "lg", [{ value: "xs", label: "XS" }, { value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }]), PREVIEW_WIDTH_CONTROL, COLORWAY_CONTROL, SURFACE_CONTROL], render: ({ values }) => { const padding: Record<MandelbrotCornerSize, string> = { xs: "p-6", sm: "p-9", md: "p-14", lg: "p-20" }; return <MandelbrotCorners size={values.size} className={`border ${padding[values.size]}`}><p>{values.content}</p></MandelbrotCorners>; } }),
  defineSpecimen({ id: "mandelbrot-icon", name: "Mandelbrot Icon", componentName: "MandelbrotIcon", category: "Media & decoration", sourcePath: "src/components/house/MandelbrotIcon.tsx", purpose: "Renders the small fractal brand glyph.", useWhen: "Use as non-essential brand decoration.", doNotUseWhen: "Do not use as an unlabeled interactive control.", contentFields: ["size", "opacity"], variants: ["32px", "64px", "96px", "Full/subtle opacity"], themeable: true, surfaceModes: ["paper", "light", "deep"], accessibility: "Keep decorative instances aria-hidden.", responsive: "Uses caller-provided intrinsic size.", agentPhrase: "Use the **Mandelbrot Icon** component.", keywords: ["brand glyph"], controls: [selectControl("size", "Icon size", "32", "64", [{ value: "32", label: "32px" }, { value: "64", label: "64px" }, { value: "96", label: "96px" }]), selectControl("opacity", "Opacity", "1", "0.35", [{ value: "1", label: "Full" }, { value: "0.35", label: "Subtle" }]), COLORWAY_CONTROL, SURFACE_CONTROL], render: ({ values }) => <MandelbrotIcon size={Number(values.size)} opacity={Number(values.opacity)} /> }),
  defineSpecimen({ id: "paper-grain-overlay", name: "Paper Grain Overlay", componentName: "PaperGrain", category: "Media & decoration", sourcePath: "src/components/ui/PaperGrain.tsx", purpose: "Adds the subtle material texture used by frosted actions.", useWhen: "Use within a positioned branded surface.", doNotUseWhen: "Do not let it intercept input or reduce text contrast.", contentFields: ["none"], variants: ["Production texture"], themeable: false, surfaceModes: ["paper"], accessibility: "Purely decorative and pointer-inert.", responsive: "Covers its positioned owner.", agentPhrase: "Use the **Paper Grain Overlay** component.", keywords: ["texture"], controls: [], render: () => <div className="relative h-32 overflow-hidden rounded-md border"><PaperGrain /><p className="relative z-10 p-6">Textured surface</p></div> }),
  defineSpecimen({ id: "fractal-pattern", name: "Fractal Pattern", componentName: "FractalPattern", category: "Media & decoration", sourcePath: "src/components/ui/FractalPattern.tsx", purpose: "Adds the subtle page-level fractal background pattern.", useWhen: "Use only on established house page surfaces.", doNotUseWhen: "Do not place in a small card.", contentFields: ["canonical data-model color"], variants: ["Campus", "Education", "Events", "Library"], themeable: false, surfaceModes: ["paper"], accessibility: "Decorative and hidden from assistive technology.", responsive: "Viewport/page-owned; this preview is intentionally bounded.", agentPhrase: "Use the **Fractal Pattern** component.", keywords: ["background"], controls: [selectControl("house", "House pattern", "campus", "education", [{ value: "campus", label: "Campus" }, { value: "education", label: "Education" }, { value: "events", label: "Events" }, { value: "library", label: "Library" }])], render: ({ values }) => { const sample = patternSamples[values.house]; return <div className={`relative h-40 overflow-hidden rounded-md ${sample.backgroundClass}`} data-pattern-house={values.house}><FractalPattern color={sample.color} /></div>; } }),
  defineSpecimen({ id: "fade-in", name: "Fade In", componentName: "FadeIn", category: "Media & decoration", sourcePath: "src/components/ui/FadeIn.tsx", purpose: "Reveals content with the site’s reduced-motion-aware entrance.", useWhen: "Use sparingly for meaningful section entrances.", doNotUseWhen: "Do not animate essential feedback or repeated workshop controls.", contentFields: ["delay", "children"], variants: ["Directional entrance", "OS reduced-motion bypass"], themeable: false, surfaceModes: ["paper"], accessibility: "Reduced-motion preference removes the transform/reveal motion.", responsive: "No layout ownership.", agentPhrase: "Use the **Fade In** component.", keywords: ["animation", "reveal"], controls: [textControl("content", "Revealed content", "Reduced-motion-aware reveal", "Semester courses revealed")], render: ({ values }) => <FadeIn><p className="text-subtitle">{values.content}</p></FadeIn> }),
  reference("education-outbound-compat", "Education Outbound Link (compatibility)", "EducationOutboundLink", "Actions & controls", "src/components/education/EducationOutboundLink.tsx", "Keeps existing Education imports working while delegating to Outbound Link."),
  reference("gallery-image", "Gallery Image", "GalleryImage", "Media & decoration", "src/components/gallery/GalleryImage.tsx", "Renders a gallery image with its established loading and presentation behavior."),
  reference("photo-gallery", "Photo Gallery", "PhotoGallery", "Media & decoration", "src/components/gallery/PhotoGallery.tsx", "Arranges Story gallery sections and images."),
  reference("campus-banner", "Campus House Pennant", "CampusBannerSVG", "Brand & complex composites", "src/components/house/CampusBannerSVG.tsx", "Renders the Campus identity through Painted Relic Banner."),
  reference("co-living-banner", "Co-Living House Pennant", "CoLivingBannerSVG", "Brand & complex composites", "src/components/house/CoLivingBannerSVG.tsx", "Renders the Co-Living identity through Painted Relic Banner."),
  reference("education-banner", "Education House Pennant", "EducationBannerSVG", "Brand & complex composites", "src/components/house/EducationBannerSVG.tsx", "Renders the Education identity through Painted Relic Banner."),
  reference("events-banner", "Events House Pennant", "EventsBannerSVG", "Brand & complex composites", "src/components/house/EventsBannerSVG.tsx", "Renders the Events identity through Painted Relic Banner."),
  reference("library-banner", "Library House Pennant", "LibraryBannerSVG", "Brand & complex composites", "src/components/house/LibraryBannerSVG.tsx", "Renders the Library identity through Painted Relic Banner."),
  reference("political-club-banner", "Political Club House Pennant", "PoliticalClubBannerSVG", "Brand & complex composites", "src/components/house/PoliticalClubBannerSVG.tsx", "Renders the Political Club identity through Painted Relic Banner."),
  reference("painted-relic-banner", "House Pennant Renderer", "PaintedRelicBanner", "Brand & complex composites", "src/components/house/PaintedRelicBanner.tsx", "Shared renderer for all six painted house pennants."),
  reference("campus-section", "Campus Section", "Campus", "Brand & complex composites", "src/components/sections/Campus.tsx", "Composes the full Campus story, actions, audience highlights, quote, amenities, and carousel."),
  reference("hero-search", "Hero Search / Combobox", "Hero", "Brand & complex composites", "src/components/sections/Hero.tsx", "Provides the homepage hero and keyboard-accessible destination search.", ["combobox", "global search"]),
  reference("housing-map", "Housing Map", "HousingMap", "Brand & complex composites", "src/components/sections/HousingMap.tsx", "Shows the interactive Co-Living neighborhood map."),
  reference("meet-space-carousel", "Meet the Space Carousel", "MeetTheSpaceCarousel", "Brand & complex composites", "src/components/sections/MeetTheSpaceCarousel.tsx", "Shows Campus photos, captions, and carousel controls."),
  reference("origin-story", "Origin Story", "OriginStory", "Brand & complex composites", "src/components/sections/OriginStory.tsx", "Presents the long-form Fractal founding narrative."),
  reference("sierpinski-carpet", "Sierpinski Carpet", "SierpinskiCarpet", "Brand & complex composites", "src/components/sections/SierpinskiCarpet.tsx", "Renders the reduced-motion-aware recursive brand animation."),
  reference("fractal-city-scene", "Fractal City Scene", "FractalCityScene", "Brand & complex composites", "src/components/three/FractalCityScene.tsx", "Owns the homepage WebGL scene."),
  reference("octahedron-hero", "Octahedron Hero", "OctahedronHero", "Brand & complex composites", "src/components/three/OctahedronHero.tsx", "Renders the interactive house-navigation octahedron."),
];

const COMMON_IDS = new Set(["action-buttons", "outbound-link", "inline-text-link", "library-article-card", "note-callout", "course-card", "club-card", "campus-audience-highlight", "editorial-quote"]);
const FORM_IDS = new Set(["archive-search", "filter-chip", "empty-results-message", "library-tag-filter", "course-subject-filter"]);
const BASIC_BOARD_IDS = new Set(["color-pairing", "page-frame", "type-style", "reading-column", "standard-section-frame", "wide-card-grid", "section-header"]);
const MEDIA_BOARD_IDS = new Set(["photo-frame", "gallery-image", "photo-gallery"]);
const FULL_CONTEXT_IDS = new Set(["site-navigation", "campus-section", "hero-search", "housing-map", "meet-space-carousel", "origin-story", "sierpinski-carpet", "fractal-city-scene", "octahedron-hero"]);
const PENNANT_IDS = new Set(["campus-banner", "co-living-banner", "education-banner", "events-banner", "library-banner", "political-club-banner"]);
const SUPPORTING_IDS = new Set(["site-footer-marker", "filter-results-summary", "library-article-grid", "metadata-facts-list", "amenity-list", "category-badge", "icon-carousel-control", "archive-toolbar", "education-outbound-compat", "painted-relic-banner"]);

const names: Record<string, { name: string; purpose: string; aliases?: string[] }> = {
  "outbound-link": { name: "Standalone Link", purpose: "A prominent link that stands on its own and carries the diagonal outbound arrow.", aliases: ["External Link", "Outbound Link", "outsource link"] },
  "library-article-card": { name: "Article Card", purpose: "A complete Library article preview with its title, author, description, and link.", aliases: ["Library Article Card"] },
  "note-callout": { name: "Note Box", purpose: "A bordered note for short, important context or a related action.", aliases: ["Note / Callout Card", "note container"] },
  "course-card": { name: "Course Card", purpose: "A semester class with instructors, schedule, description, tags, and links.", aliases: ["class container"] },
  "club-card": { name: "Club Card", purpose: "A recurring Education club or open group with its key details and links.", aliases: ["Club / Open Group Card"] },
  "campus-audience-highlight": { name: "Campus Highlight", purpose: "A bold Campus card that introduces one audience or destination.", aliases: ["Campus Audience Highlight"] },
  "action-buttons": { name: "Primary Button", purpose: "The branded Mandelbrot-corner button for a page's primary action or important destination.", aliases: ["Action Button", "Main Action Button"] },
  "editorial-quote": { name: "Editorial Quote", purpose: "A prominent quotation with an optional attribution." },
  "color-pairing": { name: "Site Colors", purpose: "Every approved Fractal color pairing shown on real surfaces." },
  "type-style": { name: "Type Styles", purpose: "The approved heading, body, label, and input styles shown together." },
  "page-frame": { name: "Page Frame", purpose: "The standard page width and safe outer spacing at different screen sizes." },
  "reading-column": { name: "Reading Column", purpose: "A comfortable line length for articles and other longer passages." },
  "standard-section-frame": { name: "Section Spacing", purpose: "The standard breathing room above, below, and beside a page section." },
  "wide-card-grid": { name: "Card Grid", purpose: "A responsive arrangement for a repeatable collection of cards." },
  "section-header": { name: "Section Header", purpose: "The large letter and label that identify a Fractal section." },
  "campus-banner": { name: "House Pennants", purpose: "The six painted pennants that identify Fractal's houses." },
};

function galleryCategoryFor(entry: ComponentRegistryEntry): Exclude<GalleryCategoryId, "common" | "all"> {
  if (FORM_IDS.has(entry.id)) return "forms";
  if (BASIC_BOARD_IDS.has(entry.id)) return "basics";
  if (MEDIA_BOARD_IDS.has(entry.id) || entry.category === "Media & decoration" || PENNANT_IDS.has(entry.id)) return "media";
  if (FULL_CONTEXT_IDS.has(entry.id) || entry.category === "Brand & complex composites") return "sections";
  if (entry.category === "Actions & controls") return "actions";
  return "cards";
}

export const COMPONENT_REGISTRY: ComponentRegistryEntry[] = COMPONENT_REGISTRY_BASE.map((entry) => {
  const copy = names[entry.id];
  const isPennant = PENNANT_IDS.has(entry.id);
  const isSupportingPennant = isPennant && entry.id !== "campus-banner";
  const presentation: ComponentPresentation = SUPPORTING_IDS.has(entry.id) || isSupportingPennant
    ? "supporting"
    : entry.render || BASIC_BOARD_IDS.has(entry.id) || MEDIA_BOARD_IDS.has(entry.id) || FULL_CONTEXT_IDS.has(entry.id) || entry.id === "campus-banner"
      ? "gallery"
      : "internal";
  const previewMode: ComponentPreviewMode = presentation !== "gallery"
    ? "invisible"
    : entry.id === "campus-banner"
      ? "asset-family"
      : FULL_CONTEXT_IDS.has(entry.id)
        ? "full-context"
        : !entry.render || BASIC_BOARD_IDS.has(entry.id) || MEDIA_BOARD_IDS.has(entry.id)
          ? "visual-board"
          : "inline";
  const publicName = copy?.name ?? entry.name;
  const promptNeeds = entry.promptNeeds ?? "content or destination";
  return {
    ...entry,
    ...(copy ?? {}),
    aliases: [...(entry.aliases ?? []), ...(copy?.aliases ?? [])],
    common: COMMON_IDS.has(entry.id),
    galleryCategory: galleryCategoryFor(entry),
    presentation,
    previewMode,
    internalReason: presentation !== "gallery" ? entry.internalReason ?? (presentation === "supporting" ? "This source supports a visible gallery pattern rather than standing alone." : "This implementation is not an independently choosable visible pattern.") : undefined,
    agentPhrase: `Use the **“${publicName}”** component from the Fractal NYC component library on the page or section I’m working on. Inherit the target page or section’s approved house/section color tokens where this component supports them; otherwise keep its approved default. Use the real production component and preserve its accessibility and responsive behavior. Ask only if the required ${promptNeeds} are unclear.`,
  };
});

export const galleryEntries = COMPONENT_REGISTRY.filter((entry) => entry.presentation === "gallery");
export const searchableEntryText = (entry: ComponentRegistryEntry) => [entry.name, entry.componentName, entry.purpose, entry.agentPhrase, ...(entry.aliases ?? []), ...entry.keywords].join(" ").toLowerCase();

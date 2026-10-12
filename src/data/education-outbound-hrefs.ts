import { EDUCATION_EVENT, isEducationEventVisible } from "./education-event";
import { FRACTALU_CATALOG } from "./fractalu";

const SUBSTACK_URL = "https://fractaluniversity.substack.com";
const CANON_PDF_URL = "https://ajr.fyi/files/fractal-canon.pdf";
const FRACTALU_MAILTO = "mailto:fractalu@fractalnyc.com";

/** Course and club links rendered inside the FractalU catalog. */
export function fractalUCatalogOutboundHrefs(): string[] {
  return [
    ...FRACTALU_CATALOG.courses.flatMap((course) => [
      ...(course.detailsUrl ? [course.detailsUrl] : []),
      course.applicationUrl,
      ...(course.videoUrl ? [course.videoUrl] : []),
    ]),
    ...FRACTALU_CATALOG.clubs.flatMap((club) => [
      ...(club.detailsUrl ? [club.detailsUrl] : []),
      club.actionUrl,
    ]),
  ];
}

/**
 * Every outbound href on /education.
 *
 * The event RSVP is included only while `EducationEventCallout` still renders.
 * A finished event drops off the page by itself, so the inventory has to follow
 * `hideAfter` instead of a hardcoded link count.
 */
export function educationPageOutboundHrefs(now: Date = new Date()): string[] {
  return [
    SUBSTACK_URL,
    ...fractalUCatalogOutboundHrefs(),
    ...(isEducationEventVisible(EDUCATION_EVENT, now) ? [EDUCATION_EVENT.actionUrl] : []),
    CANON_PDF_URL,
    SUBSTACK_URL,
    FRACTALU_MAILTO,
  ];
}

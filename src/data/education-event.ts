/**
 * The event card pinned above everything on /education.
 *
 * EDIT THIS FILE to change the announcement. The card stops rendering by itself
 * once `hideAfter` has passed, so a finished event can't linger on the page.
 */
export interface EducationEvent {
  /** Small uppercase eyebrow above the copy. */
  label: string;
  /** Headline. One short line. */
  headline: string;
  /** Body copy. Two or three sentences at most — this sits above the page title. */
  body: string;
  /** Text of the action link. */
  actionLabel: string;
  /** Where the action link goes. */
  actionUrl: string;
  /**
   * The card renders only while `now` is before this instant.
   * ISO 8601 with an explicit offset so the cutoff is a fixed moment in New York,
   * not whatever midnight means in the visitor's timezone.
   */
  hideAfter: string;
}

export const EDUCATION_EVENT: EducationEvent = {
  label: "Sunday · September 20",
  headline: "🍁 Fall Mini Classes at Fractal Campus 🍁",
  body:
    "Fall instructors will teach a 30-minute demo of their class, so you " +
    "can try classes out before committing! Pizza and drinks provided, come hang out :)",
  actionLabel: "RSVP on Partiful",
  actionUrl: "https://partiful.com/e/fJaccVQidLiccM9tORMJ",
  // End of Sept 20 in New York (EDT, UTC-4).
  hideAfter: "2026-09-21T00:00:00-04:00",
};

/** True while the event is still ahead of `now`. Pure, so it can be tested directly. */
export function isEducationEventVisible(
  event: EducationEvent = EDUCATION_EVENT,
  now: Date = new Date(),
): boolean {
  const cutoff = Date.parse(event.hideAfter);
  if (Number.isNaN(cutoff)) return false;
  return now.getTime() < cutoff;
}

import { CalloutCard } from "@/components/content/CalloutCard";
import { EducationOutboundLink } from "@/components/education/EducationOutboundLink";
import { EDUCATION_EVENT, isEducationEventVisible, type EducationEvent } from "@/data/education-event";

interface EducationEventCalloutProps {
  event?: EducationEvent;
  /** Injectable for tests; defaults to the real clock. */
  now?: Date;
}

/**
 * Pinned announcement above the Education hero. Renders nothing once the event
 * has passed, so the page needs no manual cleanup afterwards.
 */
export function EducationEventCallout({ event = EDUCATION_EVENT, now }: EducationEventCalloutProps) {
  if (!isEducationEventVisible(event, now)) return null;

  return (
    <section
      className="mx-auto mb-10 w-full max-w-7xl page-gutter md:mb-14"
      aria-labelledby="education-event-title"
      data-education-event
    >
      <CalloutCard
        label={event.label}
        labelId="education-event-label"
        surface="paper"
        className="mx-auto max-w-3xl"
      >
        <h2 id="education-event-title" className="text-subtitle mb-2 text-foreground normal-case">
          {event.headline}
        </h2>
        <p className="min-w-0 [overflow-wrap:anywhere]">{event.body}</p>
        <EducationOutboundLink
          href={event.actionUrl}
          accessibleName={event.actionLabel}
          variant="outbound"
          className="mt-3"
        >
          <span className="min-w-0 [overflow-wrap:anywhere]">{event.actionLabel}</span>
        </EducationOutboundLink>
      </CalloutCard>
    </section>
  );
}

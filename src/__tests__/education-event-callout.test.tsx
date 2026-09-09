import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EducationEventCallout } from "@/components/education/EducationEventCallout";
import {
  EDUCATION_EVENT,
  isEducationEventVisible,
  type EducationEvent,
} from "@/data/education-event";

afterEach(cleanup);

const BEFORE = new Date("2026-09-09T12:00:00-04:00");
const DURING = new Date("2026-09-20T15:00:00-04:00");
const AFTER = new Date("2026-09-21T00:00:01-04:00");

describe("Education event callout", () => {
  it("renders through the end of the event day and stops afterwards", () => {
    for (const now of [BEFORE, DURING]) {
      const { unmount } = render(<EducationEventCallout now={now} />);
      expect(screen.getByText(EDUCATION_EVENT.headline)).toBeInTheDocument();
      unmount();
      cleanup();
    }
    const { container } = render(<EducationEventCallout now={AFTER} />);
    expect(container.querySelector("[data-education-event]")).toBeNull();
  });

  it("is a labelled region carrying the copy and one outbound action", () => {
    const { container } = render(<EducationEventCallout now={BEFORE} />);
    const region = container.querySelector<HTMLElement>("[data-education-event]")!;
    expect(region.tagName).toBe("SECTION");
    expect(region).toHaveAttribute("aria-labelledby", "education-event-title");

    expect(within(region).getByText(EDUCATION_EVENT.label)).toBeInTheDocument();
    expect(within(region).getByRole("heading", { name: EDUCATION_EVENT.headline })).toHaveAttribute(
      "id",
      "education-event-title",
    );
    // Match on normalised text: copy is edited by hand, and incidental whitespace
    // should never be able to fail a test.
    const normalise = (value: string) => value.replace(/\s+/g, " ").trim();
    expect(
      within(region).getByText((_, element) =>
        element?.tagName === "P" && normalise(element.textContent ?? "") === normalise(EDUCATION_EVENT.body),
      ),
    ).toBeInTheDocument();

    const links = region.querySelectorAll<HTMLAnchorElement>("[data-education-outbound-link]");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", EDUCATION_EVENT.actionUrl);
    expect(links[0]).toHaveAttribute("target", "_blank");
    expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("treats an unparseable cutoff as expired rather than showing forever", () => {
    const broken: EducationEvent = { ...EDUCATION_EVENT, hideAfter: "not a date" };
    expect(isEducationEventVisible(broken, BEFORE)).toBe(false);
    const { container } = render(<EducationEventCallout event={broken} now={BEFORE} />);
    expect(container.querySelector("[data-education-event]")).toBeNull();
  });

  it("pins the cutoff to a fixed New York instant, not the viewer's midnight", () => {
    // 23:30 on Sept 20 in Los Angeles is already Sept 21 in New York.
    expect(isEducationEventVisible(EDUCATION_EVENT, new Date("2026-09-20T23:30:00-07:00"))).toBe(false);
    // The same wall-clock time in New York is still within the event day.
    expect(isEducationEventVisible(EDUCATION_EVENT, new Date("2026-09-20T23:30:00-04:00"))).toBe(true);
  });

  it("ships a real https action URL", () => {
    const url = new URL(EDUCATION_EVENT.actionUrl);
    expect(url.protocol).toBe("https:");
  });
});

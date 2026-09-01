import type { OutboundLinkProps } from "@/components/content/OutboundLink";
import { OutboundLink } from "@/components/content/OutboundLink";

interface EducationOutboundLinkProps extends Omit<OutboundLinkProps, "variant"> {
  variant?: "inline" | "standalone" | "outbound" | "course-title";
}

/** Compatibility name for existing Education call sites. Prefer OutboundLink in new work. */
export function EducationOutboundLink({ variant = "standalone", ...props }: EducationOutboundLinkProps) {
  return (
    <OutboundLink
      {...props}
      variant={variant === "course-title" ? "linked-title" : variant}
      data-education-outbound-link=""
    />
  );
}

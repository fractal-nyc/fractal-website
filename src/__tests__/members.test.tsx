import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { MembersPage } from "@/pages/MembersPage";
import { MemberGuidePage } from "@/pages/MemberGuidePage";
import {
  CUTIES_URL,
  DISCORD_URL,
  LUMA_EVENTS_URL,
  MEMBER_GUIDE_PATH,
  MEMBER_LINKS,
  MEMBERS_HOSTNAME,
  MEMBERS_HOME_PATH,
  STRIPE_CUSTOMER_PORTAL_LOGIN_FALLBACK,
  membersHomePathForHost,
  stripeCustomerPortalLoginUrl,
} from "@/data/member-links";
import { MEMBER_GUIDE_ADDRESS, MEMBER_GUIDE_CONTACT } from "@/data/member-guide";

function renderAt(Page: React.ComponentType, path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <WouterRouter hook={hook}>
      <Page />
    </WouterRouter>,
  );
}

function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    writable: true,
    configurable: true,
  });
}

describe("member destination config", () => {
  it("reuses the public Luma and Discord URLs", () => {
    expect(MEMBER_LINKS.events).toBe(LUMA_EVENTS_URL);
    expect(MEMBER_LINKS.events).toBe("https://lu.ma/nyc-tech");
    expect(MEMBER_LINKS.discord).toBe(DISCORD_URL);
    expect(MEMBER_LINKS.discord).toBe("https://discord.gg/Er974gPTXe");
  });

  it("points Cuties at the public Cuties site and the guide at an internal path", () => {
    expect(MEMBER_LINKS.cuties).toBe(CUTIES_URL);
    expect(MEMBER_LINKS.memberGuide).toBe(MEMBER_GUIDE_PATH);
  });

  it("uses Stripe's no-code Customer Portal login URL pattern", () => {
    expect(MEMBER_LINKS.manageMembership).toBe(
      stripeCustomerPortalLoginUrl(),
    );
    expect(MEMBER_LINKS.manageMembership.startsWith("https://billing.stripe.com/p/login")).toBe(
      true,
    );
    expect(stripeCustomerPortalLoginUrl("")).toBe(
      STRIPE_CUSTOMER_PORTAL_LOGIN_FALLBACK,
    );
    expect(
      stripeCustomerPortalLoginUrl(" https://billing.stripe.com/p/login/live_abc "),
    ).toBe("https://billing.stripe.com/p/login/live_abc");
  });

  it("sends the members subdomain root to /members", () => {
    expect(membersHomePathForHost(MEMBERS_HOSTNAME, "/")).toBe(MEMBERS_HOME_PATH);
    expect(membersHomePathForHost("fractalnyc.com", "/")).toBeNull();
    expect(membersHomePathForHost(MEMBERS_HOSTNAME, "/members")).toBeNull();
  });
});

describe("MembersPage", () => {
  beforeEach(() => {
    setViewport(375);
    document.title = "Fractal NYC";
  });

  afterEach(() => {
    document.title = "Fractal NYC";
    document.querySelector('meta[name="robots"]')?.remove();
  });

  it("identifies the page as the Campus coworking member home", () => {
    renderAt(MembersPage, "/members");
    expect(
      screen.getByRole("heading", { level: 1, name: /fractal campus member home/i }),
    ).toBeTruthy();
    expect(screen.getByText(/coworking member/i)).toBeTruthy();
    expect(document.querySelector("[data-members-home]")).toBeTruthy();
  });

  it("makes Manage membership the first destination and the primary Stripe CTA", () => {
    const { container } = renderAt(MembersPage, "/members");
    const destinations = container.querySelectorAll("[data-member-destination]");
    expect(destinations[0]).toHaveAttribute("data-member-destination", "manage");

    const manage = screen.getByRole("link", { name: "Manage membership" });
    expect(manage).toHaveAttribute("href", MEMBER_LINKS.manageMembership);
    expect(manage).toHaveAttribute("target", "_blank");
    expect(manage.getAttribute("rel")).toContain("noopener");

    const manageCard = container.querySelector<HTMLElement>(
      '[data-member-destination="manage"]',
    )!;
    expect(within(manageCard).getByRole("heading", { name: "Manage your membership" })).toBeTruthy();
  });

  it("links the remaining destinations to the centralized URLs", () => {
    renderAt(MembersPage, "/members");
    expect(screen.getByRole("link", { name: "View member guide" })).toHaveAttribute(
      "href",
      MEMBER_GUIDE_PATH,
    );
    expect(screen.getByRole("link", { name: "See upcoming events" })).toHaveAttribute(
      "href",
      LUMA_EVENTS_URL,
    );
    expect(screen.getByRole("link", { name: "Join us on Cuties" })).toHaveAttribute(
      "href",
      CUTIES_URL,
    );
    expect(screen.getByRole("link", { name: "Open Discord" })).toHaveAttribute(
      "href",
      DISCORD_URL,
    );
  });

  it("frames Cuties as optional serendipity, not a membership requirement", () => {
    renderAt(MembersPage, "/members");
    expect(screen.getByText(/a profile is optional/i)).toBeTruthy();
    expect(screen.getByText(/serendipity/i)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/must (join|have) a cuties/i);
  });

  it("does not add Members to the public navbar", () => {
    renderAt(MembersPage, "/members");
    const header = document.querySelector("header")!;
    expect(header.querySelector('a[href="/members"]')).toBeNull();
    expect(within(header).queryByText("Member Home")).toBeNull();
  });

  it("marks the page noindex and sets a member-specific title", () => {
    renderAt(MembersPage, "/members");
    expect(document.title).toBe("Fractal Campus Member Home");
    const robots = document.querySelector('meta[name="robots"]');
    expect(robots).toHaveAttribute("content", "noindex, nofollow");
  });

  it("stacks destination cards at the 375px mobile baseline", () => {
    const { container } = renderAt(MembersPage, "/members");
    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("grid-cols-1");
    const manageCta = screen.getByRole("link", { name: "Manage membership" });
    expect(manageCta.className).toMatch(/w-full/);
  });
});

describe("MemberGuidePage", () => {
  afterEach(() => {
    document.querySelector('meta[name="robots"]')?.remove();
  });

  it("only exposes known Campus facts and a path back to member home", () => {
    renderAt(MemberGuidePage, "/members/guide");
    expect(screen.getByRole("heading", { level: 1, name: /member guide/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: MEMBER_GUIDE_ADDRESS.label })).toHaveAttribute(
      "href",
      MEMBER_GUIDE_ADDRESS.mapsUrl,
    );
    expect(screen.getByRole("link", { name: MEMBER_GUIDE_CONTACT.email })).toHaveAttribute(
      "href",
      MEMBER_GUIDE_CONTACT.mailto,
    );
    expect(screen.getByText(/24\/7 access/i)).toBeTruthy();
    expect(screen.getByText(/20 hours per week/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Back to member home" })).toHaveAttribute(
      "href",
      MEMBERS_HOME_PATH,
    );
    expect(document.body.textContent).not.toMatch(/wifi password/i);
  });
});

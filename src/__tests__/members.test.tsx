import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { MembersPage } from "@/pages/MembersPage";
import {
  CUTIES_URL,
  DISCORD_URL,
  LUMA_EVENTS_URL,
  MEMBER_LINKS,
  MEMBERS_HOSTNAME,
  MEMBERS_HOME_PATH,
  STRIPE_CUSTOMER_PORTAL_LOGIN_FALLBACK,
  membersHomePathForHost,
  stripeCustomerPortalLoginUrl,
} from "@/data/member-links";
import { MEMBER_GUIDE_WIFI } from "@/data/member-guide";

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

  it("points Cuties at the public Cuties site", () => {
    expect(MEMBER_LINKS.cuties).toBe(CUTIES_URL);
  });

  it("uses Stripe's no-code Customer Portal login URL pattern", () => {
    expect(MEMBER_LINKS.manageMembership).toBe(stripeCustomerPortalLoginUrl());
    expect(
      MEMBER_LINKS.manageMembership.startsWith("https://billing.stripe.com/p/login"),
    ).toBe(true);
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

  it("uses a one-line Member Guide headline with no subheading or top wordmark", () => {
    const { container } = renderAt(MembersPage, "/members");
    const heading = screen.getByRole("heading", { level: 1, name: "Member Guide" });
    expect(heading).toHaveClass("whitespace-nowrap");
    expect(heading.textContent).toBe("Member Guide");
    expect(screen.queryByText(/everything you need/i)).toBeNull();
    expect(container.querySelector("[data-sector-letter]")).toBeNull();
    expect(document.querySelector("header")).toBeNull();
    expect(document.querySelector("[data-members-home]")).toBeTruthy();
  });

  it("is a text guide, not a destination-card dashboard", () => {
    const { container } = renderAt(MembersPage, "/members");
    expect(container.querySelector("[data-member-destination]")).toBeNull();
    expect(container.querySelector(".grid")).toBeNull();
    expect(screen.getByRole("heading", { name: "Hours and access" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Kitchens" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Desks" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Call booths" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Events" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Quiet hours" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Wi-Fi" })).toBeTruthy();
  });

  it("renders every section immediately, without a scroll-into-view fade", () => {
    const { container } = renderAt(MembersPage, "/members");
    expect(container.querySelector("[style*='opacity']")).toBeNull();
    expect(screen.getByRole("heading", { name: "Community" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Wi-Fi" })).toBeVisible();
  });

  it("covers the operational notes from Campus members", () => {
    renderAt(MembersPage, "/members");
    expect(screen.getByText(/open 24\/7/i)).toBeTruthy();
    expect(screen.getByText(/20 hours a week/i)).toBeTruthy();
    expect(screen.getByText(/pin code from your member email/i)).toBeTruthy();
    expect(screen.getByText(/both kitchens are open/i)).toBeTruthy();
    expect(screen.getByText(/coffee machines/i)).toBeTruthy();
    expect(screen.getByText(/label food with your name and an expiry date/i)).toBeTruthy();
    expect(screen.getByText(/open containers in the pantry/i)).toBeTruthy();
    expect(screen.getByText(/unlabeled or expired food will be thrown out/i)).toBeTruthy();
    expect(screen.getByText(/name and a reserved sign/i)).toBeTruthy();
    expect(screen.getByText(/time sheets on the doors/i)).toBeTruthy();
    expect(screen.getByText(/submit it for approval/i)).toBeTruthy();
    expect(screen.getByText(/after 8pm/i)).toBeTruthy();
    expect(screen.getByText(MEMBER_GUIDE_WIFI.network)).toBeTruthy();
    expect(screen.getByText(MEMBER_GUIDE_WIFI.password)).toBeTruthy();
  });

  it("keeps a clear Stripe manage-membership CTA", () => {
    renderAt(MembersPage, "/members");
    const manage = screen.getByRole("link", { name: "Manage membership" });
    expect(manage).toHaveAttribute("href", MEMBER_LINKS.manageMembership);
    expect(manage).toHaveAttribute("target", "_blank");
    expect(manage.getAttribute("rel")).toContain("noopener");
    expect(screen.getByText(/cancel or change your membership/i)).toBeTruthy();
  });

  it("links Luma, Discord, and optional Cuties as text, not cards", () => {
    renderAt(MembersPage, "/members");
    const lumaLinks = screen.getAllByRole("link", { name: /luma/i });
    expect(lumaLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of lumaLinks) {
      expect(link).toHaveAttribute("href", LUMA_EVENTS_URL);
    }
    expect(screen.getByRole("link", { name: "Discord" })).toHaveAttribute(
      "href",
      DISCORD_URL,
    );
    expect(screen.getByRole("link", { name: "Cuties" })).toHaveAttribute(
      "href",
      CUTIES_URL,
    );
    expect(screen.getByText(/is optional/i)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/must (join|have) a cuties/i);
  });

  it("marks the page noindex and does not add Members to a public navbar", () => {
    renderAt(MembersPage, "/members");
    expect(document.title).toBe("Member Guide");
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    expect(document.querySelector('a[href="/members"]')).toBeNull();
  });
});

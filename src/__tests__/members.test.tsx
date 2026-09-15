import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { MembersPage } from "@/pages/MembersPage";
import {
  CUTIES_URL,
  DISCORD_URL,
  LUMA_EVENTS_URL,
  MEMBER_LINKS,
  MEMBERS_DISCORD_URL,
  MEMBERS_HOSTNAME,
  MEMBERS_HOME_PATH,
  STRIPE_CUSTOMER_PORTAL_LOGIN_URL,
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
  it("reuses the public Luma calendar and the members Discord invite", () => {
    expect(MEMBER_LINKS.events).toBe(LUMA_EVENTS_URL);
    expect(MEMBER_LINKS.events).toBe("https://lu.ma/nyc-tech");
    expect(MEMBER_LINKS.discord).toBe(MEMBERS_DISCORD_URL);
    expect(MEMBER_LINKS.discord).toBe("https://discord.gg/DaHFyPubNv");
    expect(MEMBER_LINKS.discord).not.toBe(DISCORD_URL);
    expect(DISCORD_URL).toBe("https://discord.gg/Er974gPTXe");
  });

  it("points Cuties at the public Cuties site", () => {
    expect(MEMBER_LINKS.cuties).toBe(CUTIES_URL);
  });

  it("uses the live Stripe Customer Portal login URL", () => {
    expect(MEMBER_LINKS.manageMembership).toBe(STRIPE_CUSTOMER_PORTAL_LOGIN_URL);
    expect(MEMBER_LINKS.manageMembership).toBe(
      "https://billing.stripe.com/p/login/7sI8zddAWdabfYc144",
    );
    expect(stripeCustomerPortalLoginUrl()).toBe(STRIPE_CUSTOMER_PORTAL_LOGIN_URL);
    expect(stripeCustomerPortalLoginUrl("")).toBe(STRIPE_CUSTOMER_PORTAL_LOGIN_URL);
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

  it("uses a one-line Member Guide headline with no page subheading", () => {
    const { container } = renderAt(MembersPage, "/members");
    const heading = screen.getByRole("heading", { level: 1, name: "Member Guide" });
    expect(heading).toHaveClass("whitespace-nowrap");
    expect(heading.textContent).toBe("Member Guide");
    expect(screen.queryByText(/everything you need/i)).toBeNull();
    expect(container.querySelector("[data-sector-letter]")).toBeNull();
    expect(document.querySelector("[data-site-navbar]")).toBeTruthy();
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
    expect(screen.getByRole("heading", { name: "Hosting Events" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Quiet hours" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Wi-Fi" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Community" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Membership Changes" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: /^Membership$/ })).toBeNull();
  });

  it("renders every section immediately, without a scroll-into-view fade", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/pages/MembersPage.tsx"),
      "utf8",
    );
    expect(source).not.toMatch(/FadeIn/);
    expect(source).not.toMatch(/FractalPattern/);
    renderAt(MembersPage, "/members");
    for (const name of [
      "Hours and access",
      "Kitchens",
      "Desks",
      "Call booths",
      "Hosting Events",
      "Quiet hours",
      "Wi-Fi",
      "Community",
      "Membership Changes",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeVisible();
    }
  });

  it("covers the operational notes from Campus members", () => {
    renderAt(MembersPage, "/members");
    expect(screen.getByText(/open 24\/7/i)).toBeTruthy();
    expect(screen.getByText(/20 hours a week/i)).toBeTruthy();
    expect(
      screen.getByText(/pin code we emailed to you/i),
    ).toBeTruthy();
    expect(screen.getByText(/you may leave food in the fridge and pantry/i)).toBeTruthy();
    expect(screen.getByText(/coffee machines/i)).toBeTruthy();
    expect(screen.getByText(/label food with your name and an expiry date/i)).toBeTruthy();
    expect(screen.getByText(/open containers in the pantry/i)).toBeTruthy();
    expect(screen.getByText(/unlabeled or expired food will be thrown out/i)).toBeTruthy();
    expect(screen.queryByText(/both kitchens are open/i)).toBeNull();
    expect(screen.queryByText(/there are no restrictions/i)).toBeNull();
    expect(screen.getByText(/name and a reserved sign/i)).toBeTruthy();
    expect(screen.getByText(/time sheets on the doors/i)).toBeTruthy();
    expect(screen.getByText(/host events at Fractal Campus/i)).toBeTruthy();
    expect(screen.getByText(/Submit Event/)).toBeTruthy();
    expect(screen.getByText(/aren't double scheduling/i)).toBeTruthy();
    expect(screen.queryByText(/submit it for approval/i)).toBeNull();
    expect(screen.getByText(/after 8pm/i)).toBeTruthy();
    expect(screen.getByText(MEMBER_GUIDE_WIFI.network)).toBeTruthy();
    expect(screen.getByText(MEMBER_GUIDE_WIFI.password)).toBeTruthy();
  });

  it("keeps a Stripe manage-membership button as the last section, without extra copy", () => {
    renderAt(MembersPage, "/members");
    const headings = screen.getAllByRole("heading", { level: 2 }).map((el) => el.textContent);
    expect(headings.at(-1)).toBe("Membership Changes");
    const manage = screen.getByRole("link", { name: "Manage membership" });
    expect(manage).toHaveAttribute(
      "href",
      "https://billing.stripe.com/p/login/7sI8zddAWdabfYc144",
    );
    expect(manage).toHaveAttribute("href", MEMBER_LINKS.manageMembership);
    expect(manage).toHaveAttribute("target", "_blank");
    expect(manage.getAttribute("rel")).toContain("noopener");
    expect(screen.queryByText(/cancel or change your membership/i)).toBeNull();
  });

  it("links Luma, the members Discord, and Cuties as text, not cards", () => {
    renderAt(MembersPage, "/members");
    const lumaLinks = screen.getAllByRole("link", { name: /luma/i });
    expect(lumaLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of lumaLinks) {
      expect(link).toHaveAttribute("href", LUMA_EVENTS_URL);
    }
    expect(screen.getByRole("link", { name: "Discord" })).toHaveAttribute(
      "href",
      MEMBERS_DISCORD_URL,
    );
    expect(screen.getByRole("link", { name: "Cuties" })).toHaveAttribute(
      "href",
      CUTIES_URL,
    );
    expect(screen.getByText(/say hi and ask questions/i)).toBeTruthy();
    expect(screen.getByText(/make friends, find collaborators, or look for love/i)).toBeTruthy();
    expect(screen.queryByText(/is optional/i)).toBeNull();
    expect(document.body.textContent).not.toMatch(/must (join|have) a cuties/i);
  });

  it("marks the page noindex and does not add Members to the public navbar", () => {
    renderAt(MembersPage, "/members");
    expect(document.title).toBe("Member Guide");
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    expect(document.querySelector('header a[href="/members"]')).toBeNull();
    expect(screen.queryByRole("link", { name: "Members" })).toBeNull();
    expect(screen.getAllByText("Fractal").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Collective").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "Open menu" }).length).toBeGreaterThanOrEqual(1);
  });
});

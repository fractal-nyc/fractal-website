import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

import { Navbar } from "@/components/layout/Navbar";

// ═══════════════════════════════════════════════════════════════════════════
// The Navbar is a sticky bar: a Jacquard "Fractal" wordmark plus a hamburger
// that toggles a 280px dropdown. The section links are NOT always visible —
// they exist in the DOM only while the menu is open. That is the single most
// important property of the new design and the thing the old test suite (which
// asserted 6 permanently-visible inner-page links) got wrong.
//
// Menu model — 3 groups, 7 rows, mixing internal routes with external links:
//
//   Spaces     → Fractal Campus (/campus), Fractal Co-Living (/co-living),
//                Merlin's Place (external)
//   Education  → Fractal Accelerator (/accelerator), FractalU (external)
//   Community  → Events (/events), Library (/library)
//
// EVERY row now goes somewhere. The menu used to carry an 8th, destination-less
// row — "Enter the Fractal", rendered as a disabled <span> — which is HIDDEN
// until the member portal ships. Its color (NAV_PORTAL_COLOR / --color-nav-portal)
// is deliberately kept, so a surviving token is not evidence of a surviving row;
// the "no disabled rows" assertion below is what pins that.
//
// Political Club and People are ABSENT from the menu too — and now, unlike before,
// they are not reachable by direct route either: both pages were retired and their
// routes 404 (see routes.test.tsx).
// ═══════════════════════════════════════════════════════════════════════════

/** Every row label the open menu must expose, in render order. */
const ROWS = [
  "Fractal Campus",
  "Fractal Co-Living",
  "Merlin's Place",
  "Fractal Accelerator",
  "FractalU",
  "Events",
  "Library",
] as const;

/** Rows that navigate inside the SPA, with the href their wouter <Link> must emit. */
const INTERNAL_ROWS: Record<string, string> = {
  "Fractal Campus": "/campus",
  "Fractal Co-Living": "/co-living",
  "Fractal Accelerator": "/accelerator",
  Events: "/events",
  Library: "/library",
};

/** Rows that leave the site — must be real anchors that open in a new tab. */
const EXTERNAL_ROWS: Record<string, string> = {
  "Merlin's Place": "https://merlins.place/",
  FractalU: "https://fractalu.nyc",
};

function renderNavbar(path = "/campus") {
  const { hook } = memoryLocation({ path, static: true });
  const user = userEvent.setup();
  const utils = render(
    <WouterRouter hook={hook}>
      <Navbar />
    </WouterRouter>,
  );
  return { ...utils, user };
}

/** The hamburger. Its accessible name flips with state, so match either. */
function getToggle() {
  return screen.getByRole("button", { name: /(open|close) menu/i });
}

/** The dropdown <nav>, or null when the menu is closed. */
function queryMenu() {
  return document.querySelector("nav");
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(getToggle());
  const menu = queryMenu();
  expect(menu, "menu should be open").toBeTruthy();
  return menu!;
}

// ═══════════════════════════════════════════════════════════════════════════
// Closed by default
// ═══════════════════════════════════════════════════════════════════════════

describe("Navbar — closed state", () => {
  it("renders the wordmark and the hamburger, but no menu", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /fractal — home/i })).toBeTruthy();
    expect(getToggle()).toBeTruthy();
    expect(queryMenu()).toBeNull();
  });

  it("does not put ANY menu row in the DOM before the menu is opened", () => {
    renderNavbar();
    for (const label of ROWS) {
      expect(
        screen.queryByText(label),
        `"${label}" must not exist until the menu is opened`,
      ).toBeNull();
    }
  });

  it("marks the toggle aria-expanded=false and points aria-controls at the menu id", () => {
    renderNavbar();
    const toggle = getToggle();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.getAttribute("aria-controls")).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Opening
// ═══════════════════════════════════════════════════════════════════════════

describe("Navbar — opening the menu", () => {
  it("reveals all 7 rows", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);

    for (const label of ROWS) {
      expect(
        within(menu).getByText(label),
        `open menu should contain "${label}"`,
      ).toBeTruthy();
    }
  });

  it("renders the three group headings", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);
    for (const group of ["Spaces", "Education", "Community"]) {
      expect(within(menu).getByText(group)).toBeTruthy();
    }
  });

  it("flips aria-expanded to true, and the aria-controls id resolves to the menu", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);

    const toggle = getToggle();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(menu.getAttribute("id")).toBe(toggle.getAttribute("aria-controls"));
  });

  it("toggles back closed on a second click", async () => {
    const { user } = renderNavbar();
    await openMenu(user);

    await user.click(getToggle());

    expect(queryMenu()).toBeNull();
    expect(getToggle().getAttribute("aria-expanded")).toBe("false");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Row semantics — internal vs external vs disabled
// ═══════════════════════════════════════════════════════════════════════════

describe("Navbar — row link semantics", () => {
  it("renders internal rows as in-SPA wouter links (href, no target)", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);

    for (const [label, href] of Object.entries(INTERNAL_ROWS)) {
      const anchor = within(menu).getByText(label).closest("a");
      expect(anchor, `"${label}" should be an anchor`).toBeTruthy();
      expect(anchor!.getAttribute("href")).toBe(href);
      // An internal route must NOT open a new tab — that would break the SPA.
      expect(anchor!.hasAttribute("target")).toBe(false);
    }
  });

  it("renders external rows as target=_blank anchors with rel=noopener", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);

    for (const [label, href] of Object.entries(EXTERNAL_ROWS)) {
      const anchor = within(menu).getByText(label).closest("a");
      expect(anchor, `"${label}" should be an anchor`).toBeTruthy();
      expect(anchor!.getAttribute("href")).toBe(href);
      expect(anchor!.getAttribute("target")).toBe("_blank");
      expect(anchor!.getAttribute("rel")).toContain("noopener");
    }
  });

  it("exposes exactly 7 links — every row is a real destination", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);
    // One anchor per row, no exceptions: 5 internal + 2 external.
    expect(menu.querySelectorAll("a").length).toBe(ROWS.length);
    expect(ROWS.length).toBe(
      Object.keys(INTERNAL_ROWS).length + Object.keys(EXTERNAL_ROWS).length,
    );
  });

  it("renders NO disabled rows — a dead-end row must never ship", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);
    // The disabled <span> branch existed solely for the portal row and was deleted
    // with it. If someone reintroduces a destination-less row, this fails —
    // restoring the portal means restoring the branch deliberately.
    expect(menu.querySelectorAll("[aria-disabled]").length).toBe(0);
    for (const label of ROWS) {
      expect(
        within(menu).getByText(label).closest("a"),
        `"${label}" must be a real anchor, not a disabled row`,
      ).toBeTruthy();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// The hidden portal row
// ═══════════════════════════════════════════════════════════════════════════

describe('Navbar — "Enter the Fractal" is hidden until the portal ships', () => {
  it("does not appear in the open menu", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);
    expect(within(menu).queryByText("Enter the Fractal")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Hidden sections (FRAC-161) — still true, now enforced against the dropdown
// ═══════════════════════════════════════════════════════════════════════════

describe("Navbar — Political Club and People are not in the menu", () => {
  it("neither appears once the menu is open", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);

    expect(within(menu).queryByText("Political Club")).toBeNull();
    expect(within(menu).queryByText("People")).toBeNull();
    // ...and no row links at their routes either.
    expect(menu.querySelector('a[href="/political-club"]')).toBeNull();
    expect(menu.querySelector('a[href="/people"]')).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Dismissal
// ═══════════════════════════════════════════════════════════════════════════

describe("Navbar — dismissal", () => {
  it("closes on Escape", async () => {
    const { user } = renderNavbar();
    await openMenu(user);

    await user.keyboard("{Escape}");

    expect(queryMenu()).toBeNull();
    expect(getToggle().getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on an outside mousedown", async () => {
    const { user } = renderNavbar();
    await openMenu(user);

    // The listener is a document-level mousedown that ignores anything inside
    // the <header>. Clicking the body is the canonical "outside" gesture.
    await user.click(document.body);

    expect(queryMenu()).toBeNull();
  });

  it("stays open on a mousedown INSIDE the menu", async () => {
    const { user } = renderNavbar();
    const menu = await openMenu(user);

    await user.click(within(menu).getByText("Spaces"));

    expect(queryMenu()).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Wordmark — big + centered on Home, smaller + left-aligned on inner pages
// ═══════════════════════════════════════════════════════════════════════════

describe("Navbar — wordmark", () => {
  const wordmark = () => screen.getByRole("link", { name: /fractal — home/i });

  // NOTE ON SIZE: the two states differ by an inline `font-size: clamp(...)`.
  // jsdom's CSSOM does not understand `clamp()` — it drops the declaration
  // entirely, so both `style.fontSize` and the serialized style attribute come
  // back WITHOUT it. Font size is therefore not assertable here. The layout
  // difference is: Home centers the wordmark (`justify-center`, hamburger
  // absolutely positioned), inner pages push it left and the hamburger right
  // (`justify-between`). That IS observable, and it's the property that actually
  // changes the bar's shape.
  it("centers the wordmark on Home", () => {
    renderNavbar("/");
    expect(wordmark().parentElement!.className).toContain("justify-center");
  });

  it("left-aligns the wordmark on inner pages (space-between with the hamburger)", () => {
    renderNavbar("/campus");
    const wrapper = wordmark().parentElement!;
    expect(wrapper.className).toContain("justify-between");
    expect(wrapper.className).not.toContain("justify-center");
  });

  it("uses the Jacquard display face in both states", () => {
    const { unmount } = renderNavbar("/");
    const link = screen.getByRole("link", { name: /fractal — home/i });
    expect(link.querySelector("span")!.style.fontFamily).toContain("Jacquard");
    unmount();

    renderNavbar("/campus");
    const inner = screen.getByRole("link", { name: /fractal — home/i });
    expect(inner.querySelector("span")!.style.fontFamily).toContain("Jacquard");
  });

  it("links back to /", () => {
    renderNavbar("/campus");
    const link = screen.getByRole("link", { name: /fractal — home/i });
    expect(link.getAttribute("href")).toBe("/");
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Router as WouterRouter } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// The 3D scene is WebGL — never mountable in jsdom. That is precisely why the
// skip-nav exists, so stubbing the scene does not weaken this test.
vi.mock("@/components/three/FractalCityScene", () => ({
  FractalCityScene: () => <div data-testid="fractal-city-mock" />,
}));

import { Hero } from "@/components/sections/Hero";
import { OUTER_NAV_NODES } from "@/components/three/heroNavNodes";

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-33 — the hero's keyboard skip-nav.
//
// The octahedron's nav nodes are R3F meshes driven by pointer events. Keyboard
// users have NO path to them. The `.sr-only-focusable` list in Hero.tsx is that
// path: visually hidden until something inside it takes focus, then it pops out.
//
// The Home hero also used to carry a global search combobox. That is DELETED —
// the skip-nav is now the hero's only interactive affordance, which makes it the
// single point of keyboard failure. Hence these tests.
// ═══════════════════════════════════════════════════════════════════════════

function renderHero() {
  const { hook, history } = memoryLocation({ path: "/", record: true });
  const user = userEvent.setup();
  const utils = render(
    <WouterRouter hook={hook}>
      <Hero />
    </WouterRouter>,
  );
  return { ...utils, user, history };
}

const skipNav = () =>
  screen.getByRole("navigation", { name: /hero navigation \(keyboard\)/i });

describe("Hero — keyboard skip-nav (FRAC-33)", () => {
  it("renders a labelled nav carrying the sr-only-focusable class", () => {
    renderHero();
    const nav = skipNav();
    // Removing this class makes the list permanently visible (a visual
    // regression) — or, worse, someone swaps it for `sr-only` / `hidden`, which
    // takes it out of the focus order and silently re-breaks keyboard access.
    expect(nav.className).toContain("sr-only-focusable");
  });

  it("exposes exactly the octahedron's routes, one focusable link each", () => {
    renderHero();
    const links = within(skipNav()).getAllByRole("link");

    expect(links.length).toBe(OUTER_NAV_NODES.length);

    const hrefs = links.map((a) => a.getAttribute("href"));
    const labels = links.map((a) => a.textContent);

    for (const node of OUTER_NAV_NODES) {
      expect(hrefs, `missing skip-nav route ${node.route}`).toContain(node.route);
      expect(labels, `missing skip-nav label ${node.label}`).toContain(node.label);
    }
  });

  it("points at the post-rename routes (/co-living, /library, /accelerator, Story → /)", () => {
    // Guards the rename: Visit → Co-Living, Publications → Library, and Story,
    // which folded into Home and now points at "/".
    //
    // Also guards the Education retirement: the octahedron's vertex 1 used to
    // point at /education, which now 404s. It was REPOINTED at /accelerator (not
    // dropped), so the skip-nav — the only keyboard path into the 3D nav — still
    // exposes six live destinations and never hands a keyboard user a 404.
    renderHero();
    const hrefs = within(skipNav())
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));

    expect(hrefs).toEqual(
      expect.arrayContaining(["/co-living", "/library", "/campus", "/events", "/accelerator", "/"]),
    );
    // The retired paths must not linger in the keyboard path.
    expect(hrefs).not.toContain("/visit");
    expect(hrefs).not.toContain("/publications");
    expect(hrefs).not.toContain("/story");
    expect(hrefs).not.toContain("/education");
    expect(hrefs).not.toContain("/people");
    expect(hrefs).not.toContain("/political-club");
  });

  it("navigates in-SPA on activation instead of doing a full page load", async () => {
    const { user, history } = renderHero();

    const campus = within(skipNav()).getByRole("link", { name: "Campus" });
    await user.click(campus);

    // The handler preventDefaults and calls wouter's setLocation, so the
    // memory router records the hop. A full reload would leave history empty.
    expect(history).toContain("/campus");
  });

  it("keeps every skip-nav link reachable by Tab", async () => {
    const { user } = renderHero();
    const links = within(skipNav()).getAllByRole("link");

    for (const link of links) {
      await user.tab();
      expect(document.activeElement).toBe(link);
    }
  });
});

import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { CapPage } from "@/pages/CapPage";

afterEach(cleanup);
function renderArchive() {
  const { hook } = memoryLocation({ path: "/cap", static: true });
  return render(<Router hook={hook}><CapPage /></Router>);
}

describe("Campus Accelerator historical archive", () => {
  it("identifies the inactive program and preserves its historical copy", () => {
    renderArchive();
    expect(screen.getByText("Historical archive")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Launch a walkable campus in 6 weeks" })).toBeInTheDocument();
    expect(document.querySelector(".cap-archive")?.textContent).toContain("The deadline to apply is August 15th");
    expect(document.querySelector('iframe[src*="fillout"], form, a[href*="fillout"]')).toBeNull();
    expect(screen.getAllByText(/Applications are closed; the original application/).length).toBeGreaterThan(0);
  });
  it("retains keyboard-accessible disclosures including the complete FAQ", () => {
    const { container } = renderArchive();
    const details = container.querySelectorAll("details");
    expect(details).toHaveLength(15);
    for (const item of details) {
      expect(item.querySelector(":scope > summary")?.textContent?.trim()).toBeTruthy();
      expect(item.querySelector('[style*="display:none"]')).toBeNull();
    }
    expect(container.textContent).toContain("How do I apply for financial aid?");
    expect(container.textContent).toContain("What should I name my campus?");
    expect(container.textContent).toContain("Tyler Alterman");
    expect(container.textContent).toContain("Priya Rose");
  });
  it("ships local images, safe links and unique anchor targets", () => {
    const { container } = renderArchive();
    const archive = container.querySelector(".cap-archive")!;
    const images = archive.querySelectorAll("img");
    expect(images).toHaveLength(24);
    for (const img of images) {
      expect(img.getAttribute("src")).toMatch(/^\/images\/cap\//);
      expect(existsSync(resolve("public", img.getAttribute("src")!.slice(1)))).toBe(true);
      expect(img.alt).not.toBe("image");
    }
    const ids = [...archive.querySelectorAll("[id]")].map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const link of archive.querySelectorAll("a")) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^(https?:|mailto:|#)/);
      if(href.startsWith("#")) expect(ids).toContain(href.slice(1));
    }
    expect(archive.querySelector("script,style,form,[onclick],[srcdoc]")).toBeNull();
    for(const embed of archive.querySelectorAll("iframe")) expect(embed.title).toBeTruthy();
  });
  it("keeps shared navigation without adding an archive menu destination", () => {
    renderArchive();
    expect(document.querySelector("nav")).toBeInTheDocument();
    expect(document.querySelector('nav a[href="/cap"]')).toBeNull();
    const app = readFileSync(resolve("src/App.tsx"), "utf8");
    expect(app).toContain('<Route path="/cap" component={CapPage} />');
  });
});

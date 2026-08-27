import { describe, expect, it } from "vitest";

import { HOUSES, SECTIONS } from "@/data/houses";
import {
  HERO_GOLD_ROLES,
  PALETTE_FALLBACK,
  housePalette,
} from "@/components/three/heroNavNodes";

describe("hero gold roles", () => {
  it("sources streaming highlights from the canonical Story accent", () => {
    expect(HERO_GOLD_ROLES.streamingHighlight).toBe(SECTIONS.story.accent);
    expect(HERO_GOLD_ROLES.streamingHighlight).toBe("#D4BA58");
  });

  it("sources connectors and structural fallback from the canonical People accent", () => {
    expect(HERO_GOLD_ROLES.connectorStructural).toBe(SECTIONS.people.accent);
    expect(HERO_GOLD_ROLES.connectorStructural).toBe("#C49040");
    expect(PALETTE_FALLBACK).toBe(HERO_GOLD_ROLES.connectorStructural);
  });

  it("keeps known house palette lookup behavior and uses People for unknown ids", () => {
    const campus = HOUSES.find((house) => house.id === "campus");

    expect(campus).toBeDefined();
    expect(housePalette("campus", "deep")).toBe(campus?.palette.deep);
    expect(housePalette("unknown-house")).toBe(
      HERO_GOLD_ROLES.connectorStructural,
    );
  });
});

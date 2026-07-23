import { describe, expect, it } from "vitest";
import { clientToCanvasNdc } from "@/components/three/pointerCoordinates";

describe("clientToCanvasNdc", () => {
  it("subtracts the mobile Hero canvas origin before normalizing", () => {
    const rect = { left: 0, top: 80, width: 412, height: 568 };
    const adjusted = clientToCanvasNdc(206, 493, rect);
    const oldPrefixY = -(493 / rect.height) * 2 + 1;

    expect(adjusted.x).toBeCloseTo(0);
    expect(adjusted.y).toBeCloseTo(-0.4542, 3);
    expect(oldPrefixY).toBeCloseTo(-0.7359, 3);
    expect(adjusted.y).not.toBeCloseTo(oldPrefixY, 3);
  });

  it("handles a canvas with nonzero horizontal and vertical offsets", () => {
    expect(clientToCanvasNdc(150, 175, {
      left: 50,
      top: 25,
      width: 400,
      height: 300,
    })).toEqual({ x: -0.5, y: 0 });
  });

  it("maps the canvas center to the NDC origin", () => {
    expect(clientToCanvasNdc(320, 280, {
      left: 20,
      top: 80,
      width: 600,
      height: 400,
    })).toEqual({ x: 0, y: 0 });
  });
});

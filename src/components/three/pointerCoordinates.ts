export interface CanvasClientRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Convert viewport-level client coordinates to the canvas's R3F NDC space. */
export function clientToCanvasNdc(
  clientX: number,
  clientY: number,
  rect: CanvasClientRect,
): { x: number; y: number } {
  return {
    x: ((clientX - rect.left) / rect.width) * 2 - 1,
    y: -((clientY - rect.top) / rect.height) * 2 + 1,
  };
}

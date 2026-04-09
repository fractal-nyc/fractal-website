import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ═══════════════════════════════════════════════════════════════════════════
// FRAC-124: Hero scroll passthrough — tap-vs-drag discriminator
// ═══════════════════════════════════════════════════════════════════════════
//
// These tests lock in the discriminator thresholds used on the invisible
// enlarged hit meshes inside OctahedronHero. On iOS Safari, wrapping an R3F
// mesh with `onClick` causes the canvas to auto-capture the pointer on
// pointerdown, which kills the pending `touch-action: pan-y` scroll for that
// finger. The fix replaces onClick with onPointerDown/onPointerUp and only
// fires the callback when pointerup lands near pointerdown in <350ms
// (i.e. a real tap, not a swipe that happened to start on the canvas).
//
// We import from the hero module (triggers react-three/fiber imports which
// touch three.js). Three.js runs fine in jsdom, but the Canvas wrapper does
// not — we never render a Canvas here, we only exercise the pure discriminator
// and the hook in isolation. Mocking @react-three/fiber keeps the rest of
// the module (which we don't touch) out of the way.
// ═══════════════════════════════════════════════════════════════════════════

vi.mock("@react-three/fiber", () => ({
  // Our tests never render R3F primitives, so these are minimal stubs.
  useFrame: () => {},
  useLoader: () => null,
}));

vi.mock("@react-three/drei", () => ({
  Html: () => null,
}));

import {
  isTap,
  useTapHandlers,
  TAP_MOVE_PX,
  TAP_MAX_MS,
} from "@/components/three/OctahedronHero";

// ═══════════════════════════════════════════════════════════════════════════
// Build a minimal ThreeEvent<PointerEvent>-shaped object. The hook only
// reads e.nativeEvent.clientX/Y and calls e.stopPropagation().
// ═══════════════════════════════════════════════════════════════════════════

function makePointerEvent(clientX: number, clientY: number) {
  return {
    nativeEvent: { clientX, clientY },
    stopPropagation: vi.fn(),
  };
}

// Control performance.now so timing-dependent behavior is deterministic.
let nowValue = 0;
const originalNow = performance.now;
beforeEach(() => {
  nowValue = 1000;
  performance.now = () => nowValue;
});
afterEach(() => {
  performance.now = originalNow;
});

// ═══════════════════════════════════════════════════════════════════════════
// Pure classifier
// ═══════════════════════════════════════════════════════════════════════════

describe("isTap — pure discriminator", () => {
  it("classifies a zero-movement quick press as a tap", () => {
    expect(isTap({ x: 0, y: 0, t: 0 }, 0, 0, 100)).toBe(true);
  });

  it("classifies a small jitter within thresholds as a tap", () => {
    expect(isTap({ x: 100, y: 200, t: 0 }, 102, 198, 200)).toBe(true);
  });

  it("rejects movement exactly at the threshold (strict less-than)", () => {
    // Math.hypot(TAP_MOVE_PX, 0) === TAP_MOVE_PX, must NOT be a tap.
    expect(isTap({ x: 0, y: 0, t: 0 }, TAP_MOVE_PX, 0, 100)).toBe(false);
  });

  it("rejects a vertical swipe (40px downward)", () => {
    expect(isTap({ x: 0, y: 0, t: 0 }, 0, 40, 150)).toBe(false);
  });

  it("rejects a press that lasts too long even if stationary", () => {
    expect(isTap({ x: 0, y: 0, t: 0 }, 0, 0, TAP_MAX_MS)).toBe(false);
    expect(isTap({ x: 0, y: 0, t: 0 }, 0, 0, TAP_MAX_MS + 50)).toBe(false);
  });

  it("exposes the documented thresholds", () => {
    expect(TAP_MOVE_PX).toBe(10);
    expect(TAP_MAX_MS).toBe(350);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// useTapHandlers hook — synthetic pointer gesture sequences
// ═══════════════════════════════════════════════════════════════════════════

describe("useTapHandlers — gesture sequences", () => {
  it("does NOT fire onTap for a vertical swipe: down(0,0) → up(0,40)", () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useTapHandlers(onTap));

    const down = makePointerEvent(0, 0);
    const up = makePointerEvent(0, 40);

    act(() => {
      result.current.onPointerDown(
        down as unknown as Parameters<typeof result.current.onPointerDown>[0],
      );
    });

    // Advance time a bit (still well under 350ms) — duration alone should
    // not be what filters this; it's the movement distance.
    nowValue += 150;

    act(() => {
      result.current.onPointerUp(
        up as unknown as Parameters<typeof result.current.onPointerUp>[0],
      );
    });

    expect(onTap).not.toHaveBeenCalled();
    // Critically, stopPropagation must NOT have been called on pointerdown,
    // because the hook must let native scroll start.
    expect(down.stopPropagation).not.toHaveBeenCalled();
    // And since it wasn't a tap, pointerup should not have stopped
    // propagation either.
    expect(up.stopPropagation).not.toHaveBeenCalled();
  });

  it("fires onTap for a short quick press: down(0,0) → up(2,2) in 200ms", () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useTapHandlers(onTap));

    const down = makePointerEvent(0, 0);
    const up = makePointerEvent(2, 2);

    act(() => {
      result.current.onPointerDown(
        down as unknown as Parameters<typeof result.current.onPointerDown>[0],
      );
    });

    nowValue += 200;

    act(() => {
      result.current.onPointerUp(
        up as unknown as Parameters<typeof result.current.onPointerUp>[0],
      );
    });

    expect(onTap).toHaveBeenCalledTimes(1);
    // pointerdown must never stopPropagation (scroll passthrough).
    expect(down.stopPropagation).not.toHaveBeenCalled();
    // Confirmed tap stops propagation on pointerup so sibling handlers
    // don't also react.
    expect(up.stopPropagation).toHaveBeenCalled();
  });

  it("ignores an orphan pointerup (no matching pointerdown)", () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useTapHandlers(onTap));

    const up = makePointerEvent(5, 5);

    act(() => {
      result.current.onPointerUp(
        up as unknown as Parameters<typeof result.current.onPointerUp>[0],
      );
    });

    expect(onTap).not.toHaveBeenCalled();
  });

  it("does not fire onTap for a press that exceeds the time threshold", () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useTapHandlers(onTap));

    const down = makePointerEvent(50, 50);
    const up = makePointerEvent(50, 50);

    act(() => {
      result.current.onPointerDown(
        down as unknown as Parameters<typeof result.current.onPointerDown>[0],
      );
    });

    // Hold way past the 350ms threshold.
    nowValue += 600;

    act(() => {
      result.current.onPointerUp(
        up as unknown as Parameters<typeof result.current.onPointerUp>[0],
      );
    });

    expect(onTap).not.toHaveBeenCalled();
  });

  it("resets between gestures: a failed swipe does not arm the next press", () => {
    const onTap = vi.fn();
    const { result } = renderHook(() => useTapHandlers(onTap));

    // Gesture 1: swipe (no tap)
    const down1 = makePointerEvent(0, 0);
    const up1 = makePointerEvent(0, 50);
    act(() => {
      result.current.onPointerDown(
        down1 as unknown as Parameters<typeof result.current.onPointerDown>[0],
      );
    });
    nowValue += 100;
    act(() => {
      result.current.onPointerUp(
        up1 as unknown as Parameters<typeof result.current.onPointerUp>[0],
      );
    });
    expect(onTap).not.toHaveBeenCalled();

    // Gesture 2: clean tap
    const down2 = makePointerEvent(10, 10);
    const up2 = makePointerEvent(11, 11);
    act(() => {
      result.current.onPointerDown(
        down2 as unknown as Parameters<typeof result.current.onPointerDown>[0],
      );
    });
    nowValue += 80;
    act(() => {
      result.current.onPointerUp(
        up2 as unknown as Parameters<typeof result.current.onPointerUp>[0],
      );
    });
    expect(onTap).toHaveBeenCalledTimes(1);
  });
});

import { useEffect, useRef, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * Radial "warp line" backdrop for the Accelerator hero — 250 lines streaming
 * outward from the hero's center, over a soft radial glow. Ported from the
 * accelerator site's `home-canvas.ts` (design export `setupAccelCanvas`).
 *
 * Reduced motion: when the user asks for less motion we never start the rAF
 * loop — we paint one static frame (glow + the lines at their seeded positions)
 * so the hero keeps its texture but nothing moves. The frame is repainted on
 * resize so the static art stays centered.
 *
 * The 7 warm hues below are canvas-only string colors (a `var()` can't be
 * resolved by the 2D context) and have no equivalent in `src/data/houses.ts` —
 * they are the accelerator brand's warp palette, not house colors. This is the
 * sanctioned "JS/canvas string color" exception to the no-raw-values rule.
 */
const LINE_COUNT = 250;

const COLORS: readonly [number, number, number][] = [
  [140, 25, 50],
  [180, 50, 70],
  [200, 80, 40],
  [210, 150, 50],
  [160, 60, 90],
  [190, 100, 55],
  [170, 130, 70],
];

interface WarpLine {
  angle: number;
  dist: number;
  speed: number;
  length: number;
  thickness: number;
  maxOpacity: number;
  age: number;
  life: number;
  color: readonly [number, number, number];
}

interface AccelHeroCanvasProps {
  /**
   * The hero <section> the lines radiate from. The canvas fills the whole
   * wrapper (hero + social proof), but the vanishing point sits at the hero's
   * vertical center, not the wrapper's.
   */
  heroRef: RefObject<HTMLElement | null>;
}

export function AccelHeroCanvas({ heroRef }: AccelHeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    const wrapper = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !hero || !wrapper || !ctx) return;

    let nextAngleSlot = 0;
    const createLine = (init: boolean): WarpLine => {
      const angle = init
        ? (nextAngleSlot++ / LINE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.1
        : Math.random() * Math.PI * 2;
      const life = 2 + Math.random() * 3;
      return {
        angle,
        dist: init ? Math.random() * 600 : 20 + Math.random() * 40,
        speed: 60 + Math.random() * 120,
        length: 40 + Math.random() * 120,
        thickness: 1 + Math.random() * 2.5,
        maxOpacity: 0.12 + Math.random() * 0.18,
        age: init ? Math.random() * life : 0,
        life,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    };

    const lines: WarpLine[] = Array.from({ length: LINE_COUNT }, () => createLine(true));

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(wrapper.offsetWidth * dpr));
      canvas.height = Math.max(1, Math.round(wrapper.offsetHeight * dpr));
      // setTransform (not scale) so repeated resizes don't compound the scale —
      // the original had to reset the matrix by hand.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Draws one frame. `dt === 0` paints without advancing any line. */
    const paint = (dt: number) => {
      const width = wrapper.offsetWidth;
      const height = wrapper.offsetHeight;
      const centerX = width / 2;
      const centerY = hero.offsetTop + hero.offsetHeight / 2;
      const minDim = Math.min(width, height);
      ctx.clearRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, minDim * 0.5);
      glow.addColorStop(0, "rgba(210, 150, 80, 0.1)");
      glow.addColorStop(0.3, "rgba(190, 100, 70, 0.06)");
      glow.addColorStop(0.6, "rgba(160, 60, 80, 0.03)");
      glow.addColorStop(1, "rgba(160, 60, 80, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (dt > 0) {
          line.age += dt;
          line.dist += line.speed * dt;
          if (line.age >= line.life) {
            line = lines[i] = createLine(false);
            continue;
          }
        }

        const t = line.age / line.life;
        let opacity: number;
        if (t < 0.2) opacity = line.maxOpacity * (t / 0.2);
        else if (t > 0.8) opacity = line.maxOpacity * ((1 - t) / 0.2);
        else opacity = line.maxOpacity;
        opacity *= Math.min(1, Math.max(0, (line.dist - minDim * 0.15) / (minDim * 0.3)));
        if (opacity < 0.005) continue;

        const cos = Math.cos(line.angle);
        const sin = Math.sin(line.angle);
        const x1 = centerX + cos * line.dist;
        const y1 = centerY + sin * line.dist;
        const x2 = centerX + cos * (line.dist + line.length);
        const y2 = centerY + sin * (line.dist + line.length);
        const [r, g, b] = line.color;
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${opacity})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = line.thickness;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    };

    resize();

    // Reduced motion: one static frame, no rAF loop. Still tracks resize so the
    // vanishing point stays put when the layout reflows.
    if (prefersReducedMotion) {
      paint(0);
      const onResize = () => {
        resize();
        paint(0);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    let frame = 0;
    let last = performance.now();
    const animate = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      paint(dt);
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);

    // The original leaked its resize listener (it only removed it from inside
    // the rAF callback, which stops firing once the canvas is detached). React
    // owns the teardown here: cancel the pending frame AND drop the listener.
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [prefersReducedMotion, heroRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

// Adapted from somnai-dreams/pretext-demos (justification-comparison.js) by Maxwell Ingham.
// Source: https://github.com/somnai-dreams/pretext-demos
// MIT License. Stripped of debug river coloring; production canvas painter for Fractal NYC (FRAC-158).

import type { LaidOutLine } from "./knuthPlass";

export interface PaintOptions {
  /** Canvas font shorthand, e.g. "13px 'JetBrains Mono'". */
  font: string;
  /** Vertical advance per line in CSS pixels. */
  lineHeight: number;
  /** Fill style for text. */
  color: string;
  /** Optional inset on each side; defaults to 0. */
  padding?: number;
  /** Width of " " at the target font; used for justified space distribution. */
  normalSpaceWidth: number;
}

/**
 * Sizes a canvas for crisp rendering on high-DPR displays. Sets both the
 * intrinsic pixel buffer and the CSS dimensions, then returns a 2D context
 * with the DPR transform pre-applied so all subsequent draw calls work in
 * CSS pixels.
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
): CanvasRenderingContext2D | null {
  const dpr = typeof window !== "undefined" && window.devicePixelRatio
    ? window.devicePixelRatio
    : 1;
  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/**
 * Paints a sequence of pre-laid-out lines into a 2D canvas context.
 * Distributes slack into spaces for non-final lines that have any spaces;
 * paints the final line and short lines (less than 60% of column width)
 * left-aligned without justification.
 *
 * Returns the total height consumed.
 */
export function paintLines(
  ctx: CanvasRenderingContext2D,
  lines: LaidOutLine[],
  opts: PaintOptions,
): { totalHeight: number } {
  const { font, lineHeight, color, normalSpaceWidth } = opts;
  const padding = opts.padding ?? 0;
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textBaseline = "top";

  let y = padding;
  for (const line of lines) {
    const shouldJustify =
      !line.isLast && line.lineWidth >= line.maxWidth * 0.6;

    if (!shouldJustify) {
      let x = padding;
      for (const seg of line.segments) {
        if (!seg.isSpace) {
          ctx.fillText(seg.text, x, y);
        }
        x += seg.width;
      }
      y += lineHeight;
      continue;
    }

    let wordWidth = 0;
    let spaceCount = 0;
    for (const seg of line.segments) {
      if (seg.isSpace) spaceCount++;
      else wordWidth += seg.width;
    }

    if (spaceCount <= 0) {
      let x = padding;
      for (const seg of line.segments) {
        if (!seg.isSpace) ctx.fillText(seg.text, x, y);
        x += seg.width;
      }
      y += lineHeight;
      continue;
    }

    const rawJustifiedSpace = (line.maxWidth - wordWidth) / spaceCount;
    if (rawJustifiedSpace < normalSpaceWidth * 0.2) {
      let x = padding;
      for (const seg of line.segments) {
        if (!seg.isSpace) ctx.fillText(seg.text, x, y);
        x += seg.width;
      }
      y += lineHeight;
      continue;
    }

    const justifiedSpace = Math.max(rawJustifiedSpace, normalSpaceWidth * 0.75);
    let x = padding;
    for (const seg of line.segments) {
      if (seg.isSpace) {
        x += justifiedSpace;
      } else {
        ctx.fillText(seg.text, x, y);
        x += seg.width;
      }
    }
    y += lineHeight;
  }

  return { totalHeight: y + padding };
}

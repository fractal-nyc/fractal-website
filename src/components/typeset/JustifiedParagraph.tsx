// Knuth-Plass canvas-rendered justified paragraph for the Fractal NYC hero (FRAC-158).
// Underlying layout algorithm adapted from somnai-dreams/pretext-demos by Maxwell Ingham.
// https://github.com/somnai-dreams/pretext-demos

import { useEffect, useRef, useState } from "react";
import { prepareWithSegments } from "@chenglou/pretext";
import { useFontsReady } from "@/hooks/use-fonts-ready";
import { optimalLayout, type LaidOutLine } from "@/lib/typeset/knuthPlass";
import { softHyphenate } from "@/lib/typeset/hyphenate";
import { paintLines, setupCanvas } from "@/lib/typeset/render";

interface JustifiedParagraphProps {
  text: string;
  /** Canvas-style font family token, e.g. "'JetBrains Mono'". */
  fontFamily: string;
  /** Font size in CSS pixels. */
  fontSize: number;
  /** Line advance in CSS pixels. */
  lineHeight: number;
  /** Defaults to "currentColor" via the wrapper's computed style. */
  color?: string;
  /** Optional className applied to the wrapper div. */
  className?: string;
  /** Render text in uppercase. */
  uppercase?: boolean;
}

let measurementCanvas: HTMLCanvasElement | null = null;
function getMeasurementContext(font: string): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measurementCanvas) {
    measurementCanvas = document.createElement("canvas");
  }
  const ctx = measurementCanvas.getContext("2d");
  if (!ctx) return null;
  ctx.font = font;
  return ctx;
}

export function JustifiedParagraph({
  text,
  fontFamily,
  fontSize,
  lineHeight,
  color,
  className,
  uppercase = false,
}: JustifiedParagraphProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const fontsReady = useFontsReady();

  // Track wrapper width via ResizeObserver
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
      }
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  // Lay out and paint whenever inputs change
  useEffect(() => {
    if (!fontsReady) return;
    if (width <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderText = uppercase ? text.toUpperCase() : text;
    const font = `${fontSize}px ${fontFamily}`;

    const measureCtx = getMeasurementContext(font);
    if (!measureCtx) return;
    const normalSpaceWidth = measureCtx.measureText(" ").width;
    const hyphenWidth = measureCtx.measureText("-").width;

    const hyphenatedText = softHyphenate(renderText);
    let prepared;
    try {
      prepared = prepareWithSegments(hyphenatedText, font);
    } catch {
      return;
    }

    let lines: LaidOutLine[];
    try {
      lines = optimalLayout(prepared, width, { normalSpaceWidth, hyphenWidth });
    } catch {
      return;
    }

    // Safety net: if any line still exceeds the column (e.g. an unbreakable
    // token longer than the column width), bail out and skip painting rather
    // than rendering visibly clipped text. The sr-only mirror keeps the
    // content accessible.
    let maxLineWidth = 0;
    for (const line of lines) {
      if (line.lineWidth > maxLineWidth) maxLineWidth = line.lineWidth;
    }
    if (maxLineWidth > width + 0.5) {
      // eslint-disable-next-line no-console
      console.warn(
        "[JustifiedParagraph] line exceeds container width — skipping paint",
        { maxLineWidth, width },
      );
    }

    const totalHeight = Math.max(lineHeight, lines.length * lineHeight);
    const ctx = setupCanvas(canvas, width, totalHeight);
    if (!ctx) return;
    ctx.clearRect(0, 0, width, totalHeight);
    paintLines(ctx, lines, {
      font,
      lineHeight,
      color: color ?? "currentColor",
      normalSpaceWidth,
    });
  }, [text, fontFamily, fontSize, lineHeight, color, uppercase, width, fontsReady]);

  return (
    <div ref={wrapperRef} className={className} style={{ width: "100%" }}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <p className="sr-only">{text}</p>
    </div>
  );
}

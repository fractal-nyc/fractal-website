import { useRef, useState, useEffect, useMemo } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';
import type { LayoutLine } from '@chenglou/pretext';
import { useFontsReady } from './use-fonts-ready';

export interface UsePretextResult {
  lines: LayoutLine[] | null;
  height: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  ready: boolean;
}

export function usePretext(
  text: string,
  font: string,
  lineHeight: number,
): UsePretextResult {
  const fontsReady = useFontsReady();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  // Observe container width via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Prepare text segments (expensive, memoize on text+font+fontsReady)
  const prepared = useMemo(() => {
    if (!fontsReady || !text) return null;
    try {
      return prepareWithSegments(text, font);
    } catch {
      return null;
    }
  }, [text, font, fontsReady]);

  // Layout lines (cheap, re-run on width/lineHeight change)
  const result = useMemo(() => {
    if (!prepared || width <= 0) return { lines: null, height: 0 };
    try {
      const layoutResult = layoutWithLines(prepared, width, lineHeight);
      return {
        lines: layoutResult.lines,
        height: layoutResult.height,
      };
    } catch {
      return { lines: null, height: 0 };
    }
  }, [prepared, width, lineHeight]);

  return {
    lines: result.lines,
    height: result.height,
    containerRef,
    ready: fontsReady && result.lines !== null,
  };
}

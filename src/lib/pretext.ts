import {
  prepareWithSegments,
  layoutWithLines,
  clearCache,
} from '@chenglou/pretext';
import type {
  PreparedTextWithSegments,
  LayoutLinesResult,
} from '@chenglou/pretext';

export const FONTS = {
  body: "'JetBrains Mono'",
  mono: "'JetBrains Mono'",
  serif: "'Fraunces'",
  display: "'Jacquard 24'",
} as const;

export type FontFamily = (typeof FONTS)[keyof typeof FONTS];

export const TEXT_SIZES = {
  xs: 10,
  sm: 12,
  base: 13,
  lg: 15,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  '4xl': 36,
} as const;

export function fontString(size: number, family: string): string {
  return `${size}px ${family}`;
}

export function preparePretextSegments(
  text: string,
  font: string,
): PreparedTextWithSegments {
  return prepareWithSegments(text, font);
}

export function layoutPretextLines(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number,
): LayoutLinesResult {
  return layoutWithLines(prepared, maxWidth, lineHeight);
}

export { clearCache };
export type { PreparedTextWithSegments, LayoutLinesResult };

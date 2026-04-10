// Adapted from somnai-dreams/pretext-demos (justification-comparison.js) by Maxwell Ingham.
// Source: https://github.com/somnai-dreams/pretext-demos
// MIT License. Ported to TypeScript and parameterized for Fractal NYC (FRAC-158).

import type { PreparedTextWithSegments } from "@chenglou/pretext";

export interface LineSegment {
  text: string;
  width: number;
  isSpace: boolean;
}

export interface LaidOutLine {
  segments: LineSegment[];
  lineWidth: number;
  maxWidth: number;
  isLast: boolean;
}

export interface KnuthPlassOptions {
  /** Width of one " " character at the target font, in CSS pixels. */
  normalSpaceWidth: number;
  /** Width of one "-" character at the target font, in CSS pixels. */
  hyphenWidth: number;
}

interface BreakCandidate {
  segIndex: number;
  isSoftHyphen: boolean;
}

interface LineInfo {
  wordWidth: number;
  spaceCount: number;
  endsWithHyphen: boolean;
}

const SOFT_HYPHEN = "\u00AD";

/**
 * Knuth-Plass paragraph layout. Returns one entry per line, ready to paint.
 *
 * The algorithm builds a list of break candidates (every space and every soft
 * hyphen), runs a DP recurrence to minimize total badness across all lines,
 * then backtracks to recover the chosen break sequence.
 *
 * Badness has four terms:
 *   1. (absRatio)^3 * 1000   — Knuth's classic cubed stretch/shrink ratio
 *   2. riverPenalty          — extra cost when a line's space > 1.5x normal
 *   3. tightPenalty          — extra cost when a line's space < 0.65x normal
 *   4. hyphenPenalty         — flat 50 for hyphenated breaks
 */
export function optimalLayout(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  options: KnuthPlassOptions,
): LaidOutLine[] {
  const { normalSpaceWidth, hyphenWidth } = options;
  const segs = prepared.segments;
  const widths = prepared.widths;
  const n = segs.length;
  if (n === 0) return [];

  const breakCandidates: BreakCandidate[] = [{ segIndex: 0, isSoftHyphen: false }];
  for (let i = 0; i < n; i++) {
    const text = segs[i];
    if (text === SOFT_HYPHEN) {
      if (i + 1 < n) {
        breakCandidates.push({ segIndex: i + 1, isSoftHyphen: true });
      }
    } else if (text.trim().length === 0 && i + 1 < n) {
      breakCandidates.push({ segIndex: i + 1, isSoftHyphen: false });
    }
  }
  breakCandidates.push({ segIndex: n, isSoftHyphen: false });
  const numCandidates = breakCandidates.length;

  function getLineInfo(fromIdx: number, toIdx: number): LineInfo {
    const from = breakCandidates[fromIdx].segIndex;
    const to = breakCandidates[toIdx].segIndex;
    const endsWithHyphen = breakCandidates[toIdx].isSoftHyphen;
    let wordWidth = 0;
    let spaceCount = 0;
    for (let si = from; si < to; si++) {
      const text = segs[si];
      if (text === SOFT_HYPHEN) continue;
      if (text.trim().length === 0) {
        spaceCount++;
      } else {
        wordWidth += widths[si];
      }
    }
    if (to > from && segs[to - 1].trim().length === 0) {
      spaceCount--;
    }
    if (endsWithHyphen) {
      wordWidth += hyphenWidth;
    }
    return { wordWidth, spaceCount, endsWithHyphen };
  }

  function lineBadness(info: LineInfo, isLastLine: boolean): number {
    if (isLastLine) {
      if (info.wordWidth > maxWidth) return 1e8;
      return 0;
    }
    if (info.spaceCount <= 0) {
      const slack = maxWidth - info.wordWidth;
      if (slack < 0) return 1e8;
      return slack * slack * 10;
    }
    const justifiedSpace = (maxWidth - info.wordWidth) / info.spaceCount;
    if (justifiedSpace < 0) return 1e8;
    if (justifiedSpace < normalSpaceWidth * 0.4) return 1e8;
    const ratio = (justifiedSpace - normalSpaceWidth) / normalSpaceWidth;
    const absRatio = Math.abs(ratio);
    const badness = absRatio * absRatio * absRatio * 1000;
    const riverExcess = justifiedSpace / normalSpaceWidth - 1.5;
    const riverPenalty =
      riverExcess > 0 ? 5000 + riverExcess * riverExcess * 1e4 : 0;
    const tightThreshold = normalSpaceWidth * 0.65;
    const tightPenalty =
      justifiedSpace < tightThreshold
        ? 3000 + (tightThreshold - justifiedSpace) * (tightThreshold - justifiedSpace) * 1e4
        : 0;
    const hyphenPenalty = info.endsWithHyphen ? 50 : 0;
    return badness + riverPenalty + tightPenalty + hyphenPenalty;
  }

  const dp: number[] = new Array(numCandidates).fill(Infinity);
  const prev: number[] = new Array(numCandidates).fill(-1);
  dp[0] = 0;
  for (let j = 1; j < numCandidates; j++) {
    const isLast = j === numCandidates - 1;
    for (let i = j - 1; i >= 0; i--) {
      if (dp[i] === Infinity) continue;
      const info = getLineInfo(i, j);
      const totalWidth = info.wordWidth + info.spaceCount * normalSpaceWidth;
      if (totalWidth > maxWidth * 2) break;
      const bad = lineBadness(info, isLast);
      const total = dp[i] + bad;
      if (total < dp[j]) {
        dp[j] = total;
        prev[j] = i;
      }
    }
  }

  const breakIndices: number[] = [];
  let cur = numCandidates - 1;
  while (cur > 0) {
    if (prev[cur] === -1) {
      cur--;
      continue;
    }
    breakIndices.push(cur);
    cur = prev[cur];
  }
  breakIndices.reverse();

  const lines: LaidOutLine[] = [];
  let fromCandidate = 0;
  for (let bi = 0; bi < breakIndices.length; bi++) {
    const toCandidate = breakIndices[bi];
    const from = breakCandidates[fromCandidate].segIndex;
    const to = breakCandidates[toCandidate].segIndex;
    const endsWithHyphen = breakCandidates[toCandidate].isSoftHyphen;
    const isLast = toCandidate === numCandidates - 1;
    const segments: LineSegment[] = [];
    for (let si = from; si < to; si++) {
      const text = segs[si];
      if (text === SOFT_HYPHEN) continue;
      const width = widths[si];
      const isSpace = text.trim().length === 0;
      segments.push({ text, width, isSpace });
    }
    if (endsWithHyphen) {
      segments.push({ text: "-", width: hyphenWidth, isSpace: false });
    }
    while (segments.length > 0 && segments[segments.length - 1].isSpace) {
      segments.pop();
    }
    let lw = 0;
    for (const seg of segments) lw += seg.width;
    lines.push({
      segments,
      maxWidth,
      isLast,
      lineWidth: lw,
    });
    fromCandidate = toCandidate;
  }
  return lines;
}

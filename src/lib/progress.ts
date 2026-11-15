import { rowDirection } from "./pattern";
import type { Handedness } from "./types";

/** Physical cell: row is 1-based from the bottom, col is 0-based from the left. */
export interface Position {
  row: number;
  col: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** 1-based stitch number within the row, counted in working order. */
export function stitchNumber(p: Position, cols: number, h: Handedness): number {
  return rowDirection(p.row, h) === "ltr" ? p.col + 1 : cols - p.col;
}

export function positionFromStitch(row: number, stitch: number, cols: number, h: Handedness): Position {
  const s = clamp(Math.round(stitch), 1, cols);
  return { row, col: rowDirection(row, h) === "ltr" ? s - 1 : cols - s };
}

export const START = (cols: number, h: Handedness): Position => positionFromStitch(1, 1, cols, h);

export function nextStitch(p: Position, rows: number, cols: number, h: Handedness): Position {
  const s = stitchNumber(p, cols, h);
  if (s < cols) return positionFromStitch(p.row, s + 1, cols, h);
  if (p.row < rows) return positionFromStitch(p.row + 1, 1, cols, h);
  return p;
}

export function prevStitch(p: Position, rows: number, cols: number, h: Handedness): Position {
  const s = stitchNumber(p, cols, h);
  if (s > 1) return positionFromStitch(p.row, s - 1, cols, h);
  if (p.row > 1) return positionFromStitch(p.row - 1, cols, cols, h);
  return p;
}

export function changeRow(p: Position, delta: number, rows: number, cols: number, h: Handedness): Position {
  const row = clamp(p.row + delta, 1, rows);
  return positionFromStitch(row, stitchNumber(p, cols, h), cols, h);
}

export function clampPosition(p: Position, rows: number, cols: number): Position {
  const safe = (n: number, fallback: number) => (Number.isFinite(n) ? Math.round(n) : fallback);
  return {
    row: clamp(safe(p.row, 1), 1, Math.max(1, rows)),
    col: clamp(safe(p.col, 0), 0, Math.max(0, cols - 1)),
  };
}

export function hasProgress(p: Position, cols: number, h: Handedness): boolean {
  const s = START(cols, h);
  return p.row !== s.row || p.col !== s.col;
}

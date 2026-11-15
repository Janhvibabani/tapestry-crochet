import type { Direction, Grid, Handedness } from "./types";

export interface Run {
  color: number;
  count: number;
}

export interface PatternRow {
  /** 1-based, counted from the bottom of the tapestry. */
  row: number;
  direction: Direction;
  /** Colour runs in working order. */
  runs: Run[];
}

/** Right-handers work Row 1 right→left, left-handers left→right; every row turns. */
export function rowDirection(row: number, handedness: Handedness): Direction {
  const first: Direction = handedness === "right" ? "rtl" : "ltr";
  if (row % 2 === 1) return first;
  return first === "rtl" ? "ltr" : "rtl";
}

/** Physical left→right cells of pattern row `row` (Row 1 = bottom). */
export function gridRow(grid: Grid, row: number): number[] {
  return grid[grid.length - row];
}

export function buildPattern(grid: Grid, handedness: Handedness): PatternRow[] {
  const out: PatternRow[] = [];
  for (let row = 1; row <= grid.length; row++) {
    const direction = rowDirection(row, handedness);
    const cells = gridRow(grid, row);
    const ordered = direction === "ltr" ? cells : [...cells].reverse();
    const runs: Run[] = [];
    for (const color of ordered) {
      const last = runs[runs.length - 1];
      if (last && last.color === color) last.count++;
      else runs.push({ color, count: 1 });
    }
    out.push({ row, direction, runs });
  }
  return out;
}

export function colorTotals(grid: Grid, paletteSize: number): number[] {
  const totals = new Array<number>(paletteSize).fill(0);
  for (const row of grid) for (const c of row) totals[c]++;
  return totals;
}

/** Which run a 1-based stitch number falls in, and its 1-based position within that run. */
export function runAt(runs: Run[], stitch: number): { index: number; within: number } {
  let left = stitch;
  for (let i = 0; i < runs.length; i++) {
    if (left <= runs[i].count) return { index: i, within: left };
    left -= runs[i].count;
  }
  const last = runs.length - 1;
  return { index: last, within: runs[last]?.count ?? 0 };
}

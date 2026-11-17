import { rowDirection } from "./pattern";
import type { Handedness } from "./types";

/** Biggest total grid area (in pixels) for the downloaded chart; keeps it under Safari's canvas limit. */
const MAX_GRID_PIXELS = 14_000_000;

/** Stitch size in the downloaded chart: big for small tapestries, smaller for huge ones. */
export function chartCellSize(cols: number, rows: number): number {
  const fit = Math.floor(Math.sqrt(MAX_GRID_PIXELS / (cols * rows)));
  return Math.max(4, Math.min(24, fit));
}

/** The side a row is started from (where its number goes on the chart). */
export function rowStartSide(row: number, handedness: Handedness): "left" | "right" {
  return rowDirection(row, handedness) === "rtl" ? "right" : "left";
}

export function chartFileName(cols: number, rows: number, date = new Date()): string {
  return `tiny-tapestry-${cols}x${rows}-${date.toISOString().slice(0, 10)}.png`;
}

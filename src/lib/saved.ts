import { START, clampPosition, type Position } from "./progress";
import { LIMITS, type Grid, type Handedness, type PaletteColor } from "./types";

export interface SavedProject {
  cols: number;
  colors: number;
  handedness: Handedness;
  grid: Grid | null;
  palette: PaletteColor[];
  gridCols: number;
  rows: number;
  progress: Position;
  edited: boolean;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isByte = (v: unknown) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 255;

function validPalette(v: unknown): v is PaletteColor[] {
  return (
    Array.isArray(v) &&
    v.every((p) => isObj(p) && typeof p.name === "string" && Array.isArray(p.rgb) && p.rgb.length === 3 && p.rgb.every(isByte))
  );
}

function validGrid(v: unknown, paletteSize: number): v is Grid {
  if (!Array.isArray(v) || v.length === 0 || !Array.isArray(v[0]) || v[0].length === 0) return false;
  const width = v[0].length;
  return v.every(
    (row) =>
      Array.isArray(row) &&
      row.length === width &&
      row.every((c) => Number.isInteger(c) && c >= 0 && c < paletteSize),
  );
}

function clampInt(v: unknown, lo: number, hi: number, fallback: number) {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(v))) : fallback;
}

/**
 * Check saved data from localStorage before using it. Anything broken falls
 * back to an empty project; sizes always come from the grid itself.
 */
export function sanitizeSaved(raw: unknown): SavedProject {
  const r = isObj(raw) ? raw : {};
  const handedness: Handedness = r.handedness === "left" ? "left" : "right";
  const base = {
    cols: clampInt(r.cols, LIMITS.colsMin, LIMITS.colsMax, LIMITS.colsDefault),
    colors: clampInt(r.colors, LIMITS.colorsMin, LIMITS.colorsMax, LIMITS.colorsDefault),
    handedness,
    edited: r.edited === true,
  };
  const palette = validPalette(r.palette) ? r.palette : null;
  if (!palette || !validGrid(r.grid, palette.length)) {
    return { ...base, grid: null, palette: [], gridCols: 0, rows: 0, progress: { row: 1, col: 0 } };
  }
  const grid = r.grid;
  const rows = grid.length;
  const gridCols = grid[0].length;
  const p = r.progress;
  const progress =
    isObj(p) && typeof p.row === "number" && typeof p.col === "number"
      ? clampPosition({ row: p.row, col: p.col }, rows, gridCols)
      : START(gridCols, handedness);
  return { ...base, grid, palette, gridCols, rows, progress };
}

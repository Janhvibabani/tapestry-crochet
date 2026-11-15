import type { Position } from "./progress";
import type { Grid, PaletteColor, RGB } from "./types";
import { nearestYarnName, uniqueName } from "./yarnColors";

/** Paint one physical stitch (row 1 = bottom). Returns the same grid if nothing changes. */
export function setStitch(grid: Grid, p: Position, color: number): Grid {
  const y = grid.length - p.row;
  if (y < 0 || y >= grid.length || p.col < 0 || p.col >= grid[y].length) return grid;
  if (grid[y][p.col] === color) return grid;
  return grid.map((row, i) => (i === y ? row.map((c, x) => (x === p.col ? color : c)) : row));
}

/** Remove pattern row `row` (1 = bottom). The last remaining row is never removed. */
export function deleteRow(grid: Grid, row: number): Grid {
  if (grid.length <= 1 || row < 1 || row > grid.length) return grid;
  const y = grid.length - row;
  return grid.filter((_, i) => i !== y);
}

const othersNames = (palette: PaletteColor[], except: number) => palette.filter((_, j) => j !== except).map((p) => p.name);

/** Change a colour everywhere it's used. It's named after the yarn (or the closest yarn colour). */
export function recolor(palette: PaletteColor[], i: number, rgb: RGB, yarnName?: string): PaletteColor[] {
  const name = uniqueName(yarnName ?? nearestYarnName(rgb), othersNames(palette, i));
  return palette.map((p, j) => (j === i ? { rgb, name } : p));
}

export function addColor(palette: PaletteColor[], rgb: RGB, yarnName?: string): PaletteColor[] {
  const name = uniqueName(yarnName ?? nearestYarnName(rgb), palette.map((p) => p.name));
  return [...palette, { rgb, name }];
}

const sameRgb = (a: RGB, b: RGB) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/** Index of `rgb` in the palette, adding it if it isn't there yet. */
export function ensureColor(palette: PaletteColor[], rgb: RGB, yarnName?: string): { palette: PaletteColor[]; index: number } {
  const found = palette.findIndex((p) => sameRgb(p.rgb, rgb));
  if (found >= 0) return { palette, index: found };
  const next = addColor(palette, rgb, yarnName);
  return { palette: next, index: next.length - 1 };
}

/** Index of another palette colour with exactly this shade, or -1. */
export function findOther(palette: PaletteColor[], i: number, rgb: RGB): number {
  return palette.findIndex((p, j) => j !== i && sameRgb(p.rgb, rgb));
}

/** Fill the connected (4-way) patch of same-coloured stitches around `p`. */
export function floodFill(grid: Grid, p: Position, color: number): Grid {
  const rows = grid.length;
  const y0 = rows - p.row;
  if (y0 < 0 || y0 >= rows || p.col < 0 || p.col >= grid[y0].length) return grid;
  const from = grid[y0][p.col];
  if (from === color) return grid;
  const out = grid.map((r) => r.slice());
  const stack: [number, number][] = [[p.col, y0]];
  while (stack.length) {
    const [x, y] = stack.pop()!;
    if (y < 0 || y >= rows || x < 0 || x >= out[y].length || out[y][x] !== from) continue;
    out[y][x] = color;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  return out;
}

/** A rows × cols grid where every stitch is colour 0. */
export function blankGrid(cols: number, rows: number): Grid {
  return Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
}

/** Remove colours no stitch uses, renumbering the grid. */
export function dropUnused(grid: Grid, palette: PaletteColor[]): { grid: Grid; palette: PaletteColor[] } {
  const used = new Set(grid.flat());
  if (used.size === palette.length) return { grid, palette };
  const remap = new Map<number, number>();
  const kept: PaletteColor[] = [];
  palette.forEach((p, i) => {
    if (used.has(i)) {
      remap.set(i, kept.length);
      kept.push(p);
    }
  });
  return { grid: grid.map((r) => r.map((c) => remap.get(c)!)), palette: kept };
}

/** Stitches on the straight line from `a` (exclusive) to `b` (inclusive), Bresenham-style. */
export function cellsBetween(a: Position, b: Position): Position[] {
  const out: Position[] = [];
  const dx = Math.abs(b.col - a.col);
  const dy = Math.abs(b.row - a.row);
  const sx = a.col < b.col ? 1 : -1;
  const sy = a.row < b.row ? 1 : -1;
  let err = dx - dy;
  let { col, row } = a;
  while (col !== b.col || row !== b.row) {
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      col += sx;
    }
    if (e2 < dx) {
      err += dx;
      row += sy;
    }
    out.push({ row, col });
  }
  return out;
}

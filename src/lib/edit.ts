import type { Position } from "./progress";
import { defaultColorName, type Grid, type PaletteColor, type RGB } from "./types";

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

export function recolor(palette: PaletteColor[], i: number, rgb: RGB): PaletteColor[] {
  return palette.map((p, j) => (j === i ? { ...p, rgb } : p));
}

export function addColor(palette: PaletteColor[], rgb: RGB): PaletteColor[] {
  const used = new Set(palette.map((p) => p.name));
  let n = 0;
  while (used.has(defaultColorName(n))) n++;
  return [...palette, { rgb, name: defaultColorName(n) }];
}

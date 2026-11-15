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

const isDefaultName = (name: string) => /^Colour [A-Z]$/.test(name);

/** Change a colour's shade. A yarn name is taken only if the colour still has its default name. */
export function recolor(palette: PaletteColor[], i: number, rgb: RGB, yarnName?: string): PaletteColor[] {
  return palette.map((p, j) =>
    j === i ? { rgb, name: yarnName && isDefaultName(p.name) ? yarnName : p.name } : p,
  );
}

export function addColor(palette: PaletteColor[], rgb: RGB, yarnName?: string): PaletteColor[] {
  if (yarnName) return [...palette, { rgb, name: yarnName }];
  const used = new Set(palette.map((p) => p.name));
  let n = 0;
  while (used.has(defaultColorName(n))) n++;
  return [...palette, { rgb, name: defaultColorName(n) }];
}

import type { Grid, PaletteColor } from "./types";

/** Move every stitch of colour `from` to `into`, then drop `from` from the palette. */
export function mergeColors(
  grid: Grid,
  palette: PaletteColor[],
  from: number,
  into: number,
): { grid: Grid; palette: PaletteColor[] } {
  if (from === into) return { grid, palette };
  const remap = (c: number) => {
    const target = c === from ? into : c;
    return target > from ? target - 1 : target;
  };
  return {
    grid: grid.map((row) => row.map(remap)),
    palette: palette.filter((_, i) => i !== from),
  };
}

export function renameColor(palette: PaletteColor[], i: number, name: string): PaletteColor[] {
  const trimmed = name.trim();
  if (!trimmed) return palette;
  return palette.map((p, j) => (j === i ? { ...p, name: trimmed } : p));
}

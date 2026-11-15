export type RGB = [number, number, number];
export type Handedness = "right" | "left";
export type Direction = "rtl" | "ltr";

export interface PaletteColor {
  rgb: RGB;
  name: string;
}

/** grid[y][x], y = 0 is the TOP of the image; values index into the palette. */
export type Grid = number[][];

export const LIMITS = {
  colsMin: 10,
  colsMax: 300,
  colsDefault: 40,
  colorsMin: 2,
  colorsMax: 12,
  colorsDefault: 6,
  rowsMax: 500,
} as const;

export function defaultColorName(i: number): string {
  return `Colour ${String.fromCharCode(65 + i)}`;
}

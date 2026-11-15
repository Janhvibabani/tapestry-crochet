import { describe, expect, it } from "vitest";
import { addColor, deleteRow, recolor, setStitch } from "./edit";
import type { Grid, PaletteColor } from "./types";

const grid: Grid = [
  [0, 0, 1], // row 2 (top)
  [2, 1, 1], // row 1 (bottom)
];
const palette: PaletteColor[] = [
  { rgb: [255, 0, 0], name: "Colour A" },
  { rgb: [0, 255, 0], name: "Colour C" },
];

describe("setStitch", () => {
  it("paints one physical stitch (row 1 = bottom)", () => {
    expect(setStitch(grid, { row: 1, col: 0 }, 1)).toEqual([
      [0, 0, 1],
      [1, 1, 1],
    ]);
  });
  it("returns the same grid when nothing changes", () => {
    expect(setStitch(grid, { row: 1, col: 1 }, 1)).toBe(grid);
  });
  it("ignores stitches outside the grid", () => {
    expect(setStitch(grid, { row: 5, col: 0 }, 1)).toBe(grid);
  });
});

describe("deleteRow", () => {
  it("removes a pattern row counted from the bottom", () => {
    expect(deleteRow(grid, 1)).toEqual([[0, 0, 1]]);
    expect(deleteRow(grid, 2)).toEqual([[2, 1, 1]]);
  });
  it("never deletes the last remaining row", () => {
    const one: Grid = [[0, 1]];
    expect(deleteRow(one, 1)).toBe(one);
  });
});

describe("recolor", () => {
  it("changes a colour's shade and keeps its name", () => {
    expect(recolor(palette, 1, [1, 2, 3])[1]).toEqual({ rgb: [1, 2, 3], name: "Colour C" });
  });
});

describe("addColor", () => {
  it("adds a colour with the first unused default name", () => {
    const out = addColor(palette, [9, 9, 9]);
    expect(out).toHaveLength(3);
    expect(out[2]).toEqual({ rgb: [9, 9, 9], name: "Colour B" });
  });
});

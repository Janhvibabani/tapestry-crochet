import { describe, expect, it } from "vitest";
import { mergeColors, renameColor } from "./palette";
import type { Grid, PaletteColor } from "./types";

const grid: Grid = [
  [0, 0, 1],
  [2, 1, 1],
];
const palette: PaletteColor[] = [
  { rgb: [255, 0, 0], name: "red" },
  { rgb: [0, 255, 0], name: "green" },
  { rgb: [0, 0, 255], name: "blue" },
];

describe("mergeColors", () => {
  it("reassigns stitches and removes the merged colour", () => {
    const out = mergeColors(grid, palette, 0, 2);
    expect(out.palette.map((p) => p.name)).toEqual(["green", "blue"]);
    expect(out.grid).toEqual([
      [1, 1, 0],
      [1, 0, 0],
    ]);
  });
  it("does nothing when merging a colour into itself", () => {
    const out = mergeColors(grid, palette, 1, 1);
    expect(out.grid).toBe(grid);
    expect(out.palette).toBe(palette);
  });
});

describe("renameColor", () => {
  it("trims the new name", () => {
    expect(renameColor(palette, 0, "  dusty pink ")[0].name).toBe("dusty pink");
  });
  it("keeps the old name when the new one is empty", () => {
    expect(renameColor(palette, 0, "   ")[0].name).toBe("red");
  });
});

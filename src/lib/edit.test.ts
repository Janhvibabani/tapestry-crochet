import { describe, expect, it } from "vitest";
import { addColor, blankGrid, cellsBetween, deleteRow, dropUnused, ensureColor, floodFill, recolor, setStitch } from "./edit";
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
  it("changes a colour everywhere and names it after the yarn", () => {
    expect(recolor(palette, 1, [1, 2, 3], "sage")[1]).toEqual({ rgb: [1, 2, 3], name: "sage" });
  });
  it("names a custom colour after the closest yarn", () => {
    expect(recolor(palette, 1, [250, 250, 250])[1].name).toBe("snow white");
  });
  it("keeps names unique", () => {
    const p: PaletteColor[] = [{ rgb: [255, 255, 255], name: "snow white" }, { rgb: [0, 0, 0], name: "black" }];
    expect(recolor(p, 1, [254, 254, 254])[1].name).toBe("snow white 2");
  });
});

describe("addColor", () => {
  it("adds a colour named after the closest yarn", () => {
    const out = addColor(palette, [24, 22, 24]);
    expect(out).toHaveLength(3);
    expect(out[2]).toEqual({ rgb: [24, 22, 24], name: "black" });
  });
  it("uses the yarn's name when given", () => {
    expect(addColor(palette, [9, 9, 9], "sage").at(-1)!.name).toBe("sage");
  });
});

describe("floodFill", () => {
  const g: Grid = [
    [0, 0, 1],
    [0, 1, 1],
    [2, 2, 1],
  ];
  it("fills the connected patch of the same colour (4-way)", () => {
    // row 3 = top row; (row 3, col 0) is a 0 connected to (3,1) and (2,0)
    expect(floodFill(g, { row: 3, col: 0 }, 2)).toEqual([
      [2, 2, 1],
      [2, 1, 1],
      [2, 2, 1],
    ]);
  });
  it("returns the same grid when the patch already has that colour", () => {
    expect(floodFill(g, { row: 1, col: 0 }, 2)).toBe(g);
  });
});

describe("blankGrid", () => {
  it("makes a rows × cols grid of colour 0", () => {
    expect(blankGrid(3, 2)).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });
});

describe("ensureColor", () => {
  it("reuses a colour that is already in the palette", () => {
    expect(ensureColor(palette, [0, 255, 0])).toEqual({ palette, index: 1 });
  });
  it("adds a new colour with its yarn name", () => {
    const out = ensureColor(palette, [255, 255, 255], "snow white");
    expect(out.index).toBe(2);
    expect(out.palette[2]).toEqual({ rgb: [255, 255, 255], name: "snow white" });
  });
});

describe("dropUnused", () => {
  it("removes colours no stitch uses and renumbers the grid", () => {
    const g: Grid = [[2, 2], [0, 2]];
    const p: PaletteColor[] = [
      { rgb: [1, 1, 1], name: "a" },
      { rgb: [2, 2, 2], name: "b" },
      { rgb: [3, 3, 3], name: "c" },
    ];
    const out = dropUnused(g, p);
    expect(out.palette.map((c) => c.name)).toEqual(["a", "c"]);
    expect(out.grid).toEqual([[1, 1], [0, 1]]);
  });
});

describe("cellsBetween", () => {
  it("lists every stitch on the line between two stitches, so fast strokes leave no gaps", () => {
    expect(cellsBetween({ row: 1, col: 0 }, { row: 1, col: 4 })).toEqual([
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 1, col: 3 },
      { row: 1, col: 4 },
    ]);
    expect(cellsBetween({ row: 1, col: 0 }, { row: 3, col: 2 })).toEqual([
      { row: 2, col: 1 },
      { row: 3, col: 2 },
    ]);
    expect(cellsBetween({ row: 2, col: 2 }, { row: 2, col: 2 })).toEqual([]);
  });
});

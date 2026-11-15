import { describe, expect, it } from "vitest";
import { buildPattern, colorTotals, gridRow, rowDirection } from "./pattern";
import type { Grid } from "./types";

// top row, then bottom row
const grid: Grid = [
  [0, 0, 1],
  [2, 1, 1],
];

describe("rowDirection", () => {
  it("right-handers start right to left and alternate", () => {
    expect(rowDirection(1, "right")).toBe("rtl");
    expect(rowDirection(2, "right")).toBe("ltr");
  });
  it("left-handers start left to right and alternate", () => {
    expect(rowDirection(1, "left")).toBe("ltr");
    expect(rowDirection(2, "left")).toBe("rtl");
  });
});

describe("gridRow", () => {
  it("numbers rows from the bottom", () => {
    expect(gridRow(grid, 1)).toEqual([2, 1, 1]);
    expect(gridRow(grid, 2)).toEqual([0, 0, 1]);
  });
});

describe("buildPattern", () => {
  it("lists runs in working order for right-handers", () => {
    const p = buildPattern(grid, "right");
    expect(p[0]).toEqual({ row: 1, direction: "rtl", runs: [{ color: 1, count: 2 }, { color: 2, count: 1 }] });
    expect(p[1]).toEqual({ row: 2, direction: "ltr", runs: [{ color: 0, count: 2 }, { color: 1, count: 1 }] });
  });
  it("lists runs in working order for left-handers", () => {
    expect(buildPattern(grid, "left")[0].runs).toEqual([{ color: 2, count: 1 }, { color: 1, count: 2 }]);
  });
  it("run counts sum to the row width", () => {
    for (const r of buildPattern(grid, "right")) {
      expect(r.runs.reduce((s, x) => s + x.count, 0)).toBe(3);
    }
  });
});

describe("colorTotals", () => {
  it("counts stitches per colour", () => {
    expect(colorTotals(grid, 3)).toEqual([2, 3, 1]);
  });
});

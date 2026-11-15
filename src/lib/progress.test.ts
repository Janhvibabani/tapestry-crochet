import { describe, expect, it } from "vitest";
import {
  START,
  changeRow,
  clampPosition,
  hasProgress,
  nextStitch,
  positionFromStitch,
  prevStitch,
  stitchNumber,
} from "./progress";

const rows = 3;
const cols = 5;

describe("START", () => {
  it("is the first stitch of Row 1 in working order", () => {
    expect(START(cols, "right")).toEqual({ row: 1, col: 4 });
    expect(START(cols, "left")).toEqual({ row: 1, col: 0 });
  });
});

describe("stitchNumber", () => {
  it("counts in working order", () => {
    expect(stitchNumber({ row: 1, col: 4 }, cols, "right")).toBe(1);
    expect(stitchNumber({ row: 2, col: 4 }, cols, "right")).toBe(5);
  });
  it("keeps the physical cell when handedness switches", () => {
    const p = { row: 1, col: 4 };
    expect(stitchNumber(p, cols, "right")).toBe(1);
    expect(stitchNumber(p, cols, "left")).toBe(5);
  });
});

describe("nextStitch", () => {
  it("turns onto the next row at the end of a row", () => {
    expect(nextStitch({ row: 1, col: 0 }, rows, cols, "right")).toEqual({ row: 2, col: 0 });
  });
  it("moves one stitch along the working direction", () => {
    expect(nextStitch({ row: 1, col: 4 }, rows, cols, "right")).toEqual({ row: 1, col: 3 });
  });
  it("stays put on the very last stitch", () => {
    expect(nextStitch({ row: 3, col: 0 }, rows, cols, "right")).toEqual({ row: 3, col: 0 });
  });
});

describe("prevStitch", () => {
  it("stays put at the start", () => {
    expect(prevStitch(START(cols, "right"), rows, cols, "right")).toEqual(START(cols, "right"));
  });
  it("goes back to the last stitch of the previous row", () => {
    expect(prevStitch({ row: 2, col: 0 }, rows, cols, "right")).toEqual({ row: 1, col: 0 });
  });
});

describe("positionFromStitch", () => {
  it("maps a stitch number to the physical cell", () => {
    expect(positionFromStitch(2, 1, cols, "left")).toEqual({ row: 2, col: 4 });
  });
});

describe("changeRow", () => {
  it("keeps the stitch number and clamps the row", () => {
    expect(changeRow({ row: 1, col: 3 }, 1, rows, cols, "right")).toEqual({ row: 2, col: 1 });
    expect(changeRow({ row: 3, col: 0 }, 5, rows, cols, "right")).toEqual({ row: 3, col: 0 });
  });
});

describe("clampPosition", () => {
  it("pulls stale positions back into the grid", () => {
    expect(clampPosition({ row: 99, col: -3 }, rows, cols)).toEqual({ row: 3, col: 0 });
    expect(clampPosition({ row: Number.NaN, col: 2 }, rows, cols)).toEqual({ row: 1, col: 2 });
  });
});

describe("hasProgress", () => {
  it("is false only at the start", () => {
    expect(hasProgress(START(cols, "right"), cols, "right")).toBe(false);
    expect(hasProgress({ row: 1, col: 3 }, cols, "right")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { clampZoom, scrollAfterZoom, visibleCells } from "./zoom";

describe("scrollAfterZoom", () => {
  it("keeps the stitch under your fingers in the same place on screen", () => {
    // grid starts 40px into the content; pointer is 100px from the box's left edge, box scrolled by 60
    // content x under pointer = 160 → grid x = 120px = 12 cells at 10px. At 20px that stitch is at 40 + 240 = 280.
    expect(scrollAfterZoom({ scroll: 60, point: 100, origin: 40, oldSize: 10, newSize: 20 })).toBe(180);
  });
  it("does not scroll past the start", () => {
    expect(scrollAfterZoom({ scroll: 0, point: 5, origin: 40, oldSize: 20, newSize: 10 })).toBe(0);
  });
});

describe("clampZoom", () => {
  it("keeps the stitch size between min and max", () => {
    expect(clampZoom(1, 3, 60)).toBe(3);
    expect(clampZoom(80, 3, 60)).toBe(60);
    expect(clampZoom(12.3456, 3, 60)).toBe(12.35);
  });
});

describe("visibleCells", () => {
  it("lists only the rows and columns that are on screen (with a margin of one)", () => {
    // viewport shows content x 95..195 and y 0..50 of a 100×100 grid at 10px
    expect(visibleCells({ x: 95, y: 0, w: 100, h: 50, cellSize: 10, cols: 100, rows: 100 })).toEqual({
      x0: 8,
      x1: 21,
      y0: 0,
      y1: 6,
    });
  });
  it("never goes outside the grid", () => {
    expect(visibleCells({ x: 0, y: 0, w: 5000, h: 5000, cellSize: 10, cols: 4, rows: 3 })).toEqual({ x0: 0, x1: 4, y0: 0, y1: 3 });
  });
});

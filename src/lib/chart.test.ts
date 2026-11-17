import { describe, expect, it } from "vitest";
import { chartCellSize, chartFileName, rowStartSide } from "./chart";

describe("chartCellSize", () => {
  it("draws small tapestries with big, readable stitches", () => {
    expect(chartCellSize(40, 42)).toBe(24);
  });
  it("shrinks stitches for huge tapestries so the image stays a size every browser can save", () => {
    const size = chartCellSize(300, 500);
    expect(size).toBeGreaterThanOrEqual(4);
    expect(300 * size * 500 * size).toBeLessThanOrEqual(14_000_000);
  });
});

describe("rowStartSide", () => {
  it("puts each row's number on the side where you start it", () => {
    expect(rowStartSide(1, "right")).toBe("right");
    expect(rowStartSide(2, "right")).toBe("left");
    expect(rowStartSide(1, "left")).toBe("left");
  });
});

describe("chartFileName", () => {
  it("names the file after the size and date", () => {
    expect(chartFileName(40, 42, new Date("2026-11-17T10:00:00Z"))).toBe("tiny-tapestry-40x42-2026-11-17.png");
  });
});

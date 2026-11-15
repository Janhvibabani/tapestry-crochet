import { describe, expect, it } from "vitest";
import { sanitizeSaved } from "./saved";

const good = {
  cols: 40,
  colors: 2,
  handedness: "left",
  grid: [
    [0, 1, 1],
    [1, 0, 0],
  ],
  palette: [
    { rgb: [255, 255, 255], name: "white" },
    { rgb: [0, 0, 0], name: "black" },
  ],
  gridCols: 3,
  rows: 2,
  progress: { row: 2, col: 1 },
  edited: true,
  source: "image",
};

describe("sanitizeSaved", () => {
  it("keeps a valid saved project", () => {
    expect(sanitizeSaved(good)).toEqual(good);
  });

  it("works out rows and width from the grid itself", () => {
    const out = sanitizeSaved({ ...good, rows: 120, gridCols: 99, progress: { row: 100, col: 50 } });
    expect(out.rows).toBe(2);
    expect(out.gridCols).toBe(3);
    expect(out.progress).toEqual({ row: 2, col: 2 });
  });

  it("restarts progress when it is missing or broken", () => {
    expect(sanitizeSaved({ ...good, progress: null }).progress).toEqual({ row: 1, col: 0 });
  });

  it("drops a grid that isn't rectangular or points outside the palette", () => {
    expect(sanitizeSaved({ ...good, grid: [[0, 1], [1]] }).grid).toBeNull();
    expect(sanitizeSaved({ ...good, grid: [[0, 5, 1], [1, 0, 0]] }).grid).toBeNull();
    expect(sanitizeSaved({ ...good, palette: [{ rgb: "red", name: 1 }] }).grid).toBeNull();
  });

  it("falls back to defaults for junk", () => {
    const out = sanitizeSaved("not an object");
    expect(out.grid).toBeNull();
    expect(out.palette).toEqual([]);
    expect(out.cols).toBe(40);
    expect(out.colors).toBe(6);
    expect(out.handedness).toBe("right");
  });
});

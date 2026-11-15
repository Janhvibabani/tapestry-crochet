import { describe, expect, it } from "vitest";
import { gridSize, kmeans, pixelate } from "./pixelate";
import type { RGB } from "./types";

type RGBA = [number, number, number, number];

/** Build RGBA image data from a per-pixel function. */
function image(w: number, h: number, px: (x: number, y: number) => RGBA) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      data.set(px(x, y), (y * w + x) * 4);
    }
  }
  return data;
}

describe("gridSize", () => {
  it("keeps proportions with square stitches", () => {
    expect(gridSize(400, 200, 40)).toEqual({ cols: 40, rows: 20 });
    expect(gridSize(100, 100, 40)).toEqual({ cols: 40, rows: 40 });
  });

  it("caps rows at 500", () => {
    expect(gridSize(100, 2000, 300)).toEqual({ cols: 25, rows: 500 });
  });
});

describe("kmeans", () => {
  it("is deterministic", () => {
    const pts: RGB[] = Array.from({ length: 50 }, (_, i) => [i * 5, 255 - i * 5, (i * 37) % 256]);
    expect(kmeans(pts, 4)).toEqual(kmeans(pts, 4));
  });
});

describe("pixelate", () => {
  it("gives exactly one palette colour per cell", () => {
    const data = image(40, 40, (x, y) => [x * 6, y * 6, 128, 255]);
    const { grid, palette, cols, rows } = pixelate(data, 40, 40, 20, 6);
    expect(rows).toBe(20);
    expect(cols).toBe(20);
    expect(grid).toHaveLength(20);
    expect(palette.length).toBeLessThanOrEqual(6);
    for (const row of grid) {
      expect(row).toHaveLength(20);
      for (const v of row) {
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(palette.length);
      }
    }
  });

  it("a two-colour logo whose edges don't line up with the grid gives two colours", () => {
    // pink circle on white, 317×211 so cell edges cut through the circle's outline
    const data = image(317, 211, (x, y) =>
      (x - 158) ** 2 + (y - 105) ** 2 < 80 ** 2 ? [246, 207, 216, 255] : [255, 255, 255, 255],
    );
    for (const cols of [40, 63, 150]) {
      const { palette } = pixelate(data, 317, 211, cols, 6);
      expect(palette).toHaveLength(2);
    }
  });

  it("turns a transparent picture white", () => {
    const data = image(20, 20, () => [0, 0, 0, 0]);
    const { palette } = pixelate(data, 20, 20, 10, 6);
    expect(palette.map((p) => p.rgb)).toEqual([[255, 255, 255]]);
  });

  it("drops unused palette entries", () => {
    const data = image(20, 20, (x) => (x < 10 ? [250, 200, 210, 255] : [90, 60, 40, 255]));
    const { palette } = pixelate(data, 20, 20, 10, 6);
    expect(palette).toHaveLength(2);
    expect(palette.map((p) => p.name)).toEqual(["Colour A", "Colour B"]);
  });
});

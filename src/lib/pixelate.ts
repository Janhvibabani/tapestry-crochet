import { kmeans } from "./kmeans";
import { defaultColorName, LIMITS, type Grid, type PaletteColor, type RGB } from "./types";

export { kmeans };

/** Rows follow from the picture's shape (stitches are square), capped at LIMITS.rowsMax. */
export function gridSize(imgW: number, imgH: number, cols: number): { cols: number; rows: number } {
  let rows = Math.max(1, Math.round((cols * imgH) / imgW));
  if (rows > LIMITS.rowsMax) {
    rows = LIMITS.rowsMax;
    cols = Math.max(1, Math.round((LIMITS.rowsMax * imgW) / imgH));
  }
  return { cols, rows };
}

/**
 * Box-average the RGBA image into cols × rows cells (row-major, top-left
 * first). Transparent pixels are composited onto white.
 */
export function averageCells(data: Uint8ClampedArray, imgW: number, imgH: number, cols: number, rows: number): RGB[] {
  const sums = new Float64Array(cols * rows * 4);
  const pixel = (x: number, y: number): RGB => {
    const o = (y * imgW + x) * 4;
    const a = data[o + 3] / 255;
    return [data[o] * a + 255 * (1 - a), data[o + 1] * a + 255 * (1 - a), data[o + 2] * a + 255 * (1 - a)];
  };
  for (let y = 0; y < imgH; y++) {
    const cy = Math.min(rows - 1, Math.floor(((y + 0.5) * rows) / imgH));
    for (let x = 0; x < imgW; x++) {
      const cx = Math.min(cols - 1, Math.floor(((x + 0.5) * cols) / imgW));
      const [r, g, b] = pixel(x, y);
      const s = (cy * cols + cx) * 4;
      sums[s] += r;
      sums[s + 1] += g;
      sums[s + 2] += b;
      sums[s + 3] += 1;
    }
  }
  const out: RGB[] = [];
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const s = (cy * cols + cx) * 4;
      const n = sums[s + 3];
      if (n > 0) {
        out.push([Math.round(sums[s] / n), Math.round(sums[s + 1] / n), Math.round(sums[s + 2] / n)]);
      } else {
        // Grid finer than the picture: sample the pixel under the cell centre.
        const x = Math.min(imgW - 1, Math.floor(((cx + 0.5) * imgW) / cols));
        const y = Math.min(imgH - 1, Math.floor(((cy + 0.5) * imgH) / rows));
        out.push(pixel(x, y).map(Math.round) as RGB);
      }
    }
  }
  return out;
}

/** Turn an RGBA image into a stitch grid where every cell is exactly one palette colour. */
export function pixelate(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
  cols: number,
  colors: number,
): { grid: Grid; palette: PaletteColor[]; cols: number; rows: number } {
  const size = gridSize(imgW, imgH, cols);
  const cells = averageCells(data, imgW, imgH, size.cols, size.rows);
  const { centroids, assignments } = kmeans(cells, colors);

  // Drop clusters nobody uses and reindex.
  const used = new Map<number, number>();
  for (const a of assignments) if (!used.has(a)) used.set(a, 0);
  const order = [...used.keys()].sort((a, b) => a - b);
  order.forEach((old, i) => used.set(old, i));

  const grid: Grid = [];
  for (let y = 0; y < size.rows; y++) {
    grid.push(assignments.slice(y * size.cols, (y + 1) * size.cols).map((a) => used.get(a)!));
  }
  const palette = order.map((old, i) => ({ rgb: centroids[old], name: defaultColorName(i) }));
  return { grid, palette, cols: size.cols, rows: size.rows };
}

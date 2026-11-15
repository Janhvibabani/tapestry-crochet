import { kmeans, nearest, rgbToLab } from "./kmeans";
import { LIMITS, type Grid, type PaletteColor, type RGB } from "./types";
import { nearestYarnName, uniqueName } from "./yarnColors";

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

/** Pixel at (x, y) composited onto white. */
function pixelOnWhite(data: Uint8ClampedArray, i: number): RGB {
  const a = data[i + 3] / 255;
  return [
    Math.round(data[i] * a + 255 * (1 - a)),
    Math.round(data[i + 1] * a + 255 * (1 - a)),
    Math.round(data[i + 2] * a + 255 * (1 - a)),
  ];
}

const MAX_SAMPLES = 40_000;

/** Turn an RGBA image into a stitch grid where every cell is exactly one palette colour. */
export function pixelate(
  data: Uint8ClampedArray,
  imgW: number,
  imgH: number,
  cols: number,
  colors: number,
): { grid: Grid; palette: PaletteColor[]; cols: number; rows: number } {
  const size = gridSize(imgW, imgH, cols);
  const total = imgW * imgH;

  // 1. Pick the palette from the picture's own pixels (an even sample of them).
  const step = Math.max(1, Math.floor(total / MAX_SAMPLES));
  const samples: RGB[] = [];
  for (let p = 0; p < total; p += step) samples.push(pixelOnWhite(data, p * 4));
  const { centroids } = kmeans(samples, colors);
  const labs = centroids.map(rgbToLab);

  // 2. Every pixel votes for its nearest palette colour; each cell takes the
  //    colour most of its pixels voted for. Blended edge colours never win.
  const votes = new Uint32Array(size.cols * size.rows * centroids.length);
  const cache = new Map<number, number>();
  for (let y = 0; y < imgH; y++) {
    const cy = Math.min(size.rows - 1, Math.floor(((y + 0.5) * size.rows) / imgH));
    for (let x = 0; x < imgW; x++) {
      const cx = Math.min(size.cols - 1, Math.floor(((x + 0.5) * size.cols) / imgW));
      const rgb = pixelOnWhite(data, (y * imgW + x) * 4);
      const key = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
      let c = cache.get(key);
      if (c === undefined) {
        c = nearest(labs, rgbToLab(rgb));
        cache.set(key, c);
      }
      votes[(cy * size.cols + cx) * centroids.length + c]++;
    }
  }
  const assignments: number[] = new Array(size.cols * size.rows);
  for (let cell = 0; cell < assignments.length; cell++) {
    let best = 0;
    let bestN = -1;
    for (let c = 0; c < centroids.length; c++) {
      const n = votes[cell * centroids.length + c];
      if (n > bestN) {
        bestN = n;
        best = c;
      }
    }
    if (bestN === 0) {
      // Grid finer than the picture: no pixel centre landed here, use the pixel under the cell centre.
      const cx = cell % size.cols;
      const cy = Math.floor(cell / size.cols);
      const x = Math.min(imgW - 1, Math.floor(((cx + 0.5) * imgW) / size.cols));
      const y = Math.min(imgH - 1, Math.floor(((cy + 0.5) * imgH) / size.rows));
      best = nearest(labs, rgbToLab(pixelOnWhite(data, (y * imgW + x) * 4)));
    }
    assignments[cell] = best;
  }

  // Drop clusters nobody uses and reindex.
  const used = new Map<number, number>();
  for (const a of assignments) if (!used.has(a)) used.set(a, 0);
  const order = [...used.keys()].sort((a, b) => a - b);
  order.forEach((old, i) => used.set(old, i));

  const grid: Grid = [];
  for (let y = 0; y < size.rows; y++) {
    grid.push(assignments.slice(y * size.cols, (y + 1) * size.cols).map((a) => used.get(a)!));
  }
  const names: string[] = [];
  const palette = order.map((old) => {
    const name = uniqueName(nearestYarnName(centroids[old]), names);
    names.push(name);
    return { rgb: centroids[old], name };
  });
  return { grid, palette, cols: size.cols, rows: size.rows };
}

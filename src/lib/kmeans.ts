import type { RGB } from "./types";

export type Lab = [number, number, number];

/** Small seeded PRNG so the same picture always gives the same palette. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function srgbToLinear(c: number) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function rgbToLab([r, g, b]: RGB): Lab {
  const R = srgbToLinear(r);
  const G = srgbToLinear(g);
  const B = srgbToLinear(b);
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(x);
  const fy = f(y);
  const fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function nearest(centers: Lab[], p: Lab): number {
  let best = 0;
  let bestD = Infinity;
  for (let c = 0; c < centers.length; c++) {
    const d = dist2(p, centers[c]);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

function dist2(a: Lab, b: Lab) {
  const d0 = a[0] - b[0];
  const d1 = a[1] - b[1];
  const d2 = a[2] - b[2];
  return d0 * d0 + d1 * d1 + d2 * d2;
}

/**
 * K-means in CIE Lab with k-means++ init. Works on the distinct colours
 * (weighted by how often they appear) for speed. Centroids are returned as
 * the mean RGB of their members, rounded to integers.
 */
export function kmeans(points: RGB[], k: number, seed = 42): { centroids: RGB[]; assignments: number[] } {
  if (points.length === 0) return { centroids: [], assignments: [] };

  // Distinct colours + weights.
  const keyOf = (p: RGB) => (p[0] << 16) | (p[1] << 8) | p[2];
  const index = new Map<number, number>();
  const uniq: RGB[] = [];
  const weight: number[] = [];
  const pointToUniq = points.map((p) => {
    const key = keyOf(p);
    let i = index.get(key);
    if (i === undefined) {
      i = uniq.length;
      index.set(key, i);
      uniq.push(p);
      weight.push(0);
    }
    weight[i]++;
    return i;
  });
  const labs = uniq.map(rgbToLab);
  const kk = Math.max(1, Math.min(k, uniq.length));
  const rand = mulberry32(seed);

  // k-means++ initialisation.
  const centers: Lab[] = [labs[Math.floor(rand() * labs.length)]];
  const d = labs.map((l) => dist2(l, centers[0]));
  while (centers.length < kk) {
    let total = 0;
    for (let i = 0; i < labs.length; i++) total += d[i] * weight[i];
    let pick = 0;
    if (total > 0) {
      let r = rand() * total;
      for (let i = 0; i < labs.length; i++) {
        r -= d[i] * weight[i];
        if (r <= 0) {
          pick = i;
          break;
        }
      }
    }
    const c = labs[pick];
    centers.push(c);
    for (let i = 0; i < labs.length; i++) d[i] = Math.min(d[i], dist2(labs[i], c));
  }

  // Lloyd iterations.
  const assign = new Array<number>(labs.length).fill(0);
  for (let iter = 0; iter < 20; iter++) {
    let changed = false;
    for (let i = 0; i < labs.length; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < centers.length; c++) {
        const dd = dist2(labs[i], centers[c]);
        if (dd < bestD) {
          bestD = dd;
          best = c;
        }
      }
      if (assign[i] !== best) {
        assign[i] = best;
        changed = true;
      }
    }
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < labs.length; i++) {
      const s = sums[assign[i]];
      s[0] += labs[i][0] * weight[i];
      s[1] += labs[i][1] * weight[i];
      s[2] += labs[i][2] * weight[i];
      s[3] += weight[i];
    }
    sums.forEach((s, c) => {
      if (s[3] > 0) centers[c] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]];
    });
    if (!changed && iter > 0) break;
  }

  // Centroid colours as mean RGB of members.
  const rgbSums = centers.map(() => [0, 0, 0, 0]);
  for (let i = 0; i < uniq.length; i++) {
    const s = rgbSums[assign[i]];
    s[0] += uniq[i][0] * weight[i];
    s[1] += uniq[i][1] * weight[i];
    s[2] += uniq[i][2] * weight[i];
    s[3] += weight[i];
  }
  const centroids = rgbSums.map((s) =>
    s[3] > 0 ? ([Math.round(s[0] / s[3]), Math.round(s[1] / s[3]), Math.round(s[2] / s[3])] as RGB) : ([0, 0, 0] as RGB),
  );
  return { centroids, assignments: pointToUniq.map((u) => assign[u]) };
}

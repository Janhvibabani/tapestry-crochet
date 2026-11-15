import { nearest, rgbToLab } from "./kmeans";
import type { RGB } from "./types";

export interface YarnColor {
  name: string;
  rgb: RGB;
}

/** A full yarn-shop palette, grouped light → dark within each family. */
export const YARN_COLORS: YarnColor[] = [
  // whites & neutrals
  { name: "snow white", rgb: [255, 255, 255] },
  { name: "cream", rgb: [251, 245, 233] },
  { name: "oatmeal", rgb: [232, 220, 200] },
  { name: "linen", rgb: [214, 199, 174] },
  { name: "latte", rgb: [190, 160, 128] },
  { name: "camel", rgb: [176, 132, 86] },
  { name: "cocoa", rgb: [122, 82, 58] },
  { name: "chocolate", rgb: [91, 58, 41] },
  // greys & black
  { name: "silver", rgb: [205, 205, 205] },
  { name: "dove grey", rgb: [160, 158, 160] },
  { name: "charcoal", rgb: [74, 72, 76] },
  { name: "black", rgb: [24, 22, 24] },
  // pinks & reds
  { name: "blush", rgb: [246, 207, 216] },
  { name: "baby pink", rgb: [248, 184, 200] },
  { name: "dusty pink", rgb: [214, 150, 160] },
  { name: "bubblegum", rgb: [240, 120, 170] },
  { name: "raspberry", rgb: [196, 48, 98] },
  { name: "poppy red", rgb: [214, 44, 44] },
  { name: "cherry", rgb: [150, 20, 36] },
  { name: "burgundy", rgb: [104, 24, 40] },
  // oranges & yellows
  { name: "peach", rgb: [249, 215, 192] },
  { name: "apricot", rgb: [246, 172, 120] },
  { name: "coral", rgb: [240, 120, 96] },
  { name: "pumpkin", rgb: [232, 116, 30] },
  { name: "rust", rgb: [170, 76, 36] },
  { name: "butter", rgb: [248, 237, 181] },
  { name: "lemon", rgb: [250, 226, 80] },
  { name: "sunflower", rgb: [244, 190, 30] },
  { name: "mustard", rgb: [204, 156, 32] },
  // greens
  { name: "mint", rgb: [207, 232, 220] },
  { name: "pistachio", rgb: [186, 214, 150] },
  { name: "sage", rgb: [160, 186, 150] },
  { name: "grass", rgb: [96, 170, 70] },
  { name: "olive", rgb: [122, 128, 52] },
  { name: "forest", rgb: [38, 96, 56] },
  { name: "bottle green", rgb: [20, 64, 44] },
  // blues & teals
  { name: "baby blue", rgb: [207, 226, 243] },
  { name: "sky", rgb: [140, 196, 236] },
  { name: "aqua", rgb: [100, 200, 200] },
  { name: "teal", rgb: [20, 128, 130] },
  { name: "cornflower", rgb: [100, 140, 220] },
  { name: "denim", rgb: [70, 100, 150] },
  { name: "royal blue", rgb: [30, 70, 180] },
  { name: "navy", rgb: [28, 36, 80] },
  // purples
  { name: "lilac", rgb: [227, 211, 238] },
  { name: "lavender", rgb: [190, 166, 220] },
  { name: "orchid", rgb: [180, 110, 190] },
  { name: "plum", rgb: [110, 50, 100] },
];

const YARN_LABS = YARN_COLORS.map((c) => rgbToLab(c.rgb));

/** The name of the yarn colour closest to `rgb` (perceptually, in Lab). */
export function nearestYarnName(rgb: RGB): string {
  return YARN_COLORS[nearest(YARN_LABS, rgbToLab(rgb))].name;
}

/** `name`, or `name 2`, `name 3`… if it's already taken. */
export function uniqueName(name: string, taken: string[]): string {
  const set = new Set(taken);
  if (!set.has(name)) return name;
  let n = 2;
  while (set.has(`${name} ${n}`)) n++;
  return `${name} ${n}`;
}

import type { RGB } from "./types";

export const rgbCss = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`;

export const rgbToHex = (rgb: RGB) => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

export function hexToRgb(hex: string): RGB {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

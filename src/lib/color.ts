import type { RGB } from "./types";

export const rgbCss = ([r, g, b]: RGB) => `rgb(${r} ${g} ${b})`;

export const rgbToHex = (rgb: RGB) => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

export function hexToRgb(hex: string): RGB {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** True when light text reads better than dark text on this colour. */
export function isDark([r, g, b]: RGB): boolean {
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

/** Read a typed hex code ("#E8A0B4", "e8a0b4", "#fff"). Returns null if it isn't one. */
export function parseHex(input: string): RGB | null {
  const m = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(m)) return [...m].map((c) => Number.parseInt(c + c, 16)) as RGB;
  if (/^[0-9a-f]{6}$/i.test(m)) return hexToRgb(m);
  return null;
}

import { describe, expect, it } from "vitest";
import { hexToRgb, isDark, rgbToHex } from "./color";

describe("hex colours", () => {
  it("round-trips", () => {
    expect(rgbToHex([246, 207, 216])).toBe("#f6cfd8");
    expect(hexToRgb("#f6cfd8")).toEqual([246, 207, 216]);
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
  });
});

describe("isDark", () => {
  it("tells dark yarn from light yarn for readable numbers", () => {
    expect(isDark([91, 58, 41])).toBe(true);
    expect(isDark([251, 245, 233])).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { hexToRgb, rgbToHex } from "./color";

describe("hex colours", () => {
  it("round-trips", () => {
    expect(rgbToHex([246, 207, 216])).toBe("#f6cfd8");
    expect(hexToRgb("#f6cfd8")).toEqual([246, 207, 216]);
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
  });
});

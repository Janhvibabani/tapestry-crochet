import { describe, expect, it } from "vitest";
import { hexToRgb, isDark, parseHex, rgbToHex } from "./color";

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

describe("parseHex", () => {
  it("reads 6- and 3-digit hex codes, with or without #, any case", () => {
    expect(parseHex("#E8A0B4")).toEqual([232, 160, 180]);
    expect(parseHex("e8a0b4")).toEqual([232, 160, 180]);
    expect(parseHex("  #fff ")).toEqual([255, 255, 255]);
    expect(parseHex("#0a3")).toEqual([0, 170, 51]);
  });
  it("rejects anything that isn't a hex colour", () => {
    expect(parseHex("")).toBeNull();
    expect(parseHex("#12345")).toBeNull();
    expect(parseHex("#ggg")).toBeNull();
    expect(parseHex("red")).toBeNull();
  });
});

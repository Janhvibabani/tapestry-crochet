import { describe, expect, it } from "vitest";
import { rowDim } from "./dim";

describe("rowDim", () => {
  it("in focus mode dims every row except the current one", () => {
    expect(rowDim(5, 5, true)).toBe(0);
    expect(rowDim(4, 5, true)).toBeGreaterThan(0);
    expect(rowDim(6, 5, true)).toBeGreaterThan(0);
    expect(rowDim(4, 5, true)).toBe(rowDim(6, 5, true));
  });
  it("normally only fades finished rows (below the current one)", () => {
    expect(rowDim(4, 5, false)).toBeGreaterThan(0);
    expect(rowDim(5, 5, false)).toBe(0);
    expect(rowDim(6, 5, false)).toBe(0);
  });
});

import { describe, expect, it } from "vitest";
import { YARN_COLORS } from "./yarnColors";

describe("YARN_COLORS", () => {
  it("is a full palette of distinct named colours", () => {
    expect(YARN_COLORS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(YARN_COLORS.map((c) => c.name)).size).toBe(YARN_COLORS.length);
    expect(new Set(YARN_COLORS.map((c) => c.rgb.join())).size).toBe(YARN_COLORS.length);
  });
});

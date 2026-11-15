import { describe, expect, it } from "vitest";
import { nearestYarnName, uniqueName, YARN_COLORS } from "./yarnColors";

describe("YARN_COLORS", () => {
  it("is a full palette of distinct named colours", () => {
    expect(YARN_COLORS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(YARN_COLORS.map((c) => c.name)).size).toBe(YARN_COLORS.length);
    expect(new Set(YARN_COLORS.map((c) => c.rgb.join())).size).toBe(YARN_COLORS.length);
  });
});

describe("nearestYarnName", () => {
  it("names a colour after the closest yarn", () => {
    expect(nearestYarnName([92, 59, 40])).toBe("chocolate");
    expect(nearestYarnName([250, 250, 250])).toBe("snow white");
  });
});

describe("uniqueName", () => {
  it("adds a number when the name is taken", () => {
    expect(uniqueName("cream", ["sage"])).toBe("cream");
    expect(uniqueName("cream", ["cream", "cream 2"])).toBe("cream 3");
  });
});

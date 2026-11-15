import { describe, expect, it } from "vitest";
import { defaultColorName } from "./types";

describe("defaultColorName", () => {
  it("names colours with letters", () => {
    expect(defaultColorName(0)).toBe("Colour A");
    expect(defaultColorName(11)).toBe("Colour L");
  });
});

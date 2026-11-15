import { beforeAll, describe, expect, it, vi } from "vitest";
import type { LoadedImage } from "@/lib/loadImage";

// In-memory localStorage for the persist middleware.
const mem = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
});

let useProject: typeof import("./project").useProject;
beforeAll(async () => {
  ({ useProject } = await import("./project"));
});

function twoColourImage(w: number, h: number): LoadedImage {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) data.set(x < w / 2 ? [250, 200, 210, 255] : [90, 60, 40, 255], (y * w + x) * 4);
  return { data, width: w, height: h, url: "blob:test" };
}

describe("project store", () => {
  it("builds a grid when an image is set", () => {
    const s = useProject.getState();
    s.setCols(10);
    s.setImage(twoColourImage(20, 20));
    const st = useProject.getState();
    expect(st.grid).not.toBeNull();
    expect(st.grid![0]).toHaveLength(10);
    expect(st.grid).toHaveLength(st.rows);
    expect(st.palette).toHaveLength(2);
    expect(st.progress).toEqual({ row: 1, col: 9 });
  });

  it("clamps the width to the allowed range", () => {
    useProject.getState().setCols(500);
    expect(useProject.getState().cols).toBe(150);
  });

  it("keeps progress when handedness changes", () => {
    useProject.getState().setProgress({ row: 3, col: 2 });
    useProject.getState().setHandedness("left");
    expect(useProject.getState().progress).toEqual({ row: 3, col: 2 });
  });

  it("clamps progress into the grid", () => {
    useProject.getState().setProgress({ row: 9999, col: -1 });
    const st = useProject.getState();
    expect(st.progress).toEqual({ row: st.rows, col: 0 });
  });

  it("merges colours", () => {
    useProject.getState().merge(0, 1);
    expect(useProject.getState().palette).toHaveLength(1);
  });

  it("never persists the original image", () => {
    const partial = useProject.persist.getOptions().partialize!(useProject.getState());
    expect(partial).not.toHaveProperty("image");
    expect(partial).toHaveProperty("grid");
  });
});

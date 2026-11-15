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
    useProject.getState().setCols(900);
    expect(useProject.getState().cols).toBe(300);
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

describe("loading saved data", () => {
  it("survives broken saved data and still finishes loading", async () => {
    mem.set("tapestry-project-v1", JSON.stringify({ state: { grid: [[0, 9]], progress: null }, version: 0 }));
    await useProject.persist.rehydrate();
    expect(useProject.persist.hasHydrated()).toBe(true);
    expect(useProject.getState().grid).toBeNull();
  });

  it("survives saved data that isn't JSON", async () => {
    mem.set("tapestry-project-v1", "{oops");
    await useProject.persist.rehydrate();
    expect(useProject.persist.hasHydrated()).toBe(true);
  });

  it("takes the grid size from the saved grid", async () => {
    const state = {
      grid: [[0, 0], [0, 0], [0, 0]],
      palette: [{ rgb: [1, 2, 3], name: "x" }],
      rows: 120,
      gridCols: 50,
      progress: { row: 100, col: 40 },
    };
    mem.set("tapestry-project-v1", JSON.stringify({ state, version: 0 }));
    await useProject.persist.rehydrate();
    const st = useProject.getState();
    expect([st.rows, st.gridCols]).toEqual([3, 2]);
    expect(st.progress).toEqual({ row: 3, col: 1 });
  });
});

describe("editing", () => {
  const fresh = () => {
    const s = useProject.getState();
    s.setHandedness("right");
    s.setCols(10);
    s.setColors(2);
    s.setImage(twoColourImage(20, 20));
    return useProject.getState();
  };

  it("paints stitches and can undo the whole stroke", () => {
    const before = fresh().grid!;
    const other = 1 - before[before.length - 1][0]; // the colour the stitch isn't
    useProject.getState().beginEdit();
    useProject.getState().paint({ row: 1, col: 0 }, other);
    useProject.getState().paint({ row: 1, col: 1 }, other);
    const st = useProject.getState();
    expect(st.grid![st.rows - 1].slice(0, 2)).toEqual([other, other]);
    expect(st.edited).toBe(true);
    st.undo();
    expect(useProject.getState().grid).toEqual(before);
    expect(useProject.getState().canUndo).toBe(false);
  });

  it("deletes a row and keeps your place on the same stitch", () => {
    const st = fresh();
    st.setProgress({ row: 5, col: 3 });
    useProject.getState().deleteRow(2);
    const after = useProject.getState();
    expect(after.rows).toBe(st.rows - 1);
    expect(after.grid).toHaveLength(st.rows - 1);
    expect(after.progress).toEqual({ row: 4, col: 3 });
  });

  it("recolours and adds colours", () => {
    fresh();
    useProject.getState().recolor(0, [1, 2, 3]);
    expect(useProject.getState().palette[0].rgb).toEqual([1, 2, 3]);
    useProject.getState().addColor([9, 9, 9]);
    expect(useProject.getState().palette).toHaveLength(3);
  });

  it("never saves the undo history", () => {
    fresh();
    useProject.getState().deleteRow(1);
    const partial = useProject.persist.getOptions().partialize!(useProject.getState());
    expect(partial).not.toHaveProperty("history");
    expect(partial).toHaveProperty("edited", true);
  });
});

describe("blank canvas and editor tools", () => {
  it("starts a blank white canvas of the chosen size", () => {
    useProject.getState().newBlank(30, 20);
    const st = useProject.getState();
    expect(st.source).toBe("blank");
    expect(st.image).toBeNull();
    expect([st.gridCols, st.rows]).toEqual([30, 20]);
    expect(st.palette).toEqual([{ rgb: [255, 255, 255], name: "snow white" }]);
    expect(st.grid!.flat().every((c) => c === 0)).toBe(true);
  });

  it("fills a patch with any colour, adding it to the palette", () => {
    useProject.getState().newBlank(10, 10);
    useProject.getState().beginEdit();
    const red = useProject.getState().ensureColor([214, 44, 44], "poppy red");
    useProject.getState().fill({ row: 1, col: 0 }, red);
    const st = useProject.getState();
    expect(st.palette.map((p) => p.name)).toEqual(["snow white", "poppy red"]);
    expect(st.grid!.flat().every((c) => c === red)).toBe(true);
  });

  it("drops colours nobody uses when tidying up", () => {
    useProject.getState().newBlank(10, 10);
    useProject.getState().ensureColor([20, 128, 130], "teal");
    useProject.getState().tidyPalette();
    expect(useProject.getState().palette).toHaveLength(1);
  });

  it("changing a colour to one you already have joins them", () => {
    useProject.getState().newBlank(10, 1);
    const st = useProject.getState();
    const black = st.ensureColor([24, 22, 24], "black");
    useProject.getState().paint({ row: 1, col: 0 }, black);
    useProject.getState().recolor(black, [255, 255, 255], "snow white");
    expect(useProject.getState().palette).toHaveLength(1);
    expect(useProject.getState().grid).toEqual([new Array(10).fill(0)]);
  });
});

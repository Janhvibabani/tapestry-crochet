"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { LoadedImage } from "@/lib/loadImage";
import { mergeColors, renameColor } from "@/lib/palette";
import { pixelate } from "@/lib/pixelate";
import { START, clampPosition, type Position } from "@/lib/progress";
import { LIMITS, type Grid, type Handedness, type PaletteColor } from "@/lib/types";

export interface ProjectState {
  /** In memory only — never persisted. */
  image: LoadedImage | null;
  /** Requested stitches wide (setting). */
  cols: number;
  colors: number;
  handedness: Handedness;
  grid: Grid | null;
  palette: PaletteColor[];
  /** Actual grid size (gridCols can be below `cols` for very tall pictures). */
  gridCols: number;
  rows: number;
  progress: Position;
  setImage(img: LoadedImage): void;
  setCols(n: number): void;
  setColors(n: number): void;
  setHandedness(h: Handedness): void;
  rename(i: number, name: string): void;
  merge(from: number, into: number): void;
  setProgress(p: Position): void;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));

export const useProject = create<ProjectState>()(
  persist(
    (set, get) => {
      /** Re-pixelate from the in-memory image (if any) and reset progress. */
      const regenerate = (patch: Partial<ProjectState>) => {
        const next = { ...get(), ...patch };
        if (!next.image) {
          set(patch);
          return;
        }
        const { grid, palette, cols, rows } = pixelate(
          next.image.data,
          next.image.width,
          next.image.height,
          next.cols,
          next.colors,
        );
        set({ ...patch, grid, palette, gridCols: cols, rows, progress: START(cols, next.handedness) });
      };

      return {
        image: null,
        cols: LIMITS.colsDefault,
        colors: LIMITS.colorsDefault,
        handedness: "right",
        grid: null,
        palette: [],
        gridCols: 0,
        rows: 0,
        progress: { row: 1, col: 0 },
        setImage: (image) => {
          const old = get().image;
          if (old && old.url !== image.url && old.url.startsWith("blob:")) URL.revokeObjectURL(old.url);
          regenerate({ image });
        },
        setCols: (n) => regenerate({ cols: clamp(n, LIMITS.colsMin, LIMITS.colsMax) }),
        setColors: (n) => regenerate({ colors: clamp(n, LIMITS.colorsMin, LIMITS.colorsMax) }),
        setHandedness: (handedness) => set({ handedness }),
        rename: (i, name) => set({ palette: renameColor(get().palette, i, name) }),
        merge: (from, into) => {
          const { grid, palette } = get();
          if (!grid) return;
          set(mergeColors(grid, palette, from, into));
        },
        setProgress: (p) => set({ progress: clampPosition(p, get().rows, get().gridCols) }),
      };
    },
    {
      name: "tapestry-project-v1",
      storage: createJSONStorage(() => localStorage),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partialize: ({ image, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        if (state?.grid) state.setProgress(state.progress);
      },
    },
  ),
);

/** True once saved progress has loaded from localStorage (always false on the server). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    (cb) => useProject.persist.onFinishHydration(cb),
    () => useProject.persist.hasHydrated(),
    () => false,
  );
}

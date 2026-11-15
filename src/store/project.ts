"use client";

import { create } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { LoadedImage } from "@/lib/loadImage";
import { mergeColors, renameColor } from "@/lib/palette";
import { pixelate } from "@/lib/pixelate";
import { sanitizeSaved } from "@/lib/saved";
import { START, clampPosition, type Position } from "@/lib/progress";
import { addColor, deleteRow, recolor, setStitch } from "@/lib/edit";
import { LIMITS, type Grid, type Handedness, type PaletteColor, type RGB } from "@/lib/types";

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
  /** True once the grid was changed by hand (paint, delete row, recolour…). */
  edited: boolean;
  /** Undo snapshots — in memory only. */
  history: { grid: Grid; palette: PaletteColor[] }[];
  canUndo: boolean;
  setImage(img: LoadedImage): void;
  setCols(n: number): void;
  setColors(n: number): void;
  setHandedness(h: Handedness): void;
  rename(i: number, name: string): void;
  merge(from: number, into: number): void;
  setProgress(p: Position): void;
  /** Snapshot for undo; call once at the start of a paint stroke. */
  beginEdit(): void;
  paint(p: Position, color: number): void;
  deleteRow(row: number): void;
  recolor(i: number, rgb: RGB): void;
  addColor(rgb: RGB): void;
  undo(): void;
}

type Saved = Omit<ProjectState, "image" | "history" | "canUndo">;

const HISTORY_MAX = 40;

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
        set({
          ...patch,
          grid,
          palette,
          gridCols: cols,
          rows,
          progress: START(cols, next.handedness),
          edited: false,
          history: [],
          canUndo: false,
        });
      };

      const snapshot = () => {
        const { grid, palette, history } = get();
        if (!grid) return;
        set({ history: [...history.slice(-(HISTORY_MAX - 1)), { grid, palette }], canUndo: true });
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
        edited: false,
        history: [],
        canUndo: false,
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
          if (!grid || from === into) return;
          snapshot();
          set({ ...mergeColors(grid, palette, from, into), edited: true });
        },
        setProgress: (p) => set({ progress: clampPosition(p, get().rows, get().gridCols) }),
        beginEdit: snapshot,
        paint: (p, color) => {
          const { grid } = get();
          if (!grid) return;
          const next = setStitch(grid, p, color);
          if (next !== grid) set({ grid: next, edited: true });
        },
        deleteRow: (row) => {
          const { grid, progress, gridCols } = get();
          if (!grid) return;
          const next = deleteRow(grid, row);
          if (next === grid) return;
          snapshot();
          const moved = progress.row > row ? { ...progress, row: progress.row - 1 } : progress;
          set({ grid: next, rows: next.length, edited: true, progress: clampPosition(moved, next.length, gridCols) });
        },
        recolor: (i, rgb) => {
          snapshot();
          set({ palette: recolor(get().palette, i, rgb), edited: true });
        },
        addColor: (rgb) => {
          snapshot();
          set({ palette: addColor(get().palette, rgb), edited: true });
        },
        undo: () => {
          const { history, progress } = get();
          const last = history[history.length - 1];
          if (!last) return;
          const rest = history.slice(0, -1);
          set({
            grid: last.grid,
            palette: last.palette,
            rows: last.grid.length,
            gridCols: last.grid[0].length,
            progress: clampPosition(progress, last.grid.length, last.grid[0].length),
            history: rest,
            canUndo: rest.length > 0,
          });
        },
      };
    },
    {
      name: "tapestry-project-v1",
      storage: {
        // Never throw: unreadable saved data just means "no saved project".
        getItem: (name) => {
          try {
            const raw = localStorage.getItem(name);
            const parsed: unknown = raw ? JSON.parse(raw) : null;
            return typeof parsed === "object" && parsed !== null ? (parsed as StorageValue<Saved>) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {
            // storage full or blocked: keep working in memory
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {}
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partialize: ({ image, history, canUndo, ...rest }) => rest,
      merge: (persisted, current) => ({ ...current, ...sanitizeSaved(persisted) }),
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

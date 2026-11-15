"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { isDark, rgbCss } from "@/lib/color";
import { rowDim } from "@/lib/dim";
import type { Position } from "@/lib/progress";
import type { Grid, PaletteColor } from "@/lib/types";

interface Props {
  grid: Grid;
  palette: PaletteColor[];
  cellSize: number;
  /** Pattern row (1 = bottom) to outline; rows below it are faded as done. */
  highlightRow?: number;
  /** Focus mode: dim the whole tapestry except the highlighted row. */
  focus?: boolean;
  current?: Position;
  onCellClick?(p: Position): void;
  /** Paint mode: called once when a stroke starts, then for every stitch the pointer crosses. */
  onPaintStart?(): void;
  onPaint?(p: Position): void;
  showRowNumbers?: boolean;
  /** Per-stitch numbers to print on the cells (same shape as grid); shown when cells are big enough. */
  numbers?: number[][];
  label: string;
}

const INK = "#5b3a29";

export function gutterWidth(showRowNumbers: boolean | undefined) {
  return showRowNumbers ? 34 : 0;
}

/** Canvas rendering of the stitch grid. Row numbers run up the left side, Row 1 at the bottom. */
/** Smallest cell size that can carry a readable number. */
export const MIN_NUMBERED_CELL = 14;

export function StitchGrid({ grid, palette, cellSize, highlightRow, focus = false, current, onCellClick, onPaintStart, onPaint, showRowNumbers, numbers, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const painting = useRef(false);
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const gutter = gutterWidth(showRowNumbers);
  const pad = 4;
  const width = gutter + cols * cellSize + pad * 2;
  const height = rows * cellSize + pad * 2;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const ox = gutter + pad;
    const oy = pad;
    const colours = palette.map((p) => rgbCss(p.rgb));

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        ctx.fillStyle = colours[grid[y][x]] ?? "#fff";
        ctx.fillRect(ox + x * cellSize, oy + y * cellSize, cellSize, cellSize);
      }
    }

    if (numbers && cellSize >= MIN_NUMBERED_CELL) {
      const ink = palette.map((p) => (isDark(p.rgb) ? "#fffaf0" : "#5b3a29"));
      ctx.font = `${Math.round(cellSize * 0.5)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          ctx.fillStyle = ink[grid[y][x]] ?? "#5b3a29";
          ctx.fillText(String(numbers[y][x]), ox + x * cellSize + cellSize / 2, oy + y * cellSize + cellSize / 2 + 0.5);
        }
      }
    }

    if (cellSize >= 8) {
      ctx.strokeStyle = "rgba(91,58,41,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= cols; x++) {
        ctx.moveTo(ox + x * cellSize + 0.5, oy);
        ctx.lineTo(ox + x * cellSize + 0.5, oy + rows * cellSize);
      }
      for (let y = 0; y <= rows; y++) {
        ctx.moveTo(ox, oy + y * cellSize + 0.5);
        ctx.lineTo(ox + cols * cellSize, oy + y * cellSize + 0.5);
      }
      ctx.stroke();
    }

    if (highlightRow) {
      const yTop = oy + (rows - highlightRow) * cellSize;
      for (let row = 1; row <= rows; row++) {
        const a = rowDim(row, highlightRow, focus);
        if (a === 0) continue;
        ctx.fillStyle = `rgba(251,245,233,${a})`;
        ctx.fillRect(ox, oy + (rows - row) * cellSize, cols * cellSize, cellSize);
      }
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(ox - 1, yTop - 1, cols * cellSize + 2, cellSize + 2);
    }

    if (current) {
      const cx = ox + current.col * cellSize;
      const cy = oy + (rows - current.row) * cellSize;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fffaf0";
      ctx.strokeRect(cx - 1.5, cy - 1.5, cellSize + 3, cellSize + 3);
      ctx.lineWidth = 2;
      ctx.strokeStyle = INK;
      ctx.strokeRect(cx - 3, cy - 3, cellSize + 6, cellSize + 6);
    }

    if (showRowNumbers) {
      ctx.fillStyle = "#fffaf0";
      ctx.fillRect(0, 0, gutter, height);
      const every = cellSize >= 12 ? 1 : cellSize >= 6 ? 5 : 10;
      ctx.fillStyle = INK;
      ctx.font = `${Math.min(13, Math.max(9, cellSize - 2))}px var(--font-patrick), system-ui, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let row = 1; row <= rows; row++) {
        if (row !== 1 && row % every !== 0 && row !== highlightRow) continue;
        ctx.globalAlpha = row === highlightRow ? 1 : 0.6;
        ctx.fillText(String(row), gutter - 4, oy + (rows - row) * cellSize + cellSize / 2);
      }
      ctx.globalAlpha = 1;
    }
  }, [grid, palette, cellSize, highlightRow, current, rows, cols, gutter, width, height, showRowNumbers, numbers, focus]);

  const cellAt = (e: React.PointerEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>): Position | null => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left - gutter - pad) / cellSize);
    const y = Math.floor((e.clientY - r.top - pad) / cellSize);
    if (x < 0 || x >= cols || y < 0 || y >= rows) return null;
    return { row: rows - y, col: x };
  };

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={label}
      style={{ width, height, touchAction: onPaint ? "none" : undefined }}
      className={`block max-w-none ${onPaint ? "cursor-crosshair" : onCellClick ? "cursor-pointer" : ""}`}
      onClick={(e) => {
        if (onPaint || !onCellClick) return;
        const p = cellAt(e);
        if (p) onCellClick(p);
      }}
      onPointerDown={(e) => {
        if (!onPaint) return;
        const p = cellAt(e);
        if (!p) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        painting.current = true;
        onPaintStart?.();
        onPaint(p);
      }}
      onPointerMove={(e) => {
        if (!onPaint || !painting.current) return;
        const p = cellAt(e);
        if (p) onPaint(p);
      }}
      onPointerUp={() => (painting.current = false)}
      onPointerCancel={() => (painting.current = false)}
    />
  );
}

/** Cell size that fits `cols` stitches into the element's width (and `rows` into its height, if given). */
export function useFitCellSize(ref: RefObject<HTMLElement | null>, cols: number, gutter: number, min = 3, max = 24, rows?: number) {
  const [size, setSize] = useState(10);
  useEffect(() => {
    const el = ref.current;
    if (!el || !cols) return;
    const update = () => {
      let s = Math.floor((el.clientWidth - gutter - 12) / cols);
      if (rows) s = Math.min(s, Math.floor((el.clientHeight - 12) / rows));
      setSize(Math.max(min, Math.min(max, s)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, cols, gutter, min, max, rows]);
  return size;
}

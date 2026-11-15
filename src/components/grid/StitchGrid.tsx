"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { isDark, rgbCss } from "@/lib/color";
import { rowDim } from "@/lib/dim";
import { cellsBetween } from "@/lib/edit";
import type { Position } from "@/lib/progress";
import type { Grid, PaletteColor } from "@/lib/types";
import { visibleCells } from "@/lib/zoom";

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
export const GRID_PAD = 4;

export function gutterWidth(showRowNumbers: boolean | undefined) {
  return showRowNumbers ? 34 : 0;
}

/** Smallest cell size that can carry a readable number. */
export const MIN_NUMBERED_CELL = 14;

/**
 * The stitch grid. Only the part that is on screen is drawn (onto a canvas the size of the
 * visible area), so any zoom level works for any tapestry size. Row numbers (Row 1 at the
 * bottom) stay pinned to the left edge while scrolling sideways. The parent element is the
 * scroll box.
 */
export function StitchGrid({
  grid,
  palette,
  cellSize,
  highlightRow,
  focus = false,
  current,
  onCellClick,
  onPaintStart,
  onPaint,
  showRowNumbers,
  numbers,
  label,
}: Props) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painting = useRef(false);
  const lastCell = useRef<Position | null>(null);
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const gutter = gutterWidth(showRowNumbers);
  const pad = GRID_PAD;
  const width = gutter + cols * cellSize + pad * 2;
  const height = rows * cellSize + pad * 2;

  const draw = useCallback(() => {
    const spacer = spacerRef.current;
    const canvas = canvasRef.current;
    const box = spacer?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!spacer || !canvas || !box || !ctx) return;

    // Visible part of the grid: inside the scroll box and inside the window.
    const s = spacer.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const left = Math.max(b.left + box.clientLeft, 0);
    const top = Math.max(b.top + box.clientTop, 0);
    const right = Math.min(b.left + box.clientLeft + box.clientWidth, window.innerWidth);
    const bottom = Math.min(b.top + box.clientTop + box.clientHeight, window.innerHeight);
    const vx = Math.max(0, Math.floor(left - s.left));
    const vy = Math.max(0, Math.floor(top - s.top));
    const vw = Math.min(width, Math.ceil(right - s.left)) - vx;
    const vh = Math.min(height, Math.ceil(bottom - s.top)) - vy;
    if (vw <= 0 || vh <= 0) {
      canvas.style.display = "none";
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.style.display = "block";
    canvas.style.left = `${vx}px`;
    canvas.style.top = `${vy}px`;
    canvas.style.width = `${vw}px`;
    canvas.style.height = `${vh}px`;
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    // Draw in full-grid coordinates, shifted to the visible window.
    ctx.setTransform(dpr, 0, 0, dpr, -vx * dpr, -vy * dpr);
    ctx.clearRect(vx, vy, vw, vh);

    const ox = gutter + pad;
    const oy = pad;
    const { x0, x1, y0, y1 } = visibleCells({ x: vx - ox, y: vy - oy, w: vw, h: vh, cellSize, cols, rows });
    const colours = palette.map((p) => rgbCss(p.rgb));

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        ctx.fillStyle = colours[grid[y][x]] ?? "#fff";
        ctx.fillRect(ox + x * cellSize, oy + y * cellSize, cellSize, cellSize);
      }
    }

    if (numbers && cellSize >= MIN_NUMBERED_CELL) {
      const ink = palette.map((p) => (isDark(p.rgb) ? "#fffaf0" : INK));
      ctx.font = `${Math.round(cellSize * 0.5)}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          ctx.fillStyle = ink[grid[y][x]] ?? INK;
          ctx.fillText(String(numbers[y][x]), ox + x * cellSize + cellSize / 2, oy + y * cellSize + cellSize / 2 + 0.5);
        }
      }
    }

    if (cellSize >= 8) {
      ctx.strokeStyle = "rgba(91,58,41,0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = x0; x <= x1; x++) {
        ctx.moveTo(ox + x * cellSize + 0.5, oy + y0 * cellSize);
        ctx.lineTo(ox + x * cellSize + 0.5, oy + y1 * cellSize);
      }
      for (let y = y0; y <= y1; y++) {
        ctx.moveTo(ox + x0 * cellSize, oy + y * cellSize + 0.5);
        ctx.lineTo(ox + x1 * cellSize, oy + y * cellSize + 0.5);
      }
      ctx.stroke();
    }

    if (highlightRow) {
      for (let y = y0; y < y1; y++) {
        const a = rowDim(rows - y, highlightRow, focus);
        if (a === 0) continue;
        ctx.fillStyle = `rgba(251,245,233,${a})`;
        ctx.fillRect(ox, oy + y * cellSize, cols * cellSize, cellSize);
      }
      const yTop = oy + (rows - highlightRow) * cellSize;
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
      // Pinned to the left edge of the visible area.
      ctx.fillStyle = "#fffaf0";
      ctx.fillRect(vx, vy, gutter, vh);
      const every = cellSize >= 12 ? 1 : cellSize >= 6 ? 5 : 10;
      ctx.fillStyle = INK;
      ctx.font = `${Math.min(13, Math.max(9, cellSize - 2))}px system-ui, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let y = y0; y < y1; y++) {
        const row = rows - y;
        if (row !== 1 && row % every !== 0 && row !== highlightRow) continue;
        ctx.globalAlpha = row === highlightRow ? 1 : 0.6;
        ctx.fillText(String(row), vx + gutter - 4, oy + y * cellSize + cellSize / 2);
      }
      ctx.globalAlpha = 1;
    }
  }, [grid, palette, cellSize, highlightRow, focus, current, numbers, showRowNumbers, rows, cols, gutter, pad, width, height]);

  // Redraw whenever the content changes…
  useEffect(() => {
    draw();
  }, [draw]);

  // …and whenever the visible part changes (scrolling, resizing).
  useEffect(() => {
    const box = spacerRef.current?.parentElement;
    if (!box) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    };
    box.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(box);
    return () => {
      cancelAnimationFrame(frame);
      box.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [draw]);

  const cellAt = (e: React.PointerEvent | React.MouseEvent): Position | null => {
    const spacer = spacerRef.current;
    const canvas = canvasRef.current;
    if (!spacer || !canvas) return null;
    // Taps on the pinned row numbers don't count as stitches.
    if (showRowNumbers && e.clientX - canvas.getBoundingClientRect().left < gutter) return null;
    const r = spacer.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left - gutter - pad) / cellSize);
    const y = Math.floor((e.clientY - r.top - pad) / cellSize);
    if (x < 0 || x >= cols || y < 0 || y >= rows) return null;
    return { row: rows - y, col: x };
  };

  return (
    <div ref={spacerRef} className="relative shrink-0" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        style={{ touchAction: onPaint ? "none" : undefined }}
        className={`absolute left-0 top-0 block max-w-none ${onPaint ? "cursor-crosshair" : onCellClick ? "cursor-pointer" : ""}`}
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
          lastCell.current = p;
          onPaintStart?.();
          onPaint(p);
        }}
        onPointerMove={(e) => {
          if (!onPaint || !painting.current) return;
          const p = cellAt(e);
          if (!p) return;
          // Fill in every stitch between pointer events so fast strokes leave no gaps.
          const from = lastCell.current ?? p;
          for (const c of from.row === p.row && from.col === p.col ? [] : cellsBetween(from, p)) onPaint(c);
          lastCell.current = p;
        }}
        onPointerUp={() => (painting.current = false)}
        onPointerCancel={() => (painting.current = false)}
      />
    </div>
  );
}

/** Cell size that fits `cols` stitches into the element's width (and `rows` into its height, if given). */
export function useFitCellSize(ref: RefObject<HTMLElement | null>, cols: number, gutter: number, min = 3, max = 24, rows?: number) {
  const [size, setSize] = useState(10);
  useEffect(() => {
    const el = ref.current;
    if (!el || !cols) return;
    const update = () => {
      if (!el.clientWidth) return; // hidden (e.g. a page kept in the background)
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

"use client";

import { chartCellSize, chartFileName, rowStartSide } from "./chart";
import { rgbCss, rgbToHex } from "./color";
import { colorTotals } from "./pattern";
import type { Grid, Handedness, PaletteColor } from "./types";

const INK = "#5b3a29";
const SOFT = "#8a6a58";
const PAPER = "#fffaf0";

function cssFont(variable: string, fallback: string) {
  const family = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return family ? `${family}, ${fallback}` : fallback;
}

/** Draw a printable chart: the grid with row/stitch numbers, plus a colour key. */
export function renderChart(grid: Grid, palette: PaletteColor[], handedness: Handedness): HTMLCanvasElement {
  const rows = grid.length;
  const cols = grid[0].length;
  const cell = chartCellSize(cols, rows);
  const display = cssFont("--font-cherry", "system-ui, sans-serif");
  const hand = cssFont("--font-patrick", "system-ui, sans-serif");

  const margin = 40;
  const gutter = 46; // row numbers, both sides
  const header = 92;
  const footerNums = 30; // stitch numbers under the grid
  const gridW = cols * cell;
  const gridH = rows * cell;
  const width = Math.max(gridW + gutter * 2 + margin * 2, 720);
  const contentW = width - margin * 2;
  const entryW = 250;
  const perLine = Math.max(1, Math.floor(contentW / entryW));
  const legendLines = Math.ceil(palette.length / perLine);
  const legendTop = header + gridH + footerNums + 36;
  const height = legendTop + 40 + legendLines * 34 + 50;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = INK;
  ctx.textBaseline = "alphabetic";
  ctx.font = `34px ${display}`;
  ctx.fillText("tiny tapestry", margin, 52);
  ctx.font = `19px ${hand}`;
  ctx.fillStyle = SOFT;
  const startSide = rowStartSide(1, handedness);
  ctx.fillText(
    `${cols} × ${rows} stitches · ${handedness}-handed · row 1 is the bottom and starts on the ${startSide} · each row number sits where that row starts`,
    margin,
    78,
  );

  // Grid
  const gx = Math.round((width - gridW) / 2);
  const gy = header;
  const colours = palette.map((p) => rgbCss(p.rgb));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = colours[grid[y][x]];
      ctx.fillRect(gx + x * cell, gy + y * cell, cell, cell);
    }
  }
  // Lines: every stitch faint, every 10th stronger (easy counting).
  for (let x = 0; x <= cols; x++) {
    const major = x % 10 === 0 || x === cols;
    if (cell < 8 && !major) continue;
    ctx.strokeStyle = major ? "rgba(91,58,41,0.75)" : "rgba(91,58,41,0.22)";
    ctx.lineWidth = major ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(gx + x * cell + 0.5, gy);
    ctx.lineTo(gx + x * cell + 0.5, gy + gridH);
    ctx.stroke();
  }
  for (let y = 0; y <= rows; y++) {
    const fromBottom = rows - y;
    const major = fromBottom % 10 === 0 || y === 0;
    if (cell < 8 && !major) continue;
    ctx.strokeStyle = major ? "rgba(91,58,41,0.75)" : "rgba(91,58,41,0.22)";
    ctx.lineWidth = major ? 1.5 : 1;
    ctx.beginPath();
    ctx.moveTo(gx, gy + y * cell + 0.5);
    ctx.lineTo(gx + gridW, gy + y * cell + 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(gx - 1, gy - 1, gridW + 2, gridH + 2);

  // Row numbers on the side each row starts, with the working direction.
  const every = cell >= 12 ? 1 : 5;
  ctx.font = `${Math.max(9, Math.min(14, cell - 2))}px ${hand}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  for (let row = 1; row <= rows; row++) {
    if (row !== 1 && row % every !== 0) continue;
    const yMid = gy + (rows - row) * cell + cell / 2;
    if (rowStartSide(row, handedness) === "right") {
      ctx.textAlign = "left";
      ctx.fillText(`← ${row}`, gx + gridW + 8, yMid);
    } else {
      ctx.textAlign = "right";
      ctx.fillText(`${row} →`, gx - 8, yMid);
    }
  }

  // Stitch numbers along the bottom, counted from where row 1 starts.
  const step = cell >= 14 ? 5 : 10;
  ctx.font = `13px ${hand}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = SOFT;
  for (let n = 1; n <= cols; n++) {
    if (n !== 1 && n % step !== 0) continue;
    const x = startSide === "right" ? cols - n : n - 1;
    ctx.fillText(String(n), gx + x * cell + cell / 2, gy + gridH + 8);
  }

  // Colour key
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = INK;
  ctx.font = `24px ${display}`;
  ctx.fillText("yarn colours", margin, legendTop + 20);
  const totals = colorTotals(grid, palette.length);
  palette.forEach((p, i) => {
    const lx = margin + (i % perLine) * entryW;
    const ly = legendTop + 40 + Math.floor(i / perLine) * 34;
    ctx.fillStyle = rgbCss(p.rgb);
    ctx.fillRect(lx, ly, 24, 24);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.strokeRect(lx, ly, 24, 24);
    ctx.fillStyle = INK;
    ctx.font = `18px ${hand}`;
    ctx.fillText(p.name, lx + 34, ly + 13);
    ctx.fillStyle = SOFT;
    ctx.font = `14px ${hand}`;
    ctx.fillText(`${rgbToHex(p.rgb).toUpperCase()} · ${totals[i].toLocaleString()} stitches`, lx + 34, ly + 29);
  });

  ctx.fillStyle = SOFT;
  ctx.font = `14px ${hand}`;
  ctx.fillText("made with tiny tapestry ✿ one colour per stitch", margin, height - 22);
  return canvas;
}

/** Save the chart as a PNG. */
export async function downloadChart(grid: Grid, palette: PaletteColor[], handedness: Handedness) {
  await document.fonts?.ready;
  const canvas = renderChart(grid, palette, handedness);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("could not create the image");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = chartFileName(grid[0].length, grid.length);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

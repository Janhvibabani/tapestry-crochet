"use client";

import { rgbCss } from "@/lib/color";
import { buildPattern } from "@/lib/pattern";
import type { Grid, Handedness, PaletteColor } from "@/lib/types";

export function DirectionArrow({ direction }: { direction: "ltr" | "rtl" }) {
  return (
    <span aria-label={direction === "ltr" ? "left to right" : "right to left"} className="font-display">
      {direction === "ltr" ? "→" : "←"}
    </span>
  );
}

export function RunChip({ color, count, palette, active }: { color: number; count: number; palette: PaletteColor[]; active?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-2 py-0.5 text-base ${
        active ? "border-ink bg-butter" : "border-ink/25 bg-paper"
      }`}
    >
      <span className="h-3.5 w-3.5 rounded-full border border-ink/50" style={{ background: rgbCss(palette[color].rgb) }} aria-hidden />
      <span className="tabular-nums">{count}</span>
      <span>{palette[color].name}</span>
    </span>
  );
}

export function PatternList({ grid, palette, handedness }: { grid: Grid; palette: PaletteColor[]; handedness: Handedness }) {
  const rows = buildPattern(grid, handedness);
  return (
    <ol className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
      {rows.map((r) => (
        <li key={r.row} className="flex flex-wrap items-center gap-1.5 border-b border-dashed border-ink/20 pb-2">
          <span className="mr-1 w-20 shrink-0 font-display">
            row {r.row} <DirectionArrow direction={r.direction} />
          </span>
          {r.runs.map((run, i) => (
            <RunChip key={i} color={run.color} count={run.count} palette={palette} />
          ))}
        </li>
      ))}
    </ol>
  );
}

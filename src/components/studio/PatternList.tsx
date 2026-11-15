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

export function PatternList({
  grid,
  palette,
  handedness,
  onDeleteRow,
  className = "max-h-[32rem]",
}: {
  grid: Grid;
  palette: PaletteColor[];
  handedness: Handedness;
  onDeleteRow?(row: number): void;
  className?: string;
}) {
  const rows = buildPattern(grid, handedness);
  const canDelete = onDeleteRow && rows.length > 1;
  return (
    <ol className={`space-y-2 overflow-y-auto pr-1 ${className}`}>
      {rows.map((r) => (
        <li key={r.row} className="group flex items-start gap-1.5 border-b border-dashed border-ink/20 pb-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <span className="mr-1 w-24 shrink-0 whitespace-nowrap font-display">
              row {r.row} <DirectionArrow direction={r.direction} />
            </span>
            {r.runs.map((run, i) => (
              <RunChip key={i} color={run.color} count={run.count} palette={palette} />
            ))}
          </div>
          {canDelete && (
            <button
              type="button"
              aria-label={`delete row ${r.row}`}
              title={`delete row ${r.row}`}
              onClick={() => onDeleteRow(r.row)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl text-ink-soft hover:bg-blush hover:text-ink sm:h-9 sm:w-9 sm:opacity-40 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ol>
  );
}

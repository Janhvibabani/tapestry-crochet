"use client";

import { useEffect, useRef } from "react";
import { DirectionArrow } from "@/components/studio/PatternList";
import { isDark, rgbCss } from "@/lib/color";
import { gridRow, rowDirection } from "@/lib/pattern";
import { stitchNumber, type Position } from "@/lib/progress";
import type { Grid, Handedness, PaletteColor } from "@/lib/types";

interface Props {
  grid: Grid;
  palette: PaletteColor[];
  numbers: number[][];
  progress: Position;
  handedness: Handedness;
  onPick(p: Position): void;
}

const CELL = 46;

/** One row of stitches, drawn big, in the order they sit in the tapestry. */
function Strip({
  row,
  grid,
  palette,
  numbers,
  progress,
  handedness,
  muted,
  onPick,
}: Props & { row: number; muted?: boolean }) {
  const cells = gridRow(grid, row);
  const nums = numbers[grid.length - row];
  const cols = cells.length;
  const current = !muted && progress.row === row ? stitchNumber(progress, cols, handedness) : 0;
  return (
    <ol className="flex w-max gap-1" aria-label={`row ${row}`}>
      {cells.map((c, x) => {
        const s = stitchNumber({ row, col: x }, cols, handedness);
        const isCurrent = !muted && progress.row === row && progress.col === x;
        const done = !muted && current > 0 && s < current;
        const rgb = palette[c].rgb;
        return (
          <li key={x}>
            <button
              type="button"
              data-current={isCurrent || undefined}
              onClick={() => onPick({ row, col: x })}
              aria-label={`row ${row}, stitch ${s}, ${palette[c].name}, ${nums[x]} in this colour`}
              aria-current={isCurrent ? "step" : undefined}
              className={`relative grid place-items-center rounded-md font-display text-lg ${
                isCurrent ? "z-10 scale-110 border-[3px] border-ink shadow-[0_0_0_3px_#fffaf0]" : "border-2 border-ink/25"
              } ${done ? "opacity-40" : ""}`}
              style={{
                width: CELL,
                height: muted ? CELL * 0.75 : CELL,
                background: rgbCss(rgb),
                color: isDark(rgb) ? "#fffaf0" : "#5b3a29",
              }}
            >
              {nums[x]}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Focus mode: just the row you're on (big) with the next row above it. */
export function FocusRow(props: Props) {
  const { grid, progress, handedness } = props;
  const box = useRef<HTMLDivElement>(null);
  const rows = grid.length;
  const next = progress.row < rows ? progress.row + 1 : null;

  useEffect(() => {
    const el = box.current?.querySelector<HTMLElement>("[data-current]");
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [progress]);

  return (
    <div ref={box} className="plaid paper overflow-x-auto px-3 py-4">
      <div className="w-max space-y-2">
        {next && (
          <div className="opacity-60">
            <p className="sticky left-0 mb-1 w-max text-base">
              next: row {next} <DirectionArrow direction={rowDirection(next, handedness)} />
            </p>
            <Strip {...props} row={next} muted />
          </div>
        )}
        <div>
          <p className="sticky left-0 mb-1 w-max font-display text-lg">
            now: row {progress.row} <DirectionArrow direction={rowDirection(progress.row, handedness)} />
          </p>
          <Strip {...props} row={progress.row} />
        </div>
      </div>
    </div>
  );
}

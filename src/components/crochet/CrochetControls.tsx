"use client";

import { Button } from "@/components/ui/Button";
import { changeRow, nextStitch, positionFromStitch, prevStitch, stitchNumber } from "@/lib/progress";
import { useProject } from "@/store/project";

export function CrochetControls() {
  const { progress, rows, gridCols: cols, handedness, setProgress } = useProject();
  const stitch = stitchNumber(progress, cols, handedness);
  const atStart = progress.row === 1 && stitch === 1;
  const atEnd = progress.row === rows && stitch === cols;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_1.6fr] gap-2">
        <Button tone="paper" disabled={atStart} onClick={() => setProgress(prevStitch(progress, rows, cols, handedness))}>
          back a stitch
        </Button>
        <Button tone="blush" disabled={atEnd} onClick={() => setProgress(nextStitch(progress, rows, cols, handedness))}>
          next stitch
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button tone="paper" size="sm" disabled={progress.row <= 1} onClick={() => setProgress(changeRow(progress, -1, rows, cols, handedness))}>
          ↓ row below
        </Button>
        <Button tone="mint" size="sm" disabled={progress.row >= rows} onClick={() => setProgress(changeRow(progress, 1, rows, cols, handedness))}>
          ↑ next row
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base">
        <label className="flex items-center gap-2">
          row
          <input
            key={`r${progress.row}`}
            type="number"
            inputMode="numeric"
            min={1}
            max={rows}
            defaultValue={progress.row}
            onBlur={(e) => {
              const v = Number(e.target.value);
              if (v >= 1) setProgress(changeRow(progress, Math.min(rows, Math.round(v)) - progress.row, rows, cols, handedness));
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="paper w-20 bg-paper px-2 py-1 text-right"
          />
        </label>
        <label className="flex items-center gap-2">
          stitch
          <input
            key={`s${progress.row}-${stitch}`}
            type="number"
            inputMode="numeric"
            min={1}
            max={cols}
            defaultValue={stitch}
            onBlur={(e) => {
              const v = Number(e.target.value);
              if (v >= 1) setProgress(positionFromStitch(progress.row, v, cols, handedness));
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="paper w-20 bg-paper px-2 py-1 text-right"
          />
        </label>
      </div>
    </div>
  );
}

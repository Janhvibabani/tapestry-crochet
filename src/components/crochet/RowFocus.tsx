import { DirectionArrow, RunChip } from "@/components/studio/PatternList";
import { runAt, type PatternRow } from "@/lib/pattern";
import type { PaletteColor } from "@/lib/types";

interface Props {
  row: PatternRow;
  stitch: number;
  rows: number;
  cols: number;
  palette: PaletteColor[];
}

export function RowFocus({ row, stitch, rows, cols, palette }: Props) {
  const { index, within } = runAt(row.runs, stitch);
  const run = row.runs[index];
  return (
    <div aria-live="polite">
      <p className="flex flex-wrap items-baseline gap-x-3 font-display text-2xl lg:text-3xl">
        <span>
          row {row.row} <DirectionArrow direction={row.direction} />
        </span>
        <span className="text-lg text-ink-soft">of {rows}</span>
      </p>
      <p className="mt-1 text-lg">
        stitch <strong className="font-display">{stitch}</strong> of {cols}, working {row.direction === "ltr" ? "left to right" : "right to left"}
      </p>
      <p className="paper mt-2 flex flex-wrap items-center gap-2 bg-butter px-3 py-1.5 lg:mt-3 lg:py-2">
        <span>you&apos;re in</span>
        <RunChip color={run.color} count={run.count} palette={palette} active />
        <span>
          stitch {within} of {run.count}
        </span>
      </p>
      <ol aria-label={`all runs in row ${row.row}`} className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:flex-wrap">
        {row.runs.map((r, i) => (
          <li key={i} className={`shrink-0 ${i < index ? "opacity-45" : ""}`}>
            <RunChip color={r.color} count={r.count} palette={palette} active={i === index} />
          </li>
        ))}
      </ol>
    </div>
  );
}

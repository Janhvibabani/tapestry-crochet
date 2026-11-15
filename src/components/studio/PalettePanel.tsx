"use client";

import { rgbCss } from "@/lib/color";
import { colorTotals } from "@/lib/pattern";
import { useProject } from "@/store/project";
import { PaperCard } from "@/components/ui/PaperCard";

export function PalettePanel() {
  const { grid, palette, rename, merge } = useProject();
  if (!grid) return null;
  const totals = colorTotals(grid, palette.length);

  return (
    <PaperCard tone="paper" tilt={1} tape="mint" className="px-5 pb-5 pt-8">
      <h2 className="font-display text-2xl">yarn colours</h2>
      <p className="text-base text-ink-soft">Name them after your yarn. Merge two that look alike.</p>
      <ul className="mt-3 space-y-3">
        {palette.map((p, i) => (
          <li key={`${i}-${p.rgb.join()}`} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="paper h-9 w-9 shrink-0" style={{ background: rgbCss(p.rgb) }} aria-hidden />
            <input
              defaultValue={p.name}
              key={p.name}
              aria-label={`name for ${p.name}`}
              onBlur={(e) => rename(i, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className="min-w-0 flex-1 rounded-md border-b-2 border-dashed border-ink/30 bg-transparent px-1 py-0.5 hover:border-ink/60"
            />
            <span className="w-24 text-right tabular-nums text-ink-soft">{totals[i].toLocaleString()} sts</span>
            {palette.length > 1 && (
              <select
                aria-label={`merge ${p.name} into another colour`}
                value=""
                onChange={(e) => e.target.value !== "" && merge(i, Number(e.target.value))}
                className="paper w-full bg-paper px-2 py-1 text-base sm:ml-12 sm:w-auto"
              >
                <option value="">merge into…</option>
                {palette.map((q, j) => (j === i ? null : <option key={j} value={j}>{q.name}</option>))}
              </select>
            )}
          </li>
        ))}
      </ul>
    </PaperCard>
  );
}

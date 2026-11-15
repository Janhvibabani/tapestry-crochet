"use client";

import { ColorPicker } from "@/components/ui/ColorPicker";
import { PaperCard } from "@/components/ui/PaperCard";
import { rgbCss } from "@/lib/color";
import { colorTotals } from "@/lib/pattern";
import { useProject } from "@/store/project";

const MAX_PALETTE = 20;

export function PalettePanel() {
  const { grid, palette, rename, merge, recolor, addColor } = useProject();
  if (!grid) return null;
  const totals = colorTotals(grid, palette.length);

  return (
    <PaperCard tone="paper" tilt={1} tape="mint" className="px-5 pb-5 pt-8">
      <h2 className="font-display text-2xl">yarn colours</h2>
      <p className="text-base text-ink-soft">Tap a swatch to change its shade. Rename colours after your yarn.</p>
      <ul className="mt-3 space-y-3">
        {palette.map((p, i) => (
          <li key={`${i}-${p.name}`} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <ColorPicker value={p.rgb} label={`change the shade of ${p.name}`} onPick={(rgb) => recolor(i, rgb)} className="shrink-0">
              <span className="paper block h-11 w-11" style={{ background: rgbCss(p.rgb) }} />
            </ColorPicker>
            <input
              defaultValue={p.name}
              aria-label={`name for ${p.name}`}
              onBlur={(e) => {
                if (!e.target.value.trim()) e.target.value = p.name;
                rename(i, e.target.value);
              }}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              className="min-h-11 min-w-0 flex-1 rounded-md border-b-2 border-dashed border-ink/30 bg-transparent px-1 hover:border-ink/60"
            />
            <span className="text-right tabular-nums text-ink-soft">{totals[i].toLocaleString()} sts</span>
            {palette.length > 1 && (
              <select
                aria-label={`replace ${p.name} with another colour`}
                value=""
                onChange={(e) => e.target.value !== "" && merge(i, Number(e.target.value))}
                className="paper min-h-11 w-full bg-paper px-2 text-base sm:ml-14"
              >
                <option value="">replace with…</option>
                {palette.map((q, j) => (j === i ? null : <option key={j} value={j}>{q.name}</option>))}
              </select>
            )}
          </li>
        ))}
      </ul>
      {palette.length < MAX_PALETTE && (
        <ColorPicker value={[255, 255, 255]} label="add a colour" onPick={addColor} className="mt-4 inline-flex">
          <span className="paper inline-flex min-h-11 items-center gap-2 bg-butter px-4 text-lg">+ add a colour</span>
        </ColorPicker>
      )}
    </PaperCard>
  );
}

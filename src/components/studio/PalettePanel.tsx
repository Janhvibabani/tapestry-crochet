"use client";

import { useState } from "react";
import { ColorPaletteDialog } from "@/components/ui/ColorPaletteDialog";
import { PaperCard } from "@/components/ui/PaperCard";
import { rgbCss } from "@/lib/color";
import { colorTotals } from "@/lib/pattern";
import { useProject } from "@/store/project";

const MAX_PALETTE = 20;

/** Which colour the palette dialog is changing: an index, "new", or closed. */
type Target = number | "new" | null;

export function PalettePanel() {
  const { grid, palette, rename, merge, recolor, addColor } = useProject();
  const [target, setTarget] = useState<Target>(null);
  if (!grid) return null;
  const totals = colorTotals(grid, palette.length);
  const editing = typeof target === "number" ? palette[target] : undefined;

  return (
    <PaperCard tone="paper" tilt={1} tape="mint" className="px-5 pb-5 pt-8">
      <h2 className="font-display text-2xl">yarn colours</h2>
      <p className="text-base text-ink-soft">Tap a colour to swap it for any yarn colour. Rename colours after your yarn.</p>
      <ul className="mt-3 space-y-3">
        {palette.map((p, i) => (
          <li key={`${i}-${p.name}`} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTarget(i)}
              aria-label={`change ${p.name} to another colour`}
              className="paper h-11 w-11 shrink-0"
              style={{ background: rgbCss(p.rgb) }}
            />
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
            <span className="shrink-0 text-right tabular-nums text-ink-soft">{totals[i].toLocaleString()} sts</span>
          </li>
        ))}
      </ul>
      {palette.length < MAX_PALETTE && (
        <button
          type="button"
          onClick={() => setTarget("new")}
          className="paper mt-4 inline-flex min-h-11 items-center gap-2 bg-butter px-4 text-lg"
        >
          + add a colour
        </button>
      )}

      {target !== null && (
        <ColorPaletteDialog
          title={editing ? `change ${editing.name} to…` : "add a colour"}
          current={editing?.rgb}
          onClose={() => setTarget(null)}
          onPick={(rgb, name) => {
            if (typeof target === "number") recolor(target, rgb, name);
            else addColor(rgb, name);
            setTarget(null);
          }}
          own={
            typeof target === "number"
              ? {
                  palette,
                  exclude: target,
                  onPick: (into) => {
                    merge(target, into);
                    setTarget(null);
                  },
                }
              : undefined
          }
        />
      )}
    </PaperCard>
  );
}

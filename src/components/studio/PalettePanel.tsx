"use client";

import { useState } from "react";
import { ColorPaletteDialog } from "@/components/ui/ColorPaletteDialog";
import { PaperCard } from "@/components/ui/PaperCard";
import { rgbCss } from "@/lib/color";
import { colorTotals } from "@/lib/pattern";
import { useProject } from "@/store/project";

export function PalettePanel() {
  const { grid, palette, recolor } = useProject();
  const [target, setTarget] = useState<number | null>(null);
  if (!grid) return null;
  const totals = colorTotals(grid, palette.length);
  const editing = target !== null ? palette[target] : undefined;

  return (
    <PaperCard tone="paper" tilt={1} tape="mint" className="px-5 pb-5 pt-8">
      <h2 className="font-display text-2xl">yarn colours</h2>
      <p className="text-base text-ink-soft">Tap a colour to swap it for another one everywhere in your tapestry.</p>
      <ul className="mt-3 space-y-2">
        {palette.map((p, i) => (
          <li key={`${i}-${p.name}`}>
            <button
              type="button"
              onClick={() => setTarget(i)}
              aria-label={`replace ${p.name} everywhere with another colour`}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-1 py-1 text-left hover:bg-butter/60"
            >
              <span className="paper h-10 w-10 shrink-0" style={{ background: rgbCss(p.rgb) }} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{p.name}</span>
              <span className="shrink-0 tabular-nums text-ink-soft">{totals[i].toLocaleString()} sts</span>
              <span aria-hidden className="shrink-0 text-ink-soft">✎</span>
            </button>
          </li>
        ))}
      </ul>

      {editing && target !== null && (
        <ColorPaletteDialog
          title={`replace ${editing.name} with…`}
          hint={`All ${totals[target].toLocaleString()} ${editing.name} stitches change to the colour you pick.`}
          current={editing.rgb}
          onClose={() => setTarget(null)}
          onPick={(rgb, name) => {
            recolor(target, rgb, name);
            setTarget(null);
          }}
        />
      )}
    </PaperCard>
  );
}

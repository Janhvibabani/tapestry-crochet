"use client";

import { useRef, useState } from "react";
import { Star } from "@/components/doodles/Doodles";
import { gutterWidth, StitchGrid, useFitCellSize } from "@/components/grid/StitchGrid";
import { PalettePanel } from "@/components/studio/PalettePanel";
import { PatternList } from "@/components/studio/PatternList";
import { SettingsPanel } from "@/components/studio/SettingsPanel";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaperCard } from "@/components/ui/PaperCard";
import { rgbCss } from "@/lib/color";
import { useHydrated, useProject } from "@/store/project";

export default function StudioPage() {
  const hydrated = useHydrated();
  const { grid, palette, handedness, gridCols, rows, image, canUndo, beginEdit, paint, undo, deleteRow } = useProject();
  const previewRef = useRef<HTMLDivElement>(null);
  const cellSize = useFitCellSize(previewRef, gridCols, gutterWidth(true), 3, 22);
  const [editing, setEditing] = useState(false);
  const [brush, setBrush] = useState(0);

  if (!hydrated) return null;
  if (!grid) return <EmptyState />;
  const brushColor = Math.min(brush, palette.length - 1);

  return (
    <div className="mx-auto w-full max-w-[1720px] px-4 py-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl sm:text-5xl">your pattern</h1>
        <ButtonLink href="/crochet" tone="blush">
          <Star className="h-6 w-6" /> start crocheting
        </ButtonLink>
      </div>

      <div className="studio">
        <div className="[grid-area:settings]">
          <SettingsPanel />
        </div>

        <PaperCard tone="mint" tilt={0.4} tape="peach" className="min-w-0 px-3 pb-4 pt-8 [grid-area:preview] sm:px-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <div>
              <h2 className="font-display text-2xl">preview</h2>
              <p className="text-base">
                {gridCols} × {rows} stitches, {(gridCols * rows).toLocaleString()} in total
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canUndo && (
                <Button tone="paper" size="sm" onClick={undo}>
                  ↶ undo
                </Button>
              )}
              <Button tone={editing ? "butter" : "paper"} size="sm" aria-pressed={editing} onClick={() => setEditing((v) => !v)}>
                {editing ? "done editing" : "✎ edit stitches"}
              </Button>
            </div>
          </div>

          {editing && (
            <div className="paper mb-3 bg-butter px-3 py-2">
              <p className="text-base">Pick a colour, then tap or drag on the grid to repaint stitches.</p>
              <div role="radiogroup" aria-label="paint colour" className="mt-2 flex flex-wrap gap-2">
                {palette.map((p, i) => (
                  <button
                    key={`${i}-${p.name}`}
                    type="button"
                    role="radio"
                    aria-checked={brushColor === i}
                    onClick={() => setBrush(i)}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-3 text-base ${
                      brushColor === i ? "border-ink bg-paper" : "border-ink/25 bg-paper/60"
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full border border-ink/50" style={{ background: rgbCss(p.rgb) }} aria-hidden />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={previewRef} className="plaid paper overflow-auto p-2">
            <StitchGrid
              grid={grid}
              palette={palette}
              cellSize={cellSize}
              showRowNumbers
              onPaintStart={editing ? beginEdit : undefined}
              onPaint={editing ? (p) => paint(p, brushColor) : undefined}
              label={`Stitch grid, ${gridCols} by ${rows}`}
            />
          </div>
          {image && (
            <div className="mt-3 flex items-center gap-3 px-1 text-base text-ink-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="Your original picture" className="paper h-14 w-14 object-cover" />
              your original picture
            </div>
          )}
        </PaperCard>

        <div className="[grid-area:palette]">
          <PalettePanel />
        </div>

        <div className="[grid-area:rows] studio-rows">
          <PaperCard tone="paper" tilt={-0.5} tape="lilac" className="flex min-h-0 flex-1 flex-col px-4 pb-5 pt-8 sm:px-6">
            <h2 className="font-display text-2xl">row by row</h2>
            <p className="mb-3 text-base text-ink-soft">
              Row 1 is the bottom of your tapestry. Arrows show which way to work each row. Use × to delete a row.
            </p>
            <PatternList
              grid={grid}
              palette={palette}
              handedness={handedness}
              onDeleteRow={deleteRow}
              className="max-h-[32rem] xl:max-h-none xl:min-h-0 xl:flex-1"
            />
          </PaperCard>
        </div>
      </div>
    </div>
  );
}

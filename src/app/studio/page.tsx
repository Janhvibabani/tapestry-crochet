"use client";

import { useRef } from "react";
import { Star } from "@/components/doodles/Doodles";
import { gutterWidth, StitchGrid, useFitCellSize } from "@/components/grid/StitchGrid";
import { PalettePanel } from "@/components/studio/PalettePanel";
import { PatternList } from "@/components/studio/PatternList";
import { SettingsPanel } from "@/components/studio/SettingsPanel";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaperCard } from "@/components/ui/PaperCard";
import { useHydrated, useProject } from "@/store/project";

export default function StudioPage() {
  const hydrated = useHydrated();
  const { grid, palette, handedness, gridCols, rows, image } = useProject();
  const previewRef = useRef<HTMLDivElement>(null);
  const cellSize = useFitCellSize(previewRef, gridCols, gutterWidth(true), 3, 22);

  if (!hydrated) return null;
  if (!grid) return <EmptyState />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl sm:text-5xl">your pattern</h1>
        <ButtonLink href="/crochet" tone="blush">
          <Star className="h-6 w-6" /> start crocheting
        </ButtonLink>
      </div>

      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
        <div className="contents lg:flex lg:flex-col lg:gap-8">
          <div className="order-1">
            <SettingsPanel />
          </div>
          <div className="order-3">
            <PalettePanel />
          </div>
        </div>

        <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-8">
          <PaperCard tone="mint" tilt={0.6} tape="peach" className="order-2 min-w-0 px-3 pb-4 pt-8 sm:px-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 px-1">
              <h2 className="font-display text-2xl">preview</h2>
              <p className="text-base">
                {gridCols} × {rows} stitches, {(gridCols * rows).toLocaleString()} in total
              </p>
            </div>
            <div ref={previewRef} className="plaid paper overflow-auto p-2">
              <StitchGrid grid={grid} palette={palette} cellSize={cellSize} showRowNumbers label={`Stitch grid, ${gridCols} by ${rows}`} />
            </div>
            {image && (
              <div className="mt-3 flex items-center gap-3 px-1 text-base text-ink-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="Your original picture" className="paper h-14 w-14 object-cover" />
                your original picture
              </div>
            )}
          </PaperCard>

          <PaperCard tone="paper" tilt={-0.5} tape="lilac" className="order-4 px-4 pb-5 pt-8 sm:px-6">
            <h2 className="font-display text-2xl">row by row</h2>
            <p className="mb-3 text-base text-ink-soft">
              Row 1 is the bottom of your tapestry. Arrows show which way to work each row, and the counts are in that order.
            </p>
            <PatternList grid={grid} palette={palette} handedness={handedness} />
          </PaperCard>
        </div>
      </div>
    </div>
  );
}

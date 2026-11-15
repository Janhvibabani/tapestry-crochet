"use client";

import { useEffect, useRef, useState } from "react";
import { CrochetControls } from "@/components/crochet/CrochetControls";
import { RowFocus } from "@/components/crochet/RowFocus";
import { gutterWidth, StitchGrid, useFitCellSize } from "@/components/grid/StitchGrid";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { HandednessToggle } from "@/components/ui/HandednessToggle";
import { PaperCard } from "@/components/ui/PaperCard";
import { buildPattern } from "@/lib/pattern";
import { stitchNumber } from "@/lib/progress";
import { useHydrated, useProject } from "@/store/project";

const MIN = 6;
const MAX = 40;

export default function CrochetPage() {
  const hydrated = useHydrated();
  const { grid, palette, progress, rows, gridCols, handedness, setProgress } = useProject();
  const boxRef = useRef<HTMLDivElement>(null);
  const fit = useFitCellSize(boxRef, gridCols, gutterWidth(true), MIN, 28);
  const [zoom, setZoom] = useState<number | null>(null);
  const cellSize = zoom ?? fit;

  // Keep the current stitch in view.
  useEffect(() => {
    const box = boxRef.current;
    if (!box || !grid) return;
    const x = gutterWidth(true) + 4 + progress.col * cellSize;
    const y = 4 + (rows - progress.row) * cellSize;
    box.scrollTo({
      left: Math.max(0, x - box.clientWidth / 2),
      top: Math.max(0, y - box.clientHeight / 2),
      behavior: "smooth",
    });
  }, [progress, cellSize, rows, grid]);

  if (!hydrated) return null;
  if (!grid) return <EmptyState />;

  const pattern = buildPattern(grid, handedness);
  const row = pattern[progress.row - 1];
  const stitch = stitchNumber(progress, gridCols, handedness);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-72 pt-6 lg:pb-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-4xl sm:text-5xl">crochet mode</h1>
        <ButtonLink href="/studio" tone="paper" size="sm">
          back to pattern
        </ButtonLink>
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <div className="contents lg:order-2 lg:flex lg:flex-col lg:gap-6">
          <PaperCard tone="lilac" tilt={-0.8} tape="butter" className="order-1 px-5 pb-5 pt-8">
            <RowFocus row={row} stitch={stitch} rows={rows} cols={gridCols} palette={palette} />
            <div className="mt-5 hidden lg:block">
              <CrochetControls />
            </div>
          </PaperCard>
          <PaperCard tone="paper" className="order-3 px-5 py-4">
            <HandednessToggle />
          </PaperCard>
        </div>

        <PaperCard tone="mint" tilt={0.4} tape="blush" className="order-2 min-w-0 px-3 pb-4 pt-8 sm:px-5 lg:order-1">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-base text-ink-soft">Tap a stitch to jump there. Faded rows are done.</p>
            <div className="flex items-center gap-2">
              <Button tone="paper" size="sm" aria-label="zoom out" disabled={cellSize <= MIN} onClick={() => setZoom(Math.max(MIN, cellSize - 4))}>
                −
              </Button>
              <Button tone="paper" size="sm" aria-label="zoom in" disabled={cellSize >= MAX} onClick={() => setZoom(Math.min(MAX, cellSize + 4))}>
                +
              </Button>
            </div>
          </div>
          <div ref={boxRef} className="plaid paper max-h-[60vh] overflow-auto p-2 lg:max-h-[70vh]">
            <StitchGrid
              grid={grid}
              palette={palette}
              cellSize={cellSize}
              highlightRow={progress.row}
              current={progress}
              onCellClick={setProgress}
              showRowNumbers
              label={`Stitch grid. You are on row ${progress.row}, stitch ${stitch}.`}
            />
          </div>
        </PaperCard>

      </div>

      {/* Phone: controls stay under your thumb. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t-[2.5px] border-ink bg-cream/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto max-w-xl">
          <CrochetControls />
        </div>
      </div>
    </div>
  );
}

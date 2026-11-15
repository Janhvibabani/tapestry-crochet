"use client";

import { Star, Swirl, YarnBall, YarnSquiggle } from "@/components/doodles/Doodles";
import { BlankCanvas } from "@/components/upload/BlankCanvas";
import { Dropzone } from "@/components/upload/Dropzone";
import { ButtonLink } from "@/components/ui/Button";
import { PaperCard } from "@/components/ui/PaperCard";
import { Stamp } from "@/components/ui/Stamp";
import { toneBg } from "@/components/ui/tones";
import { useHydrated, useProject } from "@/store/project";

const steps = [
  { tone: "blush", text: "upload any picture, or draw on a blank canvas" },
  { tone: "blue", text: "pick how many stitches wide and how many colours" },
  { tone: "butter", text: "follow the pattern row by row in crochet mode" },
] as const;

export default function Home() {
  const hydrated = useHydrated();
  const grid = useProject((s) => s.grid);
  const progress = useProject((s) => s.progress);

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-8 sm:pt-12">
      {/* scattered doodles */}
      <YarnSquiggle className="pointer-events-none absolute -left-10 top-10 hidden w-72 md:block" />
      <YarnSquiggle stroke="#5b3a29" className="pointer-events-none absolute -right-6 bottom-6 hidden w-64 rotate-180 opacity-60 md:block" />
      <Star className="pointer-events-none absolute left-[46%] top-2 h-8 w-8 -rotate-12" />
      <Swirl className="pointer-events-none absolute right-16 top-4 hidden h-12 w-12 sm:block" />

      <div className="relative grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <PaperCard tone="mint" tilt={-2} tape="blush" stitched className="px-5 pb-6 pt-10 sm:px-10 sm:pb-10">
          <h1 className="font-display text-5xl leading-[0.95] sm:text-7xl">
            tiny
            <br />
            tapestry
          </h1>
          <p className="mt-4 max-w-md text-xl sm:text-2xl">
            Turn any picture into a crochet tapestry pattern. One colour per stitch, row by row.
          </p>
          <div className="mt-6">
            <Dropzone />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="h-0.5 flex-1 border-t-2 border-dashed border-ink/30" aria-hidden />
            <span className="text-ink-soft">or</span>
            <span className="h-0.5 flex-1 border-t-2 border-dashed border-ink/30" aria-hidden />
          </div>
          <div className="mt-3">
            <BlankCanvas />
          </div>
          {hydrated && grid && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-ink-soft">Your last tapestry is saved, you were on row {progress.row}.</span>
              <ButtonLink href="/crochet" tone="lilac" size="sm">
                keep crocheting
              </ButtonLink>
            </div>
          )}
        </PaperCard>

        <div className="relative flex flex-col gap-8 lg:pt-8">
          <PaperCard tone="lilac" tilt={2} tape="mint" className="px-6 pb-6 pt-8">
            <h2 className="font-display text-3xl">how it works</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((s, i) => (
                <li key={s.text} className="flex items-start gap-3">
                  <span className={`paper grid h-9 w-9 shrink-0 place-items-center font-display ${toneBg[s.tone]}`}>{i + 1}</span>
                  <span className="pt-1">{s.text}</span>
                </li>
              ))}
            </ol>
          </PaperCard>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:justify-start">
            <Stamp tone="blush" className="h-36 w-36 rotate-6 text-lg">
              one colour per stitch
            </Stamp>
            <PaperCard tone="peach" tilt={-4} className="max-w-56 px-5 py-4">
              <p className="font-display text-xl leading-tight">left &amp; right handed</p>
              <p className="mt-1 text-base">Every row is marked with the way you work it.</p>
            </PaperCard>
            <YarnBall className="h-20 w-20 -rotate-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

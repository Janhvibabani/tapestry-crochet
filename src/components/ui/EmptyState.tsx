import { YarnBall } from "@/components/doodles/Doodles";
import { ButtonLink } from "./Button";
import { PaperCard } from "./PaperCard";

export function EmptyState() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PaperCard tone="butter" tilt={-1.5} tape="lilac" stitched className="flex flex-col items-center gap-3 px-6 pb-8 pt-10 text-center">
        <YarnBall className="h-20 w-20" />
        <h1 className="font-display text-3xl">no tapestry yet</h1>
        <p>Upload a picture and we&apos;ll turn it into a stitch-by-stitch pattern.</p>
        <ButtonLink href="/" tone="mint" className="mt-2">
          upload a picture
        </ButtonLink>
      </PaperCard>
    </div>
  );
}

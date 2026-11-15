"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { SewButton } from "@/components/doodles/Doodles";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { loadImage } from "@/lib/loadImage";
import { hasProgress, stitchNumber } from "@/lib/progress";
import { useProject } from "@/store/project";

export function Dropzone() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);

  const { grid, progress, gridCols, handedness, setImage } = useProject();

  async function start(file: File) {
    setPending(null);
    setBusy(true);
    setError(null);
    try {
      const img = await loadImage(file);
      setImage(img);
      router.push("/studio");
      // Pages stay mounted (hidden) after navigating, so reset for when you come back.
      setBusy(false);
    } catch {
      setError("That file isn't a picture we can read. Try a JPG or PNG.");
      setBusy(false);
    }
  }

  function pick(file: File | undefined) {
    if (!file) return;
    if (grid && hasProgress(progress, gridCols, handedness)) setPending(file);
    else void start(file);
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a picture"
        aria-busy={busy}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            input.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={`paper flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? "bg-butter" : "bg-paper hover:bg-butter/60"
        }`}
      >
        <SewButton className={`h-14 w-14 ${busy ? "animate-spin" : ""}`} />
        <p className="font-display text-2xl">{busy ? "pixelating…" : "drop a picture here"}</p>
        <p className="text-ink-soft">{busy ? "counting every stitch" : "or tap to choose one · JPG, PNG, WebP"}</p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {error && (
        <p role="alert" className="paper mt-3 bg-blush px-4 py-2">
          {error}
        </p>
      )}
      {pending && (
      <ConfirmDialog
        open
        title="start a new tapestry?"
        message={`You're on row ${progress.row}, stitch ${stitchNumber(progress, gridCols, handedness)} of your current one. A new picture replaces it and resets your place.`}
        confirmLabel="start new"
        onConfirm={() => void start(pending)}
        onCancel={() => setPending(null)}
      />
      )}
    </>
  );
}

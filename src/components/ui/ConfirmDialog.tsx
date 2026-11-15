"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm(): void;
  onCancel(): void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = "keep going", onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="paper stitched m-auto w-[min(92vw,26rem)] bg-butter p-6 text-ink backdrop:bg-ink/30"
    >
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-2">{message}</p>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <Button tone="paper" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button tone="blush" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}

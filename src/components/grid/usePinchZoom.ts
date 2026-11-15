"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { clampZoom, scrollAfterZoom } from "@/lib/zoom";
import { GRID_PAD } from "./StitchGrid";

interface Options {
  /** The scroll box that holds the StitchGrid. */
  boxRef: RefObject<HTMLElement | null>;
  size: number;
  setSize(size: number): void;
  min: number;
  max: number;
  /** Width of the row-number gutter in front of the grid. */
  gutter: number;
  /** False until the scroll box is on the page (listeners attach when it turns true). */
  ready: boolean;
}

type Pending = { px: number; py: number; ox: number; oy: number; old: number; sl: number; st: number };

/**
 * Freehand zoom for the stitch grid: two-finger pinch on touch screens, trackpad pinch
 * (and Ctrl/⌘ + scroll) on computers. The stitch under your fingers stays put.
 * Returns `zoomAt(size, clientX?, clientY?)` for buttons (anchors at the box centre).
 */
export function usePinchZoom({ boxRef, size, setSize, min, max, gutter, ready }: Options) {
  const committed = useRef(size); // size the current layout was drawn with
  const latest = useRef(size); // last size we asked for
  const pending = useRef<Pending | null>(null);

  const zoomAt = useCallback(
    (next: number, clientX?: number, clientY?: number) => {
      const box = boxRef.current;
      const spacer = box?.querySelector<HTMLElement>(":scope > div.relative");
      if (!box || !spacer) return;
      const target = clampZoom(next, min, max);
      if (target === latest.current) return;
      const b = box.getBoundingClientRect();
      const s = spacer.getBoundingClientRect();
      const left = b.left + box.clientLeft;
      const top = b.top + box.clientTop;
      const px = (clientX ?? left + box.clientWidth / 2) - left;
      const py = (clientY ?? top + box.clientHeight / 2) - top;
      if (!pending.current) {
        pending.current = {
          px,
          py,
          ox: s.left - left + box.scrollLeft + gutter + GRID_PAD,
          oy: s.top - top + box.scrollTop + GRID_PAD,
          old: committed.current,
          sl: box.scrollLeft,
          st: box.scrollTop,
        };
      } else {
        pending.current.px = px;
        pending.current.py = py;
      }
      latest.current = target;
      setSize(target);
    },
    [boxRef, min, max, gutter, setSize],
  );

  // After the grid re-renders at the new size, scroll so the anchored stitch hasn't moved.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const p = pending.current;
    committed.current = size;
    latest.current = size;
    if (!box || !p) return;
    box.scrollLeft = scrollAfterZoom({ scroll: p.sl, point: p.px, origin: p.ox, oldSize: p.old, newSize: size });
    box.scrollTop = scrollAfterZoom({ scroll: p.st, point: p.py, origin: p.oy, oldSize: p.old, newSize: size });
    pending.current = null;
  }, [size, boxRef]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || !ready) return;

    // Trackpad pinch arrives as a wheel event with ctrlKey; Ctrl/⌘ + mouse wheel zooms too.
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      // Trackpad pinches send small deltas; a mouse wheel notch is ~100, so cap each step.
      const d = Math.max(-25, Math.min(25, e.deltaY));
      zoomAt(latest.current * Math.exp(-d * 0.01), e.clientX, e.clientY);
    };

    // Two-finger pinch.
    let start: { dist: number; size: number } | null = null;
    const dist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) start = { dist: dist(e.touches), size: latest.current };
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !start) return;
      e.preventDefault();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      zoomAt((start.size * dist(e.touches)) / start.dist, midX, midY);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) start = null;
    };

    // Safari on Mac reports trackpad pinch as gesture events.
    type GestureEvt = Event & { scale: number; clientX: number; clientY: number };
    let gestureStart = 0;
    const onGestureStart = (e: Event) => {
      e.preventDefault();
      gestureStart = latest.current;
    };
    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const g = e as GestureEvt;
      zoomAt(gestureStart * g.scale, g.clientX, g.clientY);
    };

    box.addEventListener("wheel", onWheel, { passive: false });
    box.addEventListener("touchstart", onTouchStart, { passive: true });
    box.addEventListener("touchmove", onTouchMove, { passive: false });
    box.addEventListener("touchend", onTouchEnd);
    box.addEventListener("touchcancel", onTouchEnd);
    box.addEventListener("gesturestart", onGestureStart);
    box.addEventListener("gesturechange", onGestureChange);
    return () => {
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("touchstart", onTouchStart);
      box.removeEventListener("touchmove", onTouchMove);
      box.removeEventListener("touchend", onTouchEnd);
      box.removeEventListener("touchcancel", onTouchEnd);
      box.removeEventListener("gesturestart", onGestureStart);
      box.removeEventListener("gesturechange", onGestureChange);
    };
  }, [boxRef, zoomAt, ready]);

  return zoomAt;
}

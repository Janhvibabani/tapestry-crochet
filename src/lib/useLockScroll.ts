"use client";

import { useEffect } from "react";

/** Stop the page behind a full-screen view from scrolling. */
export function useLockScroll() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
}

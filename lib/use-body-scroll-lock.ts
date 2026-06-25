"use client";

import { useEffect } from "react";

/**
 * Locks the body scroll when `locked` is true.
 *
 * Uses the `position: fixed` trick so it also blocks the iOS Safari
 * touch-scroll behind a fixed overlay, and restores the previous scroll
 * position on unlock. Safe to use with multiple consumers — each call
 * tracks and restores its own state independently.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}

"use client";

import { useEffect } from "react";

/**
 * Locks the page behind a fullscreen overlay (mobile drawers, the filter
 * sheet, the search panel, cancel/verify modals, etc.) without reflowing
 * the body.
 *
 * We rely on `scrollbar-gutter: stable` set in `globals.css` on <html> to
 * reserve the scrollbar space permanently, so hiding `overflow` here
 * doesn't shift the page left and expose a white strip under the nav.
 * `overscroll-behavior: contain` keeps modern iOS Safari from rubber-
 * banding under the overlay.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement: html } = document;

    // Save originals so we can restore them exactly on unlock.
    const original = {
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
    };

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "contain";
    html.style.overflow = "hidden";

    return () => {
      body.style.overflow = original.bodyOverflow;
      body.style.overscrollBehavior = original.bodyOverscroll;
      html.style.overflow = original.htmlOverflow;
    };
  }, [locked]);
}

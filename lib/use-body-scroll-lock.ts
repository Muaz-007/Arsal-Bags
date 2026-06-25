"use client";

import { useEffect } from "react";

/**
 * Locks the page behind a fullscreen overlay (mobile drawers, the filter
 * sheet, the search panel, etc.) without reflowing the body.
 *
 * Why not the `position: fixed; top: -scrollY` trick? It works, but every
 * lock/unlock forces a complete reflow — the page content snaps off the
 * normal flow on open, and `window.scrollTo` on unlock can land a pixel or
 * two off the original position on some browsers (causing a tiny jump and
 * a visibly choppy slide-in because the layout thrashes against the
 * Framer Motion transform).
 *
 * This version uses `overflow: hidden` on both <html> and <body> plus a
 * `padding-right` gutter to compensate for the scrollbar disappearing on
 * desktop. The scroll position is naturally preserved — nothing reflows.
 * `overscroll-behavior: contain` keeps modern iOS Safari from rubber-band
 * scrolling under the overlay.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement: html } = document;

    // Save originals so we can restore them exactly on unlock.
    const original = {
      bodyOverflow: body.style.overflow,
      bodyPaddingRight: body.style.paddingRight,
      bodyOverscroll: body.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
    };

    // Compensate for the scrollbar disappearing on desktop so the layout
    // doesn't shift when overflow goes hidden. Mobile typically reports 0.
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "contain";
    html.style.overflow = "hidden";

    return () => {
      body.style.overflow = original.bodyOverflow;
      body.style.paddingRight = original.bodyPaddingRight;
      body.style.overscrollBehavior = original.bodyOverscroll;
      html.style.overflow = original.htmlOverflow;
    };
  }, [locked]);
}

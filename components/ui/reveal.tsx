"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

/**
 * Reveal — a small wrapper that fades + lifts its children into view as the
 * user scrolls. Honors `prefers-reduced-motion`. Uses the same luxe cubic
 * easing as page transitions for visual consistency.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section";
}) {
  const reduce = useReducedMotion();
  const MotionTag = As === "section" ? motion.section : motion.div;

  return (
    <MotionTag
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
